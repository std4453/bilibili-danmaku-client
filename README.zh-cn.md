![Header image](/assets/header.svg)

[![npm](https://img.shields.io/npm/v/bilibili-danmaku-client.svg?style=flat-square)](https://www.npmjs.com/package/bilibili-danmaku-client)
[![npm](https://img.shields.io/npm/l/bilibili-danmaku-client.svg?style=flat-square)](https://www.npmjs.com/package/bilibili-danmaku-client)
[![david-dm](https://img.shields.io/david/std4453/bilibili-danmaku-client.svg?style=flat-square)](https://github.com/std4453/bilibili-danmaku-client)
[![Maintainability](https://api.codeclimate.com/v1/badges/0f3581cbb3d2d9bd0243/maintainability)](https://codeclimate.com/github/std4453/bilibili-danmaku-client/maintainability)

# 哔哩哔哩弹幕自动手记人偶

> 彼女はまだ知らない、「愛してる」の意味を。

> 哔哩哔哩 (゜-゜)つロ 干杯！🍻

B站直播弹幕接口的javascript客户端实现，在Node.js和浏览器段均可使用。

## 目录

- [翻译版本](#翻译版本)
- [简介](#简洁)
- [安装](#安装)
- [使用方法](#使用方法)
    - [建立链接](#建立连接)
    - [监听消息](#监听消息)
    - [监听生命周期事件](#监听生命周期事件)
    - [关闭客户端](#关闭客户端)
- [在浏览器中使用](#在浏览器中使用)
- [本地开发](#本地开发)
- [外部链接](#外部链接)
- [作者](#作者)
- [许可证](#许可证)

## 翻译版本

[English](https://github.com/std4453/bilibili-danmaku-client/blob/master/README.md)

[简体中文](https://github.com/std4453/bilibili-danmaku-client/blob/master/README.zh-cn.md)

## 简介

嫌弹幕姬难用？想赚(zi)点(dong)辣(chou)条(jiang)？想弄个看~~知乎~~b站？（这个我已经在弄了还请勿念~）我是渣渣辉，船新的b站直播弹幕客户端，走过路过不要错过哦！

(嗯所以如果你是某奇艺某酷用户出门左转不谢)

（清嗓子）`bilibili-danmaku-client`是一个兼容Node.js和浏览器端的`npm`包，其API简单，易用，流畅。使用它，会让你拥有回家般的体验。

就酱。

## 安装

才，才不是因为你帅才教你怎么安装的呢！这么简单的事，不应该生下来就会做吗！（摔）

那，那你听好了哦！先[安装`node`和`npm`](https://www.runoob.com/nodejs/nodejs-install-setup.html)，然后：

```console
    $ npm install --save bilibili-danmaku-client
```

（脸红）别问那么多为什么了！跟着做就是了！行不行本小姐把你电成烤猪肉！如果蹦出来什么`peer dependencies not installed`之类的，不要管他就是了！知道了吗！

其实[下面](#在浏览器中使用)写了怎么解决这个问题的，可不是我想要告诉你的哦！还不是看你只身一人怪可怜的……

## 用法

> 俗话说的好，是骡子是马，[拉出来溜溜](https://std4453.github.io/bilibili-danmaku-client)。瞧一瞧， 看一看嘞！

赵忠祥老师说过，如果你想使用`bilibili-danmaku-client`的话，你就得：

### 建立连接

```javascript
    const DanmakuClient = require('bilibili-danmaku-client');
    const client = new DanmakuClient({
        room: 5440, // https://live.bilibili.com/1
    });
```

### 监听消息

```javascript
    const client = ...;
    client.on('danmaku', ({ content, sender }) =>
        console.log(`${sender.name}: ${content}`));
    client.on('gift', ({ giftName, num, sender } =>
        console.log(`${sender.name} => ${giftName} * ${num}`)));
```

消息部分的具体细节请看[`docs/messages.md`](https://github.com/std4453/bilibili-danmaku-client/blob/master/docs/messages.zh-cn.md)。

### 监听生命周期事件

```javascript
    const client = ...;
    client.on('opened',  () => console.log('Client opened.'));
    client.on('terminated', () => console.log('Client terminated'));
```

（这就不用翻译了吧)

### 关闭客户端

```javascript
    const client = ...;
    client.terminate();
    client.on('terminated' () => console.log('Client terminated'));
```

注意`terminate()`只向客户端提出关闭请求，客户端正式关闭后会产生`'terminated'`事件。如果有必要的话，请根据`'terminated'`事件来进行处理。

关于`DanmakuClient`类的更多信息请看 [`docs/api.md`](https://github.com/std4453/bilibili-danmaku-client/blob/master/docs/api.zh-cn.md)。

## 在浏览器中使用

> 本来无一物，何处惹尘埃 ——慧能法师

事实上`bilibili-danmaku-client`本身在浏览器中的使用并不构成问题，但它所依赖的`x-platform-ws`（这也是我写的一个小工具）就需要进行这方面的考虑。

为了能够在浏览器和Node.js端的行为保持一致，`x-platform-ws`在浏览器上使用`buffer`和`events`这两个npm包来代替其Node.js上的同名模块，并将他们设定为[_peer dependencies_](https://nodejs.org/en/blog/npm/peer-dependencies/)。（这个概念比较难以翻译）而当运行`npm install`时，你就有可能会看到类似 _peer dependencies_ 未安装之类的错误信息。

这实际上除了有点惹人厌烦以外并不是什么大问题。实际上，如果你只在Node.js端（或者electron等类似环境下）使用`bilibili-danmaku-client`的话，那么不安装这些库也能运行良好。

如果你还打算在浏览器端使用`bilibili-danmaku-client`的话，那我建议最好使用[browserify](https://browserify.org/)或[webpack](https://webpack.js.org/)之类的打包工具对你的项目进行打包。在此过程中，他们会自动检测到`x-platform-ws`使用了`buffer`和`events`模块，并且将他们对应的npm包打包到最终生成的文件中。如果你不愿意打包的话，那你就得自己找到解决方法了。残念です。\(￣y▽,￣\)╭

## 开发

哟~西！用的还满意吗！让我看到你们的双手！
> 众人：不——满——意——

不满意？自己动手，丰衣足食，知不知道？
> 众人：
> 那——我——们——
> 怎——么——自——己——
> 动——手——呢——

很简单！你只要：

1. 将git项目克隆到本地

```console
    $ git clone -b master https://github.com/std4453/bilibili-danmaku-client.git
```

2. 安装依赖项+构建

```console
    $ npm install && npm run build
```

3. 运行测试

```console
    $ npm test
```

それで十分わよ！お楽しみに！

（嗯你没走错这真的是中文版）

## 外部链接

- [在线演示](https://std4453.github.io/bilibili-danmaku-client)
- [npm包](https://www.npmjs.com/package/bilibili-danmaku-client)
- [知乎文章](https://zhuanlan.zhihu.com/p/37874066) （欢迎点赞、关注）
- [API文档](https://github.com/std4453/bilibili-danmaku-client/blob/master/docs/api.zh-cn.md)

## 作者

- __std4453__ - [me@std4453.com](mailto:me@std4453.com) - [知乎](https://www.zhihu.com/people/std4453)

## 许可证

本项目使用 _MIT_ 许可证，详情请见[LICENSE](https://github.com/std4453/bilibili-danmaku-client/blob/master/LICENSE)文件。
