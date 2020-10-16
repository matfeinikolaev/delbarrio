import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class Data {
	categories: any = [];
	mainCategories: any = [];
	blocks: any = [];
	cart: any = {};
	count: number = 0;
	cartItem: any;
	wishlistId: any = [];
  freaturedProducts: any = [];
  onsaleProducts: any = [];
  products: any = [];
  cartNonce: any = '';
  storesNearby: any = [];
  allStores: any = [];
  messages: any;
  store: any;
  storeCategory: any;
  storeCategories: any = [];
  onesignal_ids: any;
  onesignal_data: any;
	constructor() {
    console.log(this);
  }

	updateCart(cart_contents) {
    console.log(cart_contents);
    this.cartItem = cart_contents;
    this.cart = [];
    this.count = 0;
    for (let item in cart_contents) {
      if(cart_contents[item].variation_id && cart_contents[item].variation_id != 0)
      this.cart[cart_contents[item].variation_id] = parseInt(cart_contents[item].quantity);
      else this.cart[cart_contents[item].product_id] = parseInt(cart_contents[item].quantity);
      this.count += parseInt(cart_contents[item].quantity);
    }
    console.log(this.cart);
  }
}
