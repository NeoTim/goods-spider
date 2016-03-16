'use strict';

var _ = require('underscore');
_.str = require('underscore.string');
var request = require('request');
var cheerio = require('cheerio');
var gbk = require('gbk');
var helper = require('./helper');

/**
 * 获取省份
 *
 * @method getProvinces
 * @return {array}
 */
exports.getProvinces = function() {
  var provinces = ['北京', '上海', '天津', '重庆', '河北', '山西', '内蒙', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '宁夏', '青海', '新疆', '香港', '澳门', '台湾', '其它'];
  return provinces;
};

/**
 * 获取查询历史价格索要的url
 *
 * @method getHistoryPriceUrl
 * @param {String} url itemUrl
 * @return {boolean}
 */

/**
* 获取淘宝商品信息
*
* @method _getTaobaoItemInfo
* @param {String} id 商品id
* @param {Function} callback 回调函数
* @return {null}
*/
exports.getTaobaoItemInfo = function(id) {

  return new Promise(function(resolve, reject) {

    var url = 'http://hws.m.taobao.com/cache/wdetail/5.0/?id=' + id;
    request(url, function(error, response, body) {

      if (error) {
        return reject(error);
      }

      var good = JSON.parse(body).data;
      var value = JSON.parse(good.apiStack[0].value);

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
      var provinces = helper.getProvinces();
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

/**
* 获取天猫商品信息
*
* @method _getTmallItemInfo
* @param {String} id 商品id
* @param {Function} callback 回调函数
* @return {null}
*/

exports.getTmallItemInfo = function(id) {

  return new Promise(function(resolve, reject) {
    var urlMobile = 'http://detail.m.tmall.com/item.htm?id=' + id;
    var urlPc = 'http://detail.tmall.com/item.htm?id=' + id;

    gbk.fetch(urlMobile).to('string', function(err, string) {

      if (err) {
        return reject(err);
      }

      string = string.replace(/\n/g, '');
      string = string.replace(/\r/g, '');
      string = string.replace(/\t/g, '');
      string = string.replace(/"/g, '\'');

      var $ = cheerio.load(string);
      var detailStart = string.indexOf('_DATA_Detail = ');
      var detailEnd = string.indexOf('}catch', detailStart);

      var skipStart = string.indexOf(' _DATA_Mdskip = ');
      var skipEnd = string.indexOf('}catch', skipStart);

      var detail = string.substring(detailStart + 15, detailEnd - 1);
      detail = detail.replace(/'/g, '"');
      detail = JSON.parse(detail);

      var skip = string.substring(skipStart + 17, skipEnd - 1);
      skip = skip.replace(/'/g, '"');
      skip = JSON.parse(skip);

      var province;
      var city;

      var title = detail.itemDO.title;
      var picUrl = detail.itemDO.mainPic;
      var originPrice = skip.defaultModel.priceResultDO.defaultPriceInfoDO.price.amount;
      var promoPrice = skip.defaultModel.priceResultDO.defaultPriceInfoDO.promPrice ? skip.defaultModel.priceResultDO.defaultPriceInfoDO.promPrice.price : originPrice;
      var discount = originPrice === promoPrice ? 10 : (promoPrice / originPrice) * 10;
      var delivery = _.str.include(JSON.stringify(skip.defaultModel.deliverDO.extDeliverySkuMap), '快递: 0.00') ? true : false;
      var deliveryAddress = skip.defaultModel.deliverDO.deliveryAddress;
      var shopTitle = $('.shop').text();
      var shopUrl = $('.shop').attr('href');
      var sellCount = skip.defaultModel.sellCountDO.sellCount;
      var itemUrl = 'http://detail.tmall.com/item.htm?id=' + id;
      var goodId = id;
      var source = 2; // 2代表商品来源是天猫

      // ==================获取省市======================
      // 获取省份
      var provinces = helper.getProvinces();
      _.each(provinces, function(i) {

        if (deliveryAddress.indexOf(i) > -1) {
          province = i;
        }
      });

      city = deliveryAddress.substring(province.length);

      // ================================================

      gbk.fetch(urlPc).to('string', function(err, string) {

        if (err) {
          return reject(err);
        }

        string = string.replace(/\n/g, '');
        string = string.replace(/\r/g, '');
        string = string.replace(/\t/g, '');
        string = string.replace(/"/g, '\'');

        $ = cheerio.load(string);

        // 获取商品图片所在的html片段
        var ul = $('#J_UlThumb img');

        var picsUrl = [];
        for (var i = 0; i < 5; i++) {
          picsUrl.push(ul[i].attribs.src.replace('_60x60q90.jpg', ''));
        }

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
          sellerNick: decodeURI(detail.itemDO.sellerNickName),
          sellCount: parseInt(sellCount, 10),
          itemUrl: itemUrl,
          goodId: goodId,
          source: source
        };

        resolve(data);

      });

    });

  });
};
