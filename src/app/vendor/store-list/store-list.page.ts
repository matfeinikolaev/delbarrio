import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../../api.service';
import { Data } from './../../data';
import { Settings } from './../../data/settings';
import { Store } from './../../data/store';
import { FilterPage } from './../../filter/filter.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.page.html',
  styleUrls: ['./store-list.page.scss'],
})
export class StoreListPage {
    stores: any;
    tempStores: any = [];
    subCategories: any = [];
    filter: any = {};
    attributes: any;
    hasMoreItems: boolean = true;
    loader: boolean = false;
    searchInput: any;
    constructor(public iab: InAppBrowser, public platform: Platform, public alertController: AlertController, public modalController: ModalController, public api: ApiService, public data: Data, public store: Store, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute) {
        this.filter.page = 1;
        this.filter.vendor = this.settings.customer.id;
        if(this.settings.administrator) {
            delete this.filter.vendor;
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
            this.getStores();
        }
    }
    async loadData(event) {
        this.filter.page = this.filter.page + 1;
        await this.api.postItem('get_user_stores', this.filter).then(res => {
            this.tempStores = res;
            if(this.tempStores[0].ID != this.stores[0].ID)
                this.stores.push.apply(this.stores, this.tempStores);
            event.target.complete();
            if (this.tempStores.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
    async getStores() {
        // this.loader = true;
        this.filter.managed_sites = JSON.stringify(this.settings.user.managed_sites);
        await this.api.postItem('get_user_stores', this.filter).then(res => {
            console.log(this.filter);
            console.log(res);
            this.stores = res;
            this.loader = false;
        }, err => {
            console.log(err);
        });
    }
    async getAttributes() {
        await this.api.postItem('product-attributes', {
            category: this.filter.category
        }, '/testmatfei/').then(res => {
            this.attributes = res;
        }, err => {
            console.log(err);
        });
    }
    ngOnInit() {
        this.filter.category = this.route.snapshot.paramMap.get('id');
        if (this.data.categories && this.data.categories.length) {
            for (var i = 0; i < this.data.categories.length; i++) {
                if (this.data.categories[i].parent == this.filter.category) {
                    this.subCategories.push(this.data.categories[i]);
                }
            }
        }
        if (this.settings.colWidthProducts == 4) this.filter.per_page = 15;
        this.getStores();
        // this.getAttributes();
    }
    ngAfterViewInit() {
    }
    getStore(store) {
        this.store.store = store;
        this.navCtrl.navigateForward(this.router.url + '/view-store/' + store.ID);
    }
    getCategory(id) {
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + id);
    }
    editStore(store){
        this.store.store = store;
        this.navCtrl.navigateForward(this.router.url + '/edit-store/' + store.ID);
    }

    goTo(link, store) {
        this.store.store = store;
        this.navCtrl.navigateForward(link);
    }
    
    viewProducts(store) {
        this.store.store = store;
        this.navCtrl.navigateForward('tabs/account/vendor-stores/view-store/' + store.ID);
    }
    onInput() {
        this.filter.page = 1;
        delete this.filter.sku;
        this.filter.q = this.searchInput;
        this.getStores();
    }

    addStore() {
        var options = "location=no,hidden=yes,toolbar=yes,hidespinner=yes";
        var browser = this.iab.create("https://delbarrio.ec/crear-tienda/", "_self", options);
        browser.show();
        browser.on("loadstart").subscribe(data => {
            for (let k in data) {
                console.log(k);
                console.log(data[k]);
            }
        }, err => {
            console.error(err);
        });
        // browser.on('exit').subscribe(data => {
        //     console.log(data);
        // });
    }

    async delete(store){
        const alert = await this.alertController.create({
          header: 'Borrar',
          message: 'Está seguro, que quiere borrar esta tienda?',
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
            this.api.postItem('delete_user_post', {ID: store.ID}).then(res => {
                this.getStores();
            }, err => {
                console.log(err);
            });
         }
        }]

        });

        await alert.present();
    }
}