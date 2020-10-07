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
// import { Map } from './../../googleMap/googleMap';
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
    currDate: any;
    selectedDate: any;
    storePath: any;
    store: any;
    form: any;
    marker: any;

    map: any;
    @ViewChild('mapEl', {static: true}) mapEl: ElementRef ;
    @ViewChild("form", {static: true, read: ElementRef}) formEl: ElementRef;
    constructor(
        // public gMap: Map,
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
        private platform: Platform,
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
        this.api.postItem("user_meta", {id: this.settings.user.ID}, this.storePath).then(res => {
            var results: any = res;
            console.log(results);
            if (results["billing_company_type"] != null)
                this.settings.user.billing_company_type = results["billing_company_type"][0];
            if (results["billing_document_type"] != null)
                this.settings.user.billing_document_type = results["billing_document_type"][0];
            if (results["billing_document"] != null)
                this.settings.user.billing_document = results["billing_document"][0];
            if (results["delivery_date"] != null)
                this.settings.user.delivery_date = results["delivery_date"][0];
            if (results["delivery_time"] != null)
                this.settings.user.delivery_time = results["delivery_time"][0];
        }, err => {
            console.error(err);
        });
        this.getCheckoutForm();
        //this.getCountries();
    }
    ngAfterViewInit() {
        // this.gMap.loadMap(this.mapEl, "address");
        this.loadMap();
    }
    loadMap() {
        let coords = this.api.userLocation.latitude == 0 && this.api.userLocation.longitude == 0 ? new google.maps.LatLng(-0.1720125, -78.480687) : new google.maps.LatLng(this.api.userLocation.latitude, this.api.userLocation.longitude);
        let mapOptions/*: google.maps.MapOptions*/ = {
            center: coords,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: false
        };

        var mapElement = document.createElement("ion-card");
        var mapElementCont = document.createElement("ion-card-content");

        mapElement.setAttribute("id", "map");
        this.mapEl.nativeElement.appendChild(mapElement);
        mapElement.setAttribute("style", "width: 94%; height:70%;");
        
        
        let markers = [];
        var that = this;

        if (this.map == null) {
            mapElementCont.setAttribute("id", "mapCont");
            mapElement.appendChild(mapElementCont);
            mapElementCont.setAttribute("style", "width: 100%; height:100%; ");
            this.map = new google.maps.Map(mapElementCont, mapOptions);
        }
        else {
            this.map.setOptions(mapOptions);
            var mapNode = this.map.getDiv();
            console.log(mapNode);
            mapElement.append(mapNode);
        }

        // let marker = new google.maps.Marker({position: coords});
        // if (markers.length > 0) {
        //     markers.forEach((m) => {
        //         m.setMap(null);
        //     });
        // }
        // markers.push(marker);
        // marker.setMap(this.map);

        var myLocation = document.querySelector("#myLocation");
        console.log(myLocation);
        myLocation.addEventListener("click", function() {
            let marker = new google.maps.Marker({position: coords});
            if (markers.length > 0) {
                markers.forEach((m) => {
                    m.setMap(null);
                });
            }
            markers.push(marker);
            marker.setMap(that.map);
            that.map.setOptions(mapOptions);
        });

        this.map.addListener("click", function (p) {
            let coords = new google.maps.LatLng(p.latLng.lat(), p.latLng.lng());

            // Place a marker
            let marker = new google.maps.Marker({position: coords});
            if (markers.length > 0) {
                markers.forEach((m) => {
                    m.setMap(null);
                });
            }
            markers.push(marker);
            marker.setMap(this);

            // Reverse geocoding
            const latlng = {
                lat: parseFloat(p.latLng.lat()),
                lng: parseFloat(p.latLng.lng()),
              };
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latlng }, (results, status) => {
                if( status == "OK" ) {
                    results.forEach(place => {
                        place.address_components.forEach(element => {
                            if (element.types.includes("route")) {
                                that.checkoutData.form.billing_address_1 = place.formatted_address;
                            }
                            else if (element.types.includes("locality", "political")) {
                                that.checkoutData.form.billing_city = element.long_name;
                            }
                            else if (element.types.includes("administrative_area_level_1", "political")) {
                                that.checkoutData.form.billing_state = element.long_name;
                            }
                            else if (element.types.includes("postal_code")) {
                                that.checkoutData.form.billing_postcode = element.long_name;
                            }
                            else if (element.types.includes("country")) {
                                that.checkoutData.form.billing_country = element.short_name;
                            }
                        });
                    });
                }
                console.log(results);
                console.log(status);
            });
        });

        const input = document.getElementById("pac-input") as HTMLInputElement;
        const searchBox = new google.maps.places.SearchBox(input);
        this.map.controls[google.maps.ControlPosition.TOP].push(input);

        // Bias the SearchBox results towards current map's viewport.
        this.map.addListener("bounds_changed", () => {
            searchBox.setBounds(this.map.getBounds());
        });

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener("places_changed", () => {
            console.log(that);
            const places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach((marker) => {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach((place) => {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                const icon = {
                    url: place.icon as string,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                };

                // Create a marker for each place.
                markers.push(
                    new google.maps.Marker({
                        map: that.map,
                        // icon,
                        title: place.name,
                        position: place.geometry.location,
                    })
                );

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
                place.address_components.forEach(element => {
                    if (element.types.includes("route")) {
                        that.checkoutData.form.billing_address_1 = place.formatted_address;
                    }
                    else if (!element.types.includes("route")) {
                        that.checkoutData.form.billing_address_1 = place.name + ", " + place.formatted_address;
                    }
                    else if (element.types.includes("locality", "political")) {
                        that.checkoutData.form.billing_city = element.long_name;
                    }
                    else if (element.types.includes("administrative_area_level_1", "political")) {
                        that.checkoutData.form.billing_state = element.long_name;
                    }
                    else if (element.types.includes("postal_code")) {
                        that.checkoutData.form.billing_postcode = element.long_name;
                    }
                    else if (element.types.includes("country")) {
                        that.checkoutData.form.billing_country = element.short_name;
                    }
                });
            });
            console.log(places);
            that.map.fitBounds(bounds);
        });
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
        await this.api.postItem('update_order_review', {}, this.data.store.path).then(res => {
            this.checkoutData.orderReview = res;
        }, err => {
            console.log(err);
        });
    }
    backToCart() {
        this.navCtrl.navigateForward('/tabs/home/cart' + this.data.store.path);
    }
    continueCheckout() {

        this.errorMessage  = '';

        if(this.validateForm()){
            if(!this.checkoutData.form.ship_to_different_address)
                this.assgnShippingAddress();
            // this.navCtrl.navigateForward('/tabs/order-summary/' + this.storePath + '/' + 10996);
            if(this.data.store.delivery)
                this.navCtrl.navigateForward('/tabs/cart/delivery/' + this.storePath + '/');
            else 
                this.navCtrl.navigateForward('/tabs/cart/contacts/' + this.storePath + '/');
        }
    }

    validateForm(){
        if(this.checkoutData.form.billing_address_1 == '' || this.checkoutData.form.billing_address_1 == undefined){
            this.errorMessage = 'La dirección de facturación es un campo obligatorio';
            return false;
        }

        if(this.checkoutData.form.billing_city == '' || this.checkoutData.form.billing_city == undefined){ 
            this.errorMessage = 'La ciudad de facturación es un campo obligatorio';
            return false;
        }

        // if(this.checkoutData.form.billing_postcode == '' || this.checkoutData.form.billing_postcode == undefined){
        //     this.errorMessage = 'El código postal de facturación es un campo obligatorio';
        //     return false;
        // }

        if(this.checkoutData.form.billing_country == '' || this.checkoutData.form.billing_country == undefined){
            this.errorMessage = 'El país de facturación es un campo obligatorio';
            return false;
        }

        if(this.checkoutData.form.billing_state == '' || this.checkoutData.form.billing_state == undefined){
            this.errorMessage = 'El estado de facturación es un campo obligatorio';
            return false;
        }

        if(this.checkoutData.form.ship_to_different_address){
                if(this.checkoutData.form.shipping_first_name == '' || this.checkoutData.form.shipping_first_name == undefined){
                    this.errorMessage = 'El nombre de envío es un campo obligatorio';
                    return false;
                }

                if(this.checkoutData.form.shipping_last_name == '' || this.checkoutData.form.shipping_last_name == undefined){
                    this.errorMessage = 'El apellido de envío es un campo obligatorio';
                    return false;
                }

                if(this.checkoutData.form.shipping_address_1 == '' || this.checkoutData.form.shipping_address_1 == undefined){
                    this.errorMessage = 'La dirección de envío es un campo obligatorio';
                    return false;
                }

                if(this.checkoutData.form.shipping_city == '' || this.checkoutData.form.shipping_city == undefined){
                    this.errorMessage = 'La ciudad de envío es un campo obligatorio';
                    return false;
                }

                if(this.checkoutData.form.shipping_postcode == '' || this.checkoutData.form.shipping_postcode == undefined){
                    this.errorMessage = 'El código postal de envío es un campo obligatorio';
                    return false;
                }

                if(this.checkoutData.form.shipping_country == '' || this.checkoutData.form.shipping_country == undefined){
                    this.errorMessage = 'El país de envío es un campo obligatorio';
                    return false;
                }

                if(this.checkoutData.form.shipping_state == '' || this.checkoutData.form.shipping_state == undefined){
                    this.errorMessage = 'El estado de envío es un campo obligatorio';
                    return false;
                }
                return true;
        }

        else return true;
    }

    shipToDifferentAddress() {
        if(this.checkoutData.form.ship_to_different_address == false) {
            this.checkoutData.form.ship_to_different_address = true;
        } else {
            this.checkoutData.form.ship_to_different_address = false;
        }
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