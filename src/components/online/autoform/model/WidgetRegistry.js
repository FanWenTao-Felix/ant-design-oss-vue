import Widget from './Widget'

/**
 * 存储容器
 * 动态表单组件注册类
 * 提供注册和获取方法
 */
class WidgetRegistry {

  widgets=new Widget();
  defaultWidget="";

  /**
   * 设置默认组件，以便找不到type对应的逐渐时候显示
   * @param widget
   */
   setDefault(widget) {
    this.defaultWidget = widget;
  }

  /**
   * 注册动态表单组件
   * @param type
   * @param widget
   */
  register(type, widget) {
    this.widgets.set(type, widget);
  }

  /**
   * 判断指定的组件名称是否存在
   * @param type
   */
   has(type) {
    return this.widgets.has(type);
  }

  /**
   * 根据指定类型获取动态组件
   * @param type
   */
  getType(type){
    let ret = this.widgets.get(type);
    if(ret == null){
      ret = this.defaultWidget;
    }
    return ret
  }

}

const widgetRegistry = new WidgetRegistry();
export default widgetRegistry;
