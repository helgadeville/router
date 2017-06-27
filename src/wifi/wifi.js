import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
import {UciReader} from 'configreader/ucireader'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Dialogs,Overlay,UciReader)

/**
 * A class that displays WIFI config
 * TODO: rewrite HTML for multiple devices
 */

export class Wireless {
    
    heading = 'Wireless Access Point';
    
    constructor(http, MD5VC, FEC, dialogs, overlay, ucireader) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
        this.creader = ucireader;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_wireless.text')
            .then(response => {
                this.overlay.close();
                var config = this.creader.read(response.response);
                // need to rewrite returned object to array
                var devices = this.decode(config);
                // setup new properties as old ones
                for(var i = 0 ; i < devices.length ; i++) {
                    var device = devices[i];
                    device.enabled = !device.disabled;
                    for(var j = 0 ; j < device.interfaces.length ; j++) {
                        var wifi = device.interfaces[j];
                        wifi.devicename = device['#'];
                        wifi.enabled = !wifi.disabled;
                    }
                }
                // bind
                this.devices = devices;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router wireless');
            });
    }
    
    decode(config) {
        if (!config) return;
        var devices = config['wifi-device'];
        var ifaces = config['wifi-iface'];
        if (!devices || !ifaces) {
            console.log('Error in configuration');
            return;
        }
        for(var i = 0 ; i < devices.length ; i++) {
            var device = devices[i];
            device.interfaces = [];
            device.channels = device.channels.split(',');
            device.channels.unshift('auto');
            device.channels.unshift('do not change');
            for(var j = 0 ; j < ifaces.length ; j++) {
                var iface = ifaces[j];
                if (device['#'] == iface.device) {
                    device.interfaces.push(iface);
                }
            }
        }
        return devices;
    }
    
    radio($event) {
        var name = $event.currentTarget.name;
        if (!name) {
            console.log('Error: no device name detected');
            return;
        }
        var device = null;
        for(var i = 0 ; i < this.devices.length ; i++) {
            if (this.devices[i]['#'] == name) {
                device = this.devices[i];
                break;
            }
        }
        if (!device) {
            console.log('Error: no device detected.');
            return;
        }
        let dlg = this.dialogService.warning('You are about to change device mode.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    device: device['#'],
                    disabled: device.enabled ? '0' : '1'
                };
                if (device.newChannel && device.newChannel != 'do not change') {
                    data.newChannel = device.newChannel;
                }
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_radio.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router wireless set');
                            var me = this;
                            this.overlay.open('Network is reloading', true);
                            this.v = 0;
                            this.ival = window.setInterval(function() {
                                if (++me.v <= 100) {
                                    me.overlay.setPercent(me.v);
                                } else {
                                    window.clearInterval(me.ival);
                                    me.overlay.close();
                                    console.log('reload');
                                    window.location.reload(true);
                                }
                            }, 60);
                        } else {
                            console.log('Error setting router radio');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router radio');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
    submit($event) {
        var name = $event.currentTarget.name;
        if (!name) {
            console.log('Error: no wifi name detected');
            return;
        }
        var wifi = null;
        for(var i = 0 ; i < this.devices.length ; i++) {
            for(var j = 0 ; j < this.devices[i].interfaces.length && !wifi ; j++) {
                if (this.devices[i].interfaces[j]['#'] == name) {
                    wifi = this.devices[i].interfaces[j];
                    break;
                }
            }
        }
        if (!wifi) {
            console.log('Error: no wifi detected.');
            return;
        }
        let dlg = this.dialogService.warning('You are about to change wireless mode.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    device: wifi.devicename,
                    iface: wifi['#'],
                    disabled: wifi.enabled ? '0' : '1'
                };
                if (wifi.newSsid) {
                    data.ssid = wifi.newSsid;
                }
                if (wifi.newKey) {
                    data.key = wifi.newKey;
                }
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_wireless.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router wireless set');
                            var me = this;
                            this.overlay.open('Network is reloading', true);
                            this.v = 0;
                            this.ival = window.setInterval(function() {
                                if (++me.v <= 100) {
                                    me.overlay.setPercent(me.v);
                                } else {
                                    window.clearInterval(me.ival);
                                    me.overlay.close();
                                    console.log('reload');
                                    window.location.reload(true);
                                }
                            }, 60);
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