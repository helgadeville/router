import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import {FormEncoder} from 'formencoder/formencoder'
import {Overlay} from 'overlay/overlay'

@inject(DialogController,FormEncoder,Overlay)
export class Saved {

    constructor(controller, FEC, overlay) {
        this.controller = controller;
        this.FEC = FEC;
        this.overlay = overlay;
    }
    
    activate(config) {
        this.aps = config.aps;
    }
    
    select(idx) {
        // get name
        this.choice = idx;
    }
    
    forget($event) {
        var name = $event.currentTarget.name;
        let data = {
            ssid : name
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/forget_ap.json', data)
            .then(response => {
                this.overlay.close();
                for(var i = 0 ; i < this.aps.length ; i++) {
                    var station = this.aps[i];
                    if (station.ssid === name) {
                        this.aps.splice(i, 1);
                        break;
                    }
                }
                if (!this.aps.length) {
                    this.controller.cancel();
                }
            }).catch(error => {
                this.overlay.close();
                console.log('Error removing AP');
            });
    }
    
    click($event) {
        var btn = $event.currentTarget.name;
        // do sth
        if (btn === 'cancel') {
            this.controller.cancel();
        }
        if (btn === 'ok') {
            this.controller.ok(this.aps[this.choice]);
        }
    }
}