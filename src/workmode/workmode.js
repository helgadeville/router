import {inject} from 'aurelia-framework'
import {HttpClient} from 'aurelia-http-client'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {DialogService} from 'aurelia-dialog';
import {Overlay} from 'overlay/overlay'
import {Scan} from 'modal/Scan'

@inject(HttpClient,FormEncoder,DialogService,Dialogs,Overlay)
export class WorkMode {
    
    heading = 'Internet Source';
    
    constructor(http, FEC, dialogService, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogService;
        this.dialogs = dialogs;
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
                    type: 'radio',
                    description: 'TBD',
                    src: me.radios[i],
                    disabled: me.radios[i].disabled,
                    enabled: !me.radios[i].disabled
                });
                if (me.radios[i].ifname === me.selection) {
                    this.source = me.radios[i];
                }
            }
            this.devices = devices;
            this.encryptions = [{
                    id : 'open',
                    name : 'Open (no encryption)'
                }, {
                    id : 'wep',
                    name : 'WEP'
                }, {
                    id : 'psk2',
                    name : 'WPA'
                }, {
                    id : 'psk2',
                    name : 'WPA2'
                }
            ];
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
    
    scan() {
        let data = {
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/scan.text', data)
            .then(response => {
                this.overlay.close();
                // response.response contains text
                var aps = [];
                var lines = response.response.split('\n');
                var current = null;
                for(var i = 0 ; i < lines.length ; i++) {
                    var line = lines[i];
                    // MAC: ESSID: Mode: Channel: Signal: Quality: Encryption:
                    var macIndex = line.indexOf('MAC:');
                    var essidIndex = line.indexOf('ESSID:');
                    var modeIndex = line.indexOf('Mode:');
                    var channelIndex = line.indexOf('Channel:');
                    var signalIndex = line.indexOf('Signal:');
                    var qualityIndex = line.indexOf('Quality:');
                    var encryptionIndex = line.indexOf('Encryption:');
                    if (macIndex >= 0) {
                        // found mac
                        if (current) {
                            aps.push(current);
                        }
                        current = {
                            mac: line.substring(macIndex + 5).trim()
                        };
                    }
                    if (essidIndex >= 0) {
                        current.ssid = line.substring(essidIndex + 7).trim();
                        if (current.ssid.startsWith('"') && current.ssid.endsWith('"')) {
                            current.ssid = current.ssid.substring(1, current.ssid.length - 1);
                        }
                    }
                    // both mode and channel
                    if (modeIndex >= 0 && channelIndex >= 0) {
                        if (channelIndex > modeIndex) {
                            current.mode = line.substring(modeIndex + 6, channelIndex - 1).trim();
                            current.channel = line.substring(channelIndex + 9).trim();
                        } else {
                            current.channel = line.substring(channelIndex + 9, modeIndex - 1).trim();
                            current.mode = line.substring(modeIndex + 6).trim();
                        }
                    } else {
                        if (modeIndex >= 0) {
                            current.mode = line.substring(modeIndex + 6).trim();
                        }
                        if (channelIndex >= 0) {
                            current.channel = line.substring(channelIndex + 9).trim();
                        }
                    }
                    // both signal and quality
                    if (signalIndex >= 0 && qualityIndex >= 0) {
                        if (qualityIndex > signalIndex) {
                            current.signal = line.substring(signalIndex + 6, qualityIndex - 1).trim();
                            current.quality = line.substring(qualityIndex + 9).trim();
                        } else {
                            current.quality = line.substring(qualityIndex + 9, signalIndex - 1).trim();
                            current.signal = line.substring(signalIndex + 6).trim();
                        }
                    } else {
                        if (modeIndex >= 0) {
                            current.signal = line.substring(signalIndex + 6).trim();
                        }
                        if (channelIndex >= 0) {
                            current.quality = line.substring(qualityIndex + 9).trim();
                        }
                    }
                    // encryption
                    if (encryptionIndex >= 0) {
                        current.encryption = line.substring(encryptionIndex + 12).trim();
                    }
                }
                if (current) {
                    aps.push(current);
                }
                let dlg = this.dialogService.open( {
                    viewModel: Scan, 
                    model: {
                        aps : aps
                    }
                });
                dlg.whenClosed(result => {
                    if (!result.wasCancelled) {
                        // TODO !!!
                        var chosen = result.output;
                    }
                });
            }).catch(error => {
                this.overlay.close();
                console.log('Error scanning AP networks');
                this.dialogs.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
            });
    }
    
    submit() {
        let dlg = this.dialogs.warning('You are about to change router work mode.\nAre you sure ?');
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
                            this.dialogs.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router work mode');
                        this.dialogs.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}