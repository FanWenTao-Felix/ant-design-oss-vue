/**
 * 新增修改完成调用 modalFormOk方法 编辑弹框组件ref定义为modalForm
 * 高级查询按钮调用 superQuery方法  高级查询组件ref定义为superQueryModal
 * data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
 */
import { getAction } from '@/api/manage'
import { isURL } from '@/utils/validate'
export const BpmNodeInfoMixin = {
  data(){
    return {
      url: {
        getProcessNodeInfo: "/process/extActProcessNode/getProcessNodeInfo",
        getHisProcessNodeInfo: "/process/extActProcessNode/getHisProcessNodeInfo",
      },
      formData:{},
    }
  },
  created() {
  },
  methods:{
    getProcessNodeInfo(record){
      let params = {taskId:record.id};//查询条件
      getAction(this.url.getProcessNodeInfo,params).then((res)=>{
        if(res.success){
          console.log("获取流程节点信息",res);
          let data = {
            dataId:res.result.dataId,
            taskId:record.id,
            taskDefKey:record.taskId,
            procInsId:record.processInstanceId,
            tableName:res.result.tableName,
            permissionList:res.result.permissionList,
            vars:res.result.records
          }
          this.formData = data;
          //update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
          console.log("获取流程节点表单URL",res.result.formUrl);

          let tempFormUrl = res.result.formUrl;
          //节点配置表单URL，VUE组件类型对应的拓展参数
          if(tempFormUrl && tempFormUrl.indexOf("?")!=-1 && !isURL(tempFormUrl) && tempFormUrl.indexOf("{{DOMAIN_URL}}")==-1){
            tempFormUrl = res.result.formUrl.split("?")[0];
            console.log("获取流程节点表单URL（去掉参数）",tempFormUrl);
            this.formData.extendUrlParams = getQueryVariable(res.result.formUrl)
          }

          //update--begin--autor:scott-----date:20191005------for：节点配置设计器表单的URL，需要参数传递taskid，用于节点表单权限------
          //如果没有taskId参数，程序自动追加，用于设计器表单节点权限
          if(tempFormUrl!=null && tempFormUrl.indexOf("{{DOMAIN_URL}}/desform/")!=-1 && tempFormUrl.indexOf("taskId")==-1){
            tempFormUrl = tempFormUrl.trim();
            if(tempFormUrl.endsWith("?")){
              tempFormUrl = tempFormUrl +'taskId='+record.taskId;
            }else{
              tempFormUrl = tempFormUrl +'&taskId='+record.taskId;
            }
          }
          this.path = tempFormUrl;
          //update--end--autor:scott-----date:20191005------for：节点配置设计器表单的URL，需要参数taskid，用于节点表单权限-----

          //update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------

          console.log("获取流程节点信息",this.formData);
          this.$refs.taskDealModal.deal(record);
          this.$refs.taskDealModal.title="流程办理";
        }
      })
    },
    getHisProcessNodeInfo(record){
      var params = {procInstId:record.processInstanceId};//查询条件
      getAction(this.url.getHisProcessNodeInfo,params).then((res)=>{
        if(res.success){
          console.log("获取流程节点信息",res);
          var  data = {
            dataId:res.result.dataId,
            taskId:record.id,
            taskDefKey:record.taskId,
            procInsId:record.processInstanceId,
            tableName:res.result.tableName,
            vars:res.result.records
          }
          this.formData = data;
          //update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
          console.log("获取流程节点表单URL ",res.result.formUrl);

          let tempFormUrl = res.result.formUrl;
          //节点配置表单URL，VUE组件类型对应的拓展参数
          if(tempFormUrl && tempFormUrl.indexOf("?")!=-1 && !isURL(tempFormUrl) && tempFormUrl.indexOf("{{DOMAIN_URL}}")==-1){
            tempFormUrl = res.result.formUrl.split("?")[0];
            console.log("获取流程节点表单URL（去掉参数）",tempFormUrl);
            this.formData.extendUrlParams = getQueryVariable(res.result.formUrl)
          }
          this.path = tempFormUrl;
          //update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------

          console.log("获取流程节点信息",this.formData);
          this.$refs.taskDealModal.deal(record);
          this.$refs.taskDealModal.title="流程历史";
        }
      })
    },
  }
}

//获取URL上参数
function getQueryVariable(url) {
  if(!url) return

  var t, n, r, i = url.split("?")[1], s = {};
  t = i.split("&"),
    r = null,
    n = null;
  for (var o in t) {
    var u = t[o].indexOf("=");
    u !== -1 && (r = t[o].substr(0, u),
      n = t[o].substr(u + 1),
      s[r] = n)
  }
  return s
}