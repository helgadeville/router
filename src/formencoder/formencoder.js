import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

@inject(HttpClient)

export class FormEncoder {
    
    debug = false;

    constructor(http) {
        this.http = http;
    }
    
    encode(data) {
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;
        for(name in data) {
          urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
        return urlEncodedData;
    }
    
    _send(rq, mustHaveStatus) {
        return new Promise((resolve, reject) => {
            rq.send().then((response) => {
                if (response) {
                    if (response.responseType === 'json') {
                        if (response.content.status && response.content.message) {
                            if (response.content.status === '0') {
                                resolve(response);
                            } else {
                                reject(response.content.status + '/' + response.content.message);
                            }
                        } else
                        if (mustHaveStatus) {
                            reject('Invalid response from device:\n' + JSON.stringify(response));
                        } else {
                            resolve(response);
                        }
                    } else {
                        resolve(response);
                    }
                } else {
                    resolve();
                }
            }, (error) => {
                reject(error.statusCode + '/' + error.statusText + '\n' + error.response);
            });
        });
    }
    
    submit(url, data, responseType) {
        let enc = this.encode(data);
        return this.post(url, enc, 'application/x-www-form-urlencoded', responseType);
    }
    
    get(url, responseType) {
        let rq = this.http.createRequest(url);
        rq.asGet();
        rq.withParams({ _t: new Date().getTime() });
        if (responseType) {
            rq.withResponseType(responseType);
        }
        return this._send(rq);
    }
    
    post(url, data, contentType, responseType) {
        let rq = this.http.createRequest(url);
        if (!this.debug) {
            if (contentType) {
                rq.withHeader('Content-Type', contentType);
            }
            rq.asPost();
            rq.withContent(data);
        } else {
            rq.asGet();
            rq.withParams({ _t: new Date().getTime() });
            console.log('POST->GET: ' + url);
            console.log(data);
        }
        if (responseType) {
            rq.withResponseType(responseType);
        }
        return this._send(rq, true);
    }
    
}