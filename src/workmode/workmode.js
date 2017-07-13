import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder';
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,FormEncoder,Dialogs,Overlay)
export class WorkMode {
    
    heading = 'Internet Source';
    
    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        var me = this;
        me.overlay.open();
        me.http.get('cgi-bin/get_work_mode.json')
        .then(response => {
            me.overlay.close();
            me.protos = [ 'do not change', 'dhcp', 'static' ];
            me.selected = response.content.selected;
            me.selection = response.content.selected;
            me.wans = response.content.wired;
            me.radios = response.content.wireless;
            var devices = [];
            for(var i = 0 ; i < me.wans.length ; i++) {
                devices.push({
                    name: me.wans[i].ifname,
                    type: 'wired',
                    description: 'TBD',
                    src: me.wans[i]
                });
                if (me.wans[i].ifname === me.selection) {
                    this.source = me.wans[i];
                }
            }
            for(var i = 0 ; i < me.radios.length ; i++) {
                devices.push({
                    name: me.radios[i].ifname,
                    type: 'radio device',
                    description: 'TBD',
                    src: me.radios[i]
                });
                if (me.radios[i].ifname === me.selection) {
                    this.source = me.radios[i];
                }
            }
            this.devices = devices;
        }).catch(error => {
            me.overlay.close();
            console.log('Error getting router work mode');
        });
    }
    
    clickedDevice($event) {
        var name = $event.currentTarget.model;
        for(var i = 0 ; i < this.devices.length ; i++) {
            if (this.devices[i].name === name) {
                this.source = this.devices[i].src;
            }
        }
        return true;
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