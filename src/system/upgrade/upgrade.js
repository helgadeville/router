import {inject} from 'aurelia-framework'
import {Dialogs} from 'modal/dialogs'
import {FormEncoder} from 'formencoder/formencoder'
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder,Dialogs,Overlay)
export class Upgrade {
    
  heading = 'Upgrade System';
  
  constructor(FEC, dialogService,overlay) {
      this.FEC = FEC;
      this.dialogService = dialogService;
      this.overlay = overlay;
  }
  
  upgrade() {
      var me = this;
      var fileToLoad = document.getElementById('uploadBuFile').files[0];
      if (fileToLoad) {
          var fileReader = new FileReader();
          fileReader.onload = function(fileLoadedEvent) {
              me.upgrade_continue(fileLoadedEvent.target.result);
          };
          fileReader.onerror = function() {
              this.dialogService.error('Error occured during file upload.');
          };
          fileReader.readAsArrayBuffer(fileToLoad);
      }
  }
  
  upgrade_continue(target) {
      let dlg = this.dialogService.warning('Are you sure to upgrade the router ?');
      dlg.whenClosed(result => {
          if (!result.wasCancelled) {
             var base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
             var data = {
                 data : base64
             };
             console.log('upgrade requested');
             this.FEC.submit('cgi-bin/upgrade.json')
             .then(response => {
                 if (response.content.status === "0") {
                     console.log('Upgrade success');
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
                     console.log('Error on upgrade');
                     this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                 }
             }).catch(error => {
                 console.log('Error on upgrade');
                 this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
             });
          } else {
             console.log('cancelled');
          }
       });
  }
  
}
