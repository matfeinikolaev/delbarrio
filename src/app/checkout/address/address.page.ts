import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, Platform, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { CheckoutData } from '../../data/checkout';
import { Data } from '../../data';
import { Settings } from './../../data/settings';
import { Storage } from '@ionic/storage';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;

@Component({
    selector: 'app-address',
    templateUrl: './address.page.html',
    styleUrls: ['./address.page.scss'],
})
export class CheckoutAddressPage implements OnInit {
    errorMessage: any;
    loader: boolean = false;
    countries: any;
    autocomplete: { input: string; };
    autocompleteItemsFirst: any[];
    autocompleteItemsSecond: any[];
    autocompleteItemsCity: any[];
    autocompleteItemsRegion: any[];
    autocompleteItemsShipFirst: any[];
    autocompleteItemsShipSecond: any[];
    autocompleteItemsShipCity: any[];
    autocompleteItemsShipRegion: any[];
    location: any;
    placeid: any;
    GoogleAutocomplete: any;
    options: GeolocationOptions;
    geoOptions: NativeGeocoderOptions;
    /* For Delivery Date Time */
    mydate: any;
    time: any;
    date: any;
    selectedDate: any;
    storePath: any;
    store: any;
    constructor(
        public data: Data,
        public api: ApiService, 
        public checkoutData: CheckoutData, 
        public router: Router, 
        public navCtrl: NavController, 
        public settings: Settings, 
        public route: ActivatedRoute,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
        public zone: NgZone,
        private tc: ToastController,
        private storage: Storage,
        public service: ApiService,
        public modalCtrl: ModalController,) {
            this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
            this.autocomplete = { input: '' };
            this.autocompleteItemsFirst = [];
            this.autocompleteItemsSecond = [];
            this.autocompleteItemsCity = [];
            this.autocompleteItemsRegion = [];
            this.autocompleteItemsShipFirst = [];
            this.autocompleteItemsShipSecond = [];
            this.autocompleteItemsShipCity = [];
            this.autocompleteItemsShipRegion = [];
        /* For Delivery Date Time */
        /*this.mydate = [];
        this.selectedDate = 0;

        this.mydate[0] = new Date();
        this.mydate[1] = new Date(this.mydate[0].getTime() + (1000 * 60 * 60 * 24));
        this.mydate[2] = new Date(this.mydate[1].getTime() + (1000 * 60 * 60 * 24));
        this.mydate[3] = new Date(this.mydate[2].getTime() + (1000 * 60 * 60 * 24));
        this.mydate[4] = new Date(this.mydate[3].getTime() + (1000 * 60 * 60 * 24));

        var curr_date = ("0" + this.mydate[0].getDate()).slice(-2);
        var curr_month = ("0" + (this.mydate[0].getMonth() + 1)).slice(-2);
        var curr_year = this.mydate[0].getFullYear();
        this.checkoutData.form['jckwds-delivery-date'] = curr_date + '/' + curr_month + '/' + curr_year;
        

        var mm = this.mydate[0].getMonth() + 1;
        var dd = this.mydate[0].getDate();

        this.date = [this.mydate[0].getFullYear(),
              (mm>9 ? '' : '0') + mm,
              (dd>9 ? '' : '0') + dd
             ].join('');

        this.checkoutData.form['jckwds-delivery-date-ymd'] = this.date;  
        this.api.getTime(this.date)
           .then((results) => this.time = results);*/
        /* End of Delivery Date Time */

    }
    /* For Delivery Date Time */
    getTimeSlot(i){
        var curr_date = ("0" + this.mydate[i].getDate()).slice(-2);
        var curr_month = ("0" + (this.mydate[i].getMonth() + 1)).slice(-2);
        var curr_year = this.mydate[i].getFullYear();
        this.checkoutData.form['jckwds-delivery-date'] = curr_date + '/' + curr_month + '/' + curr_year;
        var mm = this.mydate[i].getMonth() + 1;
        var dd = this.mydate[i].getDate();

        this.date = [this.mydate[i].getFullYear(),
              (mm>9 ? '' : '0') + mm,
              (dd>9 ? '' : '0') + dd
             ].join('');
        this.api.ajaxCall('/wp-admin/admin-ajax.php',this.date)
           .then((results) => this.time = results);    
        this.checkoutData.form['jckwds-delivery-date-ymd'] = this.date;   
    }
    
