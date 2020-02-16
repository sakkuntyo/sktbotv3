//bitlyの操作に必要
const bitlytoken = '<bitlyToken>'
const { BitlyClient } = require('bitly');
const bitly = new BitlyClient(bitlytoken, {});

exports.urlShorten = async (url) => {
  var obj = await new Promise((resolve, reject) => {
    console.log(url)
    //短縮リンク作成
    bitly.shorten(url)
    .then((res) => {
      console.log(res)
      resolve({error: null, shortUrl: res.url})
    }).catch((err) => {
      console.log(err)
      resolve({error: err, shortUrl: null})
    })
  })
  return obj
}
