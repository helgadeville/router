import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
@inject(HttpClient)

export class DMesg {

    constructor(http) {
        this.http = http;
    }
    
    activate() {
        this.http.get('cgi-bin/dmesg.json')
        .then(response => {
            this.logread = response.content.dmesg;
        }).catch(error => {
            console.log('Error getting dmesg');
        });    
    }
}