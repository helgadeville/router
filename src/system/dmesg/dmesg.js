import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Overlay} from 'overlay/overlay'
@inject(HttpClient,Overlay)

export class DMesg {

    constructor(http, overlay) {
        this.http = http;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        this.http.get('cgi-bin/dmesg.text')
        .then(response => {
            this.overlay.close();
            this.logread = response.content;
        }).catch(error => {
            this.overlay.close();
            console.log('Error getting dmesg');
        });    
    }
}