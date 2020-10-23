import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, ModalController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
import { Store } from '../data/store';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Platform } from '@ionic/angular';
import { Config } from '../config';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { HttpParams } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import { LocationPage } from './../location/location.page';
import { LS_USER_COORDS, LS_USER_ADDRESS } from './../shared/common';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ChatApi } from './../chat/chat.api';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
@Component({
    selector: 'app-home',
    templateUrl: 'stores.page.html',
    styleUrls: ['stores.page.scss']
})
export class StoresPage {
    tempProducts: any = [];
    filter: any = {};
    hasMoreItems: boolean = true;
    screenWidth: any = 300;
    slideOpts = { effect: 'flip', autoplay: true, parallax: true, loop: true, lazy: true };
    form: any;
    formRegister: any;
    cart: any = {};
    options: any = {};
    lan: any = {};
    variationId: any;
    get_wishlist:any;
    loading: any = false;
    loadingStoresNearby: any = true;
    loadingAllStores: any = false;
    errorMessage: any;
    pageHeight: any;
    showAllStores: any = false;
    result: any;
    constructor(public routerOutlet: IonRouterOutlet, public modalCtrl: ModalController, private nativeGeocoder: NativeGeocoder, private geolocation: Geolocation, private locationAccuracy: LocationAccuracy, private storage: Storage, public translate: TranslateService, public alertController: AlertController, private config: Config, public api: ApiService, private splashScreen: SplashScreen, public platform: Platform, public translateService: TranslateService, public data: Data, public settings: Settings, public product: Product, public store: Store, public loadingController: LoadingController, public router: Router, public navCtrl: NavController, public route: ActivatedRoute, private oneSignal: OneSignal, private nativeStorage: NativeStorage, private chatapi: ChatApi, private fb: FormBuilder) {
        this.filter.page = 1;
        this.filter.status = 'publish';
        this.screenWidth = this.platform.width();
        this.form = this.fb.group({
            name: this.settings.user?this.settings.user.display_name:'',
            phone: '',
            email: this.settings.user?this.settings.user.user_email:'',
        });
    }
    ngOnInit() {
        if( this.data.storeCategory == null ) {
            this.data.storeCategory = {};
            this.data.storeCategory.term_id = window.localStorage.getItem('store-category-id');
            this.data.storeCategory.displayName = window.localStorage.getItem('store-category-name');
        }
        if (this.data.storesNearby.length > 0) {
            if (this.data.storeCategory.term_id != this.data.storesNearby[0].cat) {
                this.data.storesNearby = [];
            }
        }
        if (this.data.allStores.length > 0) {
            if (this.data.storeCategory.term_id != this.data.allStores[0].cat) {
                this.data.allStores = [];
            }
        }
        // this.data.allStores = [];
        // this.data.storesNearby = [];
        this.platform.ready().then(() => {
             this.locationAccuracy.canRequest().then((canRequest: boolean) => {
              if(canRequest) {
                // the accuracy option will be ignored by iOS
                this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                  () => {
                    console.log('Request successful')
                },
                  error => {
                    console.log('Error requesting location permissions', error);
                });
              }
            });
             // Set language to user preference
            this.nativeStorage.getItem('settings').then((settings : any) => {
                this.config.lang = settings.lang;
                document.documentElement.setAttribute('dir', settings.dir);
            }, error => {
            });

            this.storage.get('userLocation').then((value : any) => {
                if(value) {
                    this.api.userLocation = value;
                }
                this.getBlocks();
            }, error => {
                this.getBlocks();
            });
            this.translate.get(['Oops!', 'Por favor seleccione', 'Por favor espera', 'Opciones', 'Opción', 'Seleccione', 'Artículo agregado al carrito', 'Mensaje', 'Cantidad solicitada no disponible'  ]).subscribe(translations => {
                this.lan.oops = translations['Oops!'];
                this.lan.PleaseSelect = translations['Por favor seleccione'];
                this.lan.Pleasewait = translations['Por favor espera'];
                this.lan.options = translations['Opciones'];
                this.lan.option = translations['Opción'];
                this.lan.select = translations['Seleccione'];
                this.lan.addToCart = translations['Artículo agregado al carrito'];
                this.lan.message = translations['Mensaje'];
                this.lan.lowQuantity = translations['Cantidad solicitada no disponible'];
            });

            this.nativeStorage.getItem('blocks').then(data => {
                this.data.blocks = data.blocks;
                this.data.categories = data.categories;
                this.data.mainCategories = this.data.categories.filter(item => item.parent == 0);
                this.settings.pages = this.data.blocks.pages;
                this.settings.settings = this.data.blocks.settings;
                this.settings.dimensions = this.data.blocks.dimensions;
                this.settings.currency = this.data.blocks.settings.currency;

                this.settings.locale = this.data.blocks.locale;

                if(this.data.blocks.languages)
                this.settings.languages = Object.keys(this.data.blocks.languages).map(i => this.data.blocks.languages[i]);
                this.settings.currencies = this.data.blocks.currencies;
                this.settings.calc(this.platform.width());
                if (this.settings.colWidthLatest == 4) this.filter.per_page = 15;
                //this.settings.theme = this.data.blocks.theme;
                this.splashScreen.hide();
            }, error => console.error(error));
        });
    }
    getCart() {
        this.api.postItem('cart').then(res => {
            this.cart = res;
            this.data.updateCart(this.cart.cart_contents);
            this.data.cartNonce = this.cart.cart_nonce;
        }, err => {
            console.log(err);
        });
    }
    async getLocation(){
        console.log("Here goes getLocation");
        const modal = await this.modalCtrl.create({
            component: LocationPage,
            componentProps: {
                path: 'tabs/home'
            },
            swipeToClose: true,
            presentingElement: this.routerOutlet.nativeEl,
        });
        console.log("Here passed modal");
        modal.present();
        const { data } = await modal.onWillDismiss();
        if(data && data.update) {
            this.loading = true;
            this.filter.page = 1;
            this.getBlocks();
            console.log(this.api.userLocation);
            this.storage.set('userLocation', this.api.userLocation);
        }
    }
    getBlocks() {
        this.api.postItem('keys').then(res => {
            this.loading = false;
            this.data.blocks = res;
            if(this.data.blocks && this.data.blocks.user)
            this.settings.user = this.data.blocks.user.data;

            if( /*this.settings.settings.location_filter == 1 && */ this.api.userLocation.latitude == 0) {
                this.getLocation();
            }
            //this.settings.theme = this.data.blocks.theme;
            this.settings.locale = this.data.blocks.locale;

            this.settings.pages = this.data.blocks.pages;
            if(this.data.blocks.user)
            this.settings.reward = this.data.blocks.user.data.points_vlaue;
            if(this.data.blocks.languages)
            this.settings.languages = Object.keys(this.data.blocks.languages).map(i => this.data.blocks.languages[i]);
            this.settings.currencies = this.data.blocks.currencies;
            this.settings.settings = this.data.blocks.settings;
            this.settings.dimensions = this.data.blocks.dimensions;
            this.settings.currency = this.data.blocks.settings.currency;
            if(this.data.blocks.categories){
                this.data.categories = this.data.blocks.categories.filter(item => item.name != 'Uncategorized');
                this.data.mainCategories = this.data.categories.filter(item => item.parent == 0);
            }
            this.settings.calc(this.platform.width());
            if (this.settings.colWidthLatest == 4) this.filter.per_page = 15;
            this.splashScreen.hide();
            this.getCart();
            this.processOnsignal();
            if (this.data.blocks.user) {
                this.settings.customer.id = this.data.blocks.user.ID;
                if(this.data.blocks.user.wc_product_vendors_admin_vendor || this.data.blocks.user.allcaps.dc_vendor || this.data.blocks.user.allcaps.seller || this.data.blocks.user.allcaps.wcfm_vendor){
                    this.settings.vendor = true;
                }
                if(this.data.blocks.user.allcaps.administrator) {
                    this.settings.administrator = true;
                }
            }
            for (let item in this.data.blocks.blocks) {
                var filter;
                if (this.data.blocks.blocks[item].block_type == 'flash_sale_block') {
                    this.data.blocks.blocks[item].interval = setInterval(() => {
                        var countDownDate = new Date(this.data.blocks.blocks[item].sale_ends).getTime();
                        var now = new Date().getTime();
                        var distance = countDownDate - now;
                        this.data.blocks.blocks[item].days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        this.data.blocks.blocks[item].hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        this.data.blocks.blocks[item].minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        this.data.blocks.blocks[item].seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        if (distance < 0) {
                            clearInterval(this.data.blocks.blocks[item].interval);
                            this.data.blocks.blocks[item].hide = true;
                        }
                    }, 1000);
                }
            }
            if (this.data.blocks.settings.show_latest) {
                this.data.products = this.data.blocks.recentProducts;
            }
            if (this.data.blocks.user) {
                this.api.postItem('get_wishlist').then(res => {
                    this.get_wishlist = res;
                    for (let item in  this.get_wishlist ) {
                        this.settings.wishlist[ this.get_wishlist [item].id] =  this.get_wishlist [item].id;
                    }
                }, err => {
                    console.log(err);
                });
            }

            this.nativeStorage.setItem('blocks', {
                    blocks: this.data.blocks,
                    categories: this.data.categories
                }).then(
            () => console.log('Stored item!'), error => console.error('Error storing item', error));

            /* Product Addons */
            if(this.data.blocks.settings.switchAddons){
                this.api.getAddonsList('product-add-ons').then(res => {
                    this.settings.addons = res;
                });
            }

            /* HERE WE GET ALL THE STORES */
            if (this.data.storesNearby.length == 0) {
                this.loadingStoresNearby = true;
                this.api.postItem('get_stores', {'categories': this.data.storeCategory.term_id,'lat':this.api.userLocation['latitude'], 'lng':this.api.userLocation['longitude'], 'radius': this.api.userLocation['distance']}).then(res=>{
                    this.result = res;
                    var result = this.result.stores;
                    this.data.storesNearby = [];
                    if( Object.values(result).length >= 1) {
                        for ( let i in result ) {
                            this.data.storesNearby.push(result[i]);
                        }
                    }
                    this.loadingStoresNearby = false;
                },err=>{
                    console.error(err);
                    console.error(err.text);
                    this.loadingStoresNearby = false;
                });
            }

            if(this.settings.user) {
                this.getIncomeMessages();
            }

            if(this.settings.user) {
                this.oneSignal.getIds().then(res => {
                    this.data.onesignal_ids = res;
                    this.data.onesignal_ids = this.data.onesignal_ids.userId;
                    this.api.postItem('get_onesignal_notification', {onesignal_user_id: this.data.onesignal_ids.userId}).then( res => {
                        this.data.onesignal_data = res;
                    }, err => {
                        console.error(err);
                    });
                }, err => {
                    console.error(err);
                    this.api.postItem('get_onesignal_notification', {onesignal_user_id: "2d6255eb-d48c-4b6e-8970-5a5122739074"}).then( res => {
                        this.data.onesignal_data = res;
                    }, err => {
                        console.error(err);
                    });
                });
            }
            if(this.settings.vendor) {

            }
            console.log(this);
        }, err => {
            console.log(err);
        });
    }
    getStore(store) {
        this.store.store = store;
        this.data.store = store;
        this.navCtrl.navigateForward('/tabs/home/store/' + store.id);
    }
    openAllStores() {
        this.data.allStores = this.result.all_stores;
        this.showAllStores = true;
    }
    hideAllStores() {
        this.showAllStores = false;
    }
    goto(item) {
        if (item.description == 'category') this.navCtrl.navigateForward('/tabs/home/products/' + item.url);
        else if (item.description == 'stores')
        this.navCtrl.navigateForward('/tabs/home/stores');
        else if (item.description == 'product') this.navCtrl.navigateForward('/tabs/home/product/' + item.url);
        else if (item.description == 'post') this.navCtrl.navigateForward('/tabs/home/post/' + item.url);
    }
    getProduct(item) {
        this.product.product = item;
        this.navCtrl.navigateForward('/tabs/home/product/' + item.id);
    }
    getSubCategories(id) {
        const results = this.data.categories.filter(item => item.parent === parseInt(id));
        return results;
    }
    getCategory(id) {
        this.navCtrl.navigateForward('/tabs/home/products/' + id);
    }
    loadData(event) {
        this.filter.page = this.filter.page + 1;
        this.api.postItem('products', this.filter).then(res => {
            this.tempProducts = res;
            this.data.products.push.apply(this.data.products, this.tempProducts);
            event.target.complete();
            if (this.tempProducts.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
    processOnsignal() {
        this.oneSignal.startInit(this.data.blocks.settings.onesignal_app_id, this.data.blocks.settings.google_project_id);
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
        this.oneSignal.handleNotificationReceived().subscribe(() => {
            //do something when notification is received
        });
        this.oneSignal.handleNotificationOpened().subscribe(result => {
            if (result.notification.payload.additionalData.category) {
                this.navCtrl.navigateForward('/tabs/home/products/' + result.notification.payload.additionalData.category);
            } else if (result.notification.payload.additionalData.product) {
                this.navCtrl.navigateForward('/tabs/home/product/' + result.notification.payload.additionalData.product);
            } else if (result.notification.payload.additionalData.post) {
                this.navCtrl.navigateForward('/tabs/home/post/' + result.notification.payload.additionalData.post);
            } else if (result.notification.payload.additionalData.order) {
                this.navCtrl.navigateForward('/tabs/account/orders/order/' + result.notification.payload.additionalData.order);
            }
        });
        this.oneSignal.endInit();
    }
    doRefresh(event) {
        this.filter.page = 1;
        this.getBlocks();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }
    getHeight(child) {
        return (child.height * this.screenWidth) / child.width;
    }
    getIncomeMessages() {
        var incomeMessages = this.chatapi.getIncomeMessages(this.settings.user.ID, '');
        incomeMessages.on('value', resp => {
            this.data.messages = this.chatapi.snapshotToArray(resp);
        });
    }
    async addToCart(product) {
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        } else if (product.type == 'variable' || product.type == 'grouped') {
            this.getProduct(product);
        }
        else if (this.setVariations(product)) {

          if (this.data.cart[product.id] != undefined) this.data.cart[product.id] += 1;
          else this.data.cart[product.id] = 1;

          this.options.product_id = product.id;
          await this.api.postItem('add_to_cart', this.options).then(res => {
              this.cart = res;
              this.data.updateCart(this.cart.cart);
          }, err => {
              console.log(err);
          });
        }
    }
    setVariations(product) {
        if(product.variationId){
            this.options.variation_id = product.variationId;
        }
        product.attributes.forEach(item => {
            if (item.selected) {
                this.options['variation[attribute_pa_' + item.name + ']'] = item.selected;
            }
        })
        for (var i = 0; i < product.attributes.length; i++) {
            if (product.type == 'variable' && product.attributes[i].variation && product.attributes[i].selected == undefined) {
                this.presentAlert(this.lan.options, this.lan.select +' '+ product.attributes[i].name +' '+ this.lan.option);
                return false;
            }
        }
        return true;
    }
    async presentAlert(header, message) {
        const alert = await this.alertController.create({
            header: header,
            message: message,
            buttons: ['OK']
        });
        await alert.present();
    }
    async updateToCart(product){
        var params: any = {};
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        } else {
          for (let key in this.data.cartItem) {
            if (this.data.cartItem[key].product_id == product.id) {
                  if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
                      this.data.cartItem[key].quantity = 0
                  }
                  else {
                      this.data.cartItem[key].quantity += 1
                  };
                  if (this.data.cart[product.id] != undefined && this.data.cart[product.id] == 0) {
                      this.data.cart[product.id] = 0
                  }
                  else {
                      this.data.cart[product.id] += 1
                  };
                  params.key = key;
                  params.quantity = this.data.cartItem[key].quantity;
            }
          }
          params.update_cart = 'Update Cart';
          params._wpnonce = this.data.cartNonce;
          await this.api.postItem('update-cart-item-qty', params).then(res => {
              this.cart = res;
              this.data.updateCart(this.cart.cart_contents);
          }, err => {
              console.log(err);
          });

        }

    }
    async deleteFromCart(product){
        var params: any = {};
        for (let key in this.data.cartItem) {
          if (this.data.cartItem[key].product_id == product.id) {
            if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
                this.data.cartItem[key].quantity = 0;
            }
            else {
                this.data.cartItem[key].quantity -= 1;
            };
            if (this.data.cart[product.id] != undefined && this.data.cart[product.id] == 0) {
                this.data.cart[product.id] = 0
            }
            else {
                this.data.cart[product.id] -= 1
            };
            params.key = key;
            params.quantity = this.data.cartItem[key].quantity;
          }
        }
        params.update_cart = 'Update Cart';
        params._wpnonce = this.data.cartNonce;
        await this.api.postItem('update-cart-item-qty', params).then(res => {
            console.log(res);
            this.cart = res;
            this.data.updateCart(this.cart.cart_contents);
        }, err => {
            console.log(err);
        });
    }
    onSubmit() {
        this.form.value.type = 'no-stores-nearby';
        if (this.checkFields()) {
            this.api.postItem("notify-client", this.form.value).then(res => {
                this.settings.clientDataSent = true;
                console.log(res);
            }, err => {
                console.log(err);
            });
        }
    }
    checkFields() {
        if (this.form.value.phone != "" || this.form.value.email != "") {
            this.errorMessage = null;
            return true;
        } else {
            this.errorMessage = "Por favor, ingrese su teléfono o correo electrónico"; //, ingrese su teléfono o correo electrónico
            return false;
        }
    }
}
