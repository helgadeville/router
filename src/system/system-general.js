import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'

@inject(FormEncoder)
export class SystemGeneral {
    
    heading = 'System General Information';
    
    poll_freq = 2000;
    
    constructor(FEC) {
        this.FEC = FEC;
    }
    
    activate() {
        this.poll_status();
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
        return this.FEC.get('cgi-bin/system.text')
            .then(response => {
                this.info = response.response;
            }).catch(error => {
                console.log('Error getting status');
            });
    }
    
}
