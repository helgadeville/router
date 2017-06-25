import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Dialogs,Overlay)

export class Password {

    heading = 'Password Change Utility';
    
    constructor(http, MD5VC, FEC, dialogs, overlay) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_user_name.json')
            .then(response => {
                this.overlay.close();
                this.oldUser = response.content.name;
                this.newUser = response.content.name;
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
                    'newUser': this.newUser,
                    'old': this.MD5VC.md5(this.oldPassword),
                    'new': this.MD5VC.md5(this.newPassword)
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_password.json', data)
                    .then(response => {
                        this.overlay.close();
                        if (response.content.status === "0") {
                            console.log('Router password set');
                            this.oldUser = this.newUser;
                            window.location.reload(true);
                        } else {
                            console.log('Error setting router password');
                            this.dialogService.error('Ooops ! Error occured:\n' + response.message);
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
