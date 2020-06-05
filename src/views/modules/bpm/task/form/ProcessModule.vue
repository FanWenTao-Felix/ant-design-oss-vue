<template>
  <div>
    <div style="margin-bottom: 20px;height: 400px;overflow: hidden;overflow-y: auto;overflow-x: auto;">
      <img :src="imgPath" style="border:2px;cursor:hand;" alt="流程图" usemap="#planetmap">
      <map name="planetmap">
        <template v-for="(item, key, index) in nodePositionInfo.positionList">
         <area shape="rect" :coords="item.coords" title="Venus" @mouseover="showNodeInfo(nodePositionInfo.hisTasks,item.id)">
        </template>
      </map>
    </div>
    <a-card title="流程历史跟踪">
      <a-table
         rowKey="taskId"
        :loading="loading"
        :dataSource="dataSource"
        :columns="columns"
        size="small">
        <!-- 字符串超长截取省略号显示-->
        <span slot="remarks" slot-scope="text, record">
          <j-ellipsis :value="getNodeInfo(record)" :length="25"/>
        </span>
      </a-table>
    </a-card>

      <node-info-model ref="nodeInfoModel" ></node-info-model>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'
  import qs from 'qs';
  import NodeInfoModel from "./NodeInfoModel.vue";
  import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    components: {NodeInfoModel,JEllipsis},
    name: 'ProcessModule',
    props: ['formData'],
    computed: {
      imgPath: function () {
        var params = qs.stringify({
          //'token': Cookies.get('token'),
          '_t': Date.parse(new Date())/1000,
          'processInstanceId': this.formData.procInsId
        })
        return `${window._CONFIG['domianURL']}/act/task/traceImage?${params}`;
      }
    },
    data() {
      return {
        loading: true,
        dataSource: [],
        nodePositionInfo:{},
        url:{
          list:"/act/task/processHistoryList",
          getNodePositionInfo:"/act/task/getNodePositionInfo",
        },
        columns: [
          {
            title: '#',
            rowKey: (record, index) => index,
            width: 40,
            customRender(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '名称',
            dataIndex: 'name',
            customRender: function (text) {
              if (text == 'start1') {
                return "开始";
              } else if (text == 'end') {
                return "结束";
              } else {
                return text;
              }
            }
          }, {
            title: '流程实例ID',
            dataIndex: 'processInstanceId'
          }, {
            title: '开始时间',
            dataIndex: 'startTime'
          }, {
            title: '结束时间',
            dataIndex: 'endTime'
          }, {
            title: '负责人',
            dataIndex: 'assigneeName'
          }, {
            title: '处理结果',
            dataIndex: 'deleteReason'
          },{
            title: '处理意见',
            fixed: 'right',
            width: 350,
            dataIndex: 'remarks',
            scopedSlots: { customRender: 'remarks' }
          }
        ]
      }
    },
    methods: {
      // 查询数据
      requestData() {
        this.loading = true;
        var params = {processInstanceId:this.formData.procInsId};//查询条件
        getAction(this.url.list,params).then(res => {
          if (res.success) {
            // console.log(res.result.records)
            this.dataSource = res.result.records
          } else {
            this.$message.warn('加载失败')
          }
        }).catch(e => {
          console.error(e)
        }).then(() => {
          this.loading = false
        })
      },
      // 查询坐标信息数据
      getNodePositionInfoData() {
        var params = {processInstanceId:this.formData.procInsId};//查询条件
        getAction(this.url.getNodePositionInfo,params).then(res => {
          if (res.success) {
            this.nodePositionInfo = res.result
          }
        }).catch(e => {
          console.error(e)
        }).then(() => {
        })
      },
      showNodeInfo(data,taskId){
        this.$refs.nodeInfoModel.close();
        this.$refs.nodeInfoModel.showInfo(data,taskId);
      },
      getNodeInfo(record){
        if(this.nodePositionInfo){
          var data = this.nodePositionInfo.hisTasks;
          if(data){
            for (var item of data) {
              if(item.id == record.id){
                return item.remarks;
              }
            }
          }
        }
        return "";
      },
    },
    created() {
      this.getNodePositionInfoData();
      this.requestData();
    }

  }
</script>

<style scoped>

</style>