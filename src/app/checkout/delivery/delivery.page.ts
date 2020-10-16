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
    selector: 'app-delivery',
    templateUrl: './delivery.page.html',
    styleUrls: ['./delivery.page.scss'],
})

export class DeliveryPage {
    errorMessage: any;
    storePath: any;
    loader = true;
    constructor(public data: Data, public api: ApiService, public checkoutData: CheckoutData, public navCtrl: NavController, public route: ActivatedRoute, public settings: Settings) {}
    ngOnInit () {
        console.log(this);
        this.storePath = this.route.snapshot.paramMap.get('storePath');
        if (Object.keys(this.checkoutData.form).length == 0) {
          this.getCheckoutForm();
        }
    }
    async getCheckoutForm() {
        this.loader = true;
        await this.api.postItem('get_checkout_form', {}, this.storePath).then(res => {
            console.log(res);
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
            this.checkoutData.form.delivery_date = this.settings.user.delivery_date;
            this.checkoutData.form.delivery_time = this.settings.user.delivery_time;
            // if(!this.checkoutData.form.ship_to_different_address)
            this.navCtrl.navigateForward('/tabs/cart/contacts/' + this.storePath + '/');
        }
    }
    delivDateLoaded() {
        var currDate = format(new Date(), 'yyyy-MM-dd');
        var deliv_date = document.getElementById("delivery_date");
        deliv_date.setAttribute('min', currDate);
    }
    delivTimeLoaded() {
        var deliv_date = document.getElementById("delivery_date");
        var deliv_time = document.getElementById("delivery_time");
        var dateValue = deliv_date.getAttribute('ng-reflect-model');
        var chosenWeekDay = format(new Date(dateValue), 'iii');
        var openHour = this.data.store[chosenWeekDay + '_o'];
        var closeHour = this.data.store[chosenWeekDay + '_c'];
        if (openHour != null) {
            if(dateValue != format(new Date(), 'yyyy-MM-dd')) {
                deliv_time.setAttribute('min', openHour);
            }
        }
        if (closeHour != null) {
            deliv_time.setAttribute('max', closeHour);
        }
    }
    validateForm(){

        if(this.settings.user.delivery_date == '' || this.settings.user.delivery_date == undefined){
            this.errorMessage = 'Dia de Entrega es un campo obligatorio';
            return false;
        }

        if(this.settings.user.delivery_time == '' || this.settings.user.delivery_time == undefined){
            this.errorMessage = 'Hora de Entrega es un campo obligatorio';
            return false;
        }

        return true;
    }
}
