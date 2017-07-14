import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)

export class Scan {

    constructor(controller){
        this.controller = controller;
    }
    
    activate(config) {
        this.aps = config.aps;
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