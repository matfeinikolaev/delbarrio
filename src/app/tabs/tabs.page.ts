import { Component } from '@angular/core';
import { LoadingController, NavController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../api.service';
import { Location } from "@angular/common";
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  userRoles: any;
  userIsManager: any;
  status: any;
  errors: any;
  constructor(public localNotifications: LocalNotifications, public location: Location, public api: ApiService, public data: Data, public settings: Settings, public platform: Platform, public navCtrl: NavController, public modCtlr: ModalController, public route: ActivatedRoute, public router: Router) {
      // this.platform.backButton.subscribeWithPriority(10, () => {
      //     this.location.back();
      // });
  }

  ngOnInit() {
      console.log(this);
      console.log(window.localStorage);
    document.addEventListener('ionBackButton', (ev) => {
        this.location.back();
    });
    //Started applying events on notifications
    // this.localNotifications.on('click').subscribe((notification) => {
    //     console.log(notification.data.type);
    //     if (notification.data.type == "order-summary") {
    //         var link = "/tabs/account/orders/order/" + notification.data.id;
    //         console.log(link);
    //         this.navCtrl.navigateForward(link);
    //     }
    // }, err => {
    //     console.error(err);
    // });

    this.platform.ready().then(() => {
        this.login();
    });
    document.addEventListener("pause", () => {
        window.localStorage.setItem("last_url", this.router.url);
    });
    window.addEventListener('beforeunload', () => {
      window.localStorage.setItem("last_url", this.router.url);
    });

  }

  login() {
      if (window.localStorage.user_id != null) {
        this.api.postItem('login', {username: window.localStorage.user_login, password: window.localStorage.password}).then(res => {
            this.status = res;
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
                if(this.status.allcaps.shop_manager || this.status.allcaps.wc_product_vendors_admin_vendor || this.status.allcaps.dc_vendor || this.status.allcaps.seller || this.status.allcaps.wcfm_vendor){
                    this.settings.vendor = true;
                    window.localStorage.setItem ("user_vendor", '1');
                }
                if(this.status.allcaps.administrator) {
                    this.settings.administrator = true;
                    window.localStorage.setItem ("user_admin", '1');
                }
                if (this.status.roles[0] === "shop_manager"){
                    this.api.postItem('get_user_sites', {id: this.status.ID}).then(res => {
                        var site_important : any = res;
                        this.settings.store_owner_id = site_important[0].blog_id
                        console.log(this.settings.store_owner_id)
                    });
                }
                if (window.localStorage.user_admin == '1') {
                    this.settings.administrator = true;
                }
                if (window.localStorage.user_vendor == '1') {
                    this.settings.vendor = true;
                }
                this.settings.user.userRoles = this.status.roles;
                this.settings.user.userIsManager = this.settings.user.userRoles.includes("shop_manager");
              }

              if (window.localStorage.last_url) {
                this.navCtrl.navigateForward(window.localStorage.last_url);
            } else {
                this.navCtrl.navigateForward("tabs/home");
            }

          }, err => {
            console.error(err);
            if (this.settings.user != null) {
              this.navCtrl.navigateRoot(window.localStorage.last_url);
            } else {
              this.navCtrl.navigateRoot("tabs/account");
            }
        });
      } else {
        this.navCtrl.navigateRoot("tabs/account");
      }
  }
  rememberLastPage() {
      if (window.localStorage.last_url) {
          // window.localStorage.removeItem("last_url");
      }
    this.settings.currentPath = this.router.url;
  }
}
