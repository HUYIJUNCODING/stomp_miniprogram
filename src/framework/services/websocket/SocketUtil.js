import SocketService from "./SocketService";
import PublicEvent from "../event/publicEvent";

export default class SocketUtil {
  static initWebSocket() {
    SocketService.getInstance({
      // 特殊配置,一般不用修改
      // token等令牌东西
    }).connect((res) => {
      // 发送socket连接成功通知
      // 注册全局监听
      console.log(res, "socket连接成功返回的结果");
      return res;
    }, false);
  }

  /**
   *
   * @param {object} config 初始化配置参数
   */
  static initSocketParams(config) {
    SocketService.getInstance().init({
      headers: {
        ...config,
      },
    });
  }

  /**
   * 注册订阅事件
   */

  static subIds = [];
  static subscribe() {
    SocketUtil.subIds = [
      SocketUtil.subEvent1(),
      SocketUtil.subEvent2(),
      SocketUtil.subEvent3(),
    ];
  }

  /**
   * 取消订阅
   */
  static unsubscribe() {
    SocketUtil.subIds.forEach((item) => {
      console.log("解除订阅");
      SocketService.getInstance({}).unsubscribe(item);
    });
  }

  /**
   * 定义订阅事件1
   *
   */
  static subEvent1() {
    let topic = "event_1"; //topic 是stomp客户端和服务端通讯的重要标识,需要约定一致(xxx.xx.x 或者 xxx_xx_x)
    return SocketService.getInstance().subscribe(
      topic,
      (res) => {
        // 处理内部事件
      },
      true,
      PublicEvent.EVENT_1
    );
  }

  /**
   * 定义订阅事件2
   *
   */
  static subEvent2() {
    let topic = "event_2";

    return SocketService.getInstance().subscribe(
      topic,
      (res) => {
        // 处理内部事件
      },
      true,
      PublicEvent.EVENT_2
    );
  }

  /**
   * 定义订阅事件3
   *
   */
  static subEvent3() {
    let topic = "event_3";

    return SocketService.getInstance().subscribe(
      topic,
      (res) => {
        // 处理内部事件
      },
      true,
      PublicEvent.EVENT_3
    );
  }
}
