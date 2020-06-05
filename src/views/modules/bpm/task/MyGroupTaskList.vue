<template>
  <div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="8" :sm="12">
            <a-form-item label="流程编号">
              <a-input placeholder="请输入流程编号" v-model="queryParam.processDefinitionId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名称" v-model="queryParam.processDefinitionName"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->


    <!-- table区域-begin -->
    <div>

      <a-table
        ref="table"
        :scroll="{x: 1800}"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <template v-if="record.taskAssigneeName&&record.taskAssigneeName!=''">
            <a  @click="handleProcess(record)">
              办理
            </a>
          </template>
          <template v-else>
            <a  @click="handleClaim(record)" >
              签收
            </a>
          </template>
        </span>

        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <j-ellipsis :value="text" :length="15"/>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->
    <!-- 弹出框 -->
    <task-deal-modal ref="taskDealModal" :path="path" :formData="formData" @ok="handleOk"></task-deal-modal>
  </div>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction,postAction,putAction } from '@/api/manage'
  import TaskDealModal from "./TaskDealModal";
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {BpmNodeInfoMixin} from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'

  export default {
    name: "MyGroupTaskList",
    mixins: [JeecgListMixin,BpmNodeInfoMixin],
    components: {
      TaskDealModal,
      JEllipsis
    },
    data () {
      return {
        description: '我的组任务',
        // 查询条件
        queryParam: {},
        // 表头
        columns: [
          {
            title: '#',
            width: 60,
            dataIndex: '',
            key: 'rowIndex',
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          }, {
            title: '业务标题',
            align: 'center',
            dataIndex: 'bpmBizTitle',
            scopedSlots: { customRender: 'bpmBizTitle' }
          }, {
            title: '流程编号',
            align: 'center',
            dataIndex: 'processDefinitionId'
          },{
            title: '流程名称',
            align: 'center',
            dataIndex: 'processDefinitionName'
          },{
            title: '流程实例',
            align: 'center',
            dataIndex: 'processInstanceId'
          },{
            title: '任务ID',
            align: 'center',
            dataIndex: 'taskId'
          }, {
            title: '发起人',
            align: 'center',
            dataIndex: 'processApplyUserName'
          },{
            title: '开始时间',
            align: 'center',
            dataIndex: 'taskBeginTime'
          }, {
            title: '结束时间',
            align: 'center',
            dataIndex: 'taskEndTime'
          }, {
            title: '当前环节',
            align: 'center',
            dataIndex: 'taskName'
          }, {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            width:150,
            scopedSlots: {customRender: 'action'}
          }
        ],
        path:"modules/bpm/task/form/FormLoading",
        formData:{},
		    url: {
          list: "/act/task/taskGroupList",
          claim: "/act/task/claim",
        },
        
      }
    },
    methods: {
      handleProcess(record){
        this.getProcessNodeInfo(record);
      },
      handleClaim(record){
        var that = this;
        var params = {taskId:record.id};//查询条件
        this.$confirm({
          title:"确认签收吗",
          content:"是否签收该任务?",
          onOk: function(){
            putAction(that.url.claim, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
              } else {
                that.$message.warning(res.message);
                that.loadData();
              }
            })
          }
        });
      },
      handleOk(){
        this.loadData();
      }
    }
  }
</script>
<style lang="less" scoped>

</style>