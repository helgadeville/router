export class DnsHelper {
    
    dnses = [
        { name : 'Google', ip: [ '8.8.8.8', '8.8.4.4' ] },
        { name : 'Level3', ip: [ '209.244.0.3', '209.244.0.4' ] },
        { name : 'Verisign', ip: [ '64.6.64.6', '64.6.65.6' ] },
        { name : 'DNS.WATCH', ip: [ '84.200.69.80', '84.200.70.40' ] },
        { name : 'Comodo Secure DNS', ip: [ '8.26.56.26', '8.20.247.20' ] },
        { name : 'OpenDNS Home', ip: [ '208.67.222.222', '208.67.220.220' ] },
        { name : 'Norton ConnectSafe', ip: [ '199.85.126.10', '199.85.127.10' ] },
        { name : 'GreenTeamDNS', ip: [ '81.218.119.11', '209.88.198.133' ] },
        { name : 'SafeDNS', ip: [ '195.46.39.39', '195.46.39.40' ] },
        { name : 'OpenNIC', ip: [ '96.90.175.167', '193.183.98.154' ] },
        { name : 'SmartViper', ip: [ '208.76.50.50', '208.76.51.51' ] },
        { name : 'Dyn', ip: [ '216.146.35.35', '216.146.36.36' ] },
        { name : 'FreeDNS', ip: [ '37.235.1.174', '37.235.1.177' ] },
        { name : 'Alternate DNS', ip: [ '198.101.242.72', '23.253.163.53' ] },
        { name : 'Yandex.DNS', ip: [ '77.88.8.8', '77.88.8.1' ] },
        { name : 'UncensoredDNS', ip: [ '91.239.100.100', '89.233.43.71' ] },
        { name : 'Hurricane Electric', ip: [ '74.82.42.42' ] },
        { name : 'puntCAT', ip: [ '109.69.8.51' ] }
    ];
    
    get list() {
        return this.dnses;
    }
    
    get names() {
        var ret = [];
        for(var i = 0 ; i < this.dnses.length ; i++) {
            ret.push(this.dnses[i].name);
        }
        ret.sort();
        return ret;
    }
    
    get ips() {
        var ret = [];
        for(var i = 0 ; i < this.dnses.length ; i++) {
            ret = ret.concat(this.dnses[i].ip);
        }
        return ret;
    }
    
    ipFromName(name) {
        // will return array of values or null
        for(var i = 0 ; i < this.dnses.length ; i++) {
            if (this.dnses[i].name === name) {
                return this.dnses[i].ip;
            }
        }
    }
    
    nameFromIp(values) {
        // values can be 1...n element array, must match every one
        for(var i = 0 ; i < this.dnses.length ; i++) {
            var dns = this.dnses[i];
            if (values.length === dns.ip.length) {
                var matched = 0;
                for(var j = 0 ; j < values.length ; j++) {
                    for(var k = 0 ; k < dns.ip.length ; k++) {
                        if (dns.ip[k] === values[j]) {
                            matched++;
                        }
                    }
                }
                if (matched === values.length) {
                    return dns.name;
                }
            }
        }
    }
    
}