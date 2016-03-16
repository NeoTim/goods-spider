# Goods-spider

> 抓取电商网站的商品信息，暂时只支持淘宝、天猫

### Demo

http://goods-spider.forsigner.com

### 安装

```
npm install goods-spider --save
```

### 用法


```js
var goodsSpider = require('goods-spider'),
var itemUrl = 'https://item.taobao.com/item.htm?id=45765691683';

goodsSpider.getItemInfo()
  .then(function(data) {
    console.log(data);
  })
  .catch(function(err) {
    console.log(err);
  });

// ouput

/*
{ title: 'OAXIS 近距离触碰式无线便携音箱 低音炮立体声户外音响无需蓝牙',
  picUrl: 'http://img.alicdn.com/imgextra/i1/TB1qbOYIXXXXXaDXpXXXXXXXXXX_!!0-item_pic.jpg',
  picsUrl:
   [ 'http://img.alicdn.com/imgextra/i1/TB1qbOYIXXXXXaDXpXXXXXXXXXX_!!0-item_pic.jpg',
     'http://img.alicdn.com/imgextra/i3/376304554/TB2oSIYcVXXXXbRXpXXXXXXXXXX_!!376304554.jpg',
     'http://img.alicdn.com/imgextra/i4/376304554/TB2kqvbepXXXXcaXXXXXXXXXXXX_!!376304554.jpg',
     'http://img.alicdn.com/imgextra/i2/376304554/TB2l6fcepXXXXbTXXXXXXXXXXXX_!!376304554.jpg' ],
  originPrice: 299,
  promoPrice: 299,
  discount: 10,
  delivery: true,
  province: '北京',
  city: '',
  shopTitle: '夏天穿棉袄玩物集',
  shopUrl: 'http://shop61628025.taobao.com',
  shopLogoUrl: 'http://img.alicdn.com/imgextra//94/c1/T1BB_3XdtdXXb1upjX.jpg',
  sellerNick: 'zy4228353',
  sellCount: 20,
  itemUrl: 'http://item.taobao.com/item.htm?id=45765691683',
  goodId: '45765691683',
  source: 1 }
*/

```

### License

  [MIT](LICENSE)
