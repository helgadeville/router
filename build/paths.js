var rootDir = '/';
var appRoot = 'src/';
var outputRoot = 'dist/';
var exportSrvRoot = 'export/';

module.exports = {
  master: rootDir,
  root: appRoot,
  source: appRoot + '**/*.js',
  jsons: rootDir + 'cgi-bin/**/*.json',
  texts: rootDir + 'cgi-bin/**/*.text',
  imgs: rootDir + 'img/**/*.png',
  html: appRoot + '**/*.html',
  css: appRoot + '**/*.css',
  style: 'styles/**/*.css',
  output: outputRoot,
  cgiOutput: rootDir + 'cgi-bin/',
  imgOutput: rootDir + 'img/',
  exportSrv: exportSrvRoot,
  doc: './doc'
};
