//

1.使用示例 参考jeecgOnlineTest
uiSchema定义的是与表单相关的信息，比如表单提交地址、提交方式、表单验证提示信息、表单布局信息
schema 定义的是每个字段对应的控件信息 包括控件类型、label显示 //TODO 后续示例 也可以在schema内定义uiSchema的信息

备注：
扩展表单控件方法：
1.在view下新建一个控件文件 参考InputWidget
2.在index.js 中注册此组件
3.测试效果可在jeecgOnlineTest页面schema内添加字段属性

4.view内容建议不要随意更改,如有新需求可新增widget
5.涉及上传的widget在index.js中注册的时候命名务必带上upload