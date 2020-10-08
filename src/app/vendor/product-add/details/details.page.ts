import { Component, OnInit } from '@angular/core';
import { Settings } from './../../../data/settings';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Vendor } from './../../../data/vendor';
import { Store } from './../../../data/store';
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  constructor(public alertController: AlertController, public vendor: Vendor, public settings: Settings, public store: Store, public loadingController: LoadingController, public navCtrl: NavController, public router: Router, public route: ActivatedRoute) { }

  ngOnInit() {
  	console.log(this);
  	console.log(this.vendor.product);
  }

  next(){
    if(this.validateForm()){
      // this.navCtrl.navigateForward('/tabs/account/add-products/details/' + this.vendor.product.categories[0].id + '/photos');
      this.navCtrl.navigateForward('/tabs/account/add-products/details/' + this.store.store.ID + '/photos');
    }
  }

  validateForm(){
    if(this.vendor.product.name == '' || this.vendor.product.name == undefined){
      this.presentAlert('Por favor ingrese el nombre');
      return false;
    }

    if(this.vendor.product.type == '' || this.vendor.product.type == undefined){
      this.presentAlert('Por favor seleccione el tipo de producto');
      return false;
    }

    if(this.vendor.product.regular_price == '' || this.vendor.product.regular_price == undefined){
      this.presentAlert('Por favor ingrese el precio regular');
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
