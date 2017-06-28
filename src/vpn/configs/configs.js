import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,FormEncoder,Dialogs,Overlay)

export class VpnConfigs {
    
    heading = 'OpenVPN Template Configurations';
    
    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_vpn_configurations.json')
            .then(response => {
                this.overlay.close();
                this.configs = response.content;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router work mode');
            });
    }
    
    set($event) {
        let dlg = 
            this.dialogService.warning('You are about to set new VPN configration.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // set current config
                var data = {
                    id : id
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/restore_vpn.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        console.log('VPN config set');
                        window.location.reload(true);
                    } else {
                        console.log('Error setting VPN config');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error setting new VPN config');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    remove($event) {
        let dlg = 
            this.dialogService.warning('You are about to remove stored VPN configration.\nThis operation is not reversible.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // set current config
                var data = {
                    id : id
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/remove_vpn.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        console.log('VPN config set');
                        window.location.reload(true);
                    } else {
                        console.log('Error setting VPN config');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error setting new VPN config');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    loadSet() {
        load(false);
    }
    
    loadArchive() {
        load(true);
    }
    
    load(archive) {
        var me = this;
        this.overlay.open();
        var fileToLoad = document.getElementById("upload").files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent){
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var ovpn = new OvpnReader();
            try {
                ovpn.read(textFromFileLoaded);
                if (ovpn.common && ovpn.remotes.length > 1 && ovpn.cert) {
                    // set current config
                    var data = {
                        file : fileToLoad,
                        description : me.description,
                        current : ovpn.get(),
                        original : ovpn.original(),
                        archive : archive ? '1' : '0'
                    };
                    me.FEC.submit('cgi-bin/set_vpn.json', data)
                    .then(response => {
                        me.overlay.close();
                        if (response.content.status === "0") {
                            console.log('VPN config set');
                            window.location.reload(true);
                        } else {
                            console.log('Error setting VPN config');
                            me.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        me.overlay.close();
                        console.log('Error setting new VPN config');
                        me.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
                } else {
                    me.overlay.close();
                    throw 'Parse error';
                }
            } catch(error) {
                me.dialogs.error('Uploaded file caused problem during parse.');
            }
        };
        fileReader.onerror = function() {
            me.overlay.close();
            me.dialogs.error('Failed to upload file.');
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
    }
    
}