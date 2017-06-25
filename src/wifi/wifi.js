import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
import {ConfigReader} from 'configreader/configreader'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Dialogs,Overlay,ConfigReader)

/**
 * A class that displays WIFI config
 * TODO: rewrite HTML for multiple devices
 */

export class Wireless {
    
    heading = 'Wireless Access Setup';
    
    constructor(http, MD5VC, FEC, dialogs, overlay, configreader) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
        this.creader = configreader;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_wireless.text')
            .then(response => {
                this.overlay.close();
                // TODO
                var config = this.creader.read(response.response);
                // need to rewrite returned object to array
                var wifis = this.decode(config);
                // setup new ssid & enabled property
                for(var i = 0 ; i < wifis.length ; i++) {
                    wifis[i].newSsid = wifis[i].ssid;
                    var dev = wifis[i].device;
                    if (dev && dev.disabled) {
                        dev.enabled = dev.disabled !== '1';
                    }
                }
                // bind
                this.wifis = wifis;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router wireless');
            });
    }
    
    decode(config) {
        if (!config) return;
        var devices = config['wifi-device'];
        var ifaces = config['wifi-iface'];
        var ret = [];
        for(var i = 0 ; i < ifaces.length ; i++) {
            var iface = ifaces[i];
            for(var j = 0 ; j < devices.length ; j++) {
                var dev = devices[j];
                if (dev.name === iface.device) {
                    iface.device = dev;
                    ret.push(iface);
                    break;
                }
            }
        }
        return ret;
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