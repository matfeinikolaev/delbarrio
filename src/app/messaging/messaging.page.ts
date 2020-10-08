import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Settings } from './../data/settings';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
// import { FirebaseMessaging } from '@ionic-native/firebase-messaging/ngx';
import { ChatApi } from './../chat/chat.api';
import { Data } from './../data';
import { ActionSheetController } from '@ionic/angular';
import * as FireBase from 'firebase';
@Component({
    selector: 'app-order',
    templateUrl: './messaging.page.html',
    styleUrls: ['./messaging.page.scss'],
})
export class MessagingPage implements OnInit {
    id: any;
    msgdata = { type:'', nickname:'', message:'', status:'' };
    chats: any = {};
    lan: any = {};
    messages: any = [];
    onBackgroundMessage: any;
    constructor(public onesignal: OneSignal, public actionSheetController: ActionSheetController, public data: Data, public translate: TranslateService, public api: ApiService, public settings: Settings, public toastController: ToastController, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute, public ChatApi: ChatApi, /*public firebaseMessaging: FirebaseMessaging*/) {}
    ngOnInit() {
        console.log(this);
        this.translate.get(['Solicitud de reembolso enviada!', 'No se puede enviar la solicitud de reembolso']).subscribe(translations => {
            this.lan.refund = translations['Solicitud de reembolso enviada!'];
            this.lan.unable = translations['No se puede enviar la solicitud de reembolso'];
        });
        this.id = this.route.snapshot.paramMap.get('userID');
        this.fireBaseDB();
    }
    testDB() {
        console.log(FireBase.database().ref().child('chats/'+this.id).push().key);
    }
    fireBaseDB() {
        let chatsData = FireBase.database().ref('chats/'+this.id+'/'+this.data.store.ID);
        chatsData.on('value', resp => {
          this.chats = this.snapshotToArray(resp);
        });

    }
    snapshotToArray(snapshot) {
        let chatData: any = {};
        snapshot.forEach(childSnapshot => {
            chatData[childSnapshot.key] = childSnapshot.val();
        });
        return chatData;
    };
    sendMessage() {
        var newKey = this.ChatApi.sendMessage(this.id, this.data.store.ID, this.msgdata.message);
        this.api.postItem('get_firebase_message', {sender_id:this.id, store_id:this.data.store.ID, key:newKey, user_data:JSON.stringify(this.settings.user)}).then(res=>{
            console.log(res);
        }, err => {
            console.error(err);
        });
        this.msgdata.message = '';
    }
    sendOneSignalNotification(msg) {
        var status: any;
        this.onesignal.getIds().then(res => {
            status = res;
        }, err => {
            console.error(err);
        });
        
        this.api.postItem('post_onesignal_notification', {user_id: status.userId, message: msg}).then(res=>{
            console.log(res);
        }, err => {
            console.error(err);
        });
        // var notificationObj = { contents: {en: msg}, include_player_ids: [this.id]};
        // this.onesignal.postNotification(notificationObj);
    }
    removeMessage(key) {
        console.log("removing...");
        this.ChatApi.removeMessage(key, this.id, this.data.store.ID);
    }
    backToStore() {
        var user_id = this.route.snapshot.paramMap.get('userID');
        var store_id = this.route.snapshot.paramMap.get('id');
        this.navCtrl.navigateForward('tabs/home/store/'+store_id);
    }
    async presentActionSheet(key) {
        const actionSheet = await this.actionSheetController.create({
        //   header: 'Albums',
          cssClass: 'my-custom-class',
          buttons: [{
            text: 'Borrar',
            role: 'destructive',
            icon: 'trash',
            handler: () => {
                this.ChatApi.removeMessage(key, this.id, this.data.store.ID);
            }
          }, {
            text: 'Cancelar',
            icon: 'close',
            role: 'cancel',
            handler: () => {

            }
          }]
        });
        await actionSheet.present();
    }
    async presentToast(message) {
        const toast = await this.toastController.create({
          message: message,
          duration: 2000
        });
        toast.present();
    }
}