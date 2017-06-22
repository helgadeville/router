import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Md5ValueConverter} from 'aurelia-utility-converters';
@inject(HttpClient)
@inject(Md5ValueConverter)

export class Password {

    heading = 'Password Change Utility';
    
    constructor(http) {
        this.http = http;
        this.MD5VC = new Md5ValueConverter();
    }
    
    activate() {
        return this.http.get('cgi-bin/get_user_name.json')
            .then(response => {
                this.oldUser = response.content.name;
                this.newUser = response.content.name;
            }).catch(error => {
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
        this.http.createRequest('cgi-bin/set_password.json')
            .withHeader('Content-Type', 'application/json; charset=utf-8')
            .asPost()
            .send(data)
            .then(response => {
                this.name = response.content.name;
            }).catch(error => {
                console.log('Error setting router password');
            });
    }
    
}
