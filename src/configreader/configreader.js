/**
 * Main method of this class is "read" which takes standard openwrt text file
 * and translates it to an object with properties
 */

export class ConfigReader {
    
    getWords(line) {
        var n = line.indexOf(' ');
        if (n < 0) {
            n = line.indexOf('\t');
            if (n < 0) {
                return;
            }
        }
        var first = line.substring(0, n);
        line = line.substring(n + 1).trim();
        n = line.indexOf(' ')
        if (n < 0) {
            n = line.indexOf('\t');
            if (n < 0) {
                return;
            }
        }
        var second = line.substring(0, n);
        line = line.substring(n + 1).trim();
        if ((line.startsWith('\'') || line.startsWith('\"')) && (line.endsWith('\'') || line.endsWith('\"'))) {
            line = line.substring(1, line.length - 1);
        }
        return [ first, second, line ];
    }
    
    read(text) {
        var lines = text.split('\n');
        var object = {};
        var name = null;
        var current = null;
        for(var i = 0 ; i < lines.length ; i++) {
            var line = lines[i].trim();
            if (line) {
                var splt = this.getWords(line);
                if (splt) {
                    if (splt[0] === 'config') {
                        name = splt[1];
                        if (!object[name]) {
                            object[name] = [];
                        }
                        current = {
                            name: splt[2]
                        };
                        object[name].push(current);
                    } else
                    if (splt[0] === 'option') {
                        if (current) {
                            current[splt[1]] = splt[2];
                        } else {
                            console.log('Error: option with no config: ' + splt[1] + '/' + splt[2]);
                        }
                    }
                }
            }
        }
        return object;
    }
    
}