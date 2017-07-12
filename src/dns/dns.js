import {inject} from 'aurelia-framework'
import {HttpClient} from 'aurelia-http-client'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {Overlay} from 'overlay/overlay'
import {DnsHelper} from 'dns/dnshelper'

@inject(HttpClient,FormEncoder,Dialogs,Overlay,DnsHelper)
export class Dns {
    
    heading = 'Domain Name Servers';
    
    constructor(http, FEC, dialogs, overlay, dnshelp) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
        this.dnshelper = dnshelp;
    }
    
    activate() {
        var me = this;
        me.overlay.open();
        me.http.get('cgi-bin/get_dns.text')
        .then(response => {
            me.overlay.close();
            var dnses = [ 'do not change' ];
            dnses = dnses.concat(me.dnshelper.names);
            var ipsRaw = response.response.split('\n');
            var ips  = [];
            if (ipsRaw) {
                for(var i = 0 ; i < ipsRaw.length ; i++) {
                    if (ipsRaw[i]) {
                        ips.push(ipsRaw[i]);
                    }
                }
            }
            var name =me.dnshelper.nameFromIp(ips);
            me.dnses = dnses;
            me.oldDns = name;
            me.newDns = name ? 'do not change' : dnses[0];
        }).catch(error => {
            me.overlay.close();
            console.log('Error getting DNS');
        });
    }
    
    setDns() {
        let dlg = this.dialogService.warning('You are about to change router DNS setting.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var dnses = this.dnshelper.ipFromName(this.newDns);
                let data = {
                    dns1 : dnses[0]
                };
                if (dnses[1]) {
                    data.dns2 = dnses[1];
                }
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_dns.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('DNS set');
                            window.location.reload(true);
                        } else {
                            console.log('Error setting router DNS');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router DNS');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}