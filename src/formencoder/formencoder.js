import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

@inject(HttpClient)

export class FormEncoder {

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
    
    submit(url, data) {
        let rq = this.http.createRequest(url);
        let enc = this.encode(data);
        rq.withHeader('Content-Type', 'application/x-www-form-urlencoded');
        rq.asPost();
        rq.withContent(enc);
        return rq.send();
    }
    
}