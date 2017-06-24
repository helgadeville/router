import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,FormEncoder,Dialogs,Overlay)

export class LAN {
    
    heading = 'LAN Address Change Utility';
    
    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_lan_ip.json')
            .then(response => {
                this.overlay.close();
                this.oldIp = response.content.ip;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router LAN IP');
            });
    }
    
    check(ip) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
            return (true);
        }
        return false;
    }
    
    submit() {
        let dlg = 
            this.dialogService.warning('You are about to change router IP address.\nAfter this, the router must restart network.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    'ip': this.newIp
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_lan_ip.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router LAN set');
                            this.oldIp = response.newIp;
                        } else {
                            console.log('Error setting router LAN');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router LAN');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}