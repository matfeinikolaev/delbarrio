import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Config } from '../config';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { HttpParams } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
    selector: 'app-help',
    templateUrl: 'help.page.html',
    styleUrls: ['help.page.scss']
})
export class HelpPage{
    faq: any;
    messageText: any = "";
    messageSent: any = false;
    filter: any = {};
    userPhone: any;
    userEmail: any;
    constructor(public platform: Platform, public modalController: ModalController, public translate: TranslateService, private alertCtrl: AlertController, public toastController: ToastController, public config: Config, public api: ApiService, public data: Data, public router: Router, public settings: Settings, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute) {}
    ngOnInit() {
        console.log(this);
    }
    ngAfterViewInit() {
        if (!this.settings.user) {
            if (window.localStorage.user_email) {
                this.userEmail = window.localStorage.user_email;
            }
        } else {
            this.userEmail = this.settings.user.user_email;
        }
    }
    openMessage() {
        this.messageSent = false;
    }
    sendMessage() {
        this.filter.question = this.messageText;
        this.filter.user_id = this.settings.user.ID;
        this.filter.user_email = this.userEmail;
        this.filter.user_phone = this.userPhone;

        this.api.postItem("support", this.filter).then(res => {
            console.log(res);
        }, err => {
            console.error(err);
        });
        this.messageSent = true;
    }
}
