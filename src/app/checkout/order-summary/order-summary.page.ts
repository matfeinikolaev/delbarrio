import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { Data } from './../../data';
import { ChatApi } from './../../chat/chat.api';
import { OneSignal } from '@ionic-native/onesignal/ngx';
// import { Map } from './../../googleMap/googleMap';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    CameraPosition,
    MarkerOptions,
    Marker,
    Environment
  } from '@ionic-native/google-maps';
declare var google;
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
    @ViewChild ("map", {static: true}) map: ElementRef;
    constructor(/*public gMap: Map, */public localNotifications: LocalNotifications,public onesignal: OneSignal , public chatapi: ChatApi,public data: Data, public api: ApiService, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute) {}
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
            var result: any = res;
            switch(result.status) {
                case 'on-hold': result.status = 'en-espera'; break;
                case 'pending': result.status = 'pendiente'; break;
                case 'processing': result.status = 'procesando'; break;
                case 'completed': result.status = 'completado'; break;
                case 'cancelled': result.status = 'cancelado'; break;
                case 'refunded': result.status = 'reembolsado'; break;
                case 'failed': result.status = 'fallido'; break;
                default: break;
            }
            console.log(res);
            this.order = result;
            loading.dismiss();
        }, err => {
            console.log(err);
            loading.dismiss();
        }).finally().then(() => {
            this.sendNotification();
        }, err => {
            console.error(err);
        });
    }
    sendNotification() {
        window.localStorage.setItem("storePath", this.storePath);
        this.localNotifications.schedule({
            title: "Estado de su Orden " + this.order.id,
            text: "Estimado/a " + this.order.billing.first_name + ' ' + this.order.billing.last_name
            + " el estado de su orden es: " + this.order.status,
            foreground: true,
            data: { type: "order-summary", id: this.order.id }
        });
        this.localNotifications.on('click').subscribe((notification) => {
            console.log(notification.data.type);
            if (notification.data.type == "order-summary") {
                var link = "/tabs/account/orders/order/" + notification.data.id;
                console.log(link);
                this.navCtrl.navigateForward(link);
            }
        }, err => {
            console.error(err);
        });
    }
    ngOnInit() {
        // this.filter.onesignal_user_id = this.data.onesignal_ids.userId;
        this.filter.id = this.route.snapshot.paramMap.get('id');
        // this.filter.store_id = this.data.store.ID;
        this.storePath = this.route.snapshot.paramMap.get('storeID');
        console.log(this);
        this.getOrder();
    }
    getStore() {
        this.api.postItem('store', {'store_id':window.localStorage.store_id}).then(res => {
            this.data.store = res;
            this.loadMap();
        }, err=>{
            console.error(err);
        })
        // .finally().then(() => {
        //   this.updateOrder();
        // }, err => {
        //   console.error(err);
        // });
    }
    ngAfterViewInit() {
        if (!this.data.store) {
          this.getStore();
        }
        else this.loadMap();
    }
    loadMap() {
        let coords = new google.maps.LatLng(this.data.store.wordpress_store_locator_lat, this.data.store.wordpress_store_locator_lng);
        let mapOptions/*: google.maps.MapOptions*/ = {
            center: coords,
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
        };

        var mapElement = document.createElement("ion-card");
        var mapElementCont = document.createElement("ion-card-content");

        mapElement.setAttribute("id", "map");
        mapElementCont.setAttribute("id", "mapCont")
        this.map.nativeElement.appendChild(mapElement);
        mapElement.appendChild(mapElementCont);
        mapElement.setAttribute("style", "width: 94%; height:100%;");
        mapElementCont.setAttribute("style", "width: 100%; height:100%; ");

        var map = new google.maps.Map(mapElementCont, mapOptions);
        google.maps.event.trigger(map, "resize");

        var marker = new google.maps.Marker({position: coords, map: map});

        var link = document.createElement("ion-button");
        var mapRedirect = document.createElement("ion-item");
        mapRedirect.appendChild(link);
        link.setAttribute("href", "http://maps.google.com/maps?daddr=" + this.data.store.wordpress_store_locator_lat + ", " + this.data.store.wordpress_store_locator_lng);
        link.innerHTML = "Abrir tienda en google maps";
        link.style.fontSize = "3vw";
        link.target = "_blank";

        this.map.nativeElement.before(mapRedirect);
    }
    checkMetaType(val) {
        if (typeof(val) == 'object') {
            return false;
        }
        else {
            return true;
        }
    }
    continue () {
        //Clear Cart
        this.api.postItem('emptyCart', {}, this.data.store.path).then(res => {}, err => {});
        this.navCtrl.navigateRoot('/tabs/successfull-order');
    }
}
