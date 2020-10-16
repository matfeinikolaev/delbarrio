import { Component } from '@angular/core';
import { LoadingController, NavController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../api.service';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  location: any = window.location.pathname;
  userRoles: any;
  userIsManager: any;
  status: any;
  errors: any;
	constructor(public api: ApiService, public data: Data, public settings: Settings, public platform: Platform, public navCtrl: NavController, public modCtlr: ModalController, public route: ActivatedRoute, public router: Router){
  }
  ngOnInit() {
    this.platform.ready().then(() => {
      if (window.localStorage.user_id != null) {
        this.api.postItem('login', {username: window.localStorage.user_login, password: window.localStorage.password}).then(res => {
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
              }
          }, err => {
            console.error(err);
          });

        this.settings.customer.id = window.localStorage.user_id;
        this.settings.user = {};
        this.settings.user.ID = window.localStorage.user_id;
        this.settings.user.roles = window.localStorage.roles;
        this.settings.user.managed_sites = window.localStorage.getItem("managed_sites");
        this.settings.user.deleted = window.localStorage.user_deleted;
        this.settings.user.display_name = window.localStorage.user_display_name;
        this.settings.user.spam = window.localStorage.user_spam;
        this.settings.user.user_activation_key = window.localStorage.user_activation_key;
        this.settings.user.user_email = window.localStorage.user_email;
        this.settings.user.user_login = window.localStorage.user_login;
        this.settings.user.user_nicename = window.localStorage.user_nicename;
        this.settings.user.user_pass = window.localStorage.user_pass;
        this.settings.user.user_registered = window.localStorage.user_registered;
        this.settings.user.user_status = window.localStorage.user_status;
        this.settings.user.user_url = window.localStorage.user_url;
        if (window.localStorage.user_admin == '1') {
            this.settings.administrator = true;
        }
        if (window.localStorage.user_vendor == '1') {
            this.settings.vendor = true;
        }
        this.settings.user.userRoles = JSON.parse(this.settings.user.roles);
        this.settings.user.userIsManager = this.settings.user.userRoles.includes("shop_manager");
      }
      if (this.settings.user != null) {
        this.navCtrl.navigateRoot(window.localStorage.last_url);
      }
      console.log(window.localStorage);
    });
    window.addEventListener('beforeunload', () => {
      window.localStorage.setItem("last_url", this.router.url);
    });
    document.addEventListener("pause", () => {
      window.localStorage.setItem("last_url", this.router.url);
    }, false);
  }
  checkPage () {
    return window.location.pathname == '/tabs/help' ? false : true;
  }
  openHelp() {
    this.settings.currentPath = window.location.pathname;
    this.api.postItem("faq", {path: this.settings.currentPath}).then(res => {
      this.settings.faq = res;
    }, err => {
        console.error(err);
    });
    this.navCtrl.navigateRoot("tabs/help");
  }
}
