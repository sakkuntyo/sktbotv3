require("date-utils");
console.log(new Date().toFormat("YYYY/MM/DD HH24:MI"))
var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var async = require('async');
var skLine = require('../lib/skLine')
var skFixedData = require('../lib/skFixedData')
var skScraping = require('../lib/skScraping')
var skSktbot = require('../lib/skSktbot')
var skGoogleAPI = require('../lib/skGoogleAPI')
var skBitlyAPI = require('../lib/skBitlyAPI')

var sqlite = require('sqlite3')

var database = new sqlite.Database('sktbot.db')

router.post('/webhook', function (req, res) {
  res.status(200).end;
  res.json({ webhook: 'called!' })

  try {
    console.log("--------------------")
    console.log(new Date().toFormat("YYYY/MM/DD HH24:MI"))
    console.log('events(debug) ->', JSON.stringify(req.body))

    var events = req.body.events
    for (var event of events) {

      console.log(event)
      // received info
      var message = event.message.text
      console.log("メッセージ", "->", message)
      var userId = event.source.userId
      console.log("ユーザーID", "->", userId)
      var groupId = event.source.groupId
      console.log("グループID", "->", groupId)
      var eventType = event.type
      console.log("イベントタイプ", "->", eventType)
      var eventSourceType = event.source.type
      console.log("イベントソースタイプ", "->", eventSourceType)
      var eventMessageType = event.message.type
      console.log("イベントメッセージタイプ", "->", eventMessageType)
      var splitMessage = []
      if (eventMessageType === "text") {
        splitMessage = message.split(":");
      }

      // info to reply
      var repObjects = []

      // message text
      if (eventType = "message" && eventMessageType == "text") {
        // 旧コマンド
        if (message.match(/y検索:/)) {
          repObjects.push(skLine.obj.mkMessage("youtubeの検索コマンドはyoutube:になりました"))
          skLine.replySend(event, repObjects)
        }
        else if (message.match(/検索:/)) {
          repObjects.push(skLine.obj.mkMessage("googleの検索コマンドはgoogle:になりました"))
          skLine.replySend(event, repObjects)
        }
        else if ((message === "まい" || message == "テォウ") && groupId === "C5be8d6b100cd49827c6ff45fb95ee15b") {
          repObjects.push(skLine.obj.mkMessage("回避失敗"))
          skLine.replySend(event, repObjects)
        }
        else if (message === "YKN" && groupId === "C5be8d6b100cd49827c6ff45fb95ee15b") {
          repObjects.push(skLine.obj.mkMessage("shut up"))
          skLine.replySend(event, repObjects)
        }
        else if (splitMessage[0] === "なかだい" || splitMessage[0] === "カーファッションニート") {
          repObjects.push(skLine.obj.mkMessage("カー用品、ファッションアイテムなどを販売しています。"))
          repObjects.push(skLine.obj.mkMessage("是非ご覧ください。"))
          repObjects.push(skLine.obj.mkMessage("https://carfashionneat.shop-pro.jp"))
          skLine.replySend(event, repObjects)
        }
        else if (message.match(/プロフィール/)) {
          skLine.info.getProfile(userId, function (profile) {
            var txt = profile.displayName + "さんですね。"
            repObjects.push(skLine.obj.mkMessage(txt))
            var txt2 = "以下、あなたのプロフィールです。"
            repObjects.push(skLine.obj.mkMessage(txt2))
            var txt3 = "ID -> " + profile.userId
            repObjects.push(skLine.obj.mkMessage(txt3))
            var txt4 = "メッセージ -> " + profile.statusMessage
            repObjects.push(skLine.obj.mkMessage(txt4))
            var imgUrl = profile.pictureUrl
            repObjects.push(skLine.obj.mkMessage("画像 -> " + imgUrl))
            skLine.replySend(event, repObjects)
          })
        }

        //nukist検索パターン
        else if (splitMessage[0] === "18" && eventSourceType === "user") {
          skScraping.xxxSearch2(splitMessage[1], (err, results) => {
            var carousel = skLine.obj.mkCarousel("動画リスト", [])
            repObjects.push(carousel)
            for (var i = 0; i < results.length; i++) {
              var act = skLine.act.mkUrl("動画を見る", results[i].mvUrl)
              var column = skLine.clm.mkImg("https://lh3.googleusercontent.com/kroer1kpwSe3j-lIfPnE7Q3MVaCoJVF8atjdh0VtGDWCz2ulLejVsDh2k6a6VUgpUFQ8qRMHMEX7bsr2jTrLXhZR_ETbqILDf-qfkk0=h128", "#FFFFFF", results[i].title.substring(0, 40), results[i].tags.toString().substring(0, 60), [act])
              carousel.template.columns.push(column)
              if (i == 9) { break; }
            }
            skLine.replySend(event, repObjects)
          })
        }

        //youtube検索パターン
        else if (splitMessage[0] === "youtube") {
          skScraping.youtubeSearch(splitMessage[1], (results) => {
            var carousel = skLine.obj.mkCarousel("動画リスト", [])
            repObjects.push(carousel)
            for (var i = 0; i < results.length; i++) {
              var act = skLine.act.mkUrl("動画を見る", results[i].mvUrl)
              var column = skLine.clm.mkImg(results[i].thumUrl, "#FFFFFF", results[i].title.substring(0, 40), " ", [act])
              carousel.template.columns.push(column)
              if (i == 9) { break; }
            }
            skLine.replySend(event, repObjects)
          })
        }

        //グーグル検索パターン
        else if (splitMessage[0] === "google") {
          skScraping.googleSearch(splitMessage[1], (err, infos) => {
            var carousel = skLine.obj.mkCarousel("記事リスト", [])
            repObjects.push(carousel)
            async.eachLimit(infos, 1, (info, next) => {
              var title = info.title.substring(0, 40)
              var subTitle = info.subTitle.substring(0, 60)
              skBitlyAPI.urlShorten(info.url)
              .then((result) => {
                if (result.error) throw result.error
                var index = infos.indexOf(info)
                var url = result.shortUrl
                var actUrl = skLine.act.mkUrl("記事を見る", url)
                var actPostback = skLine.act.mkPostback("お気に入り登録", "まだこの機能は使えません", `action=addFav&title=${title}&subTitle=${subTitle}&url=${url}`)
                var column = skLine.clm.mkImg("https://lh3.googleusercontent.com/kroer1kpwSe3j-lIfPnE7Q3MVaCoJVF8atjdh0VtGDWCz2ulLejVsDh2k6a6VUgpUFQ8qRMHMEX7bsr2jTrLXhZR_ETbqILDf-qfkk0=h128", "#FFFFFF", title, subTitle, [actPostback, actUrl])
                carousel.template.columns.push(column)
                next()
              })
            }, (err) => {
              if (err) throw err
              skLine.replySend(event, repObjects)
            })
          })
        }

        //amazon検索パターン
        else if (splitMessage[0] === "amazon") {
          skScraping.amazonSearch(splitMessage[1], (infos) => {
            infos.splice(9, infos.length - 10) //数を１０個に減らす
            var carousel = skLine.obj.mkCarousel("商品リスト", [])
            repObjects.push(carousel)
            async.eachLimit(infos, 1, (info, next) => {
              var title = info.title.substring(0, 40)
              skGoogleAPI.urlShorten(info.url).then((result) => {
                if (result.error) throw result.error
                var url = result.shortUrl
                if (info.value === "") {
                  info.value = "売り切れ"
                }
                var actUrl = skLine.act.mkUrl("商品を見る", url)
                var column = skLine.clm.mkImg(info.thumUrl, "#FFFFFF", title, info.value, [actUrl])
                carousel.template.columns.push(column)
                next()
              })
            }, (err) => {
              if (err) throw err
              skLine.replySend(event, repObjects)
            })
          })
        }

        //mp3dl
        else if(splitMessage[0] === "mp3dl"){
            skLine.replySend(event,{"type":"audio",
                                    "originalContentUrl":"https://xxw.wywx.xyz/dda978d86399d4e68fe31cc879e426d9/jlgjY32SLsE",
                                    "duration":60000 
                                     })
        }
      }
      if (event.type === "postback") {
        console.log("postback event!")
      }
      if (event.type === "beacon") {
        console.log("beacon event!")
      }
    }
    console.log("--------------------")
  }
  catch (e) {
    console.log('webhook error!')
    console.log(e);
  }
});

module.exports = router;
