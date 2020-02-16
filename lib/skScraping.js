//共通
var async = require('async');

// google検索
var client = require('cheerio-httpcli');

// Googleで検索する処理
exports.googleSearch = (phrase, callback) => {
    client.fetch('http://www.google.com/search', { q: phrase }, (err, $, res) => {
        var retInfos = []
        // 記事のタイトルとURL
        async.eachLimit($("[class='rc']"), 1, (data, next) => {
            var title = $(data).children("[class='r']").children("a").text()
            var subTitle = $(data).find("[class='st']").text()
            var url = $(data).children("[class='r']").children("a").attr("href")
            retInfos.push({ title: title, subTitle: subTitle, url: url })
            next()
        }, (err) => {
            if (err) { console.log(err) }
            callback(err, retInfos)
        })
    });
}

//youtubeで動画検索する処理
exports.youtubeSearch = (keyword, callback) => {
    const nightmare = Nightmare({ show: true })
    nightmare
        .goto('https://www.youtube.com/results?search_query=' + keyword)
        .evaluate(() => {
            //urlからクエリ取得をする処理
            var getQueryKeyValues = function (url) {
                //keyとvalueを格納するobject
                var retKeyValuesObj = {}

                // URLを取得して「?」で分割してクエリ
                var queryList = url.split('?');
                queryList.shift()

                // 分割したクエリ文字列の配列から、値を取り出す
                queryList.forEach(function (e, i, a) {
                    var tmpArray = e.split('=');
                    var key = tmpArray[0]
                    var value = tmpArray[1]
                    retKeyValuesObj[key] = value
                })
                return retKeyValuesObj;

                //参考:https://qiita.com/masarufuruya/items/d29a567d0ca4bbfb00cb
            }

            retDatas = []
            var dismissables = document.querySelectorAll("[id='dismissable']")

            for (var i = 0; i < dismissables.length; i++) {
                var mvUrl = "https://www.youtube.com" + dismissables[i].querySelector("[id='thumbnail']").getAttribute("href")
                var title = dismissables[i].querySelector("[id='video-title']").innerHTML
                var mvId = getQueryKeyValues(mvUrl).v
                var thumUrl = "https://i.ytimg.com/vi/" + mvId + "/sddefault.jpg"
                retDatas.push({ title: title, mvUrl: mvUrl, thumUrl: thumUrl })
            }
            return retDatas
        })
        .end()
        .then((data) => {
            console.log(data)
            callback(data)
        })
        .catch(error => {
            if (error) throw error
        })
}

//amazon
exports.amazonSearch = (phrase, callback) => {
    client.fetch('https://www.amazon.co.jp/s/ref=nb_sb_noss_2?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&url=search-alias%3Daps', { 'field-keywords': phrase }, (err, $, res) => {
        var infos = []
        async.eachLimit($("html").find("[class='s-item-container']"), 1, (data, next) => {
            if ($(data).find("[class='a-spacing-none a-color-tertiary  s-sponsored-header sp-pixel-data a-text-normal']").length != 0) { next() }
            else {
                var thumUrl = $($(data).find("img")[0]).attr("src")
                var title = $($(data).find("[class='a-size-base s-inline  s-access-title  a-text-normal']")[0]).html()
                var url = $($(data).find("[class='a-link-normal s-access-detail-page  s-color-twister-title-link a-text-normal']")[0]).attr("href")
                var value = $($(data).find("[class='a-size-base a-color-price s-price a-text-bold']")[0]).text()
                infos.push({ thumUrl: thumUrl, title: title, url: url, value: value })
                next()
            }
        })
        callback(infos)
    });
}
