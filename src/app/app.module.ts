import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { IonicStorageModule } from '@ionic/storage';
//import { ScrollingModule } from '@angular/cdk/scrolling/ngx';
//import { DragDropModule } from '@angular/cdk/drag-drop/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { AppMinimize } from '@ionic-native/app-minimize/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
//import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
//import { CardIO } from '@ionic-native/card-io/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { KeysPipeModule } from '../app/pipes/pipe.module';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
//import { Braintree } from '@ionic-native/braintree/ngx';
import { HomePage } from './home/home.page';
import { HTTP } from '@ionic-native/http/ngx';

//Uncomment when you use Google Login
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';

//vendor
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

//pages
import { FilterPage } from '../app/filter/filter.page';
import { OrderSummaryPage } from './checkout/order-summary/order-summary.page';
import { LocationPage } from '../app/location/location.page';
import { AccountPage } from '../app/account/account.page';
// import { Map } from './googleMap/googleMap';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
//Geolocation
//import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { IonSlides } from '@ionic/angular';
// import {IonicImageCacheModule} from 'ionic-img-cache';
import { LocalNotifications} from '@ionic-native/local-notifications/ngx'


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
  AppComponent,
  FilterPage,
  // OrderSummaryPage,
  LocationPage
  ],
  entryComponents: [
  FilterPage,
  // OrderSummaryPage,
  LocationPage
  //HomePage
  ],
  imports: [BrowserModule, 
  // IonicImageCacheModule.forRoot(),
  FormsModule, 
  HttpClientModule,
   KeysPipeModule,
   IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
     AppRoutingModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      }),
     ],

  providers: [
    StatusBar,
    SplashScreen,
    HomePage,
    //Braintree,
    GooglePlus,
    Facebook,
    OneSignal,
    NativeStorage,
    InAppBrowser,
    FormBuilder,
    //CardIO,
    ReactiveFormsModule,
    AppMinimize,
    EmailComposer,
    AppRate,
    ImagePicker,
    Crop,
    FileTransfer,
    SocialSharing,
    //BarcodeScanner,
    HTTP,
    AndroidPermissions,
    Geolocation, LocationAccuracy, NativeGeocoder,
    LocalNotifications,
    // Map,
    // OrderSummaryPage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}