import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Settings } from './../../data/settings';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Data } from '../../data';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit{
  form: any;
  editmode: any = false;
  constructor(public settings: Settings, public navCtrl: NavController, private fb: FormBuilder, public api: ApiService, public alert: AlertController, public data: Data,/*public home: HomePage, public ionicConfig: IonicConfig, public router: Router, public translateService: TranslateService, public nativeStorage: NativeStorage, public config: Config*/) { 
    this.form = this.fb.group({
      ID: this.settings.user.ID,
      display_name: this.settings.user.display_name,
      user_email: this.settings.user.user_email,
      user_login: this.settings.user.user_login,
      user_nicename: this.settings.user.user_nicename,
      user_pass: '',
      user_url: this.settings.user.user_url,
    });
  }
    // applyLanguage(){
    //   this.translateService.setDefaultLang(this.config.lang);
    //   if(this.config.lang == 'ar'){
    //     this.settings.dir = 'rtl';
    //   } else this.settings.dir = 'ltr';
    //   this.translateService.get(['Back']).subscribe(translations => {
    //       this.ionicConfig.set('backButtonText', translations['Back']);
    //   });
    //   document.documentElement.setAttribute('dir', this.settings.dir);
    //   this.nativeStorage.setItem('settings', {lang: this.config.lang, dir: this.settings.dir})
    //     .then(
    //       () => console.log(),
    //       error => console.error(error)
    //   );
    //   this.home.getBlocks();
    //   this.navCtrl.pop();
    // }
    ngOnInit(){}

    editMode() {
      this.editmode = true;
    }

    onSubmit() {
      if(this.form.value.ID != this.settings.user.ID || this.form.value.display_name != this.settings.user.display_name || this.form.value.user_email != this.settings.user.user_email || this.form.value.user_login != this.settings.user.user_login || this.form.value.user_nicename != this.settings.user.user_nicename || this.form.value.user_pass != '' || this.form.value.user_url != this.settings.user.user_url) 
      {
        this.presentAlert(1);
      }
      else {
        this.editmode = false
      }
    }

    async checkPassword(pass) {
      this.api.postItem('login', {password: pass, username:this.settings.user.user_login}).then( res => {
        var result: any = res;
        if(result.ID == this.settings.user.ID && result.data.user_pass == this.settings.user.user_pass){
          this.saveChanges(pass);
        }
        else {
          this.presentAlert(0);
        }
      }, err => {
        console.error(err);
      });
    }

    saveChanges(pass) {
      this.api.postItem('update_user_info', this.form.value).then( res => {
        var result: any = res;
        if (result.errors == null) {
          this.api.postItem('keys').then(res => {
            var keys: any = res;
            this.data.blocks.user = keys.user;
            this.settings.user = this.data.blocks.user.data;
            this.editmode = false;
          }, err => {
            console.error(err);
          });
        }
      }, err => {
        console.error(err);
      });
    }

    async presentAlert(check) {
      var header: any = check?'Ingrese su contraseña para guardar los cambios':'Perdon, la contraseña está incorrecta.';
      const alert = await this.alert.create({
        cssClass: 'my-custom-class',
        header: header,
        inputs: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Su contaseña'
          },
        ],
        buttons: [
          {
            text: 'Ok',
            handler: ({password: password}) => {
              this.checkPassword(password);
            }
          },
          {
            text: 'Cancelar',
            handler: () => {

            }
          }
        ]
      });
      await alert.present();
    }

}
