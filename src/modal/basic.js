import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)

export class Prompt {

   constructor(controller){
      this.controller = controller;
      this.answer = null;
   }
   
   /**
    * Config object must have attributes:
    *   message : text to display
    *   type    : determines icon displayed, may be info, error, question, warning
    *   btn[]   : array of button names, supported: yes no ok cancel
    */
    activate(config) {
        this.message = config.message;
        var buttons = [];
        if (!config.type) {
            config.type = 'info';
        }
        switch(config.type) {
            case 'info':
                this.iconClass = 'fa fa-info-circle fa-4x message-info-blue';
                if (!config.btn) config.btn = [ 'ok' ];
                break;
            case 'error':
                this.iconClass = 'fa fa-exclamation-circle fa-4x message-info-red';
                if (!config.btn) config.btn = [ 'ok' ];
                break;
            case 'question':
                this.iconClass = 'fa fa-question-circle fa-4x message-info-green';
                if (!config.btn) config.btn = [ 'yes', 'no' ];
                break;
            case 'warning':
                this.iconClass = 'fa fa-exclamation-triangle fa-4x message-info-orange';
                if (!config.btn) config.btn = [ 'ok', 'cancel' ];
                break;
        }
        for(var i = 0 ; i < config.btn.length ; i++) {
            var bbtn = config.btn[i];
            var text, cancel, clazz;
            switch (bbtn) {
                case 'yes':
                    text = 'Yes';
                    cancel = false;
                    switch(config.type) {
                        case 'info':
                            clazz = 'btn';
                            break;
                        case 'error':
                            clazz = 'btn';
                            break;
                        case 'question':
                            clazz = 'btn btn-success';
                            break;
                        case 'warning':
                            clazz = 'btn btn-danger';
                            break;
                    }
                    break;
                case 'no':
                    text = 'No';
                    cancel = false;
                    switch(config.type) {
                        case 'info':
                            clazz = 'btn';
                            break;
                        case 'error':
                            clazz = 'btn';
                            break;
                        case 'question':
                            clazz = 'btn btn-danger';
                            break;
                        case 'warning':
                            clazz = 'btn btn-warning';
                            break;
                    }
                    break;
                case 'ok':
                    text = 'OK';
                    cancel = false;
                    switch(config.type) {
                        case 'info':
                            clazz = 'btn btn-info';
                            break;
                        case 'error':
                            clazz = 'btn btn-info';
                            break;
                        case 'question':
                            clazz = 'btn btn-success';
                            break;
                        case 'warning':
                            clazz = 'btn btn-danger';
                            break;
                    }
                    break;
                case 'cancel':
                    text = 'Cancel';
                    cancel = true;
                    switch(config.type) {
                        case 'info':
                            clazz = 'btn btn-default';
                            break;
                        case 'error':
                            clazz = 'btn btn-default';
                            break;
                        case 'question':
                            clazz = 'btn btn-default';
                            break;
                        case 'warning':
                            clazz = 'btn btn-default';
                            break;
                    }
                    break;
            }
            var button = {
                name : bbtn,
                text : text,
                clazz : clazz,
                cancel : cancel
            };
            buttons.push(button);
        }
        this.buttons = buttons;
   }
   
   click(name) {
       for(var btn in this.buttons) {
           if (btn.name === name) {
               if (btn.cancel) {
                   controller.cancel();
               } else {
                   controller.ok(btn.name);
               }
           }
       }
   }
   
}