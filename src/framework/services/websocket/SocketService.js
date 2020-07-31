const Stomp = require("./stomp.js").Stomp;
import Event from "../event/eventBus";
import SocketUtil from "./SocketUtil";

//小程序中没有window对象,因此需要复写定时器方法(storm.js 中会看到用来发送心跳包)
Stomp.setInterval = function(interval, f) {
  return setInterval(f, interval);
};
Stomp.clearInterval = function(id) {
  return clearInterval(id);
};

export default class SocketService {

  //config 配置,支持外部写入
  config = {
    host: "wss://xxx.com/ws",
    ping: {
      open: true,
      timeout: 10000,
    },
    headers: {
      token: "",
    },
  };
  subId = 0;
  socketOpen = false;
  socketMsgQueue = [];
  stompClient = null;
  lockReconnect = false; //避免重复连接
  timer;
  pingTimer;

  //SocketService 实例
  static instance;

  //会被包装成客户端代理,未定义方法,会分配默认
  ws = {
    send: this.sendSocketMessage.bind(this),
    onopen: null,
    onmessage: null,
    close: this.closeSocket.bind(this),
  };

  constructor() {
    //初始化相关监听方法
    this.onSocketOpen();
    this.onSocketMessage();
    this.onSocketClose();
    this.onNetworkStatusChange();
  }

  /**
   * 获取SocketService实例
   * @param {object} config 外部传入的config 配置(可选参数)
   */
  static getInstance(config = {}) {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    SocketService.instance.doConfig(config);
    return SocketService.instance;
  }

  /**
   * 初始化config配置
   * @param {object} config 外部传入的config 配置
   */
  init(config = {}) {
    this.doConfig(config);
    return this;
  }

  /**
   * 执行config合并
   * @param {object} config 
   */
  doConfig(config) {
    let header = this.config.header;
    if (!config) return;
    if (config.header) {
      header = { ...header, ...config.header };
    }
    this.config = { ...this.config, ...config };
    this.config.header = header;
    return this;
  }

  /**
   * 获取客户端对象
   */
  getClient() {
    return this.stompClient;
  }

  /**
   * 创建 socketOpen 连接
   *
   */
  createConnection() {
    console.log("创建socket连接");
    wx.connectSocket({
      url: this.config.host,
      header: {
        "content-type": "application/json",
      },
    });
  }

  /**
   * 发送连接请求
   */

  sendSocketMessage(msg) {
    wx.sendSocketMessage({
      data: msg,
    });
  }

  /**
   * 监听 WebSocket 接受到服务器的消息事件
   */
  onSocketMessage() {
    wx.onSocketMessage((res) => {
      this.ws.onmessage && this.ws.onmessage(res);
    });
  }

  /**
   * 监听 WebSocket 连接打开事件
   */
  onSocketOpen() {
    wx.onSocketOpen((res) => {
      console.log("WebSocket连接已打开！");
      this.socketOpen = true;
      for (let i = 0; i < this.socketMsgQueue.length; i++) {
        const { topic, msg } = this.socketMsgQueue[i];
        this.sendMsg(topic, msg);
      }
      this.socketMsgQueue = [];
      this.ws.onopen && this.ws.onopen();
    });
  }

  /**
   * 监听 WebSocket 连接关闭事件
   */
  onSocketClose() {
    wx.onSocketClose((res) => {
      console.log("WebSocket 已关闭！");
      //重连之前先取消直播间订阅
      SocketUtil.unsubscribe();
      this.reconnect();
    });
  }


  /**
   * 关闭 WebSocket 连接
   */
  closeSocket() {
    wx.closeSocket();
  }



