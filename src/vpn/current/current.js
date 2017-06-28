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
        var i = 2;
        this.overlay.open();
        this.http.get('cgi-bin/get_vpn_config.text')
            .then(response => {
                if (!--i) this.overlay.close();
                this.original = response.response;
            }).catch(error => {
                if (!--i) this.overlay.close();
                console.log('Error getting vpn config');
            });
        this.http.get('cgi-bin/get_vpn_current.text')
        .then(response => {
            if (!--i) this.overlay.close();
            var remotes = [];
            var lines = response.response.split('\n');
            for(var j = 0 ; j < lines.length ; j++) {
                var line = lines[j].trim();
                if (!line) continue;
                if (line.toLowerCase().indexOf('file=') === 0) {
                    this.file = line.substring(5).trim();
                } else
                if (line.toLowerCase().indexOf('description=') === 0) {
                    this.desc = line.substring(12).trim();
                } else {
                    var active = line.indexOf('#') !== 0;
                    if (!active) {
                        line = line.substring(1).trim();
                    }
                    var splt = line.split(' ');
                    if (!splt || splt.length < 2 || splt[0].toLowerCase() !== 'remote') continue;
                    remotes.push({
                        remote : splt[1],
                        active : active
                    });
                }
            }
            remotes.sort(function(a,b) {
                return a.remote.localeCompare(b.remote);
            });
            this.remotes = remotes;
        }).catch(error => {
            if (!--i) this.overlay.close();
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
    
    setUserAndPass() {
        this.overlay.open();
        var data = {
            user: this.username,
            pass: this.password
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
    
    setCurrent() {
        this.save(false);
    }
    
    setArchive() {
        this.save(true);
    }
    
    save(archive) {
        // set current config
        var ovpn = new OvpnReader();
        ovpn.read(this.original);        
        var data = {
            file : this.file,
            description : this.desc,
            current : ovpn.get(this.remotes),
            original : ovpn.original(),
            archive : archive ? '1' : '0'
        };
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