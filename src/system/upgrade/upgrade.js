import {inject} from 'aurelia-framework'
import {Dialogs} from 'modal/dialogs'
import {FormEncoder} from 'formencoder/formencoder'
import {Overlay} from 'overlay/overlay'

@inject(FormEncoder,Dialogs,Overlay)
export class Upgrade {

  heading = 'Upgrade System';

  poll_freq = 2000;
  
  canUpgrade = false;
  
  constructor(FEC, dialogService,overlay) {
      this.FEC = FEC;
      this.dialogService = dialogService;
      this.overlay = overlay;
  }
  
  activate() {
      this.poll_status();
      this.activate_poll();
  }
  
  deactivate() {
      this.deactivate_poll();
  }
  
  activate_poll() {
      var me = this;
      this.deactivate_poll();
      var timer = function() {
          me.poll_status();
      }
      this.interval = window.setInterval(timer, this.poll_freq);
  }

  deactivate_poll() {
      if (this.interval) {
          window.clearInterval(this.interval);
          delete this.interval;
      }
  }
  
  poll_status() {
      return this.FEC.get('cgi-bin/welcome.json')
          .then(response => {
              this.system = response.content;
              if (this.system.internet !== this.previousInternet) {
                  this.previousInternet = this.system.internet;
              }
          }).catch(error => {
              console.log('Error getting status');
          });
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
  
  upgrade_continue(arrayBuffer) {
      let dlg = this.dialogService.warning('Are you sure to upgrade the router ?');
      dlg.whenClosed(result => {
          if (!result.wasCancelled) {
             var base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
             console.log('upgrade requested');
             this.overlay.open();
             this.FEC.post('cgi-bin/upgrade.json', base64, 'application/base64')
             .then(response => {
                 this.overlay.close();
                 console.log('Upgrade success');
                 var me = this;
                 me.uploadFile = '';
                 me.overlay.open('Router is upgrading and rebooting', true);
                 me.v = 0;
                 me.ival = window.setInterval(function() {
                     if (++me.v <= 100) {
                         me.overlay.setPercent(me.v);
                     } else {
                         window.clearInterval(me.ival);
                         me.overlay.close();
                         console.log('reload');
                         window.location.href = window.location.origin;
                         window.location.reload(true);
                     }
                 }, 500);
             }).catch(error => {
                 this.overlay.close();
                 console.log('Error on upgrade');
                 this.dialogService.error('Ooops ! Error occured:\n' + error);
             });
          } else {
             console.log('cancelled');
          }
       });
  }
  
  checkPkgs() {
      this.overlay.open();
      return this.FEC.get('cgi-bin/opkgcheck.json')
          .then(response => {
              this.overlay.close();
              this.canUpgrade = response && response.content && response.content.status && response.content.status.length > 0;
              this.forUpgrade = this.canUpgrade ? response.content.status.split(' ') : [];
              this.pkgs = [];
              this.forUpgrade.forEach(name => {
                  this.pkgs.push({
                      name: name,
                      use: true
                  });
              });
              this.changedPkgs();
          }).catch(error => {
              this.overlay.close();
              console.log('Error checking upgrades');
          });
  }
  
  changedPkgs() {
      var slctd = 0;
      for(var i = 0 ; i < this.pkgs.length ; i++) {
          if (this.pkgs[i].use) {
              slctd++;
          }
      }
      this.allPkgsSelected = slctd === this.pkgs.length;
      this.selectedPkgs = slctd > 0;
  }
  
  selectAll() {
      for(var i = 0 ; i < this.pkgs.length ; i++) {
          this.pkgs[i].use = true;
      }
      this.changedPkgs();
  }
  
  upgradePkgs() {
      let dlg = this.dialogService.warning('Are you sure to upgrade the router ?');
      dlg.whenClosed(result => {
          if (!result.wasCancelled) {
             let toUpgrade = '';
             for(var i = 0 ; i < this.pkgs.length ; i++) {
                 if (this.pkgs[i].use) {
                     toUpgrade += this.pkgs[i].name + ' ';
                 }
             }
             let data = {
                 packages: toUpgrade.trim()
             };
             console.log('opkg upgrade requested: ' + data.packages);
             this.overlay.open();
             this.FEC.submit('cgi-bin/opkgupgrade.json', data)
             .then(response => {
                 this.overlay.close();
                 console.log('Upgrade success');
                 var me = this;
                 me.overlay.open('Router is rebooting', true);
                 me.v = 0;
                 me.ival = window.setInterval(function() {
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
                 this.overlay.close();
                 console.log('Error on router upgrade');
                 this.dialogService.error('Ooops ! Error occured:\n' + error);
                 window.location.href = window.location.origin;
             });
          } else {
             console.log('cancelled');
          }
       });
  }
  
}
