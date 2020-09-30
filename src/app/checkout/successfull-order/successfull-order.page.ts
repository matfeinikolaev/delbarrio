import { Component, OnInit, ViewChild, ElementRef, NgZone, ContentChild, ViewChildren } from '@angular/core';
import { NavController, Platform, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { CheckoutData } from '../../data/checkout';
import { Data } from '../../data';
import { Settings } from './../../data/settings';
import { Storage } from '@ionic/storage';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { mainModule } from 'process';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

@Component({
    selector: 'app-successfull-order-info',
    templateUrl: './successfull-order.page.html',
    styleUrls: ['./successfull-order.page.scss'],
})

export class SuccessfullOrderPage{
    storePath: any;
    errorMessage: any;
    userMeta: any;
    constructor(public route: ActivatedRoute, public data: Data, public settings: Settings, public api: ApiService, public checkoutData: CheckoutData, public navCtrl: NavController) {}
    ngOnInit() {
        console.log(this);
        // this.storePath = this.route.snapshot.paramMap.get('storePath');
    }
}