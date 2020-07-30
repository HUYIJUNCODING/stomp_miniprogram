import Taro, { Component } from "@tarojs/taro";
import Index from "./pages/index";

import "./app.scss";

import SocketUtil from "./framework/services/websocket/SocketUtil";

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {
  componentDidMount() {
    //初始化websocket
    SocketUtil.initWebSocket();
  }

  componentDidShow() {}

  componentDidHide() {}

  componentWillUnmount() {}

  componentDidCatchError() {}

  config = {
    pages: ["pages/index/index", "pages/log/index"],
    window: {
      backgroundTextStyle: "dark",
      navigationBarBackgroundColor: "#FCDF1F",
      navigationBarTitleText: "悠然",
      navigationBarTextStyle: "black",
    },
  };

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Index />;
  }
}

Taro.render(<App />, document.getElementById("app"));
