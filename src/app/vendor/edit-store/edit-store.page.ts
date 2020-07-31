import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController, ModalController, ActionSheetController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../../api.service';
import { Data } from './../../data';
import { Settings } from './../../data/settings';
import { Store } from './../../data/store';
import { md5 } from './md5';
import { ReviewPage } from './../../review/review.page';
import { AlertController } from '@ionic/angular';

import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Headers } from '@angular/http';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Config } from './../../config';

@Component({
  selector: 'app-edit-store',
  templateUrl: './edit-store.page.html',
  styleUrls: ['./edit-store.page.scss'],
})
export class EditStorePage {
    store: any;
    filter: any = {};
    categories: any = [];
    usedVariationAttributes: any = [];
    options: any = {};
    id: any;
    variations: any = [];
    relatedProducts: any = [];
    upsellProducts: any = [];
    crossSellProducts: any = [];
    reviews: any = [];
    cart: any = {};
    status: any;
    disableButton: boolean = false;
    uploadingImage: boolean = false;
    photos: any;
    imageresult: any;
    imageIndex: any = 0;

    constructor(public platform: Platform, public actionSheetController: ActionSheetController, public modalCtrl: ModalController, public api: ApiService, public data: Data, public storeData: Store, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public alertController: AlertController, public route: ActivatedRoute, public config: Config, private transfer: FileTransfer, private imagePicker: ImagePicker, private crop: Crop) {
        this.filter.page = 1;
        this.filter.status = 'publish';
    }
    async getStore() {
        await this.api.postItem('store', {store_id:this.id}).then(res => {
            this.store = res;
            // this.handleProduct();
        }, err => {
            console.log(err);
        }).then(() => {
            this.api.postItem('products', {}, this.store.post_name).then(res => {
                this.store.products = res;
            }, err => {
                console.error(err);
            });
        }, err => {
            console.error(err);
        });
    }
    ngOnInit() {
        this.store = this.storeData.store;
        console.log(this);
        if(this.store.images){
            if (this.store.images.length == 0) {
                this.store.images = {};
            } else this.imageIndex = this.store.images.length;
        }

        this.id = this.route.snapshot.paramMap.get('id');
        this.getStore();
        // if (this.store.id) this.handleProduct();
        // else this.getProduct();
    }
    handleProduct() {
        for (let item in this.store.categories) {
            this.categories[item] = this.store.categories[item].id.toString();
        }
        this.usedVariationAttributes = this.store.attributes.filter(function(attribute) {
            return attribute.variation == true
        });
        this.options.product_id = this.store.id;
        if ((this.store.type == 'variable') && this.store.variations.length) this.getVariationProducts();
        /*this.getRelatedProducts();
        this.getUpsellProducts();
        this.getCrossSellProducts();
        this.getReviews();*/
    }
    async getVariationProducts() {
        await this.api.getItem('products/' + this.store.id + '/variations').then(res => {
            this.variations = res;
        }, err => {});
    }
    async getRelatedProducts() {
        if (this.store.related_ids != 0) {
            var filter = [];
            for (let item in this.store.related_ids) filter['include[' + item + ']'] = this.store.related_ids[item];
            await this.api.getItem('products', filter).then(res => {
                this.relatedProducts = res;
            }, err => {});
        }
    }
    async getUpsellProducts() {
        if (this.store.upsell_ids != 0) {
            var filter = [];
            for (let item in this.store.upsell_ids) filter['include[' + item + ']'] = this.store.upsell_ids[item];
            await this.api.getItem('products', filter).then(res => {
                this.upsellProducts = res;
            }, err => {});
        }
    }
    async getCrossSellProducts() {
        if (this.store.cross_sell_ids != 0) {
            var filter = [];
            for (let item in this.store.cross_sell_ids) filter['include[' + item + ']'] = this.store.cross_sell_ids[item];
            await this.api.getItem('products', filter).then(res => {
                this.crossSellProducts = res;
            }, err => {});
        }
    }
    async getReviews() {
        await this.api.getItem('products/' + this.store.id + '/reviews').then(res => {
            this.reviews = res;
            for (let item in this.reviews) {
                this.reviews[item].avatar = md5(this.reviews[item].email);
            }
        }, err => {});
    }
    goToProduct(product) {
        this.storeData.store = product;
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + product.id);
    }
    async presentAlert(header, message) {
        const alert = await this.alertController.create({
            header: header,
            message: message,
            buttons: ['OK']
        });
        await alert.present();
    }
    OnDestroy() {
        //this.storeData.store = {};
    }
    async saveStore() {
        this.disableButton = true;
        this.store.categories = [];
        for (let id in this.categories) {
            this.store.categories[id] = {
                id: parseInt(this.categories[id])
            };
        }
        // if (this.store.images.length) this.store.images[0].position = 0;
        // if (this.store.type == 'external') this.store.manage_stock = false;
        await this.api.postItem('update_store_data', this.store).then(res => {
            console.log(res);
            this.store = res;
            this.storeData.store = {};
            this.navCtrl.navigateBack('/tabs/account/vendor-stores');
        }, err => {
            console.log(err);
        });
    }

    picker(){
        console.log('hello');
        let options= {
          maximumImagesCount: 1,
        }
        this.photos = new Array<string>();
        this.imagePicker.getPictures(options)
        .then((results) => {
          this.reduceImages(results).then((results) => this.handleUpload(results));

        }, (err) => { console.log(err) });
    }


    handleUpload(results){
        this.upload();
    }

    reduceImages(selected_pictures: any) : any{
    return selected_pictures.reduce((promise:any, item:any) => {
        return promise.then((result) => {
        return this.crop.crop(item, {quality: 75, targetHeight: 100, targetWidth: 100})
        .then(cropped_image => this.photos = cropped_image);

        });
    }, Promise.resolve());
    }

    
    upload() {

        this.uploadingImage = true;

        const fileTransfer: FileTransferObject = this.transfer.create();

        var headers = new Headers();
            headers.append('Content-Type', 'multipart/form-data');

        let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: 'name.jpg',
            headers: { headers }
        }

        fileTransfer.upload( this.photos, this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp_upload_image', options)
        .then((data) => {

        this.uploadingImage = false;
        this.imageresult = JSON.parse(data.response);
        this.store.images[this.imageIndex] = {};
        this.store.images[this.imageIndex].src = this.imageresult.url;
        this.imageIndex = this.imageIndex + 1;
            // success
        }, (err) => {
            //this.functions.showAlert("error", err);
        })
    }

    async replaceImage(index){
        const actionSheet = await this.actionSheetController.create({
        header: 'Álbumes',
        buttons: [{
        text: 'Borrar el imagen',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
            this.store.images.splice(index, 1);
            this.imageIndex = this.imageIndex - 1;
        }
        }, {
        text: 'Editar el imagen',
        icon: 'create',
        handler: () => {
            let options= {
            maximumImagesCount: 1,
            }
            this.photos = new Array<string>();
            this.imagePicker.getPictures(options)
            .then((results) => {
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

        this.uploadingImage = true;

        const fileTransfer: FileTransferObject = this.transfer.create();

        var headers = new Headers();
            headers.append('Content-Type', 'multipart/form-data');

        let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: 'name.jpg',
            headers: { headers }
        }

        fileTransfer.upload( this.photos, this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp_upload_image', options)
        .then((data) => {

        this.uploadingImage = false;
        this.imageresult = JSON.parse(data.response);
        this.store.images[index].src = this.imageresult.url;
            // success
        }, (err) => {
            //this.functions.showAlert("error", err);
        })
    }

    seeAllProducts() {
        this.navCtrl.navigateForward('/tabs/account/vendor-stores/view-store/'+this.store.ID);
    }
}


