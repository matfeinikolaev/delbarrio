import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, ModalController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
import { Store } from '../data/store';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Platform } from '@ionic/angular';
import { Config } from '../config';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { HttpParams } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import { LocationPage } from './../location/location.page';
import { LS_USER_COORDS, LS_USER_ADDRESS } from './../shared/common';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ChatApi } from './../chat/chat.api';
import { AccountApi } from '../account.api';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage {
    tempProducts: any = [];
    filter: any = {};
    hasMoreItems: boolean = true;
    screenWidth: any = 300;
    slideOpts = { effect: 'flip', autoplay: true, parallax: true, loop: true, lazy: true };
    options: any = {};
    lan: any = {};
    variationId: any;
    loading: any = true;
    stores: any;
    errors: any;
    errorsRegister: any;
    status: any = {};
    disableSubmit: boolean = false;
    currDate: any = new Date();
    constructor(public localNotifications: LocalNotifications, public routerOutlet: IonRouterOutlet, public modalCtrl: ModalController, private locationAccuracy: LocationAccuracy, private storage: Storage, public translate: TranslateService, public alertController: AlertController, private config: Config, public api: ApiService, private splashScreen: SplashScreen, public platform: Platform, public translateService: TranslateService, public data: Data, public settings: Settings, public product: Product, public store: Store, public loadingController: LoadingController, public router: Router, public navCtrl: NavController, public route: ActivatedRoute, private oneSignal: OneSignal, private nativeStorage: NativeStorage, private chatapi: ChatApi, private account: AccountApi) {
        this.filter.page = 1;
        this.filter.status = 'publish';
        this.screenWidth = this.platform.width();
    }

    ionViewDidEnter() {
        // if (window.localStorage.last_url) {
        //     var last_url = window.localStorage.last_url;
        //     window.localStorage.removeItem("last_url");
        //     // this.navCtrl.navigateForward(last_url);
        // }
    }
    ngOnInit() {
        console.log(this);
        this.platform.ready().then(() => {
            // The last redirect was giving preoblems finding the property of the object
            // better search in the localstorage to redirect
            // Changed from localStorage to window.localStorage
            if (window.localStorage.roles) {
                var role_validate = window.localStorage.getItem('roles');
                if (role_validate === '["shop_manager"]'){
                    this.router.navigate(['tabs/account']);
                }
            }
            this.getBlocks();
        });
        // console.log(this);
    }
    getBlocks() {
        this.api.postItem('get_store_categories').then(res => {
            this.stores = res;
            this.data.storeCategories = res;
            this.loading = false;
        }, err => {
            this.loading = false;
            console.error(err);
        });
    }
    getStoreCategory(storeCat) {
        this.data.storeCategory = storeCat;
        this.data.storeCategory.displayName = storeCat.name.toUpperCase();
        window.localStorage.setItem('store-category-id', this.data.storeCategory.term_id);
        window.localStorage.setItem('store-category-name', this.data.storeCategory.displayName);
        this.navCtrl.navigateForward('tabs/home/stores-by-cat');
    }
    goto(item) {
        if (item.description == 'category') this.navCtrl.navigateForward('/tabs/home/products/' + item.url);
        else if (item.description == 'stores')
        this.navCtrl.navigateForward('/tabs/home/stores');
        else if (item.description == 'product') this.navCtrl.navigateForward('/tabs/home/product/' + item.url);
        else if (item.description == 'post') this.navCtrl.navigateForward('/tabs/home/post/' + item.url);
    }
    doRefresh(event) {
        this.filter.page = 1;
        this.getBlocks();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }
    getHeight(child) {
        return (child.height * this.screenWidth) / child.width;
    }
}
