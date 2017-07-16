import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
import {computedFrom} from 'aurelia-framework';

@inject(HttpClient,FormEncoder,Dialogs,Overlay)

export class Configurations {

    heading = 'Configurations';

    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_system_configurations.text')
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
                console.log('Error getting router configurations');
            });
    }
    
    @computedFrom('fileName')
    get fileNameOk() {
        // check empty
        if (!this.fileName) {
            return false;
        }
        // check special chars
        if (this.fileName.indexOf('/') >= 0 || this.fileName.indexOf('\\') >= 0 || this.fileName.indexOf('?') >= 0 || this.fileName.indexOf('*') >= 0) {
            return false;
        }
        // check reserved
        if (this.fileName === 'default') {
            return false;
        }
        // check if exists
        for(var j = 0 ; j < this.configs.length ; j++) {
            if (this.fileName.toLowerCase() === this.configs[j].toLowerCase()) {
                return false;
            }
        }
        return true;
    }
    
    saveCurrent() {
        var fName = this.fileName;
        if (fName.toLowerCase().indexOf('.cgz') !== fName.length - 4) {
            fName += '.cgz';
        }
        // TODO
    }
    
    download($event) {
        var name = $event.currentTarget.name;
        var data = {
            file : name
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/get_system_config.json', data)
        .then(response => {
            this.overlay.close();
            // response.response is text, force download
            var dl = document.createElement('a');
            dl.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(response.response));
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
            this.dialogService.warning('You are about to restore system configration.\nAfter that, router will be rebooted.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var data = {
                    file : name
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_system_config.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        console.log('System configuration restored');
                        // full reboot required !
                        var me = this;
                        this.overlay.open('Router is rebooting', true);
                        this.v = 0;
                        this.ival = window.setInterval(function() {
                            if (++me.v <= 100) {
                                me.overlay.setPercent(me.v);
                            } else {
                                window.clearInterval(me.ival);
                                me.overlay.close();
                                console.log('reload');
                                window.location.href = window.location.origin;
                            }
                        }, 500);
                    } else {
                        console.log('Error restoring system configuration');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error restoring system configuration');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    remove($event) {
        var name = $event.currentTarget.name;
        var data = {
            file : name
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/remove_system.json', data)
        .then(response => {
            this.overlay.close();
            if (response.content.status === "0") {
                console.log('System configuration removed');
                window.location.reload(true);
            } else {
                console.log('Error removing system configuration');
                this.dialogService.error('Ooops ! Error occured:\n' + response.message);
            }
        }).catch(error => {
            this.overlay.close();
            console.log('Error removing system configuration');
            this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
        });
    }
    
}
