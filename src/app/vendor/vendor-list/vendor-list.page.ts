import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { Vendor } from './../../data/vendor';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.page.html',
  styleUrls: ['./vendor-list.page.scss'],
})
export class VendorListPage implements OnInit {
    vendors: any;
    filter: any = {};
    hasMoreItems: boolean = true;
    constructor(public platform: Platform, public api: ApiService, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute, public vendor: Vendor) {
      this.filter.page = 1;
      this.filter.per_page = 30;
      this.filter.wc_vendor = true;
    }
    ngOnInit() {
        this.getVendors();
    }
    async getVendors() {
    this.filter.page = 1;
        await this.api.postItem('vendors', this.filter).then(res => {
            this.vendors = res;
        }, err => {
            console.log(err);
        });
    }
    async getMoreVendors(event) {
        this.filter.page = this.filter.page + 1;
        await this.api.postItem('vendors', this.filter).then((res: any) => {
            this.vendors.push.apply(this.vendors, res);
            event.target.complete();
            if (res.length == 0) this.hasMoreItems = false;
            else event.target.complete();
        }, err => {
            event.target.complete();
        });
    }
    detail(item) {
        this.vendor.vendor = item;
        this.navCtrl.navigateForward('/tabs/vendor/products');
    }
    isClosed(item) {
        if(item.is_close) {
            return true;
        } else {
            return false;
        }   
    }
    distance(item) {
      return this.calcCrow(item.lat, item.lon, this.api.userLocation.latitude, this.api.userLocation.longitude).toFixed(1);
    }
    calcCrow(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = this.toRad(lat2-lat1);
      var dLon = this.toRad(lon2-lon1);
      var rlat1 = this.toRad(lat1);
      var rlat2 = this.toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(rlat1) * Math.cos(rlat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }
    toRad(Value) {
        return Value * Math.PI / 180;
    }
    drivingTime(item) {
      return (this.calcCrow(item.lat, item.lon, this.api.userLocation.latitude, this.api.userLocation.longitude) * 3 + 30).toFixed(0);
    }
}
