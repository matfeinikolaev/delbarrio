// import { Component, OnInit } from '@angular/core';
// import { LoadingController, NavController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ApiService } from '../../api.service';
// import { Settings } from './../../data/settings';
// import { NavigationExtras } from '@angular/router';

// @Component({
//     selector: 'app-orders',
//     templateUrl: './orders.page.html',
//     styleUrls: ['./orders.page.scss'],
// })
// export class OrdersPage implements OnInit {
//     filter: any = {};
//     orders: any;
//     hasMoreItems: boolean = true;
//     stores: any = [];
//     constructor(public api: ApiService, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute) {
//         this.filter.page = 1;
//         this.filter.customer = this.settings.customer.id;
//     }
//     ngOnInit() {
//         if(this.settings.customer){
//             this.getStores();
//         }
//     }
//     async getStores() {
//         await this.api.postItem('get_checkout_stores').then(res => {
//             this.stores = res;
//             console.log(this);
//             for( let store of this.stores ) {
//                 this.getOrders(store);
//                 console.log(this);
//             }
//         }, err => {
//             console.log(err);
//         });
//     }
//     async getOrders(store) {
//         this.filter.user = this.settings.user.ID;
//         await this.api.postItem('orders', this.filter, store.storepath).then(res => {
//             this.orders == undefined ? this.orders = res : this.orders = this.orders.concat(res);
//             var result: any = res;
//             for ( let order of result ) {            
//                 switch(order.status) {
//                     case 'on-hold': order.status = 'en-espera'; break;
//                     case 'pending': order.status = 'pendiente'; break;
//                     case 'processing': order.status = 'procesando'; break;
//                     case 'completed': order.status = 'completado'; break;
//                     case 'cancelled': order.status = 'cancelado'; break;
//                     case 'refunded': order.status = 'reembolsado'; break;
//                     case 'failed': order.status = 'fallido'; break;
//                     default: break;
//                 }
//             }
//             this.orders == undefined? this.orders = result : this.orders = this.orders.concat(result);

//         }, err => {
//             console.log(err);
//         });
//     }
//     async loadData(event) {
//         this.filter.page = this.filter.page + 1;
//         for( let store of this.stores ) {
//             await this.api.postItem('orders', this.filter, store.storepath).then(res => {            
//                 var result: any = res;
//                 for ( let order of result ) {            
//                     switch(order.status) {
//                         case 'on-hold': order.status = 'en-espera'; break;
//                         case 'pending': order.status = 'pendiente'; break;
//                         case 'processing': order.status = 'procesando'; break;
//                         case 'completed': order.status = 'completado'; break;
//                         case 'cancelled': order.status = 'cancelado'; break;
//                         case 'refunded': order.status = 'reembolsado'; break;
//                         case 'failed': order.status = 'fallido'; break;
//                         default: break;
//                     }
//                 }
//                 this.orders.push.apply(this.orders, result);
//                 event.target.complete();
//                 if (!res) this.hasMoreItems = false;
//             }, err => {
//                 event.target.complete();
//             });
//         }
//         console.log('Done');
//     }
//     getDetail(order) {
//         console.log(order);
//         let navigationExtras: NavigationExtras = {
//             queryParams: {
//                 order: order
//             }
//         };
//         this.navCtrl.navigateForward('/tabs/account/orders/order/' + order.id, navigationExtras);
//     }
// }

import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { NavigationExtras } from '@angular/router';
// import {Plugins, LocalNotificationEnabledResult, LocalNotificationActionPerformed, LocalNotification, Device} from '@capacitor/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
// const {LocalNotifications} = Plugins;
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.page.html',
    styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
    filter: any = {};
    orders: any;
    hasMoreItems: boolean = true;
    stores: any = [];
    constructor(public localNotifications: LocalNotifications, public api: ApiService, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute, private http: HttpClient) {
        this.filter.page = 1;
        this.filter.customer = this.settings.customer.id;
    }

    ngOnInit() {
        if(this.settings.customer){
            // this.getOrders();
            this.getStores();
            this.getLastOrder();
        }
    }
    async getStores() {
        await this.api.postItem('get_checkout_stores').then(res => {
            this.stores = res;
            for( let store of this.stores ) {
                this.getOrders(store);
            }
        }, err => {
            console.log(err);
        })

    }
    async getOrders(store) {
        this.filter.user = this.settings.user.ID;
        await this.api.postItem('orders', this.filter, store.storepath).then( res => {
            this.orders == undefined ? this.orders = res : this.orders = this.orders.concat(res);
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
            return this.getActualOrder(this.orders);
        }, err => {
            console.log(err);
        });
    }

    async getLastOrder() {
        this.getActualOrder(this.settings.user.ID).then(data => {
            var result: any = data;
            if (result.status == 'success') {
                setInterval(() => {
                    this.notificationApply(data[0]);
                }, 60000)
            }
        })

    }


    async loadData(event) {
        this.filter.page = this.filter.page + 1;
        for( let store of this.stores ) {
            await this.api.postItem('orders', this.filter, store.storepath).then(res => {
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
                this.orders.push.apply(this.orders, result);
                event.target.complete();
                if (!res) this.hasMoreItems = false;
            }, err => {
                event.target.complete();
            });
        }
        console.log('Done');
    }
    getDetail(order) {
        console.log(order);
        let navigationExtras: NavigationExtras = {
            queryParams: {
                order: order
            }
        };
        this.navCtrl.navigateForward('/tabs/account/orders/order/' + order.id, navigationExtras);
    }

    getActualOrder(user_id){
        return new Promise((resolve, reject) => {
            this.http.post('https://delbarrio.ec//wp-admin/admin-ajax.php?action=mstoreapp-get_last_order&user='+user_id,'')
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
            trigger: {at: new Date(new Date().getTime() + 250)},
            data: { secret: 'secret' }
        }]);
    }


}