import { Component } from '@angular/core';
import { NavController, LoadingController, ModalController, Platform, IonRouterOutlet } from '@ionic/angular';
import { Settings } from './../data/settings';
import { ApiService } from './../api.service';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Config } from './../config';
import { Data } from './../data';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoginPage } from './../account/login/login.page';
import { RegisterPage } from './../account/register/register.page';
import { Store } from '../data/store';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { ForgottenPage } from './forgotten/forgotten.page';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { AccountApi } from '../account.api';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
// import {Plugins, LocalNotificationEnabledResult, LocalNotificationActionPerformed, LocalNotification, Device} from '@capacitor/core';
// const {LocalNotifications} = Plugins;

@Component({
    selector: 'app-account',
    templateUrl: 'account.page.html',
    styleUrls: ['account.page.scss']
})
export class AccountPage {
    toggle: any;
    slideOpts = { autoplay: false, loop: false, lazy: true };
    icons: any = new Array(60);
    segment: any = 'login';
    form: any;
    formRegister: any;
    loginTab: boolean = true;
    path: any = 'account';
    errors: any;
    errorsRegister: any;
    status: any = {};
    disableSubmit: boolean = false;
    pushForm: any = {};
    googleStatus: any = {};
    faceBookStatus: any = {};
    googleLogingInn: boolean = false;
    facebookLogingInn: boolean = false;
    phoneLogingInn: boolean = false;
    userInfo: any;
    phoneVerificationError: any;
    loading: any;
    userRoles: any;
    userIsManager: any;
    constructor(public localNotifications: LocalNotifications, public data: Data, public loadingController: LoadingController, public oneSignal: OneSignal, public modalController: ModalController, private statusBar: StatusBar, private config: Config, public api: ApiService, public navCtrl: NavController, public settings: Settings, public platform: Platform, private appRate: AppRate, private emailComposer: EmailComposer, private socialSharing: SocialSharing, public routerOutlet: IonRouterOutlet, public storeData: Store, private googlePlus: GooglePlus, private facebook: Facebook, private account: AccountApi) {}
    goTo(path) {
        this.navCtrl.navigateForward(path);
    }
    async log_out() {
        this.settings.user = undefined;
        this.settings.customer.id = undefined;
        this.settings.vendor = false;
        this.settings.administrator = false;
        this.settings.wishlist = [];
        if (window.localStorage.user_id != null) {
            window.localStorage.removeItem ("user_id");
            window.localStorage.removeItem ("roles");
            window.localStorage.removeItem ("user_deleted");
            window.localStorage.removeItem ("user_display_name");
            window.localStorage.removeItem ("user_spam");
            window.localStorage.removeItem ("user_activation_key");
            window.localStorage.removeItem ("user_email");
            window.localStorage.removeItem ("user_login");
            window.localStorage.removeItem ("user_nicename");
            window.localStorage.removeItem ("user_pass");
            window.localStorage.removeItem ("user_registered");
            window.localStorage.removeItem ("user_status");
            window.localStorage.removeItem ("user_url");
            window.localStorage.removeItem ("user_admin");
            window.localStorage.removeItem ("user_vendor");
        }
        await this.api.postItem('logout').then(res => {}, err => {
            console.log(err);
        });
        if((<any>window).AccountKitPlugin)
        (<any>window).AccountKitPlugin.logout();
    }
    rateApp() {
        if (this.platform.is('cordova')) {
            this.appRate.preferences.storeAppURL = {
                ios: this.settings.settings.rate_app_ios_id,
                android: this.settings.settings.rate_app_android_id,
                windows: 'ms-windows-store://review/?ProductId=' + this.settings.settings.rate_app_windows_id
            };
            this.appRate.promptForRating(false);
        }
    }
    shareApp() {
        if (this.platform.is('cordova')) {
            var url = '';
            if (this.platform.is('android')) url = this.settings.settings.share_app_android_link;
            else url = this.settings.settings.share_app_ios_link;
            var options = {
                message: '',
                subject: '',
                files: ['', ''],
                url: url,
                chooserTitle: ''
            }
            this.socialSharing.shareWithOptions(options);
        }
    }
    email(contact) {
        let email = {
            to: contact,
            attachments: [],
            subject: '',
            body: '',
            isHtml: true
        };
        this.emailComposer.open(email);
    }
    async ngOnInit() {
        console.log(this);
        this.platform.ready().then(() => {
            this.localNotifications.requestPermission();
        }, err => {
            console.log(err);
        });
        if (this.settings.user || this.settings.customer.id) {
            const notifs = await this.localNotifications.schedule({
                        title: "Title",
                        text: "Body",
                        id: 1,
                        trigger: { at: new Date(Date.now() + 1000 * 5) },
                        sound: null,
                        attachments: null,
            });
            console.log('scheduled notifications', notifs);
            this.toggle = document.querySelector('#themeToggle');
            if (this.toggle !== null) {
                this.toggle.addEventListener('ionChange', (ev) => {
                    document.body.classList.toggle('dark', ev.detail.checked);

                    if (ev.detail.checked) {
                        this.statusBar.backgroundColorByHexString('#121212');
                        this.statusBar.styleLightContent();
                    } else {
                        this.statusBar.backgroundColorByHexString('#ffffff');
                        this.statusBar.styleDefault();
                    }

                });
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
                prefersDark.addListener((e) => checkToggle(e.matches));

                function loadApp() {
                    checkToggle(prefersDark.matches);
                }

                function checkToggle(shouldCheck) {
                    this.toggle.checked = shouldCheck;
                }
            }
        }
        if (this.data.storeCategories.length == 0) {
            this.api.postItem('get_store_categories').then(res => {
                this.data.storeCategories = res;
            }, err => {
                console.error(err);
            });
        }
    }
    async login() {
        const modal = await this.modalController.create({
          component: LoginPage,
          componentProps: {
            path: 'tabs/account',
            },
          swipeToClose: true,
          //presentingElement: this.routerOutlet.nativeEl,
      });
      modal.present();
      const { data } = await modal.onWillDismiss();
    }
    async register() {
        const modal = await this.modalController.create({
          component: RegisterPage,
          componentProps: {
            path: 'tabs/account/register',
            },
          swipeToClose: true,
          //presentingElement: this.routerOutlet.nativeEl,
      });
      modal.present();
      const { data } = await modal.onWillDismiss();
    }
    
