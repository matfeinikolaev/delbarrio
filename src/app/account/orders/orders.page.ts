import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { NavigationExtras } from '@angular/router';

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
    constructor(public api: ApiService, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute) {
        this.filter.page = 1;
        this.filter.customer = this.settings.customer.id;
    }
    ngOnInit() {
        if(this.settings.customer){
            // this.getOrders();
            this.getStores();
        }
    }
    async getStores() {
        await this.api.postItem('get_checkout_stores').then(res => {
            this.stores = res;
            console.log(this);
            for( let store of this.stores ) {
                this.getOrders(store);
            }
        }, err => {
            console.log(err);
        });
    }
    async getOrders(store) {
        this.filter.user = this.settings.user.ID;
        await this.api.postItem('orders', this.filter, store.storepath).then(res => {
            var result: any = res;
            for ( let order of result ) {            
                switch(order.status) {
                    case 'on-hold': order.status = 'en-espera'; break;
                    case 'pending': order.status = 'pendiente'; break;
                    case 'processing': order.status = 'procesando'; break;
                    case 'completed': order.status = 'completado'; break;
                    case 'cancelled': order.status = 'cancelado'; break;
                    case 'refunded': order.status = 'reembolsado'; break;
                    case 'failed': order.status = 'fallido'; break;
                    default: break;
                }
            }
            this.orders == undefined? this.orders = result : this.orders = this.orders.concat(result);

        }, err => {
            console.log(err);
        });
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
                        case 'processing': order.status = 'procesando'; break;
                        case 'completed': order.status = 'completado'; break;
                        case 'cancelled': order.status = 'cancelado'; break;
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
        let navigationExtras: NavigationExtras = {
            queryParams: {
                order: order
            }
        };
        this.navCtrl.navigateForward('/tabs/account/orders/order/' + order.id, navigationExtras);
    }
}