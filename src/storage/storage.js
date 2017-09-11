import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder, Dialogs, Overlay)
export class Storage {
    
    heading = 'Storage Information';
    
    constructor(FEC, dialogs, overlay) {
        this.FEC = FEC;
        this.dialogs = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.remotesSelected = 0;
        this.overlay.open();
        this.FEC.get('cgi-bin/get_storage.json')
        .then(response => {
            this.overlay.close();
            this.storage = response.content;
        }).catch(error => {
            this.overlay.close();
            console.log('Error getting storage properties');
        });
    }
    
    setStorage(how) {
        this.overlay.open();
        var data = {
                readonly: how,
        };
        this.FEC.submit('cgi-bin/set_storage.json', data)
        .then(response => {
            this.overlay.close();
            this.activate();
        }).catch(error => {
            this.overlay.close();
            console.log('Error setting storage properties');
        });
    }
    
}
