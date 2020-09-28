import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { NavController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { Settings } from './data/settings';
import { ApiService } from './api.service';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Config } from './config';
import { Data } from './data';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoginPage } from './account/login/login.page';
import { RegisterPage } from './account/register/register.page';
import { Store } from './data/store';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { ForgottenPage } from './account/forgotten/forgotten.page';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
@Injectable({
    providedIn: 'root'
  })
export class AccountApi {
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
    constructor(public data: Data, public loadingController: LoadingController, public oneSignal: OneSignal, public modalController: ModalController, private statusBar: StatusBar, private config: Config, public api: ApiService, public navCtrl: NavController, public settings: Settings, public platform: Platform, private appRate: AppRate, private emailComposer: EmailComposer, private socialSharing: SocialSharing, public storeData: Store, private googlePlus: GooglePlus, private facebook: Facebook) {}
    goTo(path) {
        this.navCtrl.navigateForward(path);

    }
    async log_out() {
        this.settings.user = undefined;
        this.settings.customer.id = undefined;
        this.settings.vendor = false;
        this.settings.administrator = false;
        this.settings.wishlist = [];
        if (window.localStorage.googleLogin == '1') {
            window.localStorage.removeItem("googleLogin");
        }
        if (window.localStorage.facebookLogin == '1') {
            window.localStorage.removeItem("facebookLogin");
        }
        if (window.localStorage.username != null && window.localStorage.password != null) {
            window.localStorage.removeItem("username");
            window.localStorage.removeItem("password");
        }
        await this.api.postItem('logout').then(res => {}, err => {
            console.log(err);
        });
        if((<any>window).AccountKitPlugin)
        (<any>window).AccountKitPlugin.logout();
    }
    // rateApp() {
    //     if (this.platform.is('cordova')) {
    //         this.appRate.preferences.storeAppURL = {
    //             ios: this.settings.settings.rate_app_ios_id,
    //             android: this.settings.settings.rate_app_android_id,
    //             windows: 'ms-windows-store://review/?ProductId=' + this.settings.settings.rate_app_windows_id
    //         };
    //         this.appRate.promptForRating(false);
    //     }
    // }
    // shareApp() {
    //     if (this.platform.is('cordova')) {
    //         var url = '';
    //         if (this.platform.is('android')) url = this.settings.settings.share_app_android_link;
    //         else url = this.settings.settings.share_app_ios_link;
    //         var options = {
    //             message: '',
    //             subject: '',
    //             files: ['', ''],
    //             url: url,
    //             chooserTitle: ''
    //         }
    //         this.socialSharing.shareWithOptions(options);
    //     }
    // }
    // email(contact) {
    //     let email = {
    //         to: contact,
    //         attachments: [],
    //         subject: '',
    //         body: '',
    //         isHtml: true
    //     };
    //     this.emailComposer.open(email);
    // }
    // ngOnInit() {
    //     console.log(this);
    //     if( this.settings.user || this.settings.customer.id) {
    //       this.toggle = document.querySelector('#themeToggle');
    //       if( this.toggle !== null ) {
    //         this.toggle.addEventListener('ionChange', (ev) => {
    //           document.body.classList.toggle('dark', ev.detail.checked);
            
    //           if(ev.detail.checked) {
    //             this.statusBar.backgroundColorByHexString('#121212');
    //             this.statusBar.styleLightContent();
    //           } else {
    //             this.statusBar.backgroundColorByHexString('#ffffff');
    //             this.statusBar.styleDefault();
    //           }
            
    //         });
    //         const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    //         prefersDark.addListener((e) => checkToggle(e.matches));
    //         function loadApp() {
    //           checkToggle(prefersDark.matches);
    //         }
    //         function checkToggle(shouldCheck) {
    //           this.toggle.checked = shouldCheck;
    //         }
    //       }
    //     }
    //     if( this.data.storeCategories.length == 0 ) {
    //         this.api.postItem('get_store_categories').then(res => {
    //             this.data.storeCategories = res;
    //         }, err => {
    //             console.error(err);
    //         });
    //     }
    // }
    // async login() {
    //     const modal = await this.modalController.create({
    //       component: LoginPage,
    //       componentProps: {
    //         path: 'tabs/account',
    //         },
    //       swipeToClose: true,
    //       //presentingElement: this.routerOutlet.nativeEl,
    //   });
    //   modal.present();
    //   const { data } = await modal.onWillDismiss();
    // }
    async login(request) {
        this.disableSubmit = true;
        await this.api.postItem('login', request).then(res => {
            this.status = res;
            console.log(this.status);
            if (this.status.errors) {
                this.errors = this.status.errors;
                for (var key in this.errors) {
                    this.errors[key].forEach((item, index) => {
                        this.errors[key][index] = this.errors[key][index].replace('<strong>ERROR<\/strong>:', '');
                        this.errors[key][index] = this.errors[key][index].replace('/a>', '/span>');
                        this.errors[key][index] = this.errors[key][index].replace('<a', '<span');
                    });
                }
            } else if (this.status.data) {
                this.settings.customer.id = this.status.ID;
                this.settings.user = this.status.data;
                 if (this.platform.is('cordova')){
                    this.oneSignal.getIds().then((data: any) => {
                        this.form.onesignal_user_id = data.userId;
                        this.form.onesignal_push_token = data.pushToken;
                        this.api.postItem('update_user_notification', this.form).then(res =>{});
                    });
                 }
                if(this.status.allcaps.shop_manager || this.status.allcaps.wc_product_vendors_admin_vendor || this.status.allcaps.dc_vendor || this.status.allcaps.seller || this.status.allcaps.wcfm_vendor){
                    this.settings.vendor = true;
                }
                if(this.status.allcaps.administrator) {
                    this.settings.administrator = true;
                }
                this.close(true);
            }
            // window.localStorage.setItem ("username", request.username);
            // window.localStorage.setItem("password", request.password);
            this.disableSubmit = false;
        }, err => {
            this.disableSubmit = false;
        });
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
                  }
                  if(this.status.allcaps.administrator) {
                      this.settings.administrator = true;
                  }
                  this.close(true);
              }
              this.googleLogingInn = false;
              this.dismissLoading();
              this.redirectToHomePage();
          }, err => {
              this.googleLogingInn = false;
              this.dismissLoading();
          });
          this.googleLogingInn = false;
          window.localStorage.setItem("user", this.settings.user);
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
                  }
                  if(this.status.allcaps.administrator) {
                      this.settings.administrator = true;
                  }
                  this.close(true);
              }
              this.facebookLogingInn = false;
              this.dismissLoading();
              this.redirectToHomePage();
          }, err => {
              this.facebookLogingInn = false;
              this.dismissLoading();
          });
          this.facebookLogingInn = false;
          window.localStorage.setItem("user", this.settings.user);
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