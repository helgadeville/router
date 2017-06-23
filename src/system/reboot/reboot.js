import {DialogService} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {Prompt} from 'modal/basic';
import {HttpClient} from 'aurelia-http-client';
import {Overlay} from 'overlay/overlay'
import {Router} from 'aurelia-router';

@inject(HttpClient,DialogService,Overlay,Router)

export class Reboot {
    
  heading = 'Reboot the system';
  
  constructor(httpClient, dialogService,overlay,router) {
      this.http = httpClient;
      this.dialogService = dialogService;
      this.overlay = overlay;
      this.router = router;
  }
  
  reboot() {
      this.dialogService.open({viewModel: Prompt, model: 'Are you sure to reboot the router ?' }).whenClosed(response => {
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
                         console.log('navigate to main page');
                         me.router.navigate('/');
                         // force refresh
                         window.setTimeout(function() {
                             location.reload(true);
                         }, 100);
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
