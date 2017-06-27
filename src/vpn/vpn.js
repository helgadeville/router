export class Vpn {
    heading = 'OpenVPN';

    configureRouter(config, router) {
        config.map([
            { route: '', name: 'vpn-general', moduleId: './vpn-general', nav: true, title: 'General Information' },
            { route: 'current', name: 'current', moduleId: './current/current', nav: true, title: 'Current Configuration' },
            { route: 'configs', name: 'configs', moduleId: './configs/configs', nav: true, title: 'Configurations' },
            { route: 'log', name: 'log', moduleId: './log/log', nav: true, title: 'OpenVPN log' }
        ]);
        this.router = router;
    }
}