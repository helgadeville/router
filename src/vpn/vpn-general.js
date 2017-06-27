import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
@inject(HttpClient, Dialogs, Overlay)

export class VpnGeneral {
    
    heading = 'General Information';
    
    skip_poll = false;
    
    poll_freq = 1000;
    
    constructor(http, dialogs, overlay) {
        this.http = http;
        this.dialogs = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.poll_status();
        this.activate_poll();
    }
    
    deactivate() {
        this.deactivate_poll();
    }
    
    activate_poll() {
        var me = this;
        this.deactivate_poll();
        var timer = function() {
            me.poll_status();
        }
        this.interval = window.setInterval(timer, this.poll_freq);
    }

    deactivate_poll() {
        if (this.interval) {
            window.clearInterval(this.interval);
            delete this.interval;
        }
    }
    
    poll_status() {
        if (this.skip_poll) {
            return;
        }
        return this.http.get('cgi-bin/vpnstatus.text')
            .then(response => {
                var txt = response.content;
                if (txt) {
                    // first line is status, next are logs
                    this.VPN = txt.split('\n')[0];
                    this.log = txt.substring(this.VPN.length + 1);
                }
            }).catch(error => {
                console.log('Error getting status');
            });
    }
    
    vpn(arg) {
        let dlg = 
            this.dialogs.question('Are you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled && result.output === 'yes') {
                this.skip_poll = true;
                this.http.get('cgi-bin/vpntoggle.json')
                .then(response => {
                    // do nothing
                    this.skip_poll = false;
                }).catch(error => {
                    this.skip_poll = false;
                    console.log('Error toggling vpn');
                    this.dialogs.error('Error during operation.');
                });
            }
        });
    }
    
    vpnrestart() {
        let dlg = 
            this.dialogs.question('Are you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled && result.output === 'yes') {
                this.skip_poll = true;
                this.http.get('cgi-bin/vpnrestart.json')
                .then(response => {
                    // do nothing
                    this.skip_poll = false;
                }).catch(error => {
                    this.skip_poll = false;
                    console.log('Error restarting vpn');
                    this.dialogs.error('Error during operation.');
                });
            }
        });
    }
    
}