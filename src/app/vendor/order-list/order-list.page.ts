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
    path: any;
    hasMoreItems: boolean = true;
    loader: boolean = true;
    store_site: any;
    userIsManager: any;
    orderTypes: any;
    chosenType: any;
    //These is the final constructor I need
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
            this.getLastOrderStore();
            this.getStore();
        } else if(this.settings.settings.vendorType === 'product_vendor') {
            this.getWooCommerceProductVendorOrders();
        } else {
          this.path = this.store.store.post_name.replace("-", "");
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
        }, err => {
            console.error(err);
        });
    }
    async getOrdersManager(i) {
        this.loader = true;
        await this.api.postItem('orders', this.filter, this.store_site[i].path).then(res => {
          if(res != null) {
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
            this.path = this.store_site[i].path;
            this.loader = false;
          }
        }, err => {
            console.log(err);
        }).finally().then(() => {
            if (this.orders == null) {
                this.getOrdersManager(i+1);
            } else {
                this.api.postItem("get_order_statuses", {}, this.path).then(res => {
                    this.orderTypes = res;
                }, err => {
                    console.error(err);
                });
            }
        });
    }

    getLastOrderStore() {
        if (this.settings.store_owner_id) {
            this.getActualOrderStore(this.settings.store_owner_id).then(data => {
                var result: any = data;
                if (result.status == 'success') {
                    setInterval(() => {
                        this.notificationApply(result);
                    }, 60000);

                } else console.log(result);
            });
        }

    }

    getOrders() {
        this.api.postItem('orders', this.filter, this.store.store.post_name).then(res => {
            console.log(this.store.store);
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

            this.api.postItem("get_order_statuses", {}, this.store.store.post_name).then(res => {
                this.orderTypes = res;
            }, err => {
                console.error(err);
            });
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
    getOrdersByType() {
        this.filter.status = this.chosenType;
        this.loader = true;
        this.api.postItem('orders', this.filter, this.path).then(res => {
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
            this.api.postItem("get_order_statuses", {}, this.path).then(res => {
                this.orderTypes = res;
            }, err => {
                console.error(err);
            });
        });
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

    notificationApply(data) {
        var data_arr = Object.values(data);
        var title_notif = "";
        var texto_notif = "";
        var order_id = [];
        var client_names = [];
        var order_status = [];
        if (data_arr.length > 1){
            for (var i = 0; i < data_arr.length - 1; i++){
                order_id.push(data_arr[i]['ID']);
                client_names.push(data_arr[i]['name']+' '+data_arr[i]['last_name']);
                order_status.push(data_arr[i]['order_status']);
            }
            title_notif = "Su local tiene varias Ordenes " + order_id.join();
            texto_notif = "Clientes  " + client_names.join()
                + " el estado de las Ordenes son: " + order_status.join();
        }else {
            title_notif = "Su local tiene una Orden " + data.ID;
            texto_notif = "Cliente  " + data.name + ' ' + data.last_name
                + " el estado de la Orden es: " + data.order_status;
        }

        this.localNotifications.schedule([{
            id: 1,
            title: title_notif,
            text: texto_notif,
            foreground: true,
            trigger: {at: new Date(new Date().getTime() + 10)},
            data: {secret: 'secret'}
        }]);
    }
}
