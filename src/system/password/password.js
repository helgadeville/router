import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
import {FormEncoder} from 'formencoder/formencoder'
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,Md5ValueConverter,FormEncoder,Overlay)

export class Password {

    heading = 'Password Change Utility';
    
    constructor(http, MD5VC, FEC, overlay) {
        this.http = http;
        this.MD5VC = MD5VC;
        this.FEC = FEC;
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
                this.name = response.content.name;
            }).catch(error => {
                this.overlay.close();
                console.log('Error setting router password');
            });
    }
    
}
