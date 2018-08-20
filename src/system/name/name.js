import {inject} from 'aurelia-framework'
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder,Dialogs,Overlay)
export class Name {

    heading = 'System Name Change';
    
    constructor(FEC, dialogs, overlay) {
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.FEC.get('cgi-bin/get_name.text')
            .then(response => {
                this.overlay.close();
                var ipsRaw = response.response.split('\n');
                for(var i = 0 ; i < ipsRaw.length ; i++) {
                    if (ipsRaw[i]) {
                        this.oldName = ipsRaw[i];
                        break;
                    }
                }
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router system name');
            });
    }
    
    submit() {
        let dlg = this.dialogService.warning('You are about to change router system name.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                let data = {
                    'name': this.newName
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_name.json', data)
                    .then(response => {
                        this.oldName = this.newName;
                        this.newName = '';
                        this.overlay.close();
                        console.log('Router system name set');
                        var me = this;
                        this.overlay.open('Network is reloading', true);
                        this.v = 0;
                        this.ival = window.setInterval(function() {
                            if (++me.v <= 100) {
                                me.overlay.setPercent(me.v);
                            } else {
                                window.clearInterval(me.ival);
                                me.overlay.close();
                                me.activate();
                            }
                        }, 200);
                    }).catch(error => {
                        this.overlay.close();
                        console.log('Error setting router system name');
                        this.dialogService.error('Ooops ! Error occured:\n' + error);
                    });
            }
        });
    }
    
}
