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
    loader = true;
    constructor(public route: ActivatedRoute, public data: Data, public settings: Settings, public api: ApiService, public checkoutData: CheckoutData, public navCtrl: NavController) {}
    ngOnInit() {
        console.log(this);
        this.storePath = this.route.snapshot.paramMap.get('storePath');
        if (Object.keys(this.checkoutData.form).length == 0) {
          this.getCheckoutForm();
        }
    }
    async getCheckoutForm() {
        this.loader = true;
        await this.api.postItem('get_checkout_form', {}, this.storePath).then(res => {
            this.checkoutData.form = res;
            this.checkoutData.form.sameForShipping = true;
            this.checkoutData.form.billing_country = "EC";
            this.checkoutData.form.shipping_country = "EC";
            if(this.checkoutData.form.countries) {
                // if(this.checkoutData.form.countries.length == 1) {
                // this.checkoutData.form.billing_country = this.checkoutData.form.countries[0].value;
                // this.checkoutData.form.shipping_country = this.checkoutData.form.countries[0].value;
                // }
                this.checkoutData.billingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.billing_country);
                this.checkoutData.shippingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.shipping_country);
            }
            if(this.checkoutData.form.ship_to_different_address == null) {
                this.checkoutData.form.ship_to_different_address = false;
            }
            this.loader = false;
        }, err => {
            console.log(err);
            this.loader = false;
        });
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
