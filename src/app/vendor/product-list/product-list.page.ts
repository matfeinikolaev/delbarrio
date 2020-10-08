import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../../api.service';
import { Data } from './../../data';
import { Settings } from './../../data/settings';
import { Product } from './../../data/product';
import { FilterPage } from './../../filter/filter.page';
import { Store } from './../../data/store';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage {
    products: any;
    tempProducts: any = [];
    subCategories: any = [];
    filter: any = {};
    attributes: any;
    hasMoreItems: boolean = true;
    loader: boolean = false;
    searchInput: any;
    store: any;
    constructor(public platform: Platform, public alertController: AlertController, public modalController: ModalController, public api: ApiService, public data: Data, public product: Product, public store: Store, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute) {
        this.filter.page = 1;
        // this.filter.vendor = this.settings.customer.id;
        if(this.settings.administrator) {
            // delete this.filter.vendor;
        }
    }
    async getFilter() {
        const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
                filter: this.filter,
                attributes: this.attributes
            }
        });
        modal.present();
        const {
            data
        } = await modal.onDidDismiss();
        if (data) {
            this.filter = data;
            this.filter.page = 1;
            this.getProducts();
        }
    }
    async loadData(event) {
        this.filter.page = this.filter.page + 1;
        await this.api.getItem('products', this.filter).then(res => {
            this.tempProducts = res;
            this.products.push.apply(this.products, this.tempProducts);
            event.target.complete();
            if (this.tempProducts.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
    async getProducts() {
        this.loader = true;
        await this.api.postItem('get_all_products', this.filter, this.store.store.post_name).then(res => {
            console.log(this.filter);
            console.log(res);
            this.products = res;
            this.loader = false;
        }, err => {
            console.log(err);
        });
    }
    async getAttributes() {
        await this.api.postItem('product-attributes', {
            category: this.filter.category
        }, this.store.store.post_name).then(res => {
            this.attributes = res;
        }, err => {
            console.log(err);
        });
    }
    getStore() {
        this.api.postItem('get_user_sites', {id: this.settings.user.id}).then(res => {
            this.store = res;
        }, err => {
            console.error(err);
        }).finally().then(() => {
            // this.http.post(this.store + "get_all_products")
        }, err => {
            console.error(err);
        });
    }
    ngOnInit() {
        console.log(this);
        this.filter.category = this.route.snapshot.paramMap.get('id');
        if (this.data.categories && this.data.categories.length) {
            for (var i = 0; i < this.data.categories.length; i++) {
                if (this.data.categories[i].parent == this.filter.category) {
                    this.subCategories.push(this.data.categories[i]);
                }
            }
        }
        if (this.settings.colWidthProducts == 4) this.filter.per_page = 15;
        if (this.settings.user.userIsManager) {
            this.getStore();
        } else {
            this.getProducts();
            this.getAttributes();
        }
    }
    onInput() {
        this.filter.page = 1;
        delete this.filter.sku;
        this.filter.q = this.searchInput;
        this.getProducts();
        this.loader = false;
    }
    getProduct(product) {
        this.product.product = product;
        this.navCtrl.navigateForward(this.router.url + '/view-product/' + product.id);
    }
    getCategory(id) {
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + id);
    }
    editProduct(product){
        this.product.product = product;
        this.navCtrl.navigateForward(this.router.url + this.store.store.ID +'/edit-product/' + product.ID);
    }

    goTo(link) {
        this.navCtrl.navigateForward(link);
    }

    async delete(product){
        const alert = await this.alertController.create({
          header: 'Borrar',
          message: 'Está seguro, que quiere borrar este producto?',
          buttons: [{
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Borrar',
          handler: () => {
            this.api.postItem('delete_user_post', {ID: product.ID}, product.path).then(res => {
                console.log(product);
                this.getProducts();
            }, err => {
                console.log(err);
            });
         }
        }]

        });

        await alert.present();
    }
}