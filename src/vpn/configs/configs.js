import {inject} from 'aurelia-framework';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
import {OvpnReader} from 'ovpnreader/ovpnreader'

@inject(FormEncoder,Dialogs,Overlay)

export class VpnConfigs {
    
    heading = 'OpenVPN Template Configurations';
    
    constructor(FEC, dialogs, overlay) {
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.FEC.get('cgi-bin/get_vpn_configurations.text')
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
            this.dialogService.error('Ooops ! Error occured:\n' + error);
        });
    }
    
    restore($event) {
        var me = this;
        var name = $event.currentTarget.name;
        let dlg = 
            this.dialogService.warning('You are about to restore VPN configration.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // set current config
                var data = {
                    file : name
                };
                me.overlay.open();
                me.FEC.submit('cgi-bin/get_vpn_config.text', data)
                .then(response => {
                    me.overlay.close();
                    // response.response is text
                    me.setAll(response.response, name, null, false, true)
                    .then(() => {
                        console.log('VPN configuration restored.');
                        window.location.reload();
                    }, error => {
                        me.dialogService.error('Could not parse target configuration:\n' + error);
                    });
                }).catch(error => {
                    me.overlay.close();
                    console.log('Error setting new VPN configuration');
                    me.dialogService.error('Ooops ! Error occured:\n' + error);
                });
            }
        });
    }
    
    remove($event) {
        var me = this;
        var name = $event.currentTarget.name;
        let dlg = 
            this.dialogService.warning('You are about to remove stored VPN configration.\nThis operation is not reversible.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var data = {
                    file : name
                };
                me.overlay.open();
                me.FEC.submit('cgi-bin/remove_vpn_config.json', data)
                .then(response => {
                    me.overlay.close();
                    console.log('VPN configuration removed');
                    me.activate();
                }).catch(error => {
                    me.overlay.close();
                    console.log('Error removing VPN configuration');
                    me.dialogService.error('Ooops ! Error occured:\n' + error);
                });
            }
        });
    }
    
    setAll(original, file, remotes, upload, set) {
        var ovpn = new OvpnReader();
        try {
            var ret = ovpn.read(original, file);
            if (ret) {
                return new Promise(function(resolve, reject) { reject(ret); });
            }
        } catch(error) {
            return new Promise(function(resolve, reject) { reject(error.message); });
        };
        var data = {};
        var rx = new RegExp(/\n/,'g');
        if (upload) {
            data.file = file;
            data.original = original.replace(rx, '\r');;
        }
        if (set) {
            data.current = ovpn.get(remotes).replace(rx, '\r');;
        }
        return this.FEC.submit('cgi-bin/set_vpn_config.json', data);
    }
    
    save(original, file, remotes, upload, set) {
        this.overlay.open();
        this.setAll(original, file, remotes, upload, set)
        .then(response => {
            this.overlay.close();
            console.log('VPN config set');
            this.activate();
        }).catch(error => {
            this.overlay.close();
            console.log('Error setting new VPN configuration');
            this.dialogService.error('Ooops ! Error occured:\n' + error);
        });
    }
    
    uploadSingle(inputId) {
        var promises = [];
        var files = document.getElementById(inputId).files;
        for(var i = 0 ; i < files.length ; i++) {
            var fileToLoad = files[i];
            if (fileToLoad) {
                var promise = new Promise((resolve, reject) => {
                    var thisFileName = fileToLoad.name;
                    var fileReader = new FileReader();
                    fileReader.onload = function(fileLoadedEvent) {
                        var rx = new RegExp(/\r/, 'g');
                        resolve({
                            name: thisFileName,
                            data: fileLoadedEvent.target.result.replace(rx,'')
                        });
                    };
                    fileReader.onerror = function() {
                        reject();
                    };
                    fileReader.readAsText(fileToLoad, "UTF-8");
                });
                promises.push(promise);
            }
        }
        return promises;
    }
    
    extractBeginEnd(input) {
        var inside = false;
        var output = '';
        input.split('\n').forEach(line => {
            var line = line.trim();
            if (!inside && line.indexOf('-----BEGIN') === 0) {
                inside = true;
            }
            if (inside) {
                output += line + '\n';
                if (line.indexOf('-----END') === 0) {
                    inside = false;
                }
            }
        });
        return output;
    }
    
    upload(set) {
        var promises = [];
        var promisesAndExpected = { 'ovpn' : {
            id : 'uploadFile',
            promiseIndex: []
        }, 'ca' : {
            id: 'uploadCert',
            promiseIndex: []
        }, 'cert' : {
            id: 'clientCert',
            promiseIndex: []
        }, 'key' : {
            id: 'clientKey',
            promiseIndex: []
        }, 'tls-auth' : {
            id: 'tlsAuth',
            promiseIndex: []
        }};
        this.overlay.open();
        for(var expected in promisesAndExpected) {
            var pae = promisesAndExpected[expected];
            var newPromises = this.uploadSingle(pae.id);
            newPromises.forEach(promise => {
                if (promise) {
                    pae.promiseIndex.push(promises.length);
                    promises.push(promise);
                }
            });
        }
        Promise.all(promises)
        .then(values => {
            var ovpns = [];
            var extra = '';
            for(var expected in promisesAndExpected) {
                var pae = promisesAndExpected[expected];
                pae.promiseIndex.forEach(idx => {
                    var value = values[idx];
                    switch(expected) {
                        case 'ovpn':
                            ovpns.push(value);
                            break;
                        default:
                            extra += '<' + expected + '>\n' + this.extractBeginEnd(value.data) + '</' + expected + '>\n';
                    }
                });
            }
            var newPromises = [];
            ovpns.forEach(ovpn => {
                if (ovpn && ovpn.data) {
                    if (extra) {
                        ovpn.data += '\n' + extra;
                    }
                    newPromises.push(this.setAll(ovpn.data, ovpn.name, null, true, set));
                }
            });
            Promise.all(newPromises)
            .then(() => {
                document.getElementById('uploader').reset();
                if (set) {
                    window.location.reload();
                } else {
                    this.overlay.close();
                    this.activate();
                }
            }, error => {
                this.overlay.close();
                this.dialogService.error('Uploaded file caused problem during parse:\n' + error);
            });
        }, error => {
            this.overlay.close();
            this.dialogService.error('Failed to upload file(s):\n' + error);
        });
    }
    
}