import {inject} from 'aurelia-framework'
import {Dialogs} from 'modal/dialogs'
import {FormEncoder} from 'formencoder/formencoder'
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder,Dialogs,Overlay)
export class Reboot {
    
  heading = 'Reboot the system';
  
  constructor(FEC, dialogService,overlay) {
      this.FEC = FEC;
      this.dialogService = dialogService;
      this.overlay = overlay;
  }
  
  restart() {
      let dlg = this.dialogService.warning('Are you sure to restart router services ?');
      dlg.whenClosed(result => {
          if (!result.wasCancelled) {
             console.log('restart requested');
             this.FEC.get('cgi-bin/restart.json')
             .then(response => {
                 if (response.content.status === "0") {
                     console.log('Restart success');
                     var me = this;
                     this.overlay.open('Waiting for router', true);
                     this.v = 0;
                     this.ival = window.setInterval(function() {
                         if (++me.v <= 20) {
                             me.overlay.setPercent(me.v * 5);
                         } else {
                             window.clearInterval(me.ival);
                             me.overlay.close();
                             console.log('restart');
                             window.location.href = window.location.origin;
                         }
                     }, 500);
                 } else {
                     console.log('Error on restart');
                     this.dialogService.error('Ooops ! Error occured:\n' + response.content.message);
                 }
             }).catch(error => {
                 console.log('Error on restart');
                 this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
             });
          } else {
             console.log('cancelled');
          }
       });
  }
  
  reboot() {
      let dlg = this.dialogService.warning('Are you sure to reboot the router ?');
      dlg.whenClosed(result => {
          if (!result.wasCancelled) {
             console.log('reboot requested');
             this.FEC.get('cgi-bin/reboot.json')
             .then(response => {
                 if (response.content.status === "0") {
                     console.log('Reboot success');
                     var me = this;
                     this.overlay.open('Router is rebooting', true);
                     this.v = 0;
                     this.ival = window.setInterval(function() {
                         if (++me.v <= 100) {
                             me.overlay.setPercent(me.v);
                         } else {
                             window.clearInterval(me.ival);
                             me.overlay.close();
                             console.log('reload');
                             window.location.href = window.location.origin;
                         }
                     }, 500);
                 } else {
                     console.log('Error on reboot');
                     this.dialogService.error('Ooops ! Error occured:\n' + response.content.message);
                 }
             }).catch(error => {
                 console.log('Error on reboot');
                 this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
             });
          } else {
             console.log('cancelled');
          }
       });
  }
  
}
