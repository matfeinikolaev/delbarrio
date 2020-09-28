import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
import { Store } from '../data/store';
import { LoginPage } from '../account/login/login.page';
import { md5 } from './md5';
import { ReviewPage } from '../review/review.page';
import { AlertController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Vendor } from '../data/vendor';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { HttpParams } from "@angular/common/http";
import { Config } from '../config';
import { ChatApi } from './../chat/chat.api';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
@Component({
    selector: 'app-store',
    templateUrl: 'store.page.html',
    styleUrls: ['store.page.scss']
})
export class StorePage {
    product: any = {};
    store: any;
    filter: any = {};
    usedVariationAttributes: any = [];
    options: any = {};
    id: any;
    variations: any = [];
    groupedProducts: any = [];
    relatedProducts: any = {};
    upsellProducts: any = [];
    crossSellProducts: any = [];
    reviews: any = [];
    cart: any = {};
    status: any;
    disableButton: boolean = false;
    quantity: any;
    addons: any;//ADDONS
    addonsList: any = [];//ADDONS
    lan: any = {};
    variationId: any;
    results: any;
    sites: any = [];
    path: any;
    searchInput: any = "";
    chosenCategory: any;
    chosenSubcategory: any;
    chosenOrder: any;
    loadingProducts: any = false;
    incomeMessages: any = [];
    form: any;
    formRegister: any;
    openFeedbackForm: any = false;
    errorMessage:any;
    unavailableProduct:any;
    constructor(private chatapi: ChatApi, private config: Config, public translate: TranslateService, public toastController: ToastController, private socialSharing: SocialSharing, public modalCtrl: ModalController, public api: ApiService, public data: Data, public productData: Product, public storeData: Store, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public alertController: AlertController, public route: ActivatedRoute, public vendor: Vendor, public iab: InAppBrowser, private fb: FormBuilder) {
        this.filter.page = 1;
        this.quantity = "1";        
        this.form = this.fb.group({
            name: this.settings.user?this.settings.user.display_name:'',
            phone: '',
            email: this.settings.user?this.settings.user.user_email:'',
        });
    }
    getReviewsPage() {
        this.navCtrl.navigateForward(this.router.url + '/review/' + this.product.id);
    }
    getProduct(product) {
        this.productData.product = product;
        this.navCtrl.navigateForward('/tabs/home/product/' + product.id);
    }
    getStore() {
        this.api.postItem('store', {'store_id':this.id}).then(res => {
            this.data.store = res;
            this.store = res;
            this.path =  this.store.wordpress_store_locator_website.split('/');
            this.path = this.path[this.path.length -1];
        }, err=>{
            console.error(err);
        }).then(() => {
            this.api.postItem('categories_json', {}, this.path).then(res => {
                this.data.store.categories = res;
                this.store.categories = res;
            }, err => {
                console.error(err);
            });
        }, err => {
            console.error(err);
        }).then(()=>{
            this.api.postItem('get_catalog_ordering', {}, this.path).then(res => {
                this.data.store.ordering = res;
                this.store.ordering = res;
            }, err => {
                console.error(err);
            });
        }, err => {
            console.error(err);
        }
        ).then(()=>{
            this.loadingProducts = true;
            this.api.postItem('products', {}, this.path).then(res => {
                this.data.store.products = res;
                this.store.products = res;
                this.loadingProducts = false;
            }, err => {
                console.error(err);
                this.loadingProducts = false;
            });
        }, err=>{
            console.error(err);
        }).then(() => {
            this.api.postItem('cart', {}, this.path).then(res => {
                console.log(res);
                this.store.cart = res;
                this.cart.cart = this.store.cart.cart_contents;
                this.data.updateCart(this.cart.cart);
            })
        }).then(() => {
            if( this.settings.customer.id) {
                this.api.postItem('get_wishlist', {}, this.path).then(res => {
                    this.settings.add_wishlist = res;
                    this.settings.wishlist = [];
                    for (let item in this.settings.add_wishlist) {
                        this.settings.wishlist[this.settings.add_wishlist [item].id] = this.settings.add_wishlist [item].id;
                    }
                    this.settings.store_wishlist.push(this.settings.add_wishlist);
                }, err => {
                    console.log(err);
                });
            }
        }).then(() => {
            if(this.settings.user) {
                this.getIncomeMessages();
            }
        });
    }
    onInput() {
        // this.loading = true;
        // this.hasMoreItems = true;
        this.filter.page = 1;
        delete this.filter.sku;
        this.filter.q = this.searchInput;
        // if (this.searchInput.length) {
            this.getProducts();
        // } 
        // else {
        //     this.products = '';
        //     this.loading = false;
        // }
    }
    async getProducts(id=null) {
        this.filter.catalog_ordering = this.chosenOrder;
        this.loadingProducts = true;
        if ( Array.isArray(this.chosenCategory) ) {
            var result: any = [];
            for (let catId of this.chosenCategory) {
                this.filter.id = catId;            
                this.api.postItem('products', this.filter, this.path).then(res => {
                    result = result.concat(res);
                    this.store.products = result;
                    this.data.store.products = result;
                    this.loadingProducts = false;
                }, err => {
                    console.log(err);
                    this.loadingProducts = false;
                });
            }
            this.store.chosenCategory = this.store.categories.find(cat => {
                return cat.term_id = this.chosenCategory;
            });
        } 
        else {
            this.filter.id = this.chosenSubcategory ? this.chosenSubcategory : this.chosenCategory;
            this.api.postItem('products', this.filter, this.path).then(res => {
                this.data.store.products = result;
                this.store.products = res;
                this.loadingProducts = false;
            }, err => {
                console.log(err);
                this.loadingProducts = false;
            });        
            this.store.chosenCategory = this.store.categories.find(cat => {
                return cat.id == this.chosenCategory && cat.cat_ID == this.chosenCategory && cat.term_id == this.chosenCategory;
            });
        }
    }
    getCategory() {
        this.chosenSubcategory = null;
        this.getProducts();
    }
    getSubcategory(id) {
        this.chosenSubcategory = id;
        this.getProducts();
    }
    getCart() {
        this.api.postItem('cart', {}, this.store.path).then(res => {
            this.store.cart = res;
        }, err => {
            console.error(err);
        });
    }
    notifyClient(product) {
        this.unavailableProduct = product.id;
        if(this.settings.user || this.settings.customer.id) {
            this.openFeedbackForm = true;
        }
        else this.login();
    }
    closeForm() {
        this.openFeedbackForm = false;
    }
    onSubmit() {
        this.form.value.type = 'product-unavailable';
        this.form.value.product = this.unavailableProduct;
        if (this.checkFields()) {
            this.api.postItem("notify-client", this.form.value).then(res => {
                this.settings.clientDataSent = true;
                console.log(res);
            }, err => {
                console.log(err);
            });
        }
    }
    checkFields() {
        if (this.form.value.phone != "" || this.form.value.email != "") {
            this.errorMessage = null;
            return true;
        } else {
            this.errorMessage = "Por favor, ingrese su teléfono o correo electrónico"; //, ingrese su teléfono o correo electrónico
            return false;
        }
    }
    highlightCart() {
        setTimeout(() => {
            var cartIcon = document.querySelector("#cartIcon");
            var cartBadge = document.querySelector("#cartBadge");
            var cartStyle = cartIcon.getAttribute("style").split(";");
            if (this.data.count > 0) {
                setTimeout(() => {
                    cartIcon.setAttribute("color", "warning");
                    cartBadge.setAttribute("color", "warning");
                }, 1000);

                setTimeout(() => {
                    cartIcon.setAttribute("color", "danger");
                    cartBadge.setAttribute("color", "danger");
                }, 1500);
                setTimeout(() => {
                    cartIcon.setAttribute("color", "warning");
                    cartBadge.setAttribute("color", "warning");
                }, 2000);

                setTimeout(() => {
                    cartIcon.setAttribute("color", "danger");
                    cartBadge.setAttribute("color", "danger");
                }, 2500);
                setTimeout(() => {
                    cartIcon.setAttribute("color", "warning");
                    cartBadge.setAttribute("color", "warning");
                }, 3000);

                setTimeout(() => {
                    cartIcon.setAttribute("color", "danger");
                    cartBadge.setAttribute("color", "danger");
                }, 3500);
                this.highlightCart();
            }
            else {
                // var style = "width: 1em";
                // cartStyle.push(style);
                // cartIcon.setAttribute("style", cartStyle.join(";"));
                this.highlightCart();
            }
        }, 8000);
    }
    ngOnInit() {
        this.highlightCart();
        this.translate.get(['Oops!', 'Por favor seleccione', 'Por favor espera', 'Opciones', 'Opción', 'Seleccione', 'Artículo agregado al carrito', 'Mensaje', 'Cantidad solicitada no disponible'  ]).subscribe(translations => {
            this.lan.oops = translations['Oops!'];
            this.lan.PleaseSelect = translations['Por favor seleccione'];
            this.lan.Pleasewait = translations['Por favor espera'];
            this.lan.options = translations['Opciones'];
            this.lan.option = translations['Opción'];
            this.lan.select = translations['Seleccione'];
            this.lan.addToCart = translations['Artículo agregado al carrito'];
            this.lan.message = translations['Mensaje'];
            this.lan.lowQuantity = translations['Cantidad solicitada no disponible'];
        });
        this.store = this.storeData.store;
        this.id = this.route.snapshot.paramMap.get('id');
        // if (this.store.ID) this.handleProduct();
        //  else
        //  this.getProducts();
        this.getStore();
        console.log(this);
    }    
    getIncomeMessages() {
        var msgs = this.data.messages[this.store.ID];
        for (let i in msgs) {
            if (msgs[i].status == 'vendor-user' && (msgs[i].type=='message' || msgs[i].type=='notification')) {
                this.incomeMessages.push(msgs[i]);
            }
        }
    }
    handleProduct() {

        /* Reward Points */
        if(this.settings.settings.switchRewardPoints && this.product.meta_data)
        this.product.meta_data.forEach(item => {
            if(item.key == '_wc_points_earned'){
                this.product.showPoints = item.value;
            }
        });

        /* Product Addons */
        if(this.settings.settings.switchAddons ===  1)
        this.getAddons();

        this.usedVariationAttributes = this.product.attributes.filter(function(attribute) {
            return attribute.variation == true
        });
    
        //if ((this.product.type == 'variable') && this.product.variations.length) this.getVariationProducts();
        if ((this.product.type == 'grouped') && this.product.grouped_products.length) this.getGroupedProducts();
        this.getRelatedProducts();
        this.getReviews();
    }
    getVariationProducts() {
        this.api.getItem('products/' + this.product.id + '/variations', {per_page: 100}).then(res => {
            this.variations = res;
        }, err => {});
    }
    getGroupedProducts(){
        if (this.product.grouped_products.length) {
            var filter = [];
            for (let item in this.product.grouped_products) filter['include[' + item + ']'] = this.product.grouped_products[item];
            this.api.getItem('products', filter).then(res => {
                this.groupedProducts = res;
            }, err => {});
        }
    }
    getRelatedProducts() {
        var filter = [];
        filter['product_id'] = this.product.id;
        this.api.postItem('product_details', filter, this.store.post_name).then(res => {
            this.relatedProducts = res;
        }, err => {});
    }
    getReviews() {
        this.api.postItem('product_reviews', {'product_id': this.product.id}, this.store.post_name).then(res => {
            this.reviews = res;
            for (let item in this.reviews) {
                this.reviews[item].avatar = md5(this.reviews[item].email);
            }
        }, err => {});
    }
    goToProduct(product) {
        this.productData.product = product;
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + product.id);
    }
    openChat() {
        if(this.settings.user || this.settings.customer.id) {
            this.navCtrl.navigateForward("tabs/home/store/" + this.store.ID + "/messaging/" + this.settings.customer.id);
        }
        else this.login();
    }
    async login() {
        const modal = await this.modalCtrl.create({
            component: LoginPage,
            componentProps: {
            path: 'tabs/home/store/'+this.id,
            },
            swipeToClose: true,
            //presentingElement: this.routerOutlet.nativeEl,
        });
        modal.present();
        const { data } = await modal.onWillDismiss();

        if(this.settings.customer.id) {
            this.navCtrl.navigateForward('/tabs/home/store/' + this.id);
        }
    }
    openCart() {
        this.navCtrl.navigateForward("tabs/cart/" + this.store.ID);
    }
    onPageScroll() {
        var cart = document.getElementById("cartIcon");
        var chat = document.getElementById("chatIcon");
        var head = document.getElementById("pageHeader");
        var cartTop = cart.getBoundingClientRect().top;
        var chatTop = chat.getBoundingClientRect().top;
        var headTop = head.getBoundingClientRect().top;
        if(cartTop > 54 ) {
            cart.style.marginTop = Number.parseInt(cart.style.marginTop.split('p')[0]) - 10 + 'px';
            chat.style.marginTop = Number.parseInt(chat.style.marginTop.split('p')[0]) - 10 + 'px';
        }
        if(headTop > -56) {
            cart.style.marginTop = "-30px";
            chat.style.marginTop = "-30px";
        }
    }
    async addToCart(product) {
        this.product = product;
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        }
        else if (this.selectAdons() && this.setVariations2() && this.setGroupedProducts()) {
            this.options.product_id = product.id;
            this.options.quantity = this.quantity;
            this.disableButton = true;
            await this.api.postItem('add_to_cart', this.options, product.path).then(res => {
                this.results = res;
                if(this.results.error) {
                    this.presentToast(this.results.notice);
                } else { 
                    this.cart = res;
                    this.store.cart = res;
                    this.presentToast(this.lan.addToCart);
                    this.data.updateCart(this.cart.cart);
                }
                this.disableButton = false;
                console.log(this);
            }, err => {
                console.log(err);
                this.disableButton = false;
            });
        }
    }
    async updateToCart(product){
        var params: any = {};
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        } else {
          for (let key in this.data.cartItem) {
            if (this.data.cartItem[key].product_id == product.id) {
                  if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
                      this.data.cartItem[key].quantity = 0
                  }
                  else {
                      this.data.cartItem[key].quantity += 1
                  };
                  if (this.data.cart[product.id] != undefined && this.data.cart[product.id] == 0) {
                      this.data.cart[product.id] = 0
                  }
                  else {
                      this.data.cart[product.id] += 1
                  };
                  params.key = key;
                  params.quantity = this.data.cartItem[key].quantity;
            }      
          }
          params.update_cart = 'Update Cart';
          params._wpnonce = this.data.cartNonce;
          await this.api.postItem('update-cart-item-qty', params, product.path).then(res => {
              this.cart = res;
              this.data.updateCart(this.cart.cart_contents);
          }, err => {
              console.log(err);
          });

        }

    }
    async deleteFromCart(product){
        var params: any = {};
        for (let key in this.data.cartItem) {
          if (this.data.cartItem[key].product_id == product.id) {
            if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
                this.data.cartItem[key].quantity = 0;
            }
            else {
                this.data.cartItem[key].quantity -= 1;
            };
            if (this.data.cart[product.id] != undefined && this.data.cart[product.id] == 0) {
                this.data.cart[product.id] = 0
            }
            else {
                this.data.cart[product.id] -= 1
            };
            params.key = key;
            params.quantity = this.data.cartItem[key].quantity;
          }      
        }    
        params.update_cart = 'Update Cart';
        params._wpnonce = this.data.cartNonce;
        await this.api.postItem('update-cart-item-qty', params, product.path).then(res => {
            console.log(res);
            this.cart = res;
            this.data.updateCart(this.cart.cart_contents);
        }, err => {
            console.log(err);
        });
    }
    async presentToast(message) {
        const toast = await this.toastController.create({
          message: message,
          duration: 2000,
          position: 'top'
        });
        toast.present();
    }
    setVariations() {
        if(this.variationId){
            this.options.variation_id = this.variationId;
        }
        this.product.attributes.forEach(item => {
            if (item.selected) {
                this.options['variation[attribute_pa_' + item.name + ']'] = item.selected;
            }
        })
        for (var i = 0; i < this.product.attributes.length; i++) {
            if (this.product.attributes[i].variation && this.product.attributes[i].selected == undefined) {
                this.presentAlert(this.lan.options, this.lan.select +' '+ this.product.attributes[i].name +' '+ this.lan.option);
                return false;
            }
        }
        return true;
    }
    setVariations2() {
        var doAdd = true;
        if (this.product.type == 'variable' && this.product.variationOptions != null) {
          for (var i = 0; i < this.product.variationOptions.length; i++) {
            if (this.product.variationOptions[i].selected != null) {
              this.options['variation[attribute_' + this.product.variationOptions[i].attribute +
                  ']'] = this.product.variationOptions[i].selected;
            } else if (this.product.variationOptions[i].selected == null && this.product.variationOptions[i].options.length != 0) {
              this.presentAlert(this.lan.options, this.lan.select +' '+ this.product.variationOptions[i].name);
              doAdd = false;
              break;
            } else if (this.product.variationOptions[i].selected == null && this.product.variationOptions[i].options.length == 0) {
              this.product.stock_status = 'outofstock';
              doAdd = false;
              break;
            }
          }
          if (this.product.variation_id) {
            this.options['variation_id'] = this.product.variation_id;
          }
        }
        return doAdd;
    }
    chooseVariation2(index, value) {
        this.product.variationOptions[index].selected = value;
        this.product.stock_status = 'instock';
        if (this.product.variationOptions.every((option) => option.selected != null)) {
            var selectedOptions = [];
            var matchedOptions = [];
            for (var i = 0; i < this.product.variationOptions.length; i++) {
                selectedOptions.push(this.product.variationOptions[i].selected);
            }
            for (var i = 0; i < this.product.availableVariations.length; i++) {
                matchedOptions = [];
                for (var j = 0; j < this.product.availableVariations[i].option.length; j++) {
                  if (selectedOptions.includes(this.product.availableVariations[i].option[j].value) || this.product.availableVariations[i].option[j].value == '') {
                    matchedOptions.push(this.product.availableVariations[i].option[j].value);
                  }
                }
                if (matchedOptions.length == selectedOptions.length) {
                    this.product.variation_id = this.product.availableVariations[i].variation_id;
                    this.product.price = this.product.availableVariations[i].display_price;
                    this.product.regular_price = this.product.availableVariations[i].display_regular_price;
                    this.product.formated_price = this.product.availableVariations[i].formated_price;
                    this.product.formated_sales_price = this.product.availableVariations[i].formated_sales_price;
                    if (this.product.availableVariations[i].display_regular_price != this.product.availableVariations[i].display_price)
                        this.product.sale_price = this.product.availableVariations[i].display_price;
                    else
                        this.product.sale_price = null;
                    if (!this.product.availableVariations[i].is_in_stock) {
                        this.product.stock_status = 'outofstock';
                    }
                    
                    break;
                }
              }
              if (matchedOptions.length != selectedOptions.length) {
                this.product.stock_status = 'outofstock';
              }
        }
    }
    chooseVariation(att, value) {
        this.product.attributes.forEach(item => {
            item.selected = undefined;
        })
        this.product.attributes.forEach(item => {
            if (item.name == att.name) {
                item.selected = value;
            }
        })
        if (this.usedVariationAttributes.every(a => a.selected !== undefined))
        this.variations.forEach(variation => {
            var test = new Array(this.usedVariationAttributes.length);
            test.fill(false);
            this.usedVariationAttributes.forEach(attribute => {
                if (variation.attributes.length == 0) {
                    this.variationId = variation.id;
                    this.product.stock_status = variation.stock_status;
                    this.product.price = variation.price;
                    this.product.sale_price = variation.sale_price;
                    this.product.regular_price = variation.regular_price;
                    this.product.manage_stock = variation.manage_stock;
                    this.product.stock_quantity = variation.stock_quantity;
                    //this.product.images[0] = variation.image; /* Uncomment this if you want to use variation images */
                } else {
                    variation.attributes.forEach((item, index) => {
                        if (item.name == attribute.name && item.option == attribute.selected) {
                            test[index] = true;
                        }
                    })
                    if (test.every(v => v == true)) {
                        this.variationId = variation.id;
                        this.product.stock_status = variation.stock_status;
                        this.product.price = variation.price;
                        this.product.sale_price = variation.sale_price;
                        this.product.regular_price = variation.regular_price;
                        this.product.manage_stock = variation.manage_stock;
                        this.product.stock_quantity = variation.stock_quantity;
                        //this.product.images[0] = variation.image;  /* Uncomment this if you want to use variation images */
                        test.fill(false);
                    } else if (variation.attributes.length != 1 && variation.attributes.length == this.usedVariationAttributes.length && test.some(v => v == false)) {
                        //this.product.stock_status = 'outofstock';
                        //this.options.variation_id = variation.id;
                    }
                }
            })
        })
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
        this.productData.product = {};
    }
    share(){
        var options = {
            message: "¡Mira esto!",
            subject: this.store.post_title,
            files: ['', ''],
            url: this.store.wordpress_store_locator_website,
            chooserTitle: 'Elige una aplicación'
        }
        
        this.socialSharing.shareWithOptions(options);
    }
    getDetail(vendor) {
        this.vendor.vendor = vendor;
        var pages = this.router.url.split('/');
        this.navCtrl.navigateForward('/tabs/' + pages[2] + '/vendor-products');
    }
    buyExternalProduct(id){
        var options = "location=no,hidden=yes,toolbar=no,hidespinner=yes";
        let browser = this.iab.create(this.product.external_url, '_blank', options);
        browser.show();
    }
    setGroupedProducts(){
        if(this.product.type == 'grouped') {
            this.options['add-to-cart'] = this.product.id;
            this.groupedProducts.forEach(item => {
                if(item.selected){
                    this.options['quantity['+ item.id +']'] = item.selected;
                }
            })
            return true;

        } else return true;
    }

    /* PRODUCT ADDONS */
    getAddons(){
        if(this.product.meta_data){
            for(let item in this.product.meta_data){
                if(this.product.meta_data[item].key == '_product_addons' && this.product.meta_data[item].value.length){
                    this.addonsList.push(...this.product.meta_data[item].value)           
                }
            }
        }
        this.getGlobalAddons()
    }
    getGlobalAddons(){
        this.api.getAddonsList('product-add-ons').then(res => {
            this.handleAddonResults(res);
        });
    }
    handleAddonResults(results){
        if(results && results.length)
        results.forEach(item => {
            this.addonsList.push(...item.fields)
        });
    }
    selectAdons() {
        this.options = {};
        let valid = this.validateform();
        if(valid) {
            this.addonsList.forEach((value, i) => {
                value.selectedName = value.name.toLowerCase();
                value.selectedName = value.selectedName.split(' ').join('-');
                value.selectedName = value.selectedName.split('.').join('');
                value.selectedName = value.selectedName.replace(':','');
                    value.options.forEach((option, j) => {
                        option.selectedLabel = option.label.toLowerCase();
                        option.selectedLabel = option.selectedLabel.split(' ').join('-');
                        option.selectedLabel = option.selectedLabel.split('.').join('');
                        option.selectedLabel = option.selectedLabel.replace(':','');
                        if (value.selected instanceof Array) {
                            if (value.selected.includes(option.label)) {
                                this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i + '[' + j + ']' ] = option.selectedLabel;
                            }
                        }
                        else if (option.label == value.selected && value.type == 'select') {
                            this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i ] = option.selectedLabel + '-' + (j + 1);
                        }
                        else if (option.label == value.selected && value.type == 'radiobutton') {
                            this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i + '[' + j + ']' ] = option.selectedLabel;
                        }
                        else if (value.type === 'custom_textarea' && option.input && option.input !== '') {
                            this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i + '[' + option.selectedLabel + ']' ] = option.input;
                        }
                    });
                if(value.type == 'custom_text'){
                    let label = value.name;
                    label = label.toLowerCase();
                    label = label.split(' ').join('-');
                    label = label.split('.').join('');
                    label = label.replace(':','');
                    this.options['addon-' + this.product.id + '-' + label + '-' + i ] = value.input;
                }    
            });
        }
        return valid;
    }
    validateform(){
        if(this.addonsList){
             for(let addon in this.addonsList){
                for(let item in this.addonsList[addon].fields){
                    if(this.addonsList[addon].fields[item].required == 1 && this.addonsList[addon].fields[item].selected == ''){
                        this.presentAlert(this.lan.oops, this.lan.PleaseSelect +' '+ this.addonsList[addon].fields[item].name);
                        return false;
                    }
                }
                if(this.addonsList[addon].type == 'custom_text'){
                    if(this.addonsList[addon].required == 1 && (!this.addonsList[addon].input || this.addonsList[addon].input == '')){
                        this.presentAlert(this.lan.oops, this.lan.PleaseSelect +' '+ this.addonsList[addon].name);
                        return false;
                    }
                }  
            }
            return true;
        }
        return true;
    }
    /* PRODUCT ADDONS */
}