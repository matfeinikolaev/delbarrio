import { Injectable } from '@angular/core';
import { HttpParams } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Config } from '../config';
import { HTTP } from '@ionic-native/http/ngx';
import { Headers } from '@angular/http';
import { Platform } from '@ionic/angular';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { ApiService } from './../api.service';
import * as FireBase from 'firebase';
const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

var headers = new Headers();
headers.append('Content-Type', 'application/x-www-form-urlencoded');

@Injectable({
  providedIn: 'root'
})
export class ChatApi {
    inMsg: any;
    constructor(public onesignal: OneSignal, public api: ApiService) {}
    getMessages(user_id, store_id) {
        return FireBase.database().ref('chats/'+user_id+'/'+store_id);
    }
    getIncomeMessages(user_id, store_id) {
        return FireBase.database().ref('chats/'+user_id+'/'+store_id);
    }
    snapshotToArray(snapshot) {
        let chatData: any = {};
        snapshot.forEach(childSnapshot => {
            chatData[childSnapshot.key] = childSnapshot.val();
        });
        return chatData;
    }
    sendMessage(user_id, store_id, message) {
        let newData = FireBase.database().ref('chats/'+user_id+'/'+store_id);
        let newKey = FireBase.database().ref('chats/'+user_id+'/'+store_id).push().key;
        let updates = {};
        updates[newKey] = {
            type:'message',
            sender:user_id,
            message:message,
            sendDate:Date(),
            status:'user-vendor'
          };
        newData.update(updates);
        return newKey;
    }
    removeMessage(key, user_id, store_id) {
        let chatsData = FireBase.database().ref('chats/'+user_id+'/'+store_id+'/'+key);
        chatsData.remove();
    }
}