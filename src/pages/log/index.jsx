import Taro, { Component } from "@tarojs/taro";
import { View,Button } from "@tarojs/components";

import PublicEvent from "../../framework/services/event/publicEvent";
import EventBus from "../../framework/services/event/eventBus";

export default class Log extends Component {
  
    componentWillMount() {
      
    }
  
    componentDidMount() {
     
    }
  
    componentWillUnmount() {
    
    }
  
    componentDidShow() {}
  
    componentDidHide() {}

    trigger() {
        EventBus.emit(PublicEvent.EVENT_1,`哈喽,悠然,${PublicEvent.EVENT_1}订阅给你推送了一条新消息`)
    }
  
    config = {
      navigationBarTitleText: "日志",
    };
  
    render() {
      return (
        <View className="log">
            <Button onClick={this.trigger}>trigger</Button>
        </View>
      );
    }
  }