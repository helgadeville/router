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
        return this.http.get('cgi-bin/get_vpn_configurations.text')
            .then(response => {
                this.overlay.close();
                var cfgs = response.response.split('\n');
                var configs = [];
                for (var i = 0 ; i < cfgs.length ; i++) {
                    if (cfgs[i]) {
                        configs.push(cfgs[i]);
                    }
                }
                this.configs = configs;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router work mode');
            });
    }
    
    download($event) {
        var name = $event.currentTarget.name;
        var data = {
            file : name
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/get_vpn_config.text', data)
        .then(response => {
            this.overlay.close();
            // response.response is text, force download
            var dl = document.createElement('a');
            dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(response.response));
            dl.setAttribute('download', name);
            dl.click();
        }).catch(error => {
            this.overlay.close();
            console.log('Error setting new VPN config');
            this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
        });
    }
    
    restore($event) {
        var name = $event.currentTarget.name;
        let dlg = 
            this.dialogService.warning('You are about to restore VPN configration.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // set current config
                var data = {
                    file : name
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/get_vpn_config.text', data)
                .then(response => {
                    this.overlay.close();
                    // response.response is text
                    if (!this.save(original, name, null, false, true)) {
                        this.dialogService.error('Could not parse target configuration.');
                    } else {
                        console.log('VPN configuration restored.');
                        window.location.reload(true);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error setting new VPN configuration');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    remove($event) {
        var name = $event.currentTarget.name;
        let dlg = 
            this.dialogService.warning('You are about to remove stored VPN configration.\nThis operation is not reversible.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var data = {
                    file : name
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/remove_vpn.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        console.log('VPN configuration removed');
                        window.location.reload(true);
                    } else {
                        console.log('Error removing VPN configuration');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error removing VPN configuration');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    save(original, file, remotes, upload, set) {
        var ovpn = new OvpnReader();
        try {
            ovpn.read(original, file);
        } catch(error) {
            this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
            return false;
        };
        var data = {};
        if (upload) {
            data.file = file;
            data.original = original;
        }
        if (set) {
            data.current = ovpn.get(remotes);
        }
        this.overlay.open();
        this.FEC.submit('cgi-bin/set_vpn.json', data)
        .then(response => {
            this.overlay.close();
            if (response.content.status === "0") {
                console.log('VPN config set');
                window.location.reload(true);
            } else {
                console.log('Error setting VPN configuration');
                this.dialogService.error('Ooops ! Error occured:\n' + response.message);
            }
        }).catch(error => {
            this.overlay.close();
            console.log('Error setting new VPN configuration');
            this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
        });
    }
    
    upload(set) {
        var me = this;
        this.overlay.open();
        var fileToLoad = document.getElementById("uploadFile").files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) {
            if (!me.save(fileLoadedEvent.target.result, fileToLoad, null, true, set)) {
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