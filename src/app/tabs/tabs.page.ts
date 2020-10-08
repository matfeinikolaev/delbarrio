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
	constructor(public api: ApiService, public data: Data, public settings: Settings, public platform: Platform, public navCtrl: NavController, public modCtlr: ModalController, public route: ActivatedRoute, public router: Router){
  }
  ngOnInit() {
    console.log(this);
    this.platform.ready().then(() => {
      if (window.localStorage.user_id != null) {
        // this.account.login({'username': window.localStorage.username, 'password': window.localStorage.password});
        this.settings.customer.id = window.localStorage.user_id;
        this.settings.user = {};
        this.settings.user.ID = window.localStorage.user_id;
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
      }
    });
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
