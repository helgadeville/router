import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
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
    
    atLeastOneChecked() {
        if (!this.remotes) {
            return false;
        }
        for(var i = 0 ; i < this.remotes.length ; i++) {
            if (this.remotes[i].active) {
                return true;
            }
        }
        return false;
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
        if (!this.save(this.original, this.file, this.remotes, false, true)) {
            this.dialogs.error('Configuration caused problem during parse.');
        }
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
                console.log('Error setting VPN config');
                this.dialogService.error('Ooops ! Error occured:\n' + response.message);
            }
        }).catch(error => {
            this.overlay.close();
            console.log('Error setting new VPN config');
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