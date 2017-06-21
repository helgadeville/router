export class System {
    heading = 'System';

    configureRouter(config, router) {
        config.map([
            { route: '', name: 'system-general', moduleId: './system-general', nav: true, title: 'General Information' },
            { route: 'password', name: 'password', moduleId: './password/password', nav: true, title: 'Password' },
            { route: 'configurations', name: 'configurations', moduleId: './configurations/configurations', nav: true, title: 'Configurations' },
            { route: 'reboot', name: 'reboot', moduleId: './reboot/reboot', nav: true, title: 'Reboot' }
        ]);
        this.router = router;
    }
}
