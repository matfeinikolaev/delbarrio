import { Component, OnInit } from '@angular/core';
import { Settings } from './../../data/settings';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { ApiService } from '../../api.service';
import { Store } from './../../data/store';
import {Subject} from 'rxjs';
@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.page.html',
  styleUrls: ['./edit-order.page.scss'],
})
export class EditOrderPage implements OnInit {
	id: any;
    orders: any;
    disableButton: boolean = false;
    path: any;
    userIsManager: any;
    constructor(public router: Router, public platform: Platform, public api: ApiService, public settings: Settings, public store: Store, public route: ActivatedRoute, public loadingController: LoadingController, public navCtrl: NavController) { }

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');
        console.log(this);
        this.getOrder();
    }

    async getOrder() {
        var path: string;
        if (this.settings.user.userIsManager) {
            path = JSON.parse(window.localStorage.store_site);
        } else path = this.store.store.post_name;

        const loading = await this.loadingController.create({
            message: 'Cargando...',
            translucent: true,
            cssClass: 'custom-class custom-loading'
        });

        if(typeof(path) == "object" && this.path == null) {
            loading.present();
            this.getOrderManager(path, 0).finally().then(() => {
                loading.dismiss();
            }, err => {
                console.error(err);
            });
        } else if(this.path != null) {
            await loading.present();
            await this.api.postItem('order', {id: this.id}, this.path).then(res => {
                this.orders = res;
                loading.dismiss();
            }, err => {
                console.log(err);
                loading.dismiss();
            });
        } else {
            await loading.present();
            await this.api.postItem('order', {id: this.id}, path).then(res => {
                this.orders = res;
                loading.dismiss();
            }, err => {
                console.log(err);
                loading.dismiss();
            });
        }
    }
    async getOrderManager (path, i) {

        await this.api.postItem('order', {id: this.id}, path[i]).then(res => {
            if (res == null) {
                this.getOrderManager(path, i+1);
            } else {
                this.orders = res;
                this.path = path[i];
            }
        }, err => {
            console.log(err);
        });
    }
    save(){
        this.disableButton = true;
        this.orders.order_id = this.orders.id;
        this.api.postItem('update_order', this.orders, this.path).then(res => {
            this.disableButton = false;
            this.navCtrl.navigateForward('/tabs/account/vendor-orders');
        }, err => {
            console.log(err);
            this.disableButton = false;
        });
    }
}
