import { Component, OnInit } from '@angular/core';
import { Config } from '../../config';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Settings } from './../../data/settings';
import { HomePage} from '../../home/home.page';
import { Config as IonicConfig } from '@ionic/angular';
import { ApiService } from './../../api.service';
@Component({
  selector: 'app-setting',
  templateUrl: './edit-settings.page.html',
  styleUrls: ['./edit-settings.page.scss'],
})
export class EditSettingsPage implements OnInit {
  constructor(public settings: Settings, public api: ApiService, /*public home: HomePage, public ionicConfig: IonicConfig, public router: Router, public navCtrl: NavController, public translateService: TranslateService, public nativeStorage: NativeStorage, public config: Config*/) { }
    ngOnInit() {
      console.log(this);
    }
    save() {

    }
}
