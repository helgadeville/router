import 'bootstrap';

export function configure(aurelia) {
  // configure aurelia
  aurelia.use
    .standardConfiguration()
    .developmentLogging();
  aurelia.use.plugin('aurelia-dialog');

  // start application
  aurelia.start().then(() => aurelia.setRoot());
}
