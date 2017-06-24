import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Dialogs,Overlay)

export class Wireless {
    
    heading = 'Wireless Access Setup';
    
    constructor(http, MD5VC, FEC, dialogs, overlay) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_wireless.json')
            .then(response => {
                this.overlay.close();
                // TODO
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router wireless');
            });
    }
    
    submit() {
        let dlg = this.dialogService.warning('You are about to change wireless mode.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // TODO
                let data = {
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_wireless.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router wireless set');
                            // TODO
                        } else {
                            console.log('Error setting router wireless');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router wireless');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}