    googleLogin(){
      this.googleLogingInn = true;
      this.presentLoading();
      this.googlePlus.login({})
      .then(res => {
          this.googleStatus = res;
          this.api.postItem('google_login', {
                  "access_token": this.googleStatus.userId,
                  "email": this.googleStatus.email,
                  "first_name": this.googleStatus.givenName,
                  "last_name": this.googleStatus.familyName,
                  "display_name": this.googleStatus.displayName,
                  "image": this.googleStatus.imageUrl
              }).then(res => {
              this.status = res;
              if (this.status.errors) {
                  this.errors = this.status.errors;
              } else if (this.status.data) {
                  this.settings.customer.id = this.status.ID;
                  this.settings.user = this.status.data;
                   if (this.platform.is('cordova')){
                      this.oneSignal.getIds().then((data: any) => {
                          this.form.onesignal_user_id = data.userId;
                          this.form.onesignal_push_token = data.pushToken;
                      });
                     this.api.postItem('update_user_notification', this.form).then(res =>{});
                   }
                  if(this.status.allcaps.shop_manager || this.status.allcaps.wc_product_vendors_admin_vendor || this.status.allcaps.dc_vendor || this.status.allcaps.seller || this.status.allcaps.wcfm_vendor){
                      this.settings.vendor = true;
                      window.localStorage.setItem ("user_vendor", '1');
                  }
                  if(this.status.allcaps.administrator) {
                      this.settings.administrator = true;
                      window.localStorage.setItem ("user_admin", '1');
                  }
                  this.settings.user.roles = JSON.stringify(this.status.roles);
                  this.settings.user.userRoles = JSON.parse(this.settings.user.roles);
                  this.settings.user.userIsManager = this.settings.user.userRoles.includes("shop_manager");
                  this.close(true);
              }
              this.googleLogingInn = false;
              this.dismissLoading();
              this.redirectToHomePage();
              window.localStorage.setItem ("googleLogin", '1');
              window.localStorage.setItem ("user_id", this.settings.user.ID);
              window.localStorage.setItem ("managed_sites", this.settings.user.managed_sites);
              window.localStorage.setItem ("roles", this.settings.user.roles);
              window.localStorage.setItem ("user_deleted", this.settings.user.deleted);
              window.localStorage.setItem ("user_display_name", this.settings.user.display_name);
              window.localStorage.setItem ("user_spam", this.settings.user.spam);
              window.localStorage.setItem ("user_activation_key", this.settings.user.user_activation_key);
              window.localStorage.setItem ("user_email", this.settings.user.user_email);
              window.localStorage.setItem ("user_login", this.settings.user.user_login);
              window.localStorage.setItem ("user_nicename", this.settings.user.user_nicename);
              window.localStorage.setItem ("user_pass", this.settings.user.user_pass);
              window.localStorage.setItem ("user_registered", this.settings.user.user_registered);
              window.localStorage.setItem ("user_status", this.settings.user.user_status);
              window.localStorage.setItem ("user_url", this.settings.user.user_url);
          }, err => {
              this.googleLogingInn = false;
              this.dismissLoading();
          });
          this.googleLogingInn = false;
      })
      .catch(err => {
          console.log(err);
          this.googleStatus = err;
          this.googleLogingInn = false;
          this.dismissLoading();
      });
  }
  facebookLogin(){
      this.facebookLogingInn = true;
      this.facebook.login(['public_profile', 'email'])
      .then((res: FacebookLoginResponse) => {
          this.faceBookStatus = res;
          this.presentLoading();
          this.api.postItem('facebook_login', {
                  "access_token": this.faceBookStatus.authResponse.accessToken,
              }).then(res => {
              this.status = res;
              if (this.status.errors) {
                  this.errors = this.status.errors;
              } else if (this.status.data) {
                  this.settings.customer.id = this.status.ID;
                  this.settings.user = this.status.data;
                   if (this.platform.is('cordova')){
                      this.oneSignal.getIds().then((data: any) => {
                          this.form.onesignal_user_id = data.userId;
                          this.form.onesignal_push_token = data.pushToken;
                      });
                     this.api.postItem('update_user_notification', this.form).then(res =>{});
                   }
                  if(this.status.allcaps.shop_manager || this.status.allcaps.wc_product_vendors_admin_vendor || this.status.allcaps.dc_vendor || this.status.allcaps.seller || this.status.allcaps.wcfm_vendor){
                      this.settings.vendor = true;
                      window.localStorage.setItem ("user_vendor", '1');
                  }
                  if(this.status.allcaps.administrator) {
                      this.settings.administrator = true;
                      window.localStorage.setItem ("user_admin", '1');
                  }
                  this.settings.user.roles = JSON.stringify(this.status.roles);
                  this.settings.user.userRoles = JSON.parse(this.settings.user.roles);
                  this.settings.user.userIsManager = this.settings.user.userRoles.includes("shop_manager");
                  this.close(true);
              }
              this.facebookLogingInn = false;
              this.dismissLoading();
              window.localStorage.setItem ("facebookLogin", '1');
              window.localStorage.setItem ("user_id", this.settings.user.ID);
              window.localStorage.setItem ("managed_sites", this.settings.user.managed_sites);
              window.localStorage.setItem ("roles", this.settings.user.roles);
              window.localStorage.setItem ("user_deleted", this.settings.user.deleted);
              window.localStorage.setItem ("user_display_name", this.settings.user.display_name);
              window.localStorage.setItem ("user_spam", this.settings.user.spam);
              window.localStorage.setItem ("user_activation_key", this.settings.user.user_activation_key);
              window.localStorage.setItem ("user_email", this.settings.user.user_email);
              window.localStorage.setItem ("user_login", this.settings.user.user_login);
              window.localStorage.setItem ("user_nicename", this.settings.user.user_nicename);
              window.localStorage.setItem ("user_pass", this.settings.user.user_pass);
              window.localStorage.setItem ("user_registered", this.settings.user.user_registered);
              window.localStorage.setItem ("user_status", this.settings.user.user_status);
              window.localStorage.setItem ("user_url", this.settings.user.user_url);
              this.redirectToHomePage();
          }, err => {
              this.facebookLogingInn = false;
              this.dismissLoading();
          });
          this.facebookLogingInn = false;
      })
      .catch(e => {
          this.faceBookStatus = e;
          this.facebookLogingInn = false;
          this.dismissLoading();
      });
  }
  redirectToHomePage() {
      this.navCtrl.navigateForward("/tabs/home");
  }
  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Por favor espera...',
      duration: 2000
    });
    this.loading.present();
  }
  dismissLoading() {
      if(this.loading) {
          this.loading.dismiss();
      }
  }
  close(status) {
    this.modalController.dismiss({
      'loggedIn': status,
    });
  }
}
