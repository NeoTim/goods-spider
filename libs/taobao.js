'use strict';

var _ = require('underscore');
_.str = require('underscore.string');
var request = require('request');
var provinces =  require('./provinces');

/**
* 获取淘宝商品信息
*
* @method _getTaobaoItemInfo
* @param {String} id 商品id
* @param {Function} callback 回调函数
* @return {null}
*/
exports.get = function(id) {

  return new Promise(function(resolve, reject) {

    var url = 'http://hws.m.taobao.com/cache/wdetail/5.0/?id=' + id;
    request(url, function(error, response, body) {

      if (error) {
        return reject(error);
      }

      try {
        var good = JSON.parse(body).data;
        var value = JSON.parse(good.apiStack[0].value);
      } catch (err) {
        throw new Error(err);
      }

      var priceUnits = value.data.itemInfoModel.priceUnits;
      var seller = good.seller;
      var price = []; // 存储价格
      var originPrice;
      var promoPrice;
      var province;
      var city;

      /*
       * 获取商品价格
       */
      _.each(priceUnits, function(i) {
        _.each(i, function(value, key) {
          if (key === 'price') {
            price.push(parseFloat(value.split('-')[0]));
          }
        });
      });

      if (price.length === 1) {
        originPrice = price[0]; // 原价
        promoPrice = originPrice; // 促销价
      } else {
        originPrice = _.max(price); // 原价
        promoPrice = _.min(price); // 促销价
      }

      var title = good.itemInfoModel.title;
      var picUrl = good.itemInfoModel.picsPath[0];
      var picsUrl = good.itemInfoModel.picsPath;
      var discount = originPrice === promoPrice ? 10 : (promoPrice / originPrice) * 10;
      var delivery = _.str.include(value.data.delivery.deliveryFees.join(), '包邮') ? true : false;
      var deliveryAddress = good.itemInfoModel.location;
      var shopTitle = seller.shopTitle;
      var shopId = seller.shopId;
      var shopUrl = 'http://shop' + shopId + '.taobao.com';
      var shopLogoUrl = seller.picUrl;
      var sellerNick = seller.nick;
      var sellCount = value.data.itemInfoModel.totalSoldQuantity;
      var itemUrl = 'http://item.taobao.com/item.htm?id=' + id;
      var goodId = id;
      var source = 1; // 1代表商品来源是淘宝

      // ==================获取省市======================
      // 获取省份
      _.each(provinces, function(i) {

        if (deliveryAddress.indexOf(i) > -1) {
          province = i;
        }
      });

      city = deliveryAddress.substring(province.length);

      var data = {
        title: title,
        picUrl: picUrl,
        picsUrl: picsUrl,
        originPrice: parseFloat(originPrice),
        promoPrice: parseFloat(promoPrice),
        discount: parseFloat(_.str.numberFormat(discount, 1)),
        delivery: delivery,
        province: province,
        city: city,
        shopTitle: shopTitle,
        shopUrl: shopUrl,
        shopLogoUrl: shopLogoUrl,
        sellerNick: sellerNick,
        sellCount: parseInt(sellCount, 10),
        itemUrl: itemUrl,
        goodId: goodId,
        source: source

      };

      resolve(data);
    });
  });
};
