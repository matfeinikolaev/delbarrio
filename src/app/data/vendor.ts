import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class Vendor {
	vendor: any = {};
	product: any;
	store: any;
	constructor(){
		this.product = {};
	    this.product.categories = [];
	    this.product.images = '';
		this.store = {};
	    this.store.categories = [];
	    this.store.images = '';
    }
}