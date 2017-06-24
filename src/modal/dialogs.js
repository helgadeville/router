import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {Prompt} from 'modal/basic';

@inject(DialogService)

export class Dialogs {
        
    constructor(dialogs) {
        this.dialogService = dialogs;
    }
    
    info(message) {
        let dlg = this.dialogService.open( {
            viewModel: Prompt, 
            model: {
                type: 'info',
                message: message,
                btn: [ 'ok' ]
            }
        });
        return dlg;
    }
    
    warning(message) {
        let dlg = this.dialogService.open( {
            viewModel: Prompt, 
            model: {
                type: 'warning',
                message: message,
                btn: [ 'ok', 'cancel' ]
            }
        });
        return dlg;
    }
    
    error(message) {
        let dlg = this.dialogService.open( {
            viewModel: Prompt, 
            model: {
                type: 'error',
                message: message,
                btn: [ 'ok' ]
            }
        });
        return dlg;
    }
    
    question(message) {
        let dlg = this.dialogService.open( {
            viewModel: Prompt, 
            model: {
                type: 'question',
                message: message,
                btn: [ 'yes', 'no' ]
            }
        });
        return dlg;
    }
    
}