  /**
   * 连接websocket
   */
  connect(callback = null, force = false) {
    if (this.stompClient !== null && this.stompClient.connected) {
      console.log("连接已经建立");
      if (!force) {
        if (callback) callback();
        return;
      }
      this.disconnect();
    }

    this.createConnection(); //创建连接
    let headers = this.config.headers;
    this.stompClient = Stomp.over(this.ws); // 获取STOMP子协议的客户端对象
    this.stompClient.heartbeat.outgoing = 0; //若使用STOMP 1.1 版本，默认开启了心跳检测机制（默认值都是10000ms）
    this.stompClient.heartbeat.incoming = 0; //客户端不从服务端接收心跳包
    this.stompClient.debug = null;

    // 向服务器发起websocket连接
    this.stompClient.connect(
      headers,
      (res) => {
        this.connectCallback();
        if (callback) {
          callback(res);
        }
        console.log("连接成功");
      },
      (error) => {
        this.cleanConnect();
        console.log("连接中断", error);
        this.reconnect();
      }
    );
  }

  connectCallback() {
    this.ping();
  }

  /**
   * 心跳检测
   */
  ping() {
    if (!this.config.ping.open) return;
    this.pingTimer && clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.stompClient != null) {
        this.stompClient.send(
          "xxx.ping",
          {},
          JSON.stringify({ ping: Math.round(new Date() / 1000) })
        );
      }
    }, this.config.ping.timeout);
  }

  /**
   * 重连
   */
  reconnect() {
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    console.log("socket重连操作开始");
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.connect(() => {
        //重连成功后重新注册订阅事件
        SocketUtil.subscribe();
      }, true);
      this.lockReconnect = false;
    }, 3000);
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.stompClient != null) {
      console.log("stompClient.disconnect");
      this.stompClient.disconnect();
    }
    this.cleanConnect();
  }

  /**
   * 清除连接
   */
  cleanConnect() {
    this.stompClient = null;
    this.pingTimer && clearTimeout(this.pingTimer);
    this.timer && clearTimeout(this.timer);
    console.log("cleanConnet");
  }

  /**
   * 订阅topic
   * @param {*} pre 
   * @param {*} topic 
   * @param {*} func 
   * @param {*} autoPublish 
   * @param {*} publishTopic 
   */
  subTopic(pre, topic, func, autoPublish = false, publishTopic = null) {
    if (
      this.config.headers &&
      this.config.headers.token &&
      this.config.headers.token.length
    ) {
      sessionId = this.config.headers.token;
    }
    topic = pre + "." + this.config.headers.token + "." + topic;
    this.subscribe(topic, func, autoPublish, publishTopic);
  }

  /**
   * 客户端注册订阅事件
   * @param {*} topic 
   * @param {*} func 
   * @param {*} autoPublish 
   * @param {*} publishTopic 
   */
  subscribe(topic, func, autoPublish = false, publishTopic = null) {
    if (!this.stompClient) return false;
    //区分不同订阅消息的唯一标识,虽然storm.js源码中当id不存在时会自动给添加,但实际中发现,多个订阅的时候subId会共享,因此在这里提前声明
    this.config.headers.id = "sub-" + this.subId++;
    return this.stompClient.subscribe(
      topic,
      //订阅成功后的监听回调函数,触发时机为服务端推送该消息过来时触发
      (res) => {
        func(JSON.parse(res.body));
        if (autoPublish) {
          if (!publishTopic) publishTopic = topic;
          //eventBus派发
          Event.emit(publishTopic, JSON.parse(res.body));
        }
      },
      this.config.headers
    );
  }

/**
 * 注销客户端订阅
 * @param {string} subId 订阅的事件id
 */
  unsubscribe(subId) {
    if (!subId) return;
    subId.unsubscribe();
  }

  onError() {
    console.log("连接异常");
  }

  /**
   * 发送数据
   * @param topic
   * @param msg
   * @return {boolean}
   */
  sendMsg(topic, msg) {
    if (!this.stompClient || !this.socketOpen) {
      this.socketMsgQueue.push({ topic, msg });
    } else {
      this.stompClient.send(topic, {}, msg);
    }
  }

  /**
   * 监听网络状态变化
   */
  onNetworkStatusChange() {
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected && this.stompClient != null) {
        //重连之前先取消订阅
        SocketUtil.unsubscribe();
        //执行重连
        this.reconnect();
      }
    });
  }
}
