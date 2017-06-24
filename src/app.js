import {inject} from 'aurelia-framework';
import {Overlay} from 'overlay/overlay'

@inject(Overlay)

export class App {

    constructor(overlay) {
        this.overlay = overlay;
    }
    
    configureRouter(config, router) {
        config.title = 'AuRoutelia';
        config.map([
            { route: '', name: 'welcome', moduleId: './welcome/welcome', nav: true, title: '' },
            { route: 'workmode', name: 'workmode', moduleId: './workmode/workmode', nav: true, title: 'Work Mode' },
            { route: 'lan', name: 'lan', moduleId: './lan/lan', nav: true, title: 'LAN Settings' },
            { route: 'wifi', name: 'wifi', moduleId: './wifi/wifi', nav: true, title: 'Wireless Settings' },
            { route: 'vpn', name: 'vpn', moduleId: './vpn/vpn', nav: true, title: 'VPN Settings' },
            { route: 'system', name: 'system', moduleId: './system/system', nav: true, title: 'System' }
        ]);

        this.router = router;
    }
  
    activate() {
        this.overlay.close();
    }
  
}
