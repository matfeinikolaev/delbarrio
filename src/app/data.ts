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

	constructor() {}

	updateCart(cart_contents) {
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

