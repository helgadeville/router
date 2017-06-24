import {DialogService} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {Prompt} from 'modal/basic';
import {HttpClient} from 'aurelia-http-client';
import {Overlay} from 'overlay/overlay'

@inject(HttpClient,DialogService,Overlay)

export class Reboot {
    
  heading = 'Reboot the system';
  
  constructor(httpClient, dialogService,overlay) {
      this.http = httpClient;
      this.dialogService = dialogService;
      this.overlay = overlay;
  }
  
  reboot() {
      let dlg = this.dialogService.open( {
                                              viewModel: Prompt, 
                                              model: {
                                                  type: 'warning',
                                                  message: 'Are you sure to reboot the router ?',
                                                  btn: [ 'ok', 'cancel' ]
                                              }
                                          });
      dlg.whenClosed(response => {
          if (!response.wasCancelled) {
             console.log('reboot requested');
             this.http.get('cgi-bin/reboot.json')
             .then(response => {
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
             }).catch(error => {
                 console.log('Error on reboot');
             });
          } else {
             console.log('cancelled');
          }
       });
  }
  
}
