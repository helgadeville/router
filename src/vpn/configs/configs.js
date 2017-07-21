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
                console.log('Error getting VPN configurations');
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
                this.FEC.submit('cgi-bin/remove_vpn_config.json', data)
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
            var ret = ovpn.read(original, file);
            if (ret) {
                return ret;
            }
        } catch(error) {
            this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
            return error.statusText;
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
        this.FEC.submit('cgi-bin/set_vpn_config.json', data)
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
    
    uploadSingle(inputId) {
        var fileToLoad = document.getElementById(inputId).files[0];
        if (fileToLoad) {
            var promise = new Promise((resolve, reject) => {
                var fileReader = new FileReader();
                fileReader.onload = function(fileLoadedEvent) {
                    resolve(fileLoadedEvent.target.result);
                };
                fileReader.onerror = function() {
                    reject();
                };
                fileReader.readAsText(fileToLoad, "UTF-8");
            });
            return promise;
        }
    }
    
    extractBeginEnd(input) {
        var inside = false;
        var output = '';
        var lines = input.split('\n');
        for(var i = 0 ; i < input.length ; i++) {
            var line = lines[i].trim();
            if (!inside && line.indexOf('-----BEGIN') === 0) {
                inside = true;
            }
            if (inside) {
                output += line + '\n';
                if (line.indexOf('-----END') === 0) {
                    inside = false;
                }
            }
        }
        return output;
    }
    
    upload(set) {
        var promises = [];
        var fileToLoad = document.getElementById("uploadFile").files[0];
        var promisesAndExpected = [{
            id : 'uploadFile',
            expected : 'ovpn',
        }, {
            id: 'uploadCert',
            expected: '<ca>'
        }, {
            id: 'clientCert',
            expected: '<cert>'
        }, {
            id: 'clientKey',
            expected: '<key>'
        }, {
            id: 'tlsAuth',
            expected: '<tls-auth>'
        }];
        this.overlay.open();
        for(var i = 0 ; i < promisesAndExpected.length ; i++) {
            var pie = promisesAndExpected[i];
            var promise = this.uploadSingle(pie.id);
            if (promise) {
                pie.promiseIndex = promises.length;
                promises.push(promise);
            } else {
                pie.promiseIndex = -1;
            }
        }
        Promise.all(promises)
        .then(values => {
            var masterFile = '';
            for(var i = 0 ; i < promisesAndExpected.length ; i++) {
                var pie = promisesAndExpected[i];
                if (pie.promiseIndex >= 0) {
                    var value = values[pie.promiseIndex];
                    switch(pie.expected) {
                    case 'ovpn':
                        masterFile += value + '\n';
                        break;
                    case '<ca>':
                    case '<cert>':
                    case '<key>':
                    case '<tls-auth>':
                        masterFile += pie.expected + '\n' + this.extractBeginEnd() + '\n</' + pie.expected.substring(1) + '\n';
                        break;
                    }
                }
            }
            this.overlay.close();
            var result = this.save(masterFile, fileToLoad, null, true, set);
            if (this.save(masterFile, fileToLoad, null, true, set)) {
                this.dialogs.error('Uploaded file caused problem during parse:\n' + result);
            }
        }).catch(error => {
            this.overlay.close();
            this.dialogs.error('Failed to upload file(s).');
        });
    }
    
}