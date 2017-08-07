import {inject} from 'aurelia-framework'
import {computedFrom} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {DialogService} from 'aurelia-dialog'
import {Overlay} from 'overlay/overlay'
import {Scan} from 'modal/scan'
import {Saved} from 'modal/saved'

@inject(FormEncoder,DialogService,Dialogs,Overlay)
export class WorkMode {
    
    heading = 'Internet Source';
    
    constructor(FEC, dialogService, dialogs, overlay) {
        this.FEC = FEC;
        this.dialogService = dialogService;
        this.dialogs = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        var me = this;
        me.overlay.open();
        me.FEC.get('cgi-bin/get_workmode.json')
        .then(response => {
            me.overlay.close();
            me.protos = [ 'do not change', 'dhcp', 'static' ];
            me.selected = response.content.selected;
            me.selection = response.content.selected;
            me.wans = response.content.wired;
            me.radios = response.content.wireless;
            var devices = [];
            for(var i = 0 ; i < me.wans.length ; i++) {
                var cable = me.wans[i];
                var device = {
                    name: cable.ifname,
                    type: 'wired',
                    src: cable
                };
                cable.parent = device;
                devices.push(device);
                if (me.wans[i].ifname === me.selection) {
                    if (!me.wans[i].proto) {
                        me.wans[i].proto = 'dhcp';
                    }
                    this.source = me.wans[i];
                }
            }
            for(var i = 0 ; i < me.radios.length ; i++) {
                var radio = me.radios[i];
                radio.disabled = radio.disabled && radio.disabled === '1' ? true : false;
                var device = {
                    name: radio.ifname,
                    type: 'radio',
                    src: radio,
                    ssid: radio.ssid,
                    encryption: radio.encryption,
                    key: radio.key,
                    disabled: radio.disabled
                };
                radio.parent = device;
                devices.push(device);
                if (me.radios[i].ifname === me.selection) {
                    if (!me.radios[i].proto) {
                        me.radios[i].proto = 'dhcp';
                    }
                    me.source = me.radios[i];
                }
            }
            me.devices = devices;
            me.encryptions = [{
                    id : 'none',
                    name : 'Open (no encryption)'
                }, {
                    id : 'wep',
                    name : 'WEP'
                }, {
                    id : 'psk',
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
    
    saved($event) {
        var name = $event.currentTarget.name;
        let data = {
            device : name
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/get_stations.json', data)
            .then(response => {
                this.overlay.close();
                var stations = response.content;
                if (!stations) {
                    this.dialogs.info('There are no saved stations.');
                    return;
                }
                let dlg = this.dialogService.open( {
                    viewModel: Saved, 
                    model: {
                        aps : stations
                    }
                });
                dlg.whenClosed(result => {
                    if (!result.wasCancelled) {
                        var chosen = result.output;
                        // now setup proper device
                        for(var i = 0 ; i < this.devices.length ; i++) {
                            var dev = this.devices[i];
                            if (dev.name === this.selection) {
                                dev.ssid = chosen.ssid;
                                dev.encryption = chosen.encryption;
                                dev.key = chosen.key;
                                dev.newProto = chosen.proto;
                                dev.newIp = chosen.ipaddr;
                                dev.newMask = chosen.netmask;
                                dev.newMac = chosen.mac;
                                break;
                            }
                        }
                    }
                });
            })
            .catch(error => {
                this.overlay.close();
                console.log('Error retrieving saved stations');
                this.dialogs.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
            });
    }
    
    scan($event) {
        var name = $event.currentTarget.name;
        let data = {
            device : name
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
                            current.signal = line.substring(signalIndex + 8, qualityIndex - 1).trim();
                            current.quality = line.substring(qualityIndex + 9).trim();
                        } else {
                            current.quality = line.substring(qualityIndex + 9, signalIndex - 1).trim();
                            current.signal = line.substring(signalIndex + 8).trim();
                        }
                    } else {
                        if (modeIndex >= 0) {
                            current.signal = line.substring(signalIndex + 8).trim();
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
                        var chosen = result.output;
                        // now setup proper device
                        for(var i = 0 ; i < this.devices.length ; i++) {
                            var dev = this.devices[i];
                            if (dev.name === this.selection) {
                                dev.ssid = chosen.ssid;
                                dev.key = '';
                                var wep = chosen.encryption.indexOf('WEP') >= 0;
                                var wpa = chosen.encryption.indexOf('WPA') >= 0;
                                var wpa2 = chosen.encryption.indexOf('WPA2') >= 0;
                                dev.encryption = wpa2 ? 'psk2' : (wpa ? 'psk' : (wep ? 'wep' : 'none'));
                                break;
                            }
                        }
                    }
                });
            }).catch(error => {
                this.overlay.close();
                console.log('Error scanning AP networks');
                this.dialogs.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
            });
    }
    
    encryptionChanged(how) {
        if (how === 'none') {
            this.source.parent.key = '';
        }
    }
    
    @computedFrom('source.newProto', 'source.newIp', 'source.newMask', 'source.parent.encryption', 'source.parent.key')
    get checkButton() {
        var src = this.source;
        if (!src) {
            return false;
        }
        var regex = new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
        if (src.newProto === 'static') {
            if ((!src.ip && !src.newIp) || (src.newIp && !regex.test(src.newIp))) {
                return false;
            }
            if ((!src.mask && !src.newMask) || (src.newMask && !regex.test(src.newMask))) {
                return false;
            }
        }
        if (src.parent.type === 'radio') {
            if (src.parent.encryption !== 'none' && !src.parent.key) {
                return false;
            }
            if ((src.parent.encryption === 'psk' || src.parent.encryption === 'psk2') && src.parent.key.length < 8) {
                return false;
            }
        }
        return true;
    }
    
    submit() {
        let dlg = this.dialogs.warning('You are about to change router work mode.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    device : this.source.ifname,
                    type : this.source.parent.type,
                    proto : this.source.newProto && this.source.newProto !== 'do not change' ? this.source.newProto
                                 : (this.source.proto ? this.source.proto : 'dhcp')
                };
                if (data.proto === 'static') {
                    data.ipaddr = this.source.newIp ? this.source.newIp : this.source.ip;
                    data.netmask = this.source.newMask ? this.source.newMask : this.source.mask;
                }
                if (this.source.newMac) {
                    data.mac = this.source.newMac;
                }
                if (this.source.parent.type === 'radio') {
                    data.ssid = this.source.parent.ssid;
                    data.encryption = this.source.parent.encryption;
                    if (data.encryption !== 'none') {
                        data.key = this.source.parent.key;
                    }
                }
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_workmode.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router work mode set');
                            var msg = '';
                            var timeout = 0;
                            if (response.content.reboot === 'full') {
                                msg = 'Network is restarting';
                                timeout = 10;
                            } else
                            if (response.content.reboot === 'cable') {
                                msg = 'Network is reloading';
                                timeout = 5;
                            } else
                            if (response.content.reboot === 'wifi') {
                                msg = 'Updating wifi setting';
                                timeout = 5;
                            }
                            var me = this;
                            this.overlay.open(msg, true);
                            this.v = 0;
                            this.ival = window.setInterval(function() {
                                if (++me.v <= timeout) {
                                    me.overlay.setPercent(Math.round(100 * me.v / timeout));
                                } else {
                                    window.clearInterval(me.ival);
                                    me.overlay.close();
                                    console.log('reload');
                                    window.location.href = window.location.origin;
                                }
                            }, 500);
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