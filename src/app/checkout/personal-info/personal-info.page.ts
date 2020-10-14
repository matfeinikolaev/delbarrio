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
    selector: 'app-personal-info',
    templateUrl: './personal-info.page.html',
    styleUrls: ['./personal-info.page.scss'],
})

export class PersonalInfoPage{
    storePath: any;
    errorMessage: any;
    userMeta: any;
    constructor(public route: ActivatedRoute, public data: Data, public settings: Settings, public api: ApiService, public checkoutData: CheckoutData, public navCtrl: NavController) {}
    ngOnInit() {
        console.log(this);
        this.storePath = this.route.snapshot.paramMap.get('storePath');
    }
    continueCheckout() {

        this.errorMessage  = '';

        if(this.validateForm()){
            this.checkoutData.form.billing_company_type = this.settings.user.billing_company_type;
            this.checkoutData.form.billing_document_type = this.settings.user.billing_document_type;
            this.checkoutData.form.billing_document = this.settings.user.billing_document;
            // if(!this.checkoutData.form.ship_to_different_address)
            this.navCtrl.navigateForward('/tabs/cart/checkout/' + this.storePath + '/');
        }
    }
    validateForm(){
        if(this.settings.user.billing_company_type == '' || this.settings.user.billing_company_type == undefined){
            this.errorMessage = 'El tipo de empresa es un campo obligatorio';
            return false;
        }

        if(this.settings.user.billing_document_type == '' || this.settings.user.billing_document_type == undefined){
            this.errorMessage = 'El tipo de documento es un campo obligatorio';
            return false;
        }

        if(this.settings.user.billing_document_type == '' || this.settings.user.billing_document_type == undefined){
            this.errorMessage = 'La identificación es un campo obligatorio';
            return false;
        }

        if(this.checkoutData.form.billing_first_name == '' || this.checkoutData.form.billing_first_name == undefined){
            this.errorMessage = 'El nombre de facturación es un campo obligatorio';
            return false;
        }

        if(this.checkoutData.form.billing_last_name == '' || this.checkoutData.form.billing_last_name == undefined){
            this.errorMessage = 'El apellido de facturación es un campo obligatorio';
            return false;
        }

        return true;
    }
}