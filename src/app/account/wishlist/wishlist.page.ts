import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { Product } from './../../data/product';
@Component({
    selector: 'app-wishlist',
    templateUrl: './wishlist.page.html',
    styleUrls: ['./wishlist.page.scss'],
})
export class WishlistPage implements OnInit {
    wishlist: any = [];
    multisite_wishlist: any = [];
    constructor(public api: ApiService, public router: Router, public settings: Settings, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute, public productData: Product) {}
    ngOnInit() {
    }

    ionViewDidEnter() {
        if(this.settings.customer.id){
            /* HERE WE GET ALL THE STORES */
            this.api.postItem('get_multisite_wishlist').then(res=>{
                var result: any = res;
                for ( let i in result ) {
                    this.multisite_wishlist.push(result[i]);
                }
                console.log(this);
            },err=>{
                console.error(err);
            });
            this.getWishlist();
        }
    }
    async getWishlist() {
        await this.api.postItem('get_wishlist').then(res => {
            this.wishlist = res;
        }, err => {
            console.log(err);
        });
    }
    async removeFromWishlist(id) {
        await this.api.postItem('remove_wishlist', {
            product_id: id
        }).then(res => {
            this.wishlist = res;
        }, err => {
            console.log(err);
        });
    }
    getProduct(product){
        this.productData.product = product;
        this.navCtrl.navigateForward('/tabs/account/wishlist/product/');
    }
}