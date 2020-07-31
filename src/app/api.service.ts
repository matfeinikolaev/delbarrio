import { Injectable } from '@angular/core';
import { HttpParams } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Config } from './config';
import { HTTP } from '@ionic-native/http/ngx';
import { Headers } from '@angular/http';
import { Platform } from '@ionic/angular';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

var headers = new Headers();
headers.append('Content-Type', 'application/x-www-form-urlencoded');

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  	options: any = {};
  	userLocation: any = { latitude: 0, longitude: 0, address: '', distance: 10 }
	constructor(public platform: Platform, private http: HttpClient, private config: Config, private ionicHttp: HTTP) {
		this.options.withCredentials = true;
		this.options.headers = headers;
	}

	private handleError<T> (operation = 'operation', result?: T) {
	  return (error: any): Observable<T> => {
	    // TODO: send the error to remote logging infrastructure
	    console.error(error); // log to console instead
	    // Let the app keep running by returning an empty result.
	    return of(result as T);
	  };
	}

	getItem(endPoint, filter = {}, path = '') {
		const url = this.config.setUrl('GET', endPoint + '?', filter, path);
		console.log(url);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			return new Promise((resolve, reject) => {
	            this.ionicHttp.get(url, {}, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	console.log(error.error);
				  	//this.presentAlert(JSON.parse(error.error));
				    reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			return new Promise((resolve, reject) => {
	            this.http.get(url).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {

	            	//this.presentAlert(err.error);
	            	reject(err.error);
	            });
	        });
		}
	}

	deleteItem(endPoint, params = {}){
		const url = this.config.setUrl('DELETE', endPoint + '?', params);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			return new Promise((resolve, reject) => {
	            this.ionicHttp.delete(url, {}, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	//this.presentAlert(JSON.parse(error.error));
				    reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			return new Promise((resolve, reject) => {
	            this.http.delete(url).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	//this.presentAlert(err.error);
	            	reject(err.error);
	            });
	        });
		}
	}

	putItem(endPoint, data, params = {}){
		const url = this.config.setUrl('PUT', endPoint + '?', params);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('json');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.put(url, data, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	//this.presentAlert(JSON.parse(error.error));
				    reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			return new Promise((resolve, reject) => {
	            this.http.put(url, data).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	//this.presentAlert(err.error);
	            	reject(err.error);
	            });
	        });
		}
	}

	wcpost(endPoint, data, params = {}){
		const url = this.config.setUrl('POST', endPoint + '?', params);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('json');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.post(url, data, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	//this.presentAlert(JSON.parse(error.error));
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			return new Promise((resolve, reject) => {
	            this.http.post(url, data).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	//this.presentAlert(err.error);
	            	reject(err.error);
	            });
	        });
		}
	}

	postItem(endPoint, data = {}, path = ''){

		const url = this.config.url + path + '/wp-admin/admin-ajax.php?action=mstoreapp-' + endPoint;
		console.log(url);
		var params = new HttpParams();
		data['mstoreapp'] = '1';

		// For Testing only on browser
		/*this.userLocation.latitude = '12.9896';
		this.userLocation.longitude = '77.7127';
		this.userLocation.distance = '10';
		this.userLocation.address = 'Hoodi, Karnataka, India';*/

		if(this.userLocation.latitude && this.userLocation.longitude) {

			// For Dokan Pro and WCFM Location Filter
			if(this.userLocation.latitude && this.userLocation.longitude) {
				data['latitude'] = this.userLocation.latitude;
				data['longitude'] = this.userLocation.longitude;
				data['distance'] = this.userLocation.distance;
			}

			var wcfmparams = new HttpParams();
			wcfmparams = wcfmparams.set('wcfmmp_radius_lat', this.userLocation.latitude);
			wcfmparams = wcfmparams.set('wcfmmp_radius_lng', this.userLocation.longitude);
			wcfmparams = wcfmparams.set('wcfmmp_radius_range', this.userLocation.distance);

			data['wcfmmp_radius_lat'] = this.userLocation.latitude;
			data['wcfmmp_radius_lng'] = this.userLocation.longitude;
			data['wcfmmp_radius_range'] = this.userLocation.distance;
			data['search_data'] = wcfmparams.toString();

		}

		/*return new Promise((resolve, reject) => {
            this.http.post(url, params, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
                resolve(data);
            }, err => {
            	reject(err.error);
            });
        });*/
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			var parameters = {};
			for (var key in data) { if('object' != typeof(data[key])) parameters[key] = data[key]; }
			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('urlencoded');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.post(url, parameters, {})
				  .then(data => {
				  	console.log(JSON.parse(data.data));
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			for (var key in data) { 
				if('object' !== typeof(data[key])) {
					params = params.set(key, data[key]);
				}
			}
			params = params.set('lang', this.config.lang);
			return new Promise((resolve, reject) => {
	            this.http.post(url, params, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
		}
	}

	getStores(data) {
		const url = this.config.url + '/wp-admin/admin-ajax.php?action=get_stores';
		console.log(url);
		var params = new HttpParams();
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			var parameters = {};
			for (var key in data) { if('object' != typeof(data[key])) parameters[key] = data[key]; }
			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('urlencoded');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.post(url, parameters, {})
				  .then(data => {
				  	console.log(JSON.parse(data.data));
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			for (var key in data) { if('object' !== typeof(data[key])) params = params.set(key, data[key]) }
			params = params.set('lang', this.config.lang);
			return new Promise((resolve, reject) => {
	            this.http.post(url, params, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
		}
	}

	updateOrderReview(endPoint, data = {}, path = ''){
		delete data['terms_content'];
		delete data['logout_url'];
		delete data['terms'];
		delete data['terms_url'];
		var params = new HttpParams();
		for (var key in data) { if('object' !== typeof(data[key])) params = params.set(key, data[key]) }
		params = params.set('lang', this.config.lang);
		params = params.set('post_data', params.toString());
		const url = this.config.url + path + '/wp-admin/admin-ajax.php?action=mstoreapp-' + endPoint;
		console.log(url);
		return this.http.post(url, params, this.config.options).pipe(
		    tap(_ => {}),
		    catchError(this.handleError(endPoint))
		);

		/*const url = this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-' + endPoint;
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			for (var key in data) { if('object' === typeof(data[key])) delete data[key] }
			data['lang'] = this.config.lang;

			var params = new HttpParams();
			for (var key in data) { if('object' !== typeof(data[key])) params = params.set(key, data[key]) }
			data['post_data'] = params.toString();

			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('urlencoded');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.post(url, data, {})
				  .then(data => {
				  	console.log(JSON.parse(data.data));
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			var params = new HttpParams();
			for (var key in data) { if('object' !== typeof(data[key])) params = params.set(key, data[key]) }
			params = params.set('lang', this.config.lang);
			params = params.set('post_data', params.toString());
			return new Promise((resolve, reject) => {
	            this.http.post(url, params, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
		}*/
	}

	ajaxCall(endPoint, data = {}, path = ''){
		const url = this.config.url + path + endPoint;
		console.log(url);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			var parameters = {};
			for (var key in data) { if('object' != typeof(data[key])) parameters[key] = data[key]; }
			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('urlencoded');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.post(url, parameters, {})
				  .then(data => {
				  	console.log(JSON.parse(data.data));
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			var params = new HttpParams();
			for (var key in data) { if('object' !== typeof(data[key])) params = params.set(key, data[key]) }
			return new Promise((resolve, reject) => {
	            this.http.post(url, params, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
		}
	}

	getPosts(endPoint){
		const url = this.config.url + endPoint + '&lang=' + this.config.lang;
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			return new Promise((resolve, reject) => {
	            this.ionicHttp.get(url, {}, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			return new Promise((resolve, reject) => {
	            this.http.get(url, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
		}
	}

	getExternalData(url, data = {}){
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			var parameters = {};
			for (var key in data) { if('object' != typeof(data[key])) parameters[key] = data[key]; }
			this.ionicHttp.setHeader(this.options, 'Content-Type', 'application/json; charset=UTF-8');
			this.ionicHttp.setDataSerializer('urlencoded');
			return new Promise((resolve, reject) => {
	            this.ionicHttp.post(url, parameters, {})
				  .then(data => {
				  	console.log(JSON.parse(data.data));
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	reject(JSON.parse(error.error));
			  	});
	        });
		} else {
			var params = new HttpParams();
			for (var key in data) { if('object' !== typeof(data[key])) params = params.set(key, data[key]) }
			return new Promise((resolve, reject) => {
	            this.http.post(url, params, this.config.options).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
		}
	}

	getAddonsList(endPoint, filter = {}){
		const url = this.config.setUrl('GET', '/wp-json/wc-product-add-ons/v1/' + endPoint + '?', filter);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			return new Promise(resolve => {
	            this.ionicHttp.get(url, {}, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	resolve(JSON.parse(error.error));
			  	});
	        });
	    }    
	    else {
	    	return new Promise((resolve, reject) => {
	            this.http.get(url).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
	    }
	}

	getWCFM(endPoint, params = {}){
		const url = this.config.setUrl('GET', '/wp-json/wcfmmp/v1/' + endPoint + '?', params);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			return new Promise(resolve => {
	            this.ionicHttp.get(url, {}, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	resolve(JSON.parse(error.error));
			  	});
	        });
	    }    
	    else {
	    	return new Promise((resolve, reject) => {
	            this.http.get(url).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
	    }
	}

	WCMPVendor(endPoint, params = {}){
		const url = this.config.setUrl('GET', '/wp-json/wcmp/v1/' + endPoint + '?', params);
		if (this.platform.is('ios') && this.platform.is('hybrid')) {
			return new Promise(resolve => {
	            this.ionicHttp.get(url, {}, {})
				  .then(data => {
	            	resolve(JSON.parse(data.data));
				  })
				  .catch(error => {
				  	resolve(JSON.parse(error.error));
			  	});
	        });
		} else {
	    	return new Promise((resolve, reject) => {
	            this.http.get(url).pipe(map((res: any) => res)).subscribe(data => {
	                resolve(data);
	            }, err => {
	            	reject(err.error);
	            });
	        });
	    }	
	}
}
