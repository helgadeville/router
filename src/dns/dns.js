import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {Overlay} from 'overlay/overlay'
import {DnsHelper} from 'dns/dnshelper'

@inject(FormEncoder,Dialogs,Overlay,DnsHelper)
export class Dns {
    
    heading = 'Domain Name Servers';
    
    constructor(FEC, dialogs, overlay, dnshelp) {
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
        this.dnshelper = dnshelp;
    }
    
    activate() {
        var me = this;
        me.overlay.open();
        me.FEC.get('cgi-bin/get_dns.text')
        .then(response => {
            me.overlay.close();
            var dnses = [ 'do not change' ];
            dnses = dnses.concat(me.dnshelper.names);
            var ipsRaw = response.response.split('\n');
            var ips  = [];
            var peer = false;
            if (ipsRaw) {
                for(var i = 0 ; i < ipsRaw.length ; i++) {
                    if (ipsRaw[i]) {
                        if (ipsRaw[i] === 'peer') {
                            peer = true;
                        } else {
                            ips.push(ipsRaw[i]);
                        }
                    }
                }
            }
            var name =me.dnshelper.nameFromIp(ips);
            me.dnses = dnses;
            me.oldPeer = peer;
            me.oldDns = name;
            me.newDns = name ? 'do not change' : dnses[0];
            me.newPeer = peer;
        }).catch(error => {
            me.overlay.close();
            console.log('Error getting DNS');
        });
    }
    
    setDns() {
        let dlg = this.dialogService.warning('You are about to change router DNS setting.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var dnses = this.dnshelper.ipFromName(this.newDns !== 'do not change' ? this.newDns : this.oldDns);
                let data = {};
                if (this.newPeer) {
                    data.peer = true;
                }
                if (dnses[0]) {
                    data.dns1 = dnses[0]
                }
                if (dnses[1]) {
                    data.dns2 = dnses[1];
                }
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_dns.json', data)
                    .then(response => {
                        var me = this;
                        this.overlay.close();
                        console.log('DNS set');
                        this.overlay.open('Network is reloading', true);
                        this.v = 0;
                        this.ival = window.setInterval(function() {
                            if (++me.v <= 100) {
                                me.overlay.setPercent(me.v);
                            } else {
                                window.clearInterval(me.ival);
                                me.overlay.close();
                                me.activate();
                            }
                        }, 200);
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router DNS');
                        this.dialogService.error('Ooops ! Error occured:\n' + error);
                    });
            }
        });
    }
    
    useIspClick() {
        console.log('click !');
    }
}