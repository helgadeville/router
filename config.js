System.config({
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "*": "dist/*",
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
  map: {
    "aurelia-bootstrapper": "npm:aurelia-bootstrapper@1.0.0",
    "aurelia-dialog": "npm:aurelia-dialog@1.0.0-rc.1.0.3",
    "aurelia-framework": "npm:aurelia-framework@1.0.6",
    "aurelia-http-client": "npm:aurelia-http-client@1.1.1",
    "aurelia-loader-default": "npm:aurelia-loader-default@1.0.0",
    "aurelia-logging-console": "npm:aurelia-logging-console@1.0.0",
    "aurelia-pal-browser": "npm:aurelia-pal-browser@1.0.0",
    "aurelia-polyfills": "npm:aurelia-polyfills@1.1.1",
    "aurelia-router": "npm:aurelia-router@1.0.6",
    "aurelia-templating-binding": "npm:aurelia-templating-binding@1.0.0",
    "aurelia-templating-resources": "npm:aurelia-templating-resources@1.1.1",
    "aurelia-templating-router": "npm:aurelia-templating-router@1.0.0",
    "bootstrap": "github:twbs/bootstrap@3.3.7",
    "fetch": "github:github/fetch@1.0.0",
    "font-awesome": "npm:font-awesome@4.6.3",
    "jquery": "npm:jquery@2.2.4",
    "text": "github:systemjs/plugin-text@0.0.8",
    "github:twbs/bootstrap@3.3.7": {
      "jquery": "npm:jquery@2.2.4"
    },
    "npm:aurelia-binding@1.2.1": {
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0"
    },
    "npm:aurelia-bootstrapper@1.0.0": {
      "aurelia-event-aggregator": "npm:aurelia-event-aggregator@1.0.0",
      "aurelia-framework": "npm:aurelia-framework@1.0.6",
      "aurelia-history": "npm:aurelia-history@1.0.0",
      "aurelia-history-browser": "npm:aurelia-history-browser@1.0.0",
      "aurelia-loader-default": "npm:aurelia-loader-default@1.0.0",
      "aurelia-logging-console": "npm:aurelia-logging-console@1.0.0",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-pal-browser": "npm:aurelia-pal-browser@1.0.0",
      "aurelia-polyfills": "npm:aurelia-polyfills@1.1.1",
      "aurelia-router": "npm:aurelia-router@1.0.6",
      "aurelia-templating": "npm:aurelia-templating@1.4.2",
      "aurelia-templating-binding": "npm:aurelia-templating-binding@1.0.0",
      "aurelia-templating-resources": "npm:aurelia-templating-resources@1.1.1",
      "aurelia-templating-router": "npm:aurelia-templating-router@1.0.0"
    },
    "npm:aurelia-dependency-injection@1.3.1": {
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-dialog@1.0.0-rc.1.0.3": {
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-event-aggregator@1.0.0": {
      "aurelia-logging": "npm:aurelia-logging@1.3.1"
    },
    "npm:aurelia-framework@1.0.6": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-history-browser@1.0.0": {
      "aurelia-history": "npm:aurelia-history@1.0.0",
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-http-client@1.1.1": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1"
    },
    "npm:aurelia-loader-default@1.0.0": {
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-loader@1.0.0": {
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-path": "npm:aurelia-path@1.1.1"
    },
    "npm:aurelia-logging-console@1.0.0": {
      "aurelia-logging": "npm:aurelia-logging@1.3.1"
    },
    "npm:aurelia-metadata@1.0.3": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-pal-browser@1.0.0": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-polyfills@1.1.1": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-route-recognizer@1.1.0": {
      "aurelia-path": "npm:aurelia-path@1.1.1"
    },
    "npm:aurelia-router@1.0.6": {
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-event-aggregator": "npm:aurelia-event-aggregator@1.0.0",
      "aurelia-history": "npm:aurelia-history@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-route-recognizer": "npm:aurelia-route-recognizer@1.1.0"
    },
    "npm:aurelia-task-queue@1.2.0": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-templating-binding@1.0.0": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-templating-resources@1.1.1": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-templating-router@1.0.0": {
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-router": "npm:aurelia-router@1.0.6",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-templating@1.4.2": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0"
    },
    "npm:font-awesome@4.6.3": {
      "css": "github:systemjs/plugin-css@0.1.31"
    }
  },
  bundles: {
    "aurelia.js": [
      "github:github/fetch@1.0.0.js",
      "github:github/fetch@1.0.0/fetch.js",
      "github:twbs/bootstrap@3.3.7.js",
      "github:twbs/bootstrap@3.3.7/css/bootstrap.css!github:systemjs/plugin-text@0.0.8.js",
      "github:twbs/bootstrap@3.3.7/js/bootstrap.js",
      "npm:aurelia-binding@1.2.1.js",
      "npm:aurelia-binding@1.2.1/aurelia-binding.js",
      "npm:aurelia-bootstrapper@1.0.0.js",
      "npm:aurelia-bootstrapper@1.0.0/aurelia-bootstrapper.js",
      "npm:aurelia-dependency-injection@1.3.1.js",
      "npm:aurelia-dependency-injection@1.3.1/aurelia-dependency-injection.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/attach-focus.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/aurelia-dialog.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/dialog-cancel-error.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/dialog-configuration.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/dialog-controller.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/dialog-renderer.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/dialog-service.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/dialog-settings.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/lifecycle.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/renderer.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/ux-dialog-body.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/ux-dialog-footer.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/ux-dialog-header.js",
      "npm:aurelia-dialog@1.0.0-rc.1.0.3/ux-dialog.js",
      "npm:aurelia-event-aggregator@1.0.0.js",
      "npm:aurelia-event-aggregator@1.0.0/aurelia-event-aggregator.js",
      "npm:aurelia-framework@1.0.6.js",
      "npm:aurelia-framework@1.0.6/aurelia-framework.js",
      "npm:aurelia-history-browser@1.0.0.js",
      "npm:aurelia-history-browser@1.0.0/aurelia-history-browser.js",
      "npm:aurelia-history@1.0.0.js",
      "npm:aurelia-history@1.0.0/aurelia-history.js",
      "npm:aurelia-http-client@1.1.1.js",
      "npm:aurelia-http-client@1.1.1/aurelia-http-client.js",
      "npm:aurelia-loader-default@1.0.0.js",
      "npm:aurelia-loader-default@1.0.0/aurelia-loader-default.js",
      "npm:aurelia-loader@1.0.0.js",
      "npm:aurelia-loader@1.0.0/aurelia-loader.js",
      "npm:aurelia-logging-console@1.0.0.js",
      "npm:aurelia-logging-console@1.0.0/aurelia-logging-console.js",
      "npm:aurelia-logging@1.3.1.js",
      "npm:aurelia-logging@1.3.1/aurelia-logging.js",
      "npm:aurelia-metadata@1.0.3.js",
      "npm:aurelia-metadata@1.0.3/aurelia-metadata.js",
      "npm:aurelia-pal-browser@1.0.0.js",
      "npm:aurelia-pal-browser@1.0.0/aurelia-pal-browser.js",
      "npm:aurelia-pal@1.3.0.js",
      "npm:aurelia-pal@1.3.0/aurelia-pal.js",
      "npm:aurelia-path@1.1.1.js",
      "npm:aurelia-path@1.1.1/aurelia-path.js",
      "npm:aurelia-polyfills@1.1.1.js",
      "npm:aurelia-polyfills@1.1.1/aurelia-polyfills.js",
      "npm:aurelia-route-recognizer@1.1.0.js",
      "npm:aurelia-route-recognizer@1.1.0/aurelia-route-recognizer.js",
      "npm:aurelia-router@1.0.6.js",
      "npm:aurelia-router@1.0.6/aurelia-router.js",
      "npm:aurelia-task-queue@1.2.0.js",
      "npm:aurelia-task-queue@1.2.0/aurelia-task-queue.js",
      "npm:aurelia-templating-binding@1.0.0.js",
      "npm:aurelia-templating-binding@1.0.0/aurelia-templating-binding.js",
      "npm:aurelia-templating-resources@1.1.1.js",
      "npm:aurelia-templating-resources@1.1.1/abstract-repeater.js",
      "npm:aurelia-templating-resources@1.1.1/analyze-view-factory.js",
      "npm:aurelia-templating-resources@1.1.1/array-repeat-strategy.js",
      "npm:aurelia-templating-resources@1.1.1/attr-binding-behavior.js",
      "npm:aurelia-templating-resources@1.1.1/aurelia-hide-style.js",
      "npm:aurelia-templating-resources@1.1.1/aurelia-templating-resources.js",
      "npm:aurelia-templating-resources@1.1.1/binding-mode-behaviors.js",
      "npm:aurelia-templating-resources@1.1.1/binding-signaler.js",
      "npm:aurelia-templating-resources@1.1.1/compose.js",
      "npm:aurelia-templating-resources@1.1.1/css-resource.js",
      "npm:aurelia-templating-resources@1.1.1/debounce-binding-behavior.js",
      "npm:aurelia-templating-resources@1.1.1/dynamic-element.js",
      "npm:aurelia-templating-resources@1.1.1/focus.js",
      "npm:aurelia-templating-resources@1.1.1/hide.js",
      "npm:aurelia-templating-resources@1.1.1/html-resource-plugin.js",
      "npm:aurelia-templating-resources@1.1.1/html-sanitizer.js",
      "npm:aurelia-templating-resources@1.1.1/if.js",
      "npm:aurelia-templating-resources@1.1.1/map-repeat-strategy.js",
      "npm:aurelia-templating-resources@1.1.1/null-repeat-strategy.js",
      "npm:aurelia-templating-resources@1.1.1/number-repeat-strategy.js",
      "npm:aurelia-templating-resources@1.1.1/repeat-strategy-locator.js",
      "npm:aurelia-templating-resources@1.1.1/repeat-utilities.js",
      "npm:aurelia-templating-resources@1.1.1/repeat.js",
      "npm:aurelia-templating-resources@1.1.1/replaceable.js",
      "npm:aurelia-templating-resources@1.1.1/sanitize-html.js",
      "npm:aurelia-templating-resources@1.1.1/set-repeat-strategy.js",
      "npm:aurelia-templating-resources@1.1.1/show.js",
      "npm:aurelia-templating-resources@1.1.1/signal-binding-behavior.js",
      "npm:aurelia-templating-resources@1.1.1/throttle-binding-behavior.js",
      "npm:aurelia-templating-resources@1.1.1/update-trigger-binding-behavior.js",
      "npm:aurelia-templating-resources@1.1.1/with.js",
      "npm:aurelia-templating-router@1.0.0.js",
      "npm:aurelia-templating-router@1.0.0/aurelia-templating-router.js",
      "npm:aurelia-templating-router@1.0.0/route-href.js",
      "npm:aurelia-templating-router@1.0.0/route-loader.js",
      "npm:aurelia-templating-router@1.0.0/router-view.js",
      "npm:aurelia-templating@1.4.2.js",
      "npm:aurelia-templating@1.4.2/aurelia-templating.js",
      "npm:jquery@2.2.4.js",
      "npm:jquery@2.2.4/dist/jquery.js"
    ],
    "app-build.js": [
      "app.html!github:systemjs/plugin-text@0.0.8.js",
      "app.js",
      "configreader/configreader.js",
      "configreader/ucireader.js",
      "dns/dns.html!github:systemjs/plugin-text@0.0.8.js",
      "dns/dns.js",
      "dns/dnshelper.js",
      "formencoder/formencoder.js",
      "lan/lan.html!github:systemjs/plugin-text@0.0.8.js",
      "lan/lan.js",
      "main.js",
      "modal/basic.html!github:systemjs/plugin-text@0.0.8.js",
      "modal/basic.js",
      "modal/dialogs.js",
      "modal/saved.html!github:systemjs/plugin-text@0.0.8.js",
      "modal/saved.js",
      "modal/scan.html!github:systemjs/plugin-text@0.0.8.js",
      "modal/scan.js",
      "nav-bar.html!github:systemjs/plugin-text@0.0.8.js",
      "overlay/overlay.js",
      "ovpnreader/ovpnreader.js",
      "storage/storage.html!github:systemjs/plugin-text@0.0.8.js",
      "storage/storage.js",
      "system/configurations/configurations.html!github:systemjs/plugin-text@0.0.8.js",
      "system/configurations/configurations.js",
      "system/dhcpclients/dhcpclients.html!github:systemjs/plugin-text@0.0.8.js",
      "system/dhcpclients/dhcpclients.js",
      "system/dmesg/dmesg.html!github:systemjs/plugin-text@0.0.8.js",
      "system/dmesg/dmesg.js",
      "system/logread/logread.html!github:systemjs/plugin-text@0.0.8.js",
      "system/logread/logread.js",
      "system/name/name.html!github:systemjs/plugin-text@0.0.8.js",
      "system/name/name.js",
      "system/password/password.html!github:systemjs/plugin-text@0.0.8.js",
      "system/password/password.js",
      "system/reboot/reboot.html!github:systemjs/plugin-text@0.0.8.js",
      "system/reboot/reboot.js",
      "system/system-general.html!github:systemjs/plugin-text@0.0.8.js",
      "system/system-general.js",
      "system/system.html!github:systemjs/plugin-text@0.0.8.js",
      "system/system.js",
      "system/upgrade/upgrade.html!github:systemjs/plugin-text@0.0.8.js",
      "system/upgrade/upgrade.js",
      "vpn/configs/configs.html!github:systemjs/plugin-text@0.0.8.js",
      "vpn/configs/configs.js",
      "vpn/current/current.html!github:systemjs/plugin-text@0.0.8.js",
      "vpn/current/current.js",
      "vpn/log/log.html!github:systemjs/plugin-text@0.0.8.js",
      "vpn/log/log.js",
      "vpn/vpn-general.html!github:systemjs/plugin-text@0.0.8.js",
      "vpn/vpn-general.js",
      "vpn/vpn.html!github:systemjs/plugin-text@0.0.8.js",
      "vpn/vpn.js",
      "welcome/welcome.html!github:systemjs/plugin-text@0.0.8.js",
      "welcome/welcome.js",
      "wifi/wifi.html!github:systemjs/plugin-text@0.0.8.js",
      "wifi/wifi.js",
      "workmode/workmode.html!github:systemjs/plugin-text@0.0.8.js",
      "workmode/workmode.js"
    ]
  },
  depCache: {
    "app.js": [
      "aurelia-framework",
      "overlay/overlay"
    ],
    "dns/dns.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay",
      "dns/dnshelper"
    ],
    "formencoder/formencoder.js": [
      "aurelia-framework",
      "aurelia-http-client"
    ],
    "lan/lan.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay",
      "configreader/ucireader"
    ],
    "main.js": [
      "bootstrap"
    ],
    "modal/basic.js": [
      "aurelia-framework",
      "aurelia-dialog"
    ],
    "modal/dialogs.js": [
      "aurelia-framework",
      "aurelia-dialog",
      "modal/basic"
    ],
    "modal/saved.js": [
      "aurelia-framework",
      "aurelia-dialog",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "modal/scan.js": [
      "aurelia-framework",
      "aurelia-dialog"
    ],
    "storage/storage.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay"
    ],
    "system/configurations/configurations.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay"
    ],
    "system/dhcpclients/dhcpclients.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "system/dmesg/dmesg.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "system/logread/logread.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "system/name/name.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay"
    ],
    "system/password/password.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay"
    ],
    "system/reboot/reboot.js": [
      "aurelia-framework",
      "modal/dialogs",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "system/system-general.js": [
      "aurelia-framework",
      "formencoder/formencoder"
    ],
    "system/upgrade/upgrade.js": [
      "aurelia-framework",
      "modal/dialogs",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "vpn/configs/configs.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay",
      "ovpnreader/ovpnreader"
    ],
    "vpn/current/current.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay",
      "ovpnreader/ovpnreader"
    ],
    "vpn/log/log.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "overlay/overlay"
    ],
    "vpn/vpn-general.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay"
    ],
    "welcome/welcome.js": [
      "aurelia-framework",
      "aurelia-router",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay"
    ],
    "wifi/wifi.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "overlay/overlay",
      "configreader/ucireader"
    ],
    "workmode/workmode.js": [
      "aurelia-framework",
      "formencoder/formencoder",
      "modal/dialogs",
      "aurelia-dialog",
      "overlay/overlay",
      "modal/scan",
      "modal/saved"
    ]
  }
});