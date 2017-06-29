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
    
    restore($event) {
        var trg = $event ? $event.currentTarget.name : 'default';
        // TODO: send restore
    }
    
    remove($event) {
        var trg = $event.currentTarget.name;
        // TODO: send remove
    }
    
}
