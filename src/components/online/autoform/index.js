import {WIDGET_PRE} from './model/Constants'
import InputWidget from './view/InputWidget.vue';
import NumberWidget from './view/NumberWidget.vue';
import PasswordWidget from './view/PasswordWidget.vue';
import DateWidget from './view/DateWidget.vue';
import DatetimeWidget from './view/DatetimeWidget.vue';
import TextareaWidget from './view/TextareaWidget.vue';
import SelectWidget from './view/SelectWidget.vue';
import RadioWidget from './view/RadioWidget.vue';
import UploadWidget from './view/UploadWidget.vue';
import CheckboxWidget from './view/CheckboxWidget.vue';
import RateWidget from './view/RateWidget.vue';
import SwitchWidget from './view/SwitchWidget.vue';
import EditorWidget from './view/EditorWidget.vue';
import PopupWidget from './view/PopupWidget.vue';
import SelectMultiWidget from './view/SelectMultiWidget.vue';
import SelectDepartWidget from './view/SelectDepartWidget.vue';
import SelectUserWidget from './view/SelectUserWidget.vue';
import SelectSearchWidget from './view/SelectSearchWidget.vue';
import TreeSelectWidget from './view/TreeSelectWidget.vue';
import TreeCategoryWidget from './view/TreeCategoryWidget.vue';
import HiddenWidget from './view/HiddenWidget.vue';
import LinkDownWidget from './view/LinkDownWidget.vue'
import ImageWidget from './view/ImageWidget.vue'
import PcaWidget from './view/PcaWidget.vue'
import MarkdownWidget from './view/MarkdownWidget.vue'

import widgetRegistry from './model/WidgetRegistry';
import JPopup from './comp/JPopup.vue'


export default {
  install(Vue) {
    // 注册输入框
    widgetRegistry.register(WIDGET_PRE+'text', InputWidget);
    // 注册数字输入框
    widgetRegistry.register(WIDGET_PRE+'number', NumberWidget);
    // 注册数字输入框
    widgetRegistry.register(WIDGET_PRE+'integer', NumberWidget);
    //注册密码框
    widgetRegistry.register(WIDGET_PRE+'password', PasswordWidget);
    // 注册日期
    widgetRegistry.register(WIDGET_PRE+'date', DateWidget);
    //注册时间
    widgetRegistry.register(WIDGET_PRE+'datetime', DatetimeWidget);
    //注册多行文本
    widgetRegistry.register(WIDGET_PRE+'textarea', TextareaWidget);
    //注册下拉框
    widgetRegistry.register(WIDGET_PRE+'list', SelectWidget);
    //注册 radio
    widgetRegistry.register(WIDGET_PRE+'radio', RadioWidget);
    //注册 upload file
    widgetRegistry.register(WIDGET_PRE+'file', UploadWidget);
    //注册 upload image
    widgetRegistry.register(WIDGET_PRE+'image', ImageWidget);
    //注册 checkbox
    widgetRegistry.register(WIDGET_PRE+'checkbox', CheckboxWidget);
    //注册 打分
    widgetRegistry.register(WIDGET_PRE+'rate', RateWidget);
    //注册 switch
    widgetRegistry.register(WIDGET_PRE+'switch', SwitchWidget);
    //注册 富文本
    widgetRegistry.register(WIDGET_PRE+'umeditor', EditorWidget);
    //注册 popup
    widgetRegistry.register(WIDGET_PRE+'popup', PopupWidget);
    //注册 下拉多选
    widgetRegistry.register(WIDGET_PRE+'list_multi', SelectMultiWidget);
    //注册 部门选择器
    widgetRegistry.register(WIDGET_PRE+'sel_depart', SelectDepartWidget);
    //注册 用户选择器
    widgetRegistry.register(WIDGET_PRE+'sel_user', SelectUserWidget);
    //注册 字典表搜索
    widgetRegistry.register(WIDGET_PRE+'sel_search', SelectSearchWidget);
    //注册 树形下拉【异步加载的】
    widgetRegistry.register(WIDGET_PRE+'sel_tree', TreeSelectWidget);
    //注册 分类字典
    widgetRegistry.register(WIDGET_PRE+'cat_tree', TreeCategoryWidget);
    //注册 隐藏组件
    widgetRegistry.register(WIDGET_PRE+'hidden', HiddenWidget);
    //注册 级联组件
    widgetRegistry.register(WIDGET_PRE+'link_down', LinkDownWidget);
    //注册 省市区组件
    widgetRegistry.register(WIDGET_PRE+'pca', PcaWidget);
    //注册 markdown组件
    widgetRegistry.register(WIDGET_PRE+'markdown', MarkdownWidget);



    //popup配置
    Vue.component('JPopup',JPopup);
    console.log("在线表单各类组件install完成")
  }
}

/*
text：文本框
password：密码
radio：单选框
checkbox：多选
date 日期(yyyy-MM-dd)
datetime 日期（yyyy-MM-dd HH:mm:ss）
  file：文件
textarea：多行文本
list：下拉框
popup 弹出框
image：图片
umeditor 编辑器
tree：树控件*/