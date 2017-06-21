var rootDir = '/';
var appRoot = 'src/';
var outputRoot = 'dist/';
var exportSrvRoot = 'export/';

module.exports = {
  master: rootDir,
  root: appRoot,
  source: appRoot + '**/*.js',
  scripts: rootDir + 'cgi-bin/**/*.json',
  html: appRoot + '**/*.html',
  css: appRoot + '**/*.css',
  style: 'styles/**/*.css',
  output: outputRoot,
  cgiOutput: rootDir + 'cgi-bin/',
  exportSrv: exportSrvRoot,
  doc: './doc'
};
