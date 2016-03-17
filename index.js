'use strict';

var url = require('url');
var querystring = require('querystring');
var taobao = require('./libs/taobao');
var tmall = require('./libs/tmall');

/**
 * 抓取商品信息
 *
 * @method getItemInfo
 * @param {String} itemUrl 商品网址
 * @param {Function} callback 回调函数
 * @return {Object} 商品信息
 */

exports.getItemInfo = function(itemUrl) {
  return new Promise(function(resolve, reject) {

    // 获取商品id
    var id = getItemId(itemUrl);

    // 抓取淘宝数据
    if (itemUrl.indexOf('taobao.com') > -1) {
      taobao.get(id)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });

    // 抓取天猫数据
    } else if (itemUrl.indexOf('tmall.com') > -1) {
      tmall.get(id)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    }
  });
};

// //////////////////////////
function getItemId(itemUrl) {
  var objUrl = url.parse(itemUrl);
  return querystring.parse(objUrl.query).id;
}
