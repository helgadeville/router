import {inject} from 'aurelia-framework'
import {HttpClient} from 'aurelia-http-client'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {Overlay} from 'overlay/overlay'
import {OvpnReader} from 'ovpnreader/ovpnreader'

@inject(HttpClient,FormEncoder,Dialogs,Overlay)

export class VpnCurrent {
    
    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogs = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.remotesSelected = 0;
        this.overlay.open();
        this.http.get('cgi-bin/get_vpn_config.text')
        .then(response => {
            this.overlay.close();
            var remotes = [];
            var lines = response.response.split('\n');
            this.original = '';
            for(var j = 0 ; j < lines.length ; j++) {
                var line = lines[j].trim();
                if (!line) continue;
                var skip = false;
                if (line.toLowerCase().indexOf('#user=') === 0) {
                    this.username = line.substring(6).trim();
                } else
                if (line.toLowerCase().indexOf('#original-file ') === 0) {
                    this.file = line.substring(15).trim();
                    skip = true;
                } else {
                    var active = line.indexOf('#') !== 0;
                    var splt = active ? line.split(' ') : line.substring(1).trim().split(' ');
                    if (splt && splt.length > 1 && splt[0].toLowerCase() === 'remote') {
                        remotes.push({
                            remote : splt[1],
                            active : active
                        });
                        if (active) {
                            this.remotesSelected++;
                        }
                    }
                }
                if (!skip) {
                    this.original += line + '\n';
                }
            }
            remotes.sort(function(a,b) {
                return a.remote.localeCompare(b.remote);
            });
            this.remotes = remotes;
        }).catch(error => {
            this.overlay.close();
            console.log('Error getting vpn config');
        });
        
    }
    
    selUnselAll(how) {
        for(var i = 0 ; i < this.remotes.length ; i++) {
            this.remotes[i].active = how;
        }
        this.remotesSelected = how ? this.remotes.length : 0;
    }
    
    selUnselRemote(how) {
        if (how) {
            this.remotesSelected++;
        } else {
            this.remotesSelected--;
        }
    }
        
    setUserAndPass(connect) {
        this.overlay.open();
        var data = {
            user: this.username,
            pass: this.password,
            connect : connect ? '1' : '0'
        };
        this.FEC.submit('cgi-bin/set_vpn_auth.json', data)
        .then(response => {
            me.overlay.close();
            if (response.content.status === "0") {
                console.log('VPN username & password set');
            } else {
                console.log('Error setting VPN username & password');
                me.dialogService.error('Ooops ! Error occured:\n' + response.message);
            }
        }).catch(error => {
            me.overlay.close();
            console.log('Error setting new VPN username/password');
            me.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
        });
    }
    
    set() {
        var result = this.save(this.original, this.file, this.remotes, false, true);
        if (result) {
            this.dialogs.error('Configuration caused problem during parse.');
        }
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