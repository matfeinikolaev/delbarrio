import { Component, OnInit } from '@angular/core';
import { Settings } from './../../../data/settings';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Vendor } from './../../../data/vendor';
import { ApiService } from './../../../api.service';
import { Data } from './../../../data';
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class StoreDetailsPage implements OnInit {

  constructor(public alertController: AlertController, public vendor: Vendor, public settings: Settings, public api: ApiService, public data: Data, public loadingController: LoadingController, public navCtrl: NavController, public router: Router, public route: ActivatedRoute) { }

  ngOnInit() {
    console.log(this);
  }

  next(){
    if(this.validateForm()){
      this.navCtrl.navigateForward('/tabs/account/add-stores/photos');
    }
  }

  validateForm(){
    if(this.vendor.store.name == '' || this.vendor.store.name == undefined){
      this.presentAlert('Por favor ingrese el nombre');
      return false;
    }

    if(this.vendor.store.type == '' || this.vendor.store.type == undefined){
      this.presentAlert('Por favor seleccione el tipo de producto');
      return false;
    }

    else return true;
  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
