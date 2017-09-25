import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder,Dialogs,Overlay)
export class Password {

    heading = 'Password Change Utility';
    
    constructor(FEC, dialogs, overlay) {
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.FEC.get('cgi-bin/get_user_name.json')
            .then(response => {
                this.overlay.close();
                this.oldUser = response.content.name;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router user name');
            });
    }
    
    submit() {
        let dlg = this.dialogService.warning('You are about to change router access password.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    'oldUser': this.oldUser,
                    'newUser': this.newUser ? this.newUser : this.oldUser,
                    'old': this.oldPassword,
                    'new': this.newPassword
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_password.json', data)
                    .then(response => {
                        this.oldPassword = '';
                        this.newPassword = '';
                        this.newPassword2 = '';
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router password set');
                            this.oldUser = this.newUser;
                            this.activate();
                        } else {
                            console.log('Error setting router password');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.content.message);
                        }
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router password');
                        this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                    });
            }
        });
    }
    
}
