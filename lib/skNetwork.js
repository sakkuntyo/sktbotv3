// ipv4Address
exports.ipv4Address = function () {
    var ipv4 = {}
    var interfaces = require('os').networkInterfaces();

    for (var dev in interfaces) {
        interfaces[dev].forEach(function (details) {
            if (details.internal == false && details.family == "IPv4") {
                ipv4 = details.address;
            }
        });
    }
    return ipv4
};
