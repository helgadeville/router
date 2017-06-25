/**
 * Main method of this class is "read" which takes standard openwrt text file
 * and translates it to an object with properties
 */

export class UciReader {

    read(text) {
        var lines = text.split('\n');
        var object = {};
        for(var i = 0 ; i < lines.length ; i++) {
            var line = lines[i].trim();
            if (line) {
                var equals = line.indexOf('=');
                if (equals > 0) {
                    var key = line.substring(0, equals).trim();
                    var value = line.substring(equals + 1).trim();
                    if ((value.startsWith('\'') || value.startsWith('\"')) && (value.endsWith('\'') || value.endsWith('\"'))) {
                        value = value.substring(1, value.length - 1);
                    }
                    if (key && value) {
                        var obj, name;
                        var dot = key.indexOf('.');
                        if (dot < 0) {
                            obj = key;
                            name = '#';
                        } else {
                            obj = key.substring(0, dot);
                            name = key.substring(dot + 1);
                        }
                        if (obj && name) {
                            object[obj] = object[obj] || {};
                            object[obj][name] = value;
                        }
                    }
                }
            }
        }
        // transcode
        var ret = {};
        for(var name in object) {
            var obj = object[name];
            var tag = obj['#'];
            if (!ret[tag]) {
                ret[tag] = [];
            }
            obj['#'] = name;
            ret[tag].push(obj);
        }
        return ret;
    }
    
}