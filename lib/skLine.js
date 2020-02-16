var request = require("request");

var line = require('@line/bot-sdk')

var client = new line.Client({
  channelAccessToken: process.env.NODE_Line_Authorization
});

// replySend
exports.replySend = function (event, msgObjects) {
  client.replyMessage(event.replyToken, msgObjects)
    .then(() => {
      console.log("reply success")
    })
    .catch((err) => {
      console.log(err)
    });
}

///// info
var info = new Object();
exports.info = info;

//get user profile
info.getProfile = function (userId, callback) {
  client.getProfile(userId).then((profile) => {
    console.log(profile.displayName);
    console.log(profile.userId);
    if (typeof profile.pictureUrl === "undefined") { profile.pictureUrl = "" }
    console.log(profile.pictureUrl);
    if (typeof profile.statusMessage === "undefined") { profile.statusMessage = "" }
    console.log(profile.statusMessage);
    callback(profile)
  }).catch((err) => {
    console.log(err)
  })
}

/***
need verified account
***/
//get GroupMemberIds
info.getGroupMemberIds = function (groupId, callback) {
  client.getGroupMemberIds(groupId)
    .then((ids) => {
      callback(ids)
    }).catch((err) => {
      console.log(err)
    })
}

///// make Object Funcs
var obj = new Object();
exports.obj = obj;

//make messageObj
obj.mkMessage = function (text) {
  return {
    "type": "text",
    "text": text
  }
}

//make imageObj
obj.mkImage = function (contentUrl, previewUrl) {
  return {
    "type": "image",
    "originalContentUrl": contentUrl,
    "previewImageUrl": previewUrl
  }
}

//make CarouselObj
obj.mkCarousel = function (altText, columns) {
  var carousel = {
    "type": "template",
    "altText": altText,
    "template": {
      "type": "carousel",
      "columns": []
    },
    "imageAspectRatio": "rectangle",
    "imageSize": "contain"
  }

  for (let i = 0; i < columns.length; i++) {
    carousel.template.columns.push(columns[i])
  }

  return carousel;
}

//make imgCarouselObj
obj.mkImgCarousel = function (altText, columns) {
  var carousel = {
    "type": "template",
    "altText": altText,
    "template": {
      "type": "image_carousel",
      "columns": []
    }
  }

  for (let i = 0; i < columns.length; i++) {
    carousel.template.columns.push(columns[i]);
  }

  return carousel;
}

///// make Clumn Funcs
var clm = new Object();
exports.clm = clm;

//make UrlColumn
clm.mkUrl = function (imgUrl, btnLabel, url) {
  return {
    "imageUrl": imgUrl,
    "action": {
      "type": "uri",
      "label": btnLabel,
      "uri": url
    }
  }
}

//make Column
clm.mkImg = function (thumImgUrl, bgColor, title, text, actions) {
  var column = {
    "thumbnailImageUrl": thumImgUrl,
    "imageBackgroundColor": bgColor, //#FFFFFF
    //    "title": title, //後でnullじゃなければ入れる
    "text": text,
    "defaultAction": {
      "type": "uri",
      "label": "uri label",
      "uri": thumImgUrl
    },
    "actions": []
  }

  for (let i = 0; i < actions.length; i++) {
    column.actions.push(actions[i]);
  }

  if (title != null) {
    column["title"] = title
  }

  return column;
}

///// make Action Funcs
var act = new Object();
exports.act = act;

//make DTPicker
act.mkDTPicker = function (label, data, initDateTime, maxDateTime, minDateTime) {
  return {
    "type": "datetimepicker",
    "label": label,
    "data": data,
    "mode": "datetime",
    "initial": initDateTime, //2017-12-25t00:00
    "max": maxDateTime, //2018-01-24t23:59
    "min": minDateTime //2017-12-25t00:00
  }
}

//make Message
act.mkMessage = function (btnText, msg) {
  return {
    "type": "message",
    "label": btnText,
    "text": msg
  }
}

//make URI
act.mkUrl = function (btnText, url) {
  return {
    "type": "uri",
    "label": btnText,
    "uri": url
  }
}

//make postback
act.mkPostback = (btnText, repMsg, postbackData) => {
  return {
    "type": "postback",
    "label": btnText,
    "data": postbackData,//"action=buy&itemid=111",
    "text": repMsg
  }
}

