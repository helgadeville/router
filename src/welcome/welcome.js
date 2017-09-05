import {inject} from 'aurelia-framework'
import {Router} from 'aurelia-router'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {Overlay} from 'overlay/overlay'

@inject(Router, FormEncoder, Dialogs, Overlay)
export class Welcome {

    skip_poll = false;
    
    poll_freq = 1000;
    
    constructor(router, FEC, dialogs, overlay) {
        this.router = router;
        this.FEC = FEC;
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
        return this.FEC.get('cgi-bin/welcome.json')
            .then(response => {
                this.system = response.content;
                if (this.system.internet !== this.previousInternet || this.system.VPN !== this.previousVPN) {
                    this.previousInternet = this.system.internet;
                    this.previousVPN = this.system.VPN;
                    if (this.system.internet === 'online') {
                        this.publicIp();
                    } else {
                        this.public = null;
                    }
                }
            }).catch(error => {
                console.log('Error getting status');
            });
    }
    
    wifi($event, arg) {
        var dev = $event.currentTarget.name;
        var me = this;
        let dlg = 
            me.dialogs.question('Are you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled && result.output === 'yes') {
                me.skip_poll = true;
                let data = {
                    device: dev,
                    disabled: arg ? '0' : '1'
                };
                me.FEC.submit('cgi-bin/set_radio.json', data)
                .then(response => {
                    me.overlay.open('Network is reloading', true);
                    me.v = 0;
                    me.ival = window.setInterval(function() {
                        if (++me.v <= 100) {
                            me.overlay.setPercent(me.v);
                        } else {
                            window.clearInterval(me.ival);
                            me.overlay.close();
                            console.log('reload');
                            me.activate();
                        }
                    }, 60);
                }).catch(error => {
                    me.skip_poll = false;
                    console.log('Error setting radio device');
                    me.dialogs.error('Error during operation.');
                });
            }
        });
    }
    
    vpn(arg) {
        let dlg = 
            this.dialogs.question('Are you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled && result.output === 'yes') {
                this.skip_poll = true;
                this.FEC.get('cgi-bin/vpntoggle.json')
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
                this.FEC.get('cgi-bin/vpnrestart.json')
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
    
    workmode() {
        this.router.navigate('/workmode');
    }
    
    publicIp() {
        var me = this;
        me.FEC.get('cgi-bin/get_public_address.json')
        .then(response => {
            me.public = response.content;
        }).catch(error => {
            console.log('Error getting status');
        });
    }
    
}

