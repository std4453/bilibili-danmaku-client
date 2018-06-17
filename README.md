![Header image](assets/header.svg)

[![npm](https://img.shields.io/npm/v/bilibili-danmaku-client.svg?style=flat-square)](https://www.npmjs.com/package/bilibili-danmaku-client)
[![npm](https://img.shields.io/npm/l/bilibili-danmaku-client.svg?style=flat-square)](https://www.npmjs.com/package/bilibili-danmaku-client)
[![david-dm](https://img.shields.io/david/std4453/bilibili-danmaku-client.svg?style=flat-square)](https://github.com/std4453/bilibili-danmaku-client)
[![Maintainability](https://api.codeclimate.com/v1/badges/0f3581cbb3d2d9bd0243/maintainability)](https://codeclimate.com/github/std4453/bilibili-danmaku-client/maintainability)

# Bilibili Danmaku Client

A standalone client for connecting to the Bilibili Live Danmaku Interface, in Node.js and the browser.

_Read this in another language: [English](README.md), [简体中文](README.zh-cn.md)._

## Table of content

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
    - [Open a connection](#open-a-connection)
    - [Listen to Events](#listen-to-events)
    - [Listen to client lifecycle](#listen-to-client-lifecycle)
    - [Terminate client](#terminate-client)
- [Usage in browser](#usage-in-browser)
- [Developement](#development)
- [Links](#links)
- [Author](#author)
- [License](#license)

## Introduction

Never heard of Bilibili or Danmaku? You're out of this. Close this page and have a cup of coffee might be the wise choice.

And if you're finding a way to watch on a Bilibili Live room, analyze danmaku programmatically, either for statistical or some squeaky purposes, you've come the right place. `bilibili-danmaku-client` will be exactly what you want.

`bilibili-danmaku-client` is a `npm` package that runs in Node.js or in the browser, providing an easy, fluent API for listening to the activities happening in a Bilibili Live room.

## Installation

It can't be easier to install a `npm` package.

First make sure that you have `npm` and `node` correctly installed and in `PATH`, and then:

```console
    $ npm install --save bilibili-danmaku-client
```

If you see something like `peer dependencies not installed`, don't panic, see [this sector](#usage-in-browser) below.

## Usage

> If you wonder what you can do with this package, please see this [demo](https://std4453.github.io/bilibili-danmaku-client) first.

`bilibili-danmaku-client` is easy to use. You can:

### Open a connection

```javascript
    const DanmakuClient = require('bilibili-danmaku-client');
    // https://live.bilibili.com/5440
    const client = new DanmakuClient(5440);
    client.start();
```

### Listen to Events

```javascript
    const client = ...;
    
    const onDanmaku = ({ content, sender }) =>
        console.log(`${sender.name}: ${content}`);
    const onGift = ({ gift, num, sender }) =>
        console.log(`${sender.name} => ${gift.name} * ${num}`);

    client.on('event', ({ name, content }) => {
        switch (name) {
        case 'danmaku':
            onDanmaku(content);
            break;
        case 'gift':
            onGift(content);
            break;
        }
    })
```

For more information about __Events__, see [Wiki](https://github.com/std4453/bilibili-danmaku-client/wiki/Events).

### Listen to client lifecycle

```javascript
    const client = ...;
    client.on('open', () => console.log('Client opened.'));
    client.on('close', () => console.log('Client closed.'));
```

### Terminate client

```javascript
    const client = ...;
    client.terminate();
    client.on('close' () => console.log('Client closed.'));
```

Note that you must listen to the `'close'` event to be notified when the client is actually closed. `terminate()` only requests close, not forces it.

For more information about how to use `DanmakuClient`, see [Wiki](https://github.com/std4453/bilibili-danmaku-client/wiki/DanmakuClient).

## Usage in browser

Actually this is not about `bilibili-danmaku-client` itself, but about the `x-platform-ws` package, which `bilibili-danmaku-client` depends on, and is a small utility package of mine.

In order to be compatible both in Node.js and in the browser, `x-platform-ws` requies shimming of the `buffer` and `events` Node.js module, therefore it declares them as [_peer dependencies_](https://nodejs.org/en/blog/npm/peer-dependencies/). So if you run `npm install`, you might hear it complain about not installed peer dependecies.

Don't panic. That's perfectly unproblematic if you're only using `bilibili-danmaku-client` in Node.js, as shimming is not required there. But if you tend to use the package in a browser, you should read on.

I recommend using a bundler like [browserify](https://browserify.org/) or [webpack](https://webpack.js.org/). they will automatically detect usage of `buffer` and `events` and provide shimming. Unfortunately, I happen to have no knowledge about how to use this package without a bundler, so - you have to figure the solution out yourself.

## Development

To build and test the package yourself:

1. Clone the github repository

```console
    $ git clone -b master https://github.com/std4453/bilibili-danmaku-client.git
```

2. Build

```console
    $ npm install && npm run build
```

3. Test

```console
    $ npm test
```

## Links

- [Live demo](https://std4453.github.io/bilibili-danmaku-client)
- [npm package](https://www.npmjs.com/package/bilibili-danmaku-client)
- [Zhihu article](https://zhuanlan.zhihu.com/p/37874066) (Chinese)
- [API reference](https://github.com/std4453/bilibili-danmaku-client/wiki/DanmakuClient)

## Author

- __std4453__ - [me@std4453.com](mailto:me@std4453.com) - [blog](http://blog.std4453.com)

## License

This project is licensed under the _MIT License_, see [LICENSE](/LICENSE) for details.
