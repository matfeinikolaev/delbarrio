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
    selector: 'app-contacts',
    templateUrl: './contacts.page.html',
    styleUrls: ['./contacts.page.scss'],
})

export class ContactsPage{
    storePath: any;
    errorMessage: any;
    constructor(public route: ActivatedRoute, public data: Data, public settings: Settings, public api: ApiService, public checkoutData: CheckoutData, public navCtrl: NavController) {}
    ngOnInit() {
        console.log(this);
        this.storePath = this.route.snapshot.paramMap.get('storePath');
    }
    continueCheckout() {

        this.errorMessage  = '';

        if(this.validateForm()){
            // if(!this.checkoutData.form.ship_to_different_address)
            this.navCtrl.navigateForward('/tabs/cart/personal-info/' + this.storePath + '/');
        }
    }
    validateForm(){
        
        if(this.checkoutData.form.billing_phone == '' || this.checkoutData.form.billing_phone == undefined){
            this.errorMessage = 'Telefono es un campo obligatorio';
            return false;
        }

        if(this.checkoutData.form.billing_email == '' || this.checkoutData.form.billing_email == undefined){
            this.errorMessage = 'Correo Electrónico es un campo obligatorio';
            return false;
        }

        return true;
    }
}