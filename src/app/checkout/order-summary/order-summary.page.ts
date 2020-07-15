import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { Data } from './../../data';
import { ChatApi } from './../../chat/chat.api';
import { OneSignal } from '@ionic-native/onesignal/ngx';
@Component({
    selector: 'app-order-summary',
    templateUrl: './order-summary.page.html',
    styleUrls: ['./order-summary.page.scss'],
})
export class OrderSummaryPage implements OnInit {
    id: any;
    order: any;
    filter: any = {};
    storePath: any = '';
    constructor(public onesignal: OneSignal , public chatapi: ChatApi,public data: Data, public api: ApiService, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute) {}
    async getOrder() {
        console.log(this);
        const loading = await this.loadingController.create({
            message: 'Cargando...',
            translucent: true,
            animated: true,
            backdropDismiss: true
        });
        await loading.present();
        await this.api.postItem('order', this.filter, this.storePath).then(res => {
            console.log(res);
            this.order = res;
            loading.dismiss();
        }, err => {
            console.log(err);
            loading.dismiss();
        }).then(() => {
            // this.postFireBaseMessage();
        }, err => {
            console.error(err);
        });
    }
    ngOnInit() {
        this.filter.onesignal_user_id = this.data.onesignal_ids.userId;
        this.filter.id = this.route.snapshot.paramMap.get('id');
        this.filter.store_id = this.data.store.ID;
        this.storePath = this.route.snapshot.paramMap.get('storeID');
        console.log(this);
        this.getOrder();
    }
    continue () {
        //Clear Cart
        this.api.postItem('emptyCart', {}, this.storePath).then(res => {}, err => {});
        this.navCtrl.navigateRoot('/tabs/home');
    }
}