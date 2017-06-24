import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Dialogs,Overlay)

export class Wireless {
    
    heading = 'Wireless Access Setup';
    
    constructor(http, MD5VC, FEC, dialogs, overlay) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_wireless.text')
            .then(response => {
                this.overlay.close();
                // TODO
                this.decode(response.response);
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router wireless');
            });
    }
    
    getWords(line) {
        var n = line.indexOf(' ');
        if (n < 0) {
            n = line.indexOf('\t');
            if (n < 0) {
                return;
            }
        }
        var first = line.substring(0, n);
        line = line.substring(n + 1).trim();
        n = line.indexOf(' ')
        if (n < 0) {
            n = line.indexOf('\t');
            if (n < 0) {
                return;
            }
        }
        var second = line.substring(0, n);
        line = line.substring(n + 1).trim();
        return [ first, second, line ];
    }
    
    decode(text) {
        var lines = text.split('\n');
        var object = {};
        var name = null;
        for(var i = 0 ; i < lines.length ; i++) {
            var line = lines[i].trim();
            if (line) {
                var splt = this.getWords(line);
                if (splt) {
                    if (splt[0] === 'config') {
                        name = splt[1];
                        object[name] = {
                            name: splt[2]
                        };
                    } else
                    if (splt[0] === 'option') {
                        if (name) {
                            object[name][splt[1]] = splt[2];
                        } else {
                            console.log('Error: name undefined');
                        }
                    }
                }
            }
        }
        return object;
    }
    
    submit() {
        let dlg = this.dialogService.warning('You are about to change wireless mode.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                // TODO
                let data = {
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_wireless.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router wireless set');
                            // TODO
                        } else {
                            console.log('Error setting router wireless');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router wireless');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}