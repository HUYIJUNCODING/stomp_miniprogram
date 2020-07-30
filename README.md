## stomp_miniprogram

> 在小程序中使用 stomp 代理客户端收发 websocket 消息(客户端封装)


### 运行
* 小程序 demo 采用 taro 框架
* 项目启动命令
    * yarn install
    * yarn dev:weapp

### 说明

* 采用 taro 框架只是为了提供小程序编译环境,socket 和 eventBus 核心代码是独立的,不受框架束缚.
* 需自行提供 wss 域名和后台 stomp 服务端支持


### 参考
[STOMP Over WebSocket](http://jmesnil.net/stomp-websocket/doc/)


