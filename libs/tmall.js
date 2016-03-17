'use strict';

var _ = require('underscore');
_.str = require('underscore.string');
var cheerio = require('cheerio');
var gbk = require('gbk');
var provinces = require('./provinces');

/**
* 获取天猫商品信息
*
* @method _getTmallItemInfo
* @param {String} id 商品id
* @param {Function} callback 回调函数
* @return {null}
*/

exports.get = function(id) {

  return new Promise(function(resolve, reject) {
    var urlMobile = 'http://detail.m.tmall.com/item.htm?id=' + id;
    var urlPc = 'http://detail.tmall.com/item.htm?id=' + id;

    Promise.all([fetchMobile(urlMobile, id), fetchPC(urlPc)])
      .then(function(data) {
        resolve(_.extend(data[0], data[1]));
      })
      .catch(function(err) {
        reject(err);
      });
  });

};

// //////////////////////////////
function fetchMobile(url, id) {
  return new Promise(function(resolve, reject) {
    gbk.fetch(url).to('string', function(err, string) {
      if (err) {
        return reject(err);
      }

      var $ = cheerio.load(string);

      string = string.replace(/\n/g, '');
      string = string.replace(/\r/g, '');
      string = string.replace(/\t/g, '');
      string = string.replace(/"/g, '\'');
      string = string.replace(/\s/g, '');

      var reg = {
        detail: /var_DATA_Detail=(.*?);<\/script>/,
        skip: /var_DATA_Mdskip=(.*?)<\/script>/,
        promoPrice: /"promotionList":(.*?)]}/
      };

      var detail = string.match(reg.detail)[1];
      detail = detail.replace(/'/g, '"');
      try {
        detail = JSON.parse(detail);
      } catch (err) {
        throw new Error(err);
      }

      var skip = string.match(reg.skip)[1];
      skip = skip.replace(/'/g, '"');

      try {
        skip = JSON.parse(skip);
      } catch (err) {
        throw new Error(err);
      }

      var promoPriceData;
      var promoPrice;
      var province;
      var city;
      var title = detail.itemDO.title;
      var picUrl = detail.itemDO.mainPic;

      // var originPrice = detail.detail.defaultItemPrice;
      var originPrice = detail.itemDO.reservePrice;

      promoPriceData = JSON.stringify(skip.defaultModel.itemPriceResultDO);

      if (promoPriceData.indexOf('"promotionList":') > -1) {
        promoPriceData = JSON.parse(promoPriceData.match(reg.promoPrice)[1] + ']')[0];
        promoPrice = promoPriceData.price;
      } else {
        promoPrice = promoPriceData.match(/,"price":"(.*?)"},/)[1];
      }

      var discount = originPrice === promoPrice ? 10 : (promoPrice / originPrice) * 10;
      var delivery = _.str.include(JSON.stringify(skip.defaultModel.deliveryDO.extDeliverySkuMap), '快递: 0.00') ? true : false;
      var deliveryAddress = skip.defaultModel.deliveryDO.deliveryAddress;

      var shopTitle = $('.shop-t').text();
      var shopUrl = 'http:' + $('.go-shop').attr('href');

      var sellCount = skip.defaultModel.sellCountDO.sellCount;
      var itemUrl = 'http://detail.tmall.com/item.htm?id=' + id;
      var goodId = id;
      var source = 2; // 2代表商品来源是天猫

      // ==================获取省市======================
      _.each(provinces, function(i) {
        if (deliveryAddress.indexOf(i) > -1) {
          province = i;
        }
      });

      city = deliveryAddress.substring(province.length);

      var data = {
        title: title,
        picUrl: picUrl,
        originPrice: parseFloat(originPrice),
        promoPrice: parseFloat(promoPrice),
        discount: parseFloat(_.str.numberFormat(discount, 1)),
        delivery: delivery,
        province: province,
        city: city,
        shopTitle: shopTitle,
        shopUrl: shopUrl,
        sellerNick: decodeURI(detail.itemDO.sellerNickName),
        sellCount: parseInt(sellCount, 10),
        itemUrl: itemUrl,
        goodId: goodId,
        source: source
      };

      resolve(data);
    });
  });
}

function fetchPC(url) {
  return new Promise(function(resolve, reject) {
    gbk.fetch(url).to('string', function(err, string) {
      if (err) {
        return reject(err);
      }

      string = string.replace(/\n/g, '');
      string = string.replace(/\r/g, '');
      string = string.replace(/\t/g, '');
      string = string.replace(/"/g, '\'');

      var $ = cheerio.load(string);

      // 获取商品图片所在的html片段
      var $ul = $('#J_UlThumb img');
      var arr = Array.prototype.slice.call($ul);
      var picsUrl = [];

      for (var i = 0; i < arr.length; i++) {
        picsUrl.push(arr[i].attribs.src.replace('_60x60q90.jpg', ''));
      }

      string = string.replace(/'/g, '"');
      var data = { picsUrl: picsUrl };
      resolve(data);
    });
  });
}
