var googl = require('goo.gl'),
    assert = require('assert');

googl.setKey('<google shortener token>');

exports.urlShorten = async (url) => {
    var obj = await new Promise((resolve, reject) => {
    	console.log(url)
        googl.shorten(url)
            .then(function (shortUrl) {
		console.log("aaaaaaaaaaaa")
                resolve({ error: null, shortUrl: shortUrl })
            }).catch(function (err) {
		console.log("aaaaaaaaaaaa")
                resolve({ error: err, shortUrl: null })
            });
    })
    return obj
}
