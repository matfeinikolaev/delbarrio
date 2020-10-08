import { Component, OnInit } from '@angular/core';
import { Settings } from './../../../data/settings';
import { LoadingController, NavController, ActionSheetController, Platform  } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Vendor } from './../../../data/vendor';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Headers } from '@angular/http';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Config } from './../../../config';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.page.html',
  styleUrls: ['./photos.page.scss'],
})
export class StorePhotosPage implements OnInit {
  
  uploadingImageSpinner: boolean = false;
  photos: any;
  imageresult: any;
  imageIndex: any = 0;
  imageArray: any = [];
  res: any;
  loading: any;

  err: any;
  constructor(public platform: Platform, public api: ApiService, public actionSheetController: ActionSheetController, public config: Config, public vendor: Vendor, public settings: Settings, public loadingController: LoadingController, public navCtrl: NavController, public router: Router, private transfer: FileTransfer, private imagePicker: ImagePicker, private crop: Crop) { }

  ngOnInit() {
      console.log(this);
  }

  picker() {
      
      let options = {
          maximumImagesCount: 1,
      }
      this.photos = new Array < string > ();
      this.imagePicker.getPictures(options).then((results) => {
          console.log(results);
          this.reduceImages(results).then((results) => this.handleUpload(results));
      }, (err) => {
          this.err = err;
      });
  }

  handleUpload(results) {
      this.upload();
  }
  reduceImages(selected_pictures: any): any {
      return selected_pictures.reduce((promise: any, item: any) => {
          return promise.then((result) => {
              return this.crop.crop(item, {
                  quality: 75,
                  targetHeight: 100,
                  targetWidth: 100
              }).then(
              cropped_image => this.photos = cropped_image,
              error => this.err = error
              );
          });
      }, Promise.resolve());
  }
  upload() {
      this.uploadingImageSpinner = true;
      const fileTransfer: FileTransferObject = this.transfer.create();
      var headers = new Headers();
      headers.append('Content-Type', 'multipart/form-data');
      let options: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'name.jpg',
          headers: {
              headers
          }
      }
      fileTransfer.upload(this.photos, this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp_upload_image', options).then((data) => {
          this.uploadingImageSpinner = false;
          this.imageresult = JSON.parse(data.response);
        //   this.vendor.product.images[this.imageIndex] = {};
          if(this.vendor.product.images == '') {
            this.vendor.product.images = this.imageresult.url;
          }
          else {
            this.vendor.product.images = this.vendor.product.images.concat( ' ' + this.imageresult.url );
          }
          this.imageIndex = this.imageIndex + 1;
          // success
      }, (err) => {
          //this.functions.showAlert("error", err);
      })
  }
  async replaceImage(index) {
      const actionSheet = await this.actionSheetController.create({
          header: 'Álbums',
          buttons: [{
              text: 'Borrar Imagen',
              role: 'destructive',
              icon: 'trash',
              handler: () => {
                  this.imageArray.splice(index, 1);
                  //   this.vendor.product.images.splice(index, 1);
                  this.vendor.product.images = this.imageArray.join(' ');
                  this.imageIndex = this.imageIndex - 1;
              }
          }, {
              text: 'Editar Imagen',
              icon: 'create',
              handler: () => {
                  let options = {
                      maximumImagesCount: 1,
                  }
                  this.photos = new Array < string > ();
                  this.imagePicker.getPictures(options).then((results) => {
                      this.reduceImages(results).then((results) => this.replaceUpload(index));
                  }, (err) => {
                      //this.functions.showAlert("error", err);
                  });
              }
          }, {
              text: 'Cancelar',
              icon: 'close',
              role: 'cancel',
              handler: () => {
                  console.log('Cancel clicked');
              }
          }]
      });
      await actionSheet.present();
  }
  replaceUpload(index) {
      this.uploadingImageSpinner = true;
      const fileTransfer: FileTransferObject = this.transfer.create();
      var headers = new Headers();
      headers.append('Content-Type', 'multipart/form-data');
      let options: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'name.jpg',
          headers: {
              headers
          }
      }
      fileTransfer.upload(this.photos, this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp_upload_image', options).then((data) => {
          this.uploadingImageSpinner = false;
          this.imageresult = JSON.parse(data.response);
          //   this.vendor.product.images[this.imageIndex] = {};
          if(this.vendor.product.images == '') {
            this.vendor.product.images = this.imageresult.url;
          }
          else {
            this.vendor.product.images = this.vendor.product.images.concat( ' ' + this.imageresult.url );
          }
          // success
      }, (err) => {
          //this.functions.showAlert("error", err);
      })
  }
  publish() {
      this.vendor.product.status = 'publish';
      this.submit();
  }
  draft() {
      this.vendor.product.status = 'draft';
      this.submit();
  }
  async submit() {
      this.vendor.store.id = this.settings.customer.id;
      this.loading = await this.loadingController.create({
          spinner: 'crescent',
          translucent: true,
          animated: true,
          backdropDismiss: true
      });
      await this.loading.present();
      this.api.postItem('add_store', this.vendor.store).then(res => {
          //DOKAN AND WCFM Plugin
          this.res = res;
        //   this.api.postItem('update-vendor-product', {
        //       id: this.res.id
        //   }).then(res => {
        //       console.log(res);
        //   }, err => {
        //       console.log(err);
        //   });
          //DOKAN AND WCFM Plugin
          this.vendor.store = {};
          this.vendor.store.categories = [];
          this.vendor.store.images = '';
          this.vendor.store.dimensions = {};
          this.imageArray = [];
          this.loading.dismiss();
          this.navCtrl.navigateBack('tabs/account');
      }, err => {
          this.loading.dismiss();
          console.log(err);
      });
  }


}
