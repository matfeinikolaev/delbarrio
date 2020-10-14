import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, Platform, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApiService } from '../api.service';
import { Storage } from '@ionic/storage';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  path: any = 'tabs/home';
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;
  options: GeolocationOptions;
  geoOptions: NativeGeocoderOptions;
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any = {};
  userAddress: any = '';
  allowedGeoLoc: boolean = false;
  errorMsg: string = '';
  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    public zone: NgZone,
    private router: Router,
    private navCtrl: NavController,
    private tc: ToastController,
    private storage: Storage,
    public service: ApiService,
    public modalCtrl: ModalController,
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit() {
    this.currentLoadUserMap();
  }

  currentLoadUserMap(){
      this.geolocation.getCurrentPosition().then((resp) => {
      this.allowedGeoLoc = true;
      this.service.userLocation.latitude = resp.coords.latitude;
      this.service.userLocation.longitude = resp.coords.longitude;
      this.getLocationAdddress();
    }).catch((error) => {
      this.allowedGeoLoc = false;
      console.log('Error getting location', error);
    });
  }
  getLocationAdddress() {
    let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 5
    };
    this.nativeGeocoder.reverseGeocode(this.service.userLocation.latitude, this.service.userLocation.longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        console.log(JSON.stringify(result));
        this.service.userLocation.address = result[0].subLocality + ' ' + result[0].subAdministrativeArea;
        this.modalCtrl.dismiss({update: true});
        }).catch((error: any) => {
            console.log(error);
            this.modalCtrl.dismiss({update: true});
     });
  }

  getCoordsFromAddress(address) {
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
    this.nativeGeocoder.forwardGeocode(address)
      .then((result: NativeGeocoderResult[]) => {
        this.service.userLocation.latitude = result[0].latitude;
        this.service.userLocation.longitude = result[0].longitude;
        this.modalCtrl.dismiss({update: true});
      }).catch((error: any) => {
        this.errorMsg = JSON.stringify(error);
        console.log(this.errorMsg);
        this.userAddress = "";
        this.service.userLocation.latitude = '';
        this.service.userLocation.longitude = '';
        this.modalCtrl.dismiss({update: true});
      });
  }

  UpdateSearchResults() {
    if (this.userAddress == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.userAddress },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }
  SelectSearchResult(address) {
    this.userAddress = address;//May be delete
    this.service.userLocation.address = address;
    this.getCoordsFromAddress(address);
    this.storage.set('userLocation', this.service.userLocation);
  }
  ClearAutocomplete() {
    this.autocompleteItems = []
  }
  close() {
    this.modalCtrl.dismiss({update: false});
  }

}
