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
        return this.http.createRequest(url)
            .withHeader('Content-Type', 'application/x-www-form-urlencoded')
            .asPost()
            .withContent(this.encode(data))
            .send();
    }
    
}