import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {FormEncoder} from 'formencoder/formencoder'
import {Dialogs} from 'modal/dialogs';
import {Overlay} from 'overlay/overlay'
import {computedFrom} from 'aurelia-framework';

@inject(HttpClient,FormEncoder,Dialogs,Overlay)

export class Configurations {

    heading = 'Configurations';

    constructor(http, FEC, dialogs, overlay) {
        this.http = http;
        this.FEC = FEC;
        this.dialogService = dialogs;
        this.overlay = overlay;
    }
    
    activate() {
        this.overlay.open();
        return this.http.get('cgi-bin/get_system_configurations.text')
            .then(response => {
                this.overlay.close();
                var cfgs = response.response.split('\n');
                var configs = [];
                for (var i = 0 ; i < cfgs.length ; i++) {
                    if (cfgs[i]) {
                        configs.push(cfgs[i]);
                    }
                }
                this.configs = configs;
            }).catch(error => {
                this.overlay.close();
                console.log('Error getting router configurations');
            });
    }
    
    @computedFrom('fileName')
    get fileNameOk() {
        // check empty
        if (!this.fileName) {
            return false;
        }
        // check special chars
        if (this.fileName.indexOf('/') >= 0 
            || this.fileName.indexOf('\\') >= 0 
            || this.fileName.indexOf('?') >= 0 
            || this.fileName.indexOf('*') >= 0
            || this.fileName.indexOf('\"') >= 0
            || this.fileName.indexOf('\'') >= 0
            || this.fileName.indexOf('\`') >= 0) {
            return false;
        }
        // check reserved
        if (this.fileName === 'factory' || this.fileName === 'default') {
            return false;
        }
        // check if exists
        for(var j = 0 ; j < this.configs.length ; j++) {
            if (this.fileName.toLowerCase() === this.configs[j].toLowerCase()) {
                return false;
            }
        }
        return true;
    }
    
    saveCurrent() {
        var fName = this.fileName;
        let dlg = 
            this.dialogService.warning('Save current configuration - are  you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var data = {
                    file : fName
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/save_current_config.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        this.fileName = '';
                        this.activate();
                    } else {
                        console.log('Error saving current system configuration !');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error saving current configuration !');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    download($event) {
        var name = $event.currentTarget.name;
        var data = {
            file : name
        };
        this.overlay.open();
        this.FEC.submit('cgi-bin/get_system_config.bin', data, 'arraybuffer')
        .then(response => {
            this.overlay.close();
            // response.response is blob
            var blob = new Blob([response.response], {type:'octet/stream'});
            var dl = document.createElement('a');
            dl.href = window.URL.createObjectURL(blob);
            dl.setAttribute('download', name);
            dl.click();
        }).catch(error => {
            this.overlay.close();
            console.log('Error downloading saved configuration !');
            this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
        });
    }
    
    restore($event) {
        var name = $event === 'factory' || $event === 'default' ? $event : $event.currentTarget.name;
        let dlg = 
            this.dialogService.warning('You are about to restore system configration.\nAfter that, router will be rebooted.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                var data = {
                    file : name
                };
                this.overlay.open();
                this.FEC.submit('cgi-bin/set_system_config.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        console.log('System configuration restored');
                        // full reboot required !
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
                        console.log('Error restoring system configuration');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error restoring system configuration');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
    
    remove($event) {
        var name = $event.currentTarget.name;
        var data = {
            file : name
        };
        let dlg = 
            this.dialogService.warning('You are about to remove system configuration ' + name + '.\nAre you sure ?');
        dlg.whenClosed(result => {
            if (!result.wasCancelled) {
                this.overlay.open();
                this.FEC.submit('cgi-bin/remove_system_config.json', data)
                .then(response => {
                    this.overlay.close();
                    if (response.content.status === "0") {
                        console.log('System configuration removed');
                        this.activate();
                    } else {
                        console.log('Error removing system configuration');
                        this.dialogService.error('Ooops ! Error occured:\n' + response.message);
                    }
                }).catch(error => {
                    this.overlay.close();
                    console.log('Error removing system configuration');
                    this.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                });
            }
        });
    }
        
    loadSet(archive) {
        var me = this;
        var fileToLoad = document.getElementById('upload').files[0];
        if (fileToLoad.toLowerCase() === 'default' || fileToLoad.toLowerCase() === 'factory') {
            return;
        }
        if (fileToLoad) {
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) {
                let dlg = 
                    me.dialogService.warning('Are you sure to upload and set configuration ' + fileToLoad + ' ?');
                dlg.whenClosed(result => {
                    if (!result.wasCancelled) {
                        var arrayBuffer = fileLoadedEvent.target.result;
                        var base64 = btoa(
                                new Uint8Array(arrayBuffer)
                                  .reduce((data, byte) => data + String.fromCharCode(byte), '')
                              );
                        var data = {
                            file : fileToLoad,
                            data : base64
                        }
                        if (archive) {
                            data.archive = 'yes'
                        };
                        me.overlay.open();
                        me.FEC.submit('cgi-bin/upload_system_config.json', data)
                        .then(response => {
                            me.overlay.close();
                            if (response.content.status === "0") {
                                console.log('System configuration uploaded');
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
                            } else {
                                console.log('Error uploading system configuration');
                                me.dialogService.error('Ooops ! Error occured:\n' + response.message);
                            }
                        }).catch(error => {
                            me.overlay.close();
                            console.log('Error uploading system configuration');
                            me.dialogService.error('Ooops ! Error occured:\n' + error.statusCode + '/' + error.statusText + '\n' + error.response);
                        });
                    }});
            };
            fileReader.onerror = function() {
                console.log('Error uploading system configuration');
                this.dialogService.error('Ooops ! Error occured when trying to upload file.');
            };
            fileReader.readAsArrayBuffer(fileToLoad);
        }
    }
    
    loadArchive() {
        loadSet(true);
    }
    
}
