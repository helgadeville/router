import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
import {UciReader} from 'configreader/ucireader'

@inject(HttpClient,FormEncoder,Dialogs,Overlay,UciReader)

export class LAN {
    
    heading = 'LAN Address Change Utility';
    
    constructor(http, FEC, dialogs, overlay, ucireader) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
        this.creader = ucireader;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_lan.text')
            .then(response => {
                this.overlay.close();
                var config = this.creader.read(response.response);
                var lans = config.interface;
                if (lans && config.dhcp) {
                    for(var i = 0 ; i < lans.length ; i++) {
                        var name = lans[i]['#'];
                        for(var j = 0 ; j < config.dhcp.length ; j++) {
                            if (config.dhcp[j].interface === name) {
                                lans[i].dhcp = config.dhcp[j];
                                if (lans[i].dhcp.start && lans[i].dhcp.limit) {
                                    lans[i].dhcp.start = Number(lans[i].dhcp.start);
                                    lans[i].dhcp.stop = lans[i].dhcp.start + Number(lans[i].dhcp.limit);
                                    lans[i].dhcp.newStart = lans[i].dhcp.start;
                                    lans[i].dhcp.newStop = lans[i].dhcp.stop;
                                }
                                break;
                            }
                        }
                    }
                }
                this.lans = lans;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router LAN IP');
            });
    }
    
    check(ip, dStart, dStop) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
            if (dStart && dStop) {
                if (dStart >= dStop || dStart < 1 || dStart > 254 || dStop < 1 || dStop > 254) {
                    return false;
                }
                var lastDot = ip.lastIndexOf('.');
                var part = Number(ip.substring(lastDot + 1));
                return part < dStart || part > dStop;
            }
            return true;
        }
        return false;
    }
    
    submit($event) {
        var dev = $event.currentTarget.name;
        if (!dev) {
            console.log('Error: no lan name detected');
            return;
        }
        var lan = null;
        for(var i = 0 ; i < this.lans.length ; i++) {
            if (this.lans[i]['#'] === dev) {
                lan = this.lans[i];
                break;
            }
        }
        if (!lan) {
            console.log('Error: unknown lan referenced');
            return;
        }
        var newIp = lan.newIpaddr;
        // WARNING: netmask is fixed and we do not touch it
        var newMask = lan.netmask;
        let dlg = 
            this.dialogService.warning('You are about to change router IP address.\nAfter this, the router must restart network.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    lan: lan['#'],
                    ip: newIp,
                    mask: newMask
                };
                if (lan.dhcp) {
                    data.dhcp_start = lan.dhcp.newStart;
                    data.dhcp_limit = lan.dhcp.newStop - lan.dhcp.newStart;
                }
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_lan.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router LAN set');
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
                                    var newURL = window.location.protocol + "//" + newIp + "/" + window.location.hash;
                                    window.location.href = newURL;
                                }
                            }, 100);
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