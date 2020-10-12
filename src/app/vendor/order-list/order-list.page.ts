import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { Store } from './../../data/store';
import { NavigationExtras } from '@angular/router';
import {HttpClient} from "@angular/common/http";
import {LocalNotifications} from "@ionic-native/local-notifications/ngx";
@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit {
    filter: any = {};
    orders: any = [];
    hasMoreItems: boolean = true;
    loader: boolean = true;
    store_site: any;
    userIsManager: any;
    constructor(public actionSheetController: ActionSheetController, public platform: Platform, public api: ApiService, public settings: Settings, public store: Store, public router: Router, public navCtrl: NavController, public route: ActivatedRoute, private http: HttpClient, public localNotifications: LocalNotifications) {
        this.filter.page = 1;
        this.filter.vendor = this.settings.customer.id;
        if(this.settings.administrator) {
            delete this.filter.vendor;
        }
    }
    ionViewWillEnter(){
        this.loader = true;
        if (this.orders != []) this.orders = [];
        if(this.settings.user.userIsManager) {
            this.getStore();
        } else if(this.settings.settings.vendorType === 'product_vendor') {
            this.getWooCommerceProductVendorOrders();
        } else {
            this.getOrders(); //THIS WORKS FOE WCFM ALSO, DO NOT CHANEG THIS. WCFM API NOT WORKING
        }
    }
    ngOnInit() {
        //WCFM DO NOT USE THIS. WCFM API THIS IS NOT WORKING
        //this.getWCFMOrders();
    }
    getStore() {
        this.api.postItem('get_user_sites', {id: this.settings.user.ID}).then(res => {
            this.store_site = res;
            if (window.localStorage.getItem("store_site") != null) {
                window.localStorage.removeItem("store_site");
                window.localStorage.setItem("store_site", JSON.stringify(this.store_site.map( a=>a.path )));
            } else {
                window.localStorage.setItem("store_site", JSON.stringify(this.store_site.map( a=>a.path )));
            }
        }, err => {
            console.error(err);
        }).finally().then(() => {
            this.getOrdersManager(0);
            this.getLastOrderStore(0);
        }, err => {
            console.error(err);
        });
    }
    async getOrdersManager(i) {
        this.loader = true;
        await this.api.postItem('orders', this.filter, this.store_site[i].path).then(res => {
            var result: any = res;
            for ( let order of result ) {
                switch(order.status) {
                    case 'on-hold': order.status = 'en-espera'; break;
                    case 'pending': order.status = 'pendiente'; break;
                    case 'completed': order.status = 'completado'; break;
                    case 'cancelled': order.status = 'cancelado'; break;
                    case 'processing': order.status = 'procesando'; break;
                    case 'refunded': order.status = 'reembolsado'; break;
                    case 'failed': order.status = 'fallido'; break;
                    default: break;
                }
            }
            this.orders = result;
            this.loader = false;
        }, err => {
            console.log(err);
        }).finally().then(() => {
            if (i != this.store_site.length - 1) {
                this.getOrdersManager(i+1);
            }
        });
    }

    async getLastOrderStore(i) {
        this.getActualOrderStore(this.store_site[i].blog_id).then(data => {
            var result: any = data;
            if (result.length > 1) {
                return this.notificationApply(data[0]);
           }
        });

    }

    getOrders() {
        this.api.postItem('orders', this.filter, this.store.store.post_name).then(res => {
            var result: any = res;
            for ( let order of result ) {
                switch(order.status) {
                    case 'on-hold': order.status = 'en-espera'; break;
                    case 'pending': order.status = 'pendiente'; break;
                    case 'completed': order.status = 'completado'; break;
                    case 'cancelled': order.status = 'cancelado'; break;
                    case 'processing': order.status = 'procesando'; break;
                    case 'refunded': order.status = 'reembolsado'; break;
                    case 'failed': order.status = 'fallido'; break;
                    default: break;
                }
            }
            this.orders = result;
            this.loader = false;
        }, err => {
            console.log(err);
        });
    }
    loadData(event) {
        this.filter.page = this.filter.page + 1;
        this.api.getItem('orders', this.filter).then(res => {
            this.orders.push.apply(this.orders, res);
            event.target.complete();
            if (!res) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }

    getDetail(order) {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                order: order
            }
        };
        this.navCtrl.navigateForward('/tabs/account/vendor-orders/view-order/' + order.id, navigationExtras);
    }
    editOrder(order) {
        this.navCtrl.navigateForward('/tabs/account/vendor-orders/edit-order/' + order.id);
    }

    getWooCommerceProductVendorOrders() {
        this.api.postItem('vendor-order-list', this.filter, this.store.store.post_name).then(res => {
            this.orders = res;
            this.loader = false;
        }, err => {
            console.log(err);
        });
    }
    
    async updateOrderStatus(order) {
      const actionSheet = await this.actionSheetController.create({
      header: 'Estado',
      buttons: [{
        text: 'Cumplido',
        icon: 'checkmark',
        handler: () => {
            this.api.postItem('set_fulfill_status', {status: 'fulfilled', order_item_id: order.order_item_id}, this.store.store.post_name).then(res => {
                order.fulfillment_status = res;
            }, err => {
                console.log(err);
            });
        }
      }, {
        text: 'No cumplido',
        icon: 'close',
        handler: () => {
            this.api.postItem('set_fulfill_status', {status: 'unfulfilled', order_item_id: order.order_item_id}, this.store.store.post_name).then(res => {
                order.fulfillment_status = res;
            }, err => {
                console.log(err);
            });
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
        }]
      });
      await actionSheet.present();        
    }

    //WCFM
    /*getWCFMOrders(){
        this.loader = true;
        if (this.platform.is('hybrid'))
        this.api.getWCFMIonic('orders', this.filter).then((res) => {
            this.orders = res;
            this.loader = false;
        }, err => {
            console.log(err);
        });
        else {
            this.api.getWCFM('orders', this.filter).then(res => {
                this.orders = res;
                this.loader = false;
            }, err => {
                console.log(err);
            });
        }
    }
    loadData(event) {
        this.filter.page = this.filter.page + 1;
        if (this.platform.is('hybrid'))
            this.api.getWCFMIonic('orders', this.filter).then((res) => {
                this.orders.push.apply(this.orders, res);
                event.target.complete();
                if (!res) this.hasMoreItems = false;
            }, err => {
                event.target.complete();
            });
        else {
            this.api.getWCFM('orders', this.filter).then(res => {
                this.orders.push.apply(this.orders, res);
                event.target.complete();
                if (!res) this.hasMoreItems = false;
            }, err => {
                event.target.complete();
            });
        }
    }*/

    getActualOrderStore(store_id){
        return new Promise((resolve, reject) => {
            this.http.post('https://delbarrio.ec//wp-admin/admin-ajax.php?action=mstoreapp-get_last_order_store&store='+store_id,'')
                .subscribe(data => {
                    resolve(data)
                }, error => {
                    reject(error.error)
                });
        });
    }

    async notificationApply(data) {
        await this.localNotifications.schedule([{
            id: 1,
            title: "Estado de su Orden " + data.ID,
            text: "Estimado " + data.name + ' ' + data.last_name
                + " el estado de su orden es: " + data.order_status,
            foreground: true,
            trigger: { at: new Date(Date.now() + 5000) },
            data: { secret: 'secret' }
        }]);
    }
}