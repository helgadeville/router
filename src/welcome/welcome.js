import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
@inject(HttpClient)

export class Welcome {

    poll_freq = 1000;
    
    constructor(http) {
        this.http = http;
    }
    
    activate() {
        this.activate_poll();
    }
    
    deactivate() {
        this.deactivate_poll();
    }
    
    activate_poll() {
        var me = this;
        this.deactivate_poll();
        var timer = function() {
            me.poll_status();
        }
        this.interval = window.setInterval(timer, this.poll_freq);
    }

    deactivate_poll() {
        if (this.interval) {
            window.clearInterval(this.interval);
            delete this.interval;
        }
    }
    
    poll_status() {
        return this.http.get('cgi-bin/router_data.json')
            .then(response => {
                this.name = response.content.name;
                this.date = response.content.date;
            }).catch(error => {
                console.log('Error getting status');
            });
    }
    
}

