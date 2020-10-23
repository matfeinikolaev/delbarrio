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
@Component({
    selector: 'app-help',
    templateUrl: 'help.page.html',
    styleUrls: ['help.page.scss']
})
export class HelpPage{
    faq: any;
    sendMessageClick: any = false;
    messageText: any = "";
    messageSent: any = false;
    constructor(public platform: Platform, public modalController: ModalController, public translate: TranslateService, private alertCtrl: AlertController, public toastController: ToastController, public config: Config, public api: ApiService, public data: Data, public router: Router, public settings: Settings, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute) {}
    ngOnInit() {
        console.log(this);
        this.messageSent = false;
        this.platform.ready().then(() => {
            this.api.postItem("faq").then(res => {
                this.faq = res;
            }, err => {
                console.error(err);
            });
        }, err => {
            console.error(err);
        });
    }
    openMessage() {
        this.sendMessageClick = true;
        this.messageSent = false;
    }
    sendMessage() {
        this.messageSent = true;
        this.sendMessageClick = false;
    }
}
