import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Dialogs,Overlay)

export class WorkMode {
    
    heading = 'Internet Source';
    
    constructor(http, MD5VC, FEC, dialogs, overlay) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_work_mode.json')
            .then(response => {
                this.overlay.close();
                this.protos = [ 'do not change', 'dhcp', 'static' ];
                this.selection = response.content.selected;
                this.wans = response.content.wired;
                this.radios = response.content.wireless;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router work mode');
            });
    }
    
    submit() {
        let dlg = this.dialogService.warning('You are about to change router work mode.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // TODO
                let data = {
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_work_mode.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router work mode set');
                            // TODO
                        } else {
                            console.log('Error setting router work mode');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router work mode');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}