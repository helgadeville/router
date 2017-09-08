export class System {
    heading = 'System';

    configureRouter(config, router) {
        config.map([
            { route: '', name: 'system-general', moduleId: './system-general', nav: true, title: 'General Information' },
            { route: 'password', name: 'password', moduleId: './password/password', nav: true, title: 'Password' },
            { route: 'configurations', name: 'configurations', moduleId: './configurations/configurations', nav: true, title: 'Configurations' },
            { route: 'logread', name: 'logread', moduleId: './logread/logread', nav: true, title: 'LOGREAD command' },
            { route: 'dmesg', name: 'dmesg', moduleId: './dmesg/dmesg', nav: true, title: 'DMESG command' },
            { route: 'reboot', name: 'reboot', moduleId: './reboot/reboot', nav: true, title: 'Reboot' },
            { route: 'upgrade', name: 'upgrade', moduleId: './upgrade/upgrade', nav: true, title: 'Upgrade' }
        ]);
        this.router = router;
    }
}
