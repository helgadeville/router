export class OvpnReader {

    original = '';
    
    common = '';
    remotes = [];
    specials = [];
    cert = null;
    
    // lines that need to be changed or removed, no space after auth-user-pass here !
    special = [ 'auth-user-pass', 'log ', 'status ', 'script-security ', 'up ', 'down ' ];
    
    read(txt) {
        this.original = txt;
        var lines = txt.split('\n');
        var newLines = [];
        var newCert = [];
        var isCert = false;
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
                // strip everything that is past the comment NOT at the beginning
                line.replace(new RegExp('\#.*', 'g'), '');
                // replace tabs
                line.replace(new RegExp('\t', 'g'),' ');
                // make lowercase for easier recognition
                var lowCase = line.toLowerCase();
                // extract remotes even when commented
                if (lowCase.indexOf('remote ') === 0) {
                    remotes.push({
                        remote : line,
                        active : !commented
                    });
                    // and skip
                    continue;
                }
                // skip commented lines
                if (commented) continue;
                // now need to check for special lines
                var spec = false;
                for(var j = 0 ; j < lowCase.length ; j++) {
                    if (lowCase.indexOf(this.special[j]) === 0) {
                        spec = true;
                        break;
                    }
                }
                // skip special line
                if (spec) {
                    specials.push(line);
                    continue;
                }
                // now check for certificate
                if (lowCase.indexOf('<ca>' === 0)) {
                    isCert = true;
                    newCert.push(line);
                } else {
                    newLines.push(line);
                }
            } else {
                newCert.push(line);
                if (line.toLowerCase().indexOf('</ca>') === 0) {
                    isCert = false;
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
            cert += newCert[i];
        }
        this.cert = cert;
        return this.common && this.allRemotes && this.cert ? true : false;
    }
    
    original() {
        return this.original;
    }
    
    get(rmts) {
        // now remotes
        if (rmts == undefined) {
            rmts = this.remotes;
        }
        var output = this.output + '\n';
        for(var i = 0 ; i < rmts.length ; i++) {
            var rmt = rmts[i];
            if (rmt.active) {
                output += rmt.remote + '\n';
            }
        }
        // now special lines [ 'auth-user-pass', 'log ', 'status ', 'script-security ', 'up ', 'down ' ];
        output += 'auth-user-pass /etc/openvpn/auth.txt\n';
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