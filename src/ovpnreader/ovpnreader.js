export class OvpnReader {

    original = '';
    
    common = '';
    remotes = [];
    specials = {};
    cert = null;
    
    // lines that need to be changed or removed, no space after auth-user-pass here !
    special = [ 'ca ', 'cert ', 'key ', 'tls-auth ', 'auth-user-pass', 'log ', 'status ', 'script-security ', 'up ', 'down ' ];
    certs = [ '<ca>', '<cert>', '<key>', '<tls-auth>' ];
    
    read(txt, fileName) {
        this.original = txt;
        this.fileName = fileName;
        var lines = txt.split('\n');
        var hasCerts = {};
        var newLines = [];
        var newCert = [];
        var isCert = null;
        for(var i = 0 ; i < lines.length ; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            if (!isCert) {
                // read comment at beginning
                var commented = false;
                if (line.charAt(0) === '#') {
                    commented = true;
                    line = line.substring(1).trim();
                }
                // replace tabs
                line.replace(new RegExp('\t', 'g'),' ');
                // make lowercase for easier recognition
                var lowCase = line.toLowerCase();
                // extract remotes even when commented
                if (lowCase.indexOf('remote ') === 0) {
                    this.remotes.push({
                        remote : line,
                        active : !commented
                    });
                    // and skip
                    continue;
                }
                // now need to check for special lines
                var spec = null;
                for(var j = 0 ; j < lowCase.length ; j++) {
                    if (lowCase.indexOf(this.special[j]) === 0) {
                        spec = this.special[j];
                        break;
                    }
                }
                // skip special line
                if (spec) {
                    this.specials[spec] = line;
                    continue;
                }
                // now check for certificate(s)
                for(var cc = 0 ; cc < this.certs.length ; cc++) {
                    var chk = this.certs[cc];
                    if (lowCase.indexOf(chk) === 0) {
                        if (hasCerts[chk]) {
                            return 'Duplicated certificate: ' + chk;
                        }
                        hasCerts[chk] = true;
                        isCert = '</' + chk.substring(1);
                        newCert.push(line);
                        break;
                    }
                }
                if (!isCert) {
                    newLines.push(line);
                }
            } else {
                newCert.push(line);
                if (line.toLowerCase().indexOf(isCert) === 0) {
                    isCert = null;
                }
            }
        }
        // now reassemble common and cert, special and remotes will be dynamically added
        var output = '';
        for(var i = 0 ; i < newLines.length ; i++) {
            output += newLines[i] + '\n';
        }
        this.common = output;
        var cert = '';
        for(var i = 0 ; i < newCert.length ; i++) {
            cert += newCert[i] + '\n';
        }
        this.cert = cert;
        if (!this.common) {
            return 'Could not parse main configuration file.';
        }
        if (!this.remotes) {
            return 'No remote server address specified.';
        }
        if (!this.cert || !hasCerts['<ca>']) {
            return 'No server certificate specified.';
        }
    }
    
    original() {
        return this.original;
    }
    
    get(rmts) {
        // now remotes
        rmts = !rmts ? this.remotes : rmts;
        var output = this.common + '\n';
        for(var i = 0 ; i < rmts.length ; i++) {
            var rmt = rmts[i];
            if (rmt.active) {
                output += rmt.remote + '\n';
            }
        }
        // now special lines [ 'original-file', 'auth-user-pass', 'log ', 'status ', 'script-security ', 'up ', 'down ' ];
        if (this.fileName) {
            output = '#original-file=' + this.fileName + '\n' + output;
        }
        if (this.specials['auth-user-pass']) {
            output += 'auth-user-pass /etc/openvpn/.auth.txt\n';
        }
        output += 'log /var/log/openvpn.log\n';
        output += 'status /var/log/openvpn-status.log\n';
        output += 'script-security 2\n';
        output += 'up "/etc/openvpn/upvpn"\n';
        output += 'down "/etc/openvpn/downvpn"\n';
        // now certificate
        output += this.cert + '\n';
        return output;
    }
    
}