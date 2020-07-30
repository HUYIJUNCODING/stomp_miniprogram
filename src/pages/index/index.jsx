import Taro, { Component } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";

import "./index.scss";

import SocketUtil from "../../framework/services/websocket/SocketUtil";
import PublicEvent from "../../framework/services/event/publicEvent";
import EventBus from "../../framework/services/event/eventBus";

export default class Index extends Component {
  //定义事件(会注册进eventBus)
  notices = [
    //要注册的事件
    {
      name: PublicEvent.EVENT_1,
      callback: (msg) => {
        console.log(msg)
      },
    },
  ];

  componentWillMount() {
    //初始化config配置
    SocketUtil.initSocketParams({
      //在这里定义 config 参数
    });

    //初始化socket订阅事件
    SocketUtil.subscribe();
  }

  componentDidMount() {
    //注册事件(eventBus)
    if (this.notices && this.notices.length) {
      this.notices.forEach((item) => {
        EventBus.listen(item.name, item.callback, this);
      });
    }
  }

  componentWillUnmount() {
    //解除socket订阅事件
    SocketUtil.unsubscribe();

    //移除当前组件eventBus监听事件
    if (this.notices && this.notices.length) {
      this.notices.forEach((item) => {
        EventBus.remove(item.name, this);
      });
      this.notices = [];
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  navigateToPage() {
    Taro.navigateTo({
      url: '/pages/log/index'
    })
  }

  config = {
    navigationBarTitleText: "首页",
  };

  render() {
    return (
      <View className="index">
        <View className="title">微信小程序使用STOMP(WebSocket)</View>
        <Button onClick={this.navigateToPage}>跳转log页面</Button>
      </View>
    );
  }
}