    ngOnInit() {
        this.storePath = this.route.snapshot.paramMap.get('storePath');
        console.log(this);
        this.getCheckoutForm();
        //this.getCountries();
    }
    getRegion() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.billing_state, types:['(regions)'], componentRestrictions: {country: this.checkoutData.form.billing_country } }, (predictions, status) => {
            this.autocompleteItemsRegion = predictions;
        });
    }
    getCity() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.billing_city, types:['(cities)'], componentRestrictions: {country: this.checkoutData.form.billing_country } }, (predictions, status) => {
            this.autocompleteItemsCity = predictions;
        });
    }
    getFirstAddress() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.billing_city + this.checkoutData.form.billing_address_1, componentRestrictions: {country: this.checkoutData.form.billing_country } }, (predictions, status) => {
            this.autocompleteItemsFirst = predictions;
        });
    }    
    getSecondAddress() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.billing_city + this.checkoutData.form.billing_address_2, componentRestrictions: {country: this.checkoutData.form.billing_country } }, (predictions, status) => {
            this.autocompleteItemsSecond = predictions;
        });
    }
    getRegionShip() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.shipping_state, types:['(regions)'], componentRestrictions: {country: this.checkoutData.form.shipping_country } }, (predictions, status) => {
            this.autocompleteItemsShipRegion = predictions;
        });
    }
    getCityShip() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.shipping_city, types:['(cities)'], componentRestrictions: {country: this.checkoutData.form.shipping_country } }, (predictions, status) => {
            this.autocompleteItemsShipCity = predictions;
        });
    }
    getFirstAddressShip() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.shipping_city + this.checkoutData.form.shipping_address_1, componentRestrictions: {country: this.checkoutData.form.shipping_country } }, (predictions, status) => {
            this.autocompleteItemsShipFirst = predictions;
        });
    }    
    getSecondAddressShip() {
        this.GoogleAutocomplete.getPlacePredictions({ input: this.checkoutData.form.shipping_city + this.checkoutData.form.shipping_address_2, componentRestrictions: {country: this.checkoutData.form.shipping_country } }, (predictions, status) => {
            this.autocompleteItemsShipSecond = predictions;
        });
    }
    selectSearchResult(item, addr) {
        this.checkoutData.form[addr] = item.description;
        if( addr == 'billing_address_1' ) {
            this.autocompleteItemsFirst = [];
        }
        else if( addr == 'billing_address_2' ) {
            this.autocompleteItemsSecond = [];
        }
        else if( addr == 'billing_city' ) {
            this.autocompleteItemsCity = [];
        }
        else if( addr == 'billing_state' ) {
            this.autocompleteItemsRegion = [];
        }
        else if( addr == 'shipping_address_1' ) {
            this.autocompleteItemsShipFirst = [];
        }
        else if( addr == 'shipping_address_2' ) {
            this.autocompleteItemsShipSecond = [];
        }
        else if( addr == 'shipping_city' ) {
            this.autocompleteItemsShipCity = [];
        }
        else if( addr == 'shipping_state' ) {
            this.autocompleteItemsShipRegion = [];
        }
    }
    async getCheckoutForm() {
        this.loader = true;
        await this.api.postItem('get_checkout_form', {}, this.storePath).then(res => {
            this.checkoutData.form = res;
            this.checkoutData.form.sameForShipping = true;
            if(this.checkoutData.form.countries) {
                if(this.checkoutData.form.countries.length == 1) {
                this.checkoutData.form.billing_country = this.checkoutData.form.countries[0].value;
                this.checkoutData.form.shipping_country = this.checkoutData.form.countries[0].value;
                }
                this.checkoutData.billingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.billing_country);
                this.checkoutData.shippingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.shipping_country);
            }
            
            this.loader = false;
        }, err => {
            console.log(err);
            this.loader = false;
        });
    }
    getCountries() {
        this.api.getItem('settings/general/woocommerce_specific_allowed_countries').then(res => {
            this.countries = res;
        }, err => {
            console.log(err);
        });
    }
    getBillingRegion() {
        this.checkoutData.billingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.billing_country);
        this.checkoutData.form.billing_state = '';
    }
    getShippingRegion() {
        this.checkoutData.shippingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.shipping_country);
        this.checkoutData.form.shipping_state = '';
    }
    async updateOrderReview() {
        await this.api.postItem('update_order_review', {}, this.storePath).then(res => {
            this.checkoutData.orderReview = res;
        }, err => {
            console.log(err);
        });
    }
    backToCart() {
        this.navCtrl.navigateForward('/tabs/home/cart/' + this.storePath);
    }
    continueCheckout() {

        this.errorMessage  = '';

        if(this.validateForm()){
            if(!this.checkoutData.form.ship_to_different_address)
            this.assgnShippingAddress();
            this.navCtrl.navigateForward('/tabs/cart/checkout/' + this.storePath);
        }
    }

    validateForm(){
        if(this.checkoutData.form.billing_first_name == '' || this.checkoutData.form.billing_first_name == undefined){
            this.errorMessage = 'Billing first name is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_last_name == '' || this.checkoutData.form.billing_last_name == undefined){
            this.errorMessage = 'Billing last name is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_phone == '' || this.checkoutData.form.billing_phone == undefined){
            this.errorMessage = 'Billing phone is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_address_1 == '' || this.checkoutData.form.billing_address_1 == undefined){
            this.errorMessage = 'Billing Street address is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_city == '' || this.checkoutData.form.billing_city == undefined){
            this.errorMessage = 'Billing city is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_postcode == '' || this.checkoutData.form.billing_postcode == undefined){
            this.errorMessage = 'Billing post code is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_country == '' || this.checkoutData.form.billing_country == undefined){
            this.errorMessage = 'Billing country is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_state == '' || this.checkoutData.form.billing_state == undefined){
            this.errorMessage = 'Billing state is a required field';
            return false;
        }

        if(this.checkoutData.form.ship_to_different_address){
                if(this.checkoutData.form.shipping_first_name == '' || this.checkoutData.form.shipping_first_name == undefined){
                    this.errorMessage = 'Shipping first name is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_last_name == '' || this.checkoutData.form.shipping_last_name == undefined){
                    this.errorMessage = 'Shipping last name is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_address_1 == '' || this.checkoutData.form.shipping_address_1 == undefined){
                    this.errorMessage = 'Shipping Street address is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_city == '' || this.checkoutData.form.shipping_city == undefined){
                    this.errorMessage = 'Shipping city is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_postcode == '' || this.checkoutData.form.shipping_postcode == undefined){
                    this.errorMessage = 'Shipping post code is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_country == '' || this.checkoutData.form.shipping_country == undefined){
                    this.errorMessage = 'Shipping country is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_state == '' || this.checkoutData.form.shipping_state == undefined){
                    this.errorMessage = 'Shipping state is a required field';
                    return false;
                }
                return true;
        }

        else return true;
    }

    assgnShippingAddress(){
        this.checkoutData.form.shipping_first_name = this.checkoutData.form.billing_first_name;
        this.checkoutData.form.shipping_last_name = this.checkoutData.form.billing_last_name;
        this.checkoutData.form.shipping_company = this.checkoutData.form.billing_company;
        this.checkoutData.form.shipping_address_1 = this.checkoutData.form.billing_address_1;
        this.checkoutData.form.shipping_address_2 = this.checkoutData.form.billing_address_2;
        this.checkoutData.form.shipping_city = this.checkoutData.form.billing_city;
        this.checkoutData.form.shipping_postcode = this.checkoutData.form.billing_postcode;
        this.checkoutData.form.shipping_country = this.checkoutData.form.billing_country;
        this.checkoutData.form.shipping_state = this.checkoutData.form.billing_state;
        return true;
    }
}