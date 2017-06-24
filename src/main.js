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
  // finally hide overlay by hand - do NOT use injectors here
  //document.getElementById('overlay-main').classList.add('noshow');
}
