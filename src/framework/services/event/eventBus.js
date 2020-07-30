import { cmp } from "../../../utils";

export default class EventBus {
  static listen(eventName, callback, observer) {
    Notification.addOnceNotification(eventName, callback, observer);
  }

  static listenSignal(eventName, callback, observer) {
    Notification.addNotificationSignal(eventName, callback, observer);
  }

  static emit(eventName, params) {
    Notification.postNotificationName(eventName, params);
  }

  static remove(eventName, observer) {
    Notification.removeNotification(eventName, observer);
  }

  static getNotices() {
    return Notification.getNotices();
  }
}

class Notification {
  static __notices = [];

  /**
   * addNotification
   * 注册通知对象方法
   *
   * 参数:
   * name： 注册名，一般let在公共类中
   * selector： 对应的通知方法，接受到通知后进行的动作
   * observer: 注册对象，指Page对象
   */
  static addNotification(name, selector, observer) {
    if (name && selector) {
      if (!observer) {
        console.warn(
          "addNotification Warning: no observer will can't remove notice"
        );
      }
      console.log("addNotification:" + name);
      let newNotice = {
        name: name,
        selector: selector,
        observer: observer,
      };

      this.addNotices(newNotice);
    } else {
      console.error("addNotification error: no selector or name");
    }
  }

  static addNotificationSignal(name, selector, observer) {
    if (name && selector) {
      if (!observer) {
        console.warn(
          "addNotification Warning: no observer will can't remove notice"
        );
      }
      console.log("addNotification:" + name);
      let newNotice = {
        name: name,
        selector: selector,
        observer: observer,
      };
      this.__notices = []; // 清空事件回调
      this.addNotices(newNotice);
    } else {
      console.error("addNotification error: no selector or name");
    }
  }

  /**
   * 仅添加一次监听
   *
   * 参数:
   * name： 注册名，一般let在公共类中
   * selector： 对应的通知方法，接受到通知后进行的动作
   * observer: 注册对象，指Page对象
   */
  static addOnceNotification(name, selector, observer) {
    if (this.__notices.length > 0) {
      for (let i = 0; i < this.__notices.length; i++) {
        let notice = this.__notices[i];
        if (notice.name === name) {
          if (notice.observer === observer) {
            return;
          }
        }
      }
    }
    this.addNotification(name, selector, observer);
  }

  static addNotices(newNotice) {
    if (this.__notices.length > 0) {
      for (let i = 0; i < this.__notices.length; i++) {
        let hisNotice = this.__notices[i];
        //当名称一样时进行对比，如果不是同一个 则放入数组，否则跳出
        if (newNotice.name === hisNotice.name) {
          if (!cmp(hisNotice, newNotice)) {
            this.__notices.push(newNotice);
          }
          return;
        } else {
          this.__notices.push(newNotice);
          return;
        }
      }
    } else {
      this.__notices.push(newNotice);
    }
  }

  static getNotices() {
    return this.__notices;
  }

  /**
   * removeNotification
   * 移除通知方法
   *
   * 参数:
   * name: 已经注册了的通知
   * observer: 移除的通知所在的Page对象
   */
  static removeNotification(name, observer) {
    for (let i = 0; i < this.__notices.length; i++) {
      let notice = this.__notices[i];
      if (notice.name === name) {
        if (notice.observer === observer) {
          this.__notices.splice(i, 1);
          return;
        }
      }
    }
  }

  /**
   * postNotificationName
   * 发送通知方法
   *
   * 参数:
   * name: 已经注册了的通知
   * info: 携带的参数
   */
  static postNotificationName(name, info) {
    console.log("postNotificationName:" + name);
    if (!this.__notices.length) {
      console.error("postNotificationName error: u hadn't add any notice.");
      return;
    }
    for (let i = 0; i < this.__notices.length; i++) {
      let notice = this.__notices[i];
      if (notice.name === name) {
        notice.selector(info);
      }
    }
  }
}
