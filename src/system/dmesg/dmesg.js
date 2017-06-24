import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
@inject(HttpClient)

export class DMesg {

    constructor(http) {
        this.http = http;
    }
    
    activate() {
        this.http.get('cgi-bin/dmesg.text')
        .then(response => {
            this.logread = response.content;
        }).catch(error => {
            console.log('Error getting dmesg');
        });    
    }
}