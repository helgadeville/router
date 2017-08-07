import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder, Overlay)
export class LogRead {
    
    constructor(FEC,overlay) {
        this.FEC = FEC;
        this.overlay = overlay;
    }
    
    activate() {
        this.refresh();   
    }
    
    refresh() {
        this.overlay.open();
        this.FEC.get('cgi-bin/logread.text')
        .then(response => {
            this.overlay.close();
            this.logread = response.content;
        }).catch(error => {
            this.overlay.close();
            console.log('Error getting logread');
        });  
    }
    
}