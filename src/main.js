import 'bootstrap';

export function configure(aurelia) {
  // configure aurelia
  aurelia.use
    .standardConfiguration()
    .developmentLogging();
  aurelia.use.plugin('aurelia-dialog');
  aurelia.use.plugin('aurelia-utility-converters');

  // start application
  aurelia.start().then(() => aurelia.setRoot());
}
