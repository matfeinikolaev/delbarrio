import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../../api.service';
import { Data } from './../../data';
import { Settings } from './../../data/settings';
import { Product } from './../../data/product';
import { FilterPage } from './../../filter/filter.page';
import { Store } from './../../data/store';
import {IonSlides} from '@ionic/angular';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage {
    products: any;
    tempProducts: any = [];
    subCategories: any = [];
    filter: any = {};
    attributes: any;
    hasMoreItems: boolean = true;
    loader: boolean = true;
    searchInput: any;
    store_site: any;
    displayProducts: any;
    productTypes: any;
    categories: any;
    types: any;
    chosenCategory: any;
    chosenType: any;
    chosenStockState: any;
    path: any;
    @ViewChild("slider", { static: true }) ionSlides: IonSlides;
    constructor(public platform: Platform, public alertController: AlertController, public modalController: ModalController, public api: ApiService, public data: Data, public product: Product, public store: Store, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute) {
        this.filter.page = 1;
        // this.filter.vendor = this.settings.customer.id;
        if(this.settings.administrator) {
            // delete this.filter.vendor;
        }
    }
    async getFilter() {
        const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
                filter: this.filter,
                attributes: this.attributes
            }
        });
        modal.present();
        const {
            data
        } = await modal.onDidDismiss();
        if (data) {
            this.filter = data;
            this.filter.page = 1;
            this.getProducts();
        }
    }
    async loadData(event) {
        this.filter.page = this.filter.page + 1;
        await this.api.getItem('products', this.filter).then(res => {
            this.tempProducts = res;
            this.products.push.apply(this.products, this.tempProducts);
            event.target.complete();
            if (this.tempProducts.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
    async getProducts() {
        this.loader = true;
        await this.api.postItem('get_all_products', this.filter, this.path).then(res => {
            this.products = res;
            this.displayProducts = this.products[0];
            this.loader = false;
        }, err => {
            console.log(err);
        }).finally().then(() => {
            this.api.postItem("get_product_statuses", {}, this.path).then(res => {
                this.productTypes = res;
            }, err => {
                console.error(err);
            });

            this.api.postItem("categories_all", {}, this.path).then(res => {
                this.categories = res;
            }, err => {
                console.error(err);
            });

            this.api.postItem("get_product_types", {}, this.path).then(res => {
                this.types = res;
            }, err => {
                console.error(err);
            });
        });;
    }
    async getProductsManager(i) {
        this.loader = true;
        await this.api.postItem('get_all_products', this.filter, this.store_site[i].path).then(res => {
          if(res != null) {
            this.products = res;
            this.displayProducts = this.products[0];
            this.path = this.store_site[i].path;
            this.loader = false;
          }
        }, err => {
            console.log(err);
        }).finally().then(() => {
            if (this.products == null) {
                this.getProductsManager(i+1);
            } else {
                this.api.postItem("get_product_statuses", {}, this.path).then(res => {
                    this.productTypes = res;
                }, err => {
                    console.error(err);
                });

                this.api.postItem("categories_all", {}, this.path).then(res => {
                    this.categories = res;
                }, err => {
                    console.error(err);
                });

                this.api.postItem("get_product_types", {}, this.path).then(res => {
                    this.types = res;
                }, err => {
                    console.error(err);
                });

            }
        });
    }
    getProductsByType(status) {
        this.chosenType = null;
        this.chosenCategory = null;
        this.chosenStockState = null;
        this.filter.category = null;
        this.filter.type = null;
        this.filter.stock_status = null;
        this.filter.status = status;
        this.loader = true;
        this.api.postItem('get_all_products', this.filter, this.path).then(res => {
          console.log(this.filter);
            this.products = res;
            this.displayProducts = this.products[0];
            this.loader = false;
        }, err => {
            console.log(err);
        });
    }
    async filterProducts () {
      if (this.chosenCategory != null)
        this.filter.category = this.chosenCategory;
      if (this.chosenType != null)
        this.filter.type = this.chosenType;
      if (this.chosenStockState != null)
        this.filter.stock_status = this.chosenStockState;
      this.loader = true;
      await this.api.postItem('get_all_products', this.filter, this.path).then(res => {
          this.products = res;
          this.displayProducts = this.products[0];
          this.loader = false;
      }, err => {
          console.log(err);
      }).finally().then(() => {
          this.api.postItem("get_product_statuses", {}, this.path).then(res => {
              this.productTypes = res;
          }, err => {
              console.error(err);
          });

          this.api.postItem("categories_all", {}, this.path).then(res => {
              this.categories = res;
          }, err => {
              console.error(err);
          });

          this.api.postItem("get_product_types", {}, this.path).then(res => {
              this.types = res;
          }, err => {
              console.error(err);
          });
      });

    }
    async getAttributes() {
        await this.api.postItem('product-attributes', {
            category: this.filter.category
        }, this.store.store.post_name).then(res => {
            this.attributes = res;
        }, err => {
            console.log(err);
        });
    }
    getStore() {
        this.api.postItem('get_user_sites', {id: this.settings.user.ID}).then(res => {
            this.store_site = res;
        }, err => {
            console.error(err);
        }).finally().then(() => {
            this.getProductsManager(0);
        }, err => {
            console.error(err);
        });
    }
    ionViewWillEnter(){
        this.ngOnInit();
    }
    ngOnInit() {
        console.log(this);
        this.filter.category = this.route.snapshot.paramMap.get('id');
        this.filter.status = "";
        if (this.data.categories && this.data.categories.length) {
            for (var i = 0; i < this.data.categories.length; i++) {
                if (this.data.categories[i].parent == this.filter.category) {
                    this.subCategories.push(this.data.categories[i]);
                }
            }
        }
        if (this.settings.colWidthProducts == 4) this.filter.per_page = 15;
        if (this.settings.user.userIsManager) {
            this.getStore();
        } else {
            this.path = this.store.store.post_name.replace("-", "");
            this.getProducts();
            this.getAttributes();
        }
    }
    ionSlideDidChange() {
        this.loader = true;
        this.ionSlides.getActiveIndex().then(res => {
            this.displayProducts = this.products[res];
            this.loader = false;
        }, err => {
            console.error(err);
        });
    }
    changeSlide(dir) {
        this.loader = true;
        switch (dir) {
            case "back":
                this.ionSlides.slidePrev().then(res => {
                    this.ionSlides.getActiveIndex().then(res => {
                        this.displayProducts = this.products[res];
                        this.loader = false;
                    }, err => {
                        console.error(err);
                    });
                });
                break;
            case "forward":
                this.ionSlides.slideNext().then(res => {
                    this.ionSlides.getActiveIndex().then(res => {
                        this.displayProducts = this.products[res];
                        this.loader = false;
                    }, err => {
                        console.error(err);
                    });
                });
                break
        }
    }
    onInput() {
        this.filter.page = 1;
        delete this.filter.sku;
        this.filter.q = this.searchInput;
        this.getProducts();
        this.loader = false;
    }
    getProduct(product) {
        this.product.product = product;
        this.navCtrl.navigateForward(this.router.url + '/view-product/' + product.id);
    }
    getCategory(id) {
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + id);
    }
    editProduct(product){
        this.product.product = product;
        this.navCtrl.navigateForward(this.router.url + this.store.store.ID +'/edit-product/' + product.ID);
    }

    goTo(link) {
        this.navCtrl.navigateForward(link);
    }

    async delete(product){
        const alert = await this.alertController.create({
          header: 'Borrar',
          message: 'Está seguro, que quiere borrar este producto?',
          buttons: [{
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Borrar',
          handler: () => {
            this.api.postItem('delete_user_post', {ID: product.ID}, product.path).then(res => {
                console.log(product);
                this.getProducts();
            }, err => {
                console.log(err);
            });
         }
        }]

        });

        await alert.present();
    }
}
