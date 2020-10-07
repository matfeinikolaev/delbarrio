import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
import { md5 } from './md5';
import { ReviewPage } from '../review/review.page';
import { AlertController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Vendor } from '../data/vendor';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { HttpParams } from "@angular/common/http";
import { Config } from '../config';
import { LoginPage } from '../account/login/login.page';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
@Component({
    selector: 'app-product',
    templateUrl: 'product.page.html',
    styleUrls: ['product.page.scss']
})
export class ProductPage {
    product: any;
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
    form: any;
    formRegister: any;
    openFeedbackForm: any = false;
    errorMessage:any;
    unavailableProduct:any;
    store: any;
    incomeMessages: any;
    constructor(private fb: FormBuilder ,private config: Config, public translate: TranslateService, public toastController: ToastController, private socialSharing: SocialSharing, public modalCtrl: ModalController, public api: ApiService, public data: Data, public productData: Product, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public alertController: AlertController, public route: ActivatedRoute, public vendor: Vendor, public iab: InAppBrowser) {
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
    getProduct() {
        this.api.postItem('product', {'product_id': this.id}, this.productData.product.path).then(res => {
            this.product = res;
            this.handleProduct();
        }, err => {
            console.log(err);
        });
    }
    ngOnInit() {
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
        this.product = this.productData.product;
        this.id = this.route.snapshot.paramMap.get('id');
        console.log(this);
        if (this.product.id) this.handleProduct();
         else 
         this.getProduct();
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
        if(this.settings.settings.switchAddons ===  1 || this.product.add_ons)
        this.getAddons();

        if( this.product.attributes ) {
            this.usedVariationAttributes = this.product.attributes.filter(function(attribute) {
                return attribute.variation == true
            });
        }
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
        this.api.postItem('product_details', filter, this.product.path).then(res => {
            this.relatedProducts = res;
        }, err => {});
    }
    getReviews() {
        this.api.postItem('product_reviews', {'product_id': this.product.id}, this.product.path).then(res => {
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
            this.navCtrl.navigateForward("tabs/home/store/" + this.data.store.ID + "/messaging/" + this.settings.customer.id);
        }
        else this.login();
    }
    async login() {
        const modal = await this.modalCtrl.create({
            component: LoginPage,
            componentProps: {
            path: 'tabs/home/product/'+this.id,
            },
            swipeToClose: true,
            //presentingElement: this.routerOutlet.nativeEl,
        });
        modal.present();
        const { data } = await modal.onWillDismiss();

        if(this.settings.customer.id) {
            this.navCtrl.navigateForward('/tabs/home/product/' + this.id);
        }
    }
    openCart() {
        this.navCtrl.navigateForward("tabs/cart/" + this.data.store.ID);
    }
    async addToCart(product) {
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        }
        else if (this.selectAdons() && this.setVariations2() && this.setGroupedProducts()) {
            console.log(this.options);
            this.options.product_id = product.id;
            this.options.quantity = this.quantity;
            this.disableButton = true;
            await this.api.postItem('add_to_cart', this.options, this.product.path).then(res => {
                this.results = res;
                if(this.results.error) {
                    this.presentToast(this.results.notice);
                } else { 
                    this.cart = res;
                    this.presentToast(this.lan.addToCart);
                    this.data.updateCart(this.cart.cart);
                }
                this.disableButton = false;
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
          await this.api.postItem('update-cart-item-qty', params, this.product.path).then(res => {
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
        await this.api.postItem('update-cart-item-qty', params, this.product.path).then(res => {
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
          position: 'top',
          cssClass: "toast-pop-up",
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
        if (this.product.variationOptions[index].selected == value) {
            this.product.variationOptions[index].selected = null;
        }
        else {
            this.product.variationOptions[index].selected = value;
        }
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
            subject: this.product.name,
            files: ['', ''],
            url: this.product.permalink,
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

    backToStore() {
        this.navCtrl.navigateBack('tabs/home/store/' + this.data.store.ID);
    }

    /* PRODUCT ADDONS */
    getAddons(){
        if(this.product.meta_data && !this.product.add_ons){
            for(let item in this.product.meta_data){
                if(this.product.meta_data[item].key == '_product_addons' && this.product.meta_data[item].value.length){
                    this.addonsList.push(...this.product.meta_data[item].value)           
                }
            }
            this.getGlobalAddons();
        } else if (this.product.add_ons) {
            this.addonsList = this.product.add_ons;
            for (let i in this.addonsList) {
                this.addonsList[i].selected = false;
            }
        }
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
                value.selectedName = value.name ? value.name : value.label;
                if (value.options != false) {                    
                    value.options.forEach((option, j) => {
                        option.selectedLabel = option.label;
                        // option.selectedLabel = option.selectedLabel.split(' ').join('-');
                        // option.selectedLabel = option.selectedLabel.split('.').join('');
                        // option.selectedLabel = option.selectedLabel.replace(':','');
                        if (value.selected instanceof Array) {
                            if (value.selected.includes(option.label)) {
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[value]'] = option.selectedLabel;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[name]'] = value.selectedName;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price]'] = Number.parseFloat(option.price);
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price_original]'] = Number.parseFloat(option.price);
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[original_value]'] = [];
                                for (let k=0; k<j; k++) {
                                    this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[original_value]'][k] = 'ywapo_value_' + value.id;
                                }
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[original_index]'] = j;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price_type]'] = option.type;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[type_id]'] = value.id;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[sold_individually]'] = value.sold_individually;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[calculate_quantity_sum]'] = value.calculate_quantity_sum;
                                this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[add_on_type]'] = value.type;
                            }
                        }
                        else if (option.label == value.selected && value.type == 'select') {
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[value]'] = option.selectedLabel;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[name]'] = value.selectedName;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price]'] = Number.parseFloat(option.price);
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price_type]'] = option.type;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[type_id]'] = value.id;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[sold_individually]'] = value.sold_individually;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[calculate_quantity_sum]'] = value.calculate_quantity_sum;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[add_on_type]'] = value.type;
                        }
                        else if (option.label == value.selected && value.type == 'radiobutton') {
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[value]'] = option.selectedLabel;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[name]'] = value.selectedName;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price]'] = Number.parseFloat(option.price);
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price_type]'] = option.type;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[type_id]'] = value.id;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[sold_individually]'] = value.sold_individually;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[calculate_quantity_sum]'] = value.calculate_quantity_sum;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[add_on_type]'] = value.type;
                        }
                        else if ( ( value.type === 'custom_textarea' || value.type == "text" ) && value.input && value.input !== '') {
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[value]'] = value.input;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[price_type]'] = option.type;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[type_id]'] = value.id;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[sold_individually]'] = value.sold_individually;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[calculate_quantity_sum]'] = value.calculate_quantity_sum;
                            this.options['addon-' + this.product.id + '[' + i + ']' + '[' + j + ']' + '[add_on_type]'] = value.type;
                        }
                    });
                } 
            });
        }
        return valid;
    }
    checkTextValue() {
        
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