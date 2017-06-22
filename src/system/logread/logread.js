import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
@inject(HttpClient)

export class LogRead {
    
    constructor(http) {
        this.http = http;
    }
    
    activate() {
        this.http.get('cgi-bin/logread.json')
        .then(response => {
            this.logread = response.content.logread;
        }).catch(error => {
            console.log('Error getting logread');
        });    
    }
    
}