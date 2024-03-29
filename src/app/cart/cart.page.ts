import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Config } from '../config';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { HttpParams } from "@angular/common/http";
import { Product } from '../data/product';
import { Store } from '../data/store';
import { TranslateService } from '@ngx-translate/core';
import { LoginPage } from './../account/login/login.page';

@Component({
    selector: 'app-cart',
    templateUrl: 'cart.page.html',
    styleUrls: ['cart.page.scss']
})
export class CartPage {
    coupon: any;
    cart: any = {};
    couponMessage: any;
    status: any;
    loginForm: any = {};
    errors: any;
    lan: any = {};
    store: any;
    id: any;
    IhaveCouponChecked: any = false;
    addonsTotal: any = 0;
    constructor(public modalController: ModalController, public translate: TranslateService, private alertCtrl: AlertController, public toastController: ToastController, public config: Config, public api: ApiService, public data: Data, public router: Router, public settings: Settings, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute, public productData: Product, public storeData: Store) {}
    ngOnInit() {
        console.log(this);
        this.translate.get(['Cantidad solicitada no disponible'  ]).subscribe(translations => {
          this.lan.lowQuantity = translations['Cantidad solicitada no disponible'];
        });
        this.store = this.storeData.store;
        this.id = this.route.snapshot.paramMap.get('storeId');
    }
    ionViewDidEnter() {
        this.getStore();
    }
    getStore() {
        this.api.postItem('store', {'store_id':this.id}).then(res => {
            this.store = res;
        }, err=>{
            console.error(err);
        }).then(() => {
            this.api.postItem('cart', {}, this.store.path).then(res => {
                this.cart = res;
                this.data.updateCart(this.cart.cart_contents);
            }, err => {
                console.log(err);
            });
        });
    }
    async getCart() {
        await this.api.postItem('cart', {}, this.store.path).then(res => {
            this.cart = res;
            this.data.updateCart(this.cart.cart_contents);
        }, err => {
            console.log(err);
        });
    }
    backToStore() {
        this.navCtrl.navigateForward('/tabs/home/store/' + this.id);
    }
    checkout() {
        if(this.settings.customer.id || this.settings.settings.disable_guest_checkout == 0) {
            this.navCtrl.navigateForward('/tabs/cart/address' + this.store.path);
        }
        else this.login();
    }
    getProduct(id){
        this.productData.product = {};
        this.navCtrl.navigateForward(this.router.url + '/product/' + id);
    }
    async deleteItem(itemKey, qty) {
        await this.api.postItem('remove_cart_item&item_key=' + itemKey, {}, this.store.path).then(res => {
            this.cart = res;
            this.data.updateCart(this.cart.cart_contents);
        }, err => {
            console.log(err);
        });
    }
    async submitCoupon(coupon) {
        if(coupon)
        await this.api.postItem('apply_coupon', {
            coupon_code: coupon
        }, this.store.path).then(res => {
            this.couponMessage = res;
            if(this.couponMessage != null && this.couponMessage.notice) {
                this.presentToast(this.couponMessage.notice)
            }
            this.getCart();
        }, err => {
            console.log(err);
        });
    }
    async removeCoupon(coupon) {
        await this.api.postItem('remove_coupon', {
            coupon: coupon
        }, this.store.path).then(res => {
            this.getCart();
        }, err => {
            console.log(err);
        });
    }

    async addToCart(id, item){
        if(item.value.manage_stock && (item.value.stock_quantity <= item.value.quantity)) {
            this.presentToast(this.lan.lowQuantity);
        } else {
            if (this.data.cartItem[item.key].quantity != undefined && this.data.cartItem[item.key].quantity == 0) {
                this.data.cartItem[item.key].quantity = 0
            }
            else {
                this.data.cartItem[item.key].quantity += 1
            };
            if (this.data.cart[id] != undefined && this.data.cart[id] == 0) {
                this.data.cart[id] = 0
            }
            else {
                this.data.cart[id] += 1
            };
            var params: any = {};
            params.key = item.key;
            params.quantity = this.data.cartItem[item.key].quantity;
            params.update_cart = 'Update Cart';
            params._wpnonce = this.cart.cart_nonce;
            await this.api.postItem('update-cart-item-qty', params, this.store.path).then(res => {
                this.cart = res;
                this.data.updateCart(this.cart.cart_contents);
            }, err => {
                console.log(err);
            });
        }
    }

    async deleteFromCart(id, key){

        if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
            this.data.cartItem[key].quantity = 0;
        }
        else {
            this.data.cartItem[key].quantity -= 1;
        };
        if (this.data.cart[id] != undefined && this.data.cart[id] == 0) {
            this.data.cart[id] = 0
        }
        else {
            this.data.cart[id] -= 1
        };
        var params: any = {};
        params.key = key;
        params.quantity = this.data.cartItem[key].quantity;
        params.update_cart = 'Update Cart';
        params._wpnonce = this.cart.cart_nonce;

        await this.api.postItem('update-cart-item-qty', params, this.store.path).then(res => {
            this.cart = res;
            console.log(this.cart);
            this.data.updateCart(this.cart.cart_contents);
        }, err => {
            console.log(err);
        });
    }
    //----------Rewrad-----------------//
    redeem(){
       // wc_points_rewards_apply_discount_amount: 
       // wc_points_rewards_apply_discount: Apply Discount
        this.api.postItem('ajax_maybe_apply_discount', {}, this.store.path).then(res =>{
            console.log(res);
            this.getCart();
            })
    }

    async login() {
        const modal = await this.modalController.create({
              component: LoginPage,
              componentProps: {
                path: 'tabs/cart',
                },
              swipeToClose: true,
              //presentingElement: this.routerOutlet.nativeEl,
          });
          modal.present();
          const { data } = await modal.onWillDismiss();

            if(this.settings.customer.id) {
                this.navCtrl.navigateForward('/tabs/cart/address' + this.store.path);
            }
    }
    async onSubmit(userData) {
        this.loginForm.username = userData.username;
        this.loginForm.password = userData.password;
        await this.api.postItem('login', this.loginForm, this.store.path).then(res => {
            this.status = res;
            if (this.status.errors != undefined) {
                this.errors = this.status.errors;
                this.inValidUsername();
            } else if (this.status.data) {
                this.settings.customer.id = this.status.ID;
                if(this.status.allcaps.dc_vendor || this.status.allcaps.seller || this.status.allcaps.wcfm_vendor){
                    this.settings.vendor = true;
                }
                if(this.status.allcaps.administrator) {
                    this.settings.administrator = true;
                }
                this.navCtrl.navigateForward('/tabs/cart/address/');
            }
        }, err => {
            console.log(err);
        });
    }
    async inValidUsername() {
        const alert = await this.alertCtrl.create({
          header: 'Aviso',
          message: 'Usuario o contraseña invalido',
          buttons: ['OK']
        });
        await alert.present();
    }
    IhaveCouponClick() {
        if (this.IhaveCouponChecked == false) {
            this.IhaveCouponChecked = true;
        } else {
            this.IhaveCouponChecked = false;
        }
    }
    async presentToast(message) {
        const toast = await this.toastController.create({
          message: message,
          duration: 2000,
          position: 'top'
        });
        toast.present();
    }
}