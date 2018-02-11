import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs'
import {Overlay} from 'overlay/overlay'
import {OvpnReader} from 'ovpnreader/ovpnreader'

@inject(FormEncoder,Dialogs,Overlay)
export class VpnCurrent {
    
    constructor(FEC, dialogService, overlay) {
        this.FEC = FEC;
        this.dialogService = dialogService;
        this.overlay = overlay;
    }
    
    activate() {
        this.remotesSelected = 0;
        this.overlay.open();
        this.FEC.get('cgi-bin/get_vpn_config.text')
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
                } else if (line.toLowerCase().indexOf('#pass=') === 0) {
                    this.password = line.substring(6).trim();
                } else
                if (line.toLowerCase().indexOf('#original-file=') === 0) {
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
            this.overlay.close();
            console.log('VPN username & password set');
        }).catch(error => {
            this.overlay.close();
            console.log('Error setting new VPN username/password');
            this.dialogService.error('Ooops ! Error occured:\n' + error);
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
                    window.location.reload(true);
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