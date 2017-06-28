import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,FormEncoder,Dialogs,Overlay)

export class Configurations {

    heading = 'Configurations';

    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_system_configurations.json')
            .then(response => {
                this.overlay.close();
                this.configs = response.content;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router configurations');
            });
    }
    
}
