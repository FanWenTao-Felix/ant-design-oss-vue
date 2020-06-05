<template>
  <a-card :bordered="false">
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
              <a-input placeholder="请输入流程名称" v-model="queryParam.processName"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: right;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>
    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        :scroll="{x: 1600}"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
            <template v-if="record.endTime&&record.endTime!=''">
              <a @click="showHistory(record)">
                历史
              </a>
            </template>
            <template v-else>
              <a-dropdown>
                <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
                <a-menu slot="overlay">
                    <a-menu-item >
                      <a-popconfirm title="确定要作废流程吗?" @confirm="() => invalidProcess(record)">
                        <a>
                          作废流程
                        </a>
                      </a-popconfirm>
                    </a-menu-item>
                    <a-menu-item >
                      <a-popconfirm title="确定要取回流程吗?" @confirm="() => callBackProcess(record)">
                        <a>
                          取回流程
                        </a>
                      </a-popconfirm>
                    </a-menu-item>
                    <a-menu-item  @click="showHistory(record)">历史</a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
          <!--<template v-if="record.endTime&&record.endTime!=''">
            <a @click="showHistory(record)">
              历史
            </a>
          </template>
          <template v-else>
            <a-popconfirm title="确定要作废吗?" @confirm="() => invalidProcess(record)">
              <a>
                作废流程
              </a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a-popconfirm title="确定要取回流程吗?" @confirm="() => callBackProcess(record)">
              <a>
                取回流程
              </a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a @click="showHistory(record)">
                历史
            </a>
          </template>-->
        </span>

        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <j-ellipsis :value="text"/>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 弹出框 -->
    <his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { getAction,putAction } from '@/api/manage'
  import HisTaskDealModal from "./HisTaskDealModal";
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {BpmNodeInfoMixin} from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'

  export default {
    name: 'HisProcessList',
    mixins: [JeecgListMixin,BpmNodeInfoMixin],
    components: {
      HisTaskDealModal,
      JEllipsis
    },
    data() {
      return {
        description: '历史流程',
        queryParam: {},
        dataSource: [],
        loading: false,
        columns: [
          {
            title: '#',
            dataIndex: '',
            width: 60,
            key: 'rowIndex',
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '业务标题',
            align: 'center',
            dataIndex: 'bpmBizTitle',
            scopedSlots: { customRender: 'bpmBizTitle' }
          },
          {
            title: '流程名称',
            align: 'center',
            dataIndex: 'prcocessDefinitionName'
          },
          {
            title: '流程编号',
            align: 'center',
            dataIndex: 'processDefinitionId'
          },

          {
            title: '流程实例',
            align: 'center',
            dataIndex: 'processInstanceId'
          },
          {
            title: '发起人',
            align: 'center',
            dataIndex: 'startUserName'
          },
          {
            title: '开始日期',
            align: 'center',
            dataIndex: 'startTime'
          },
          {
            title: '结束时间',
            align: 'center',
            dataIndex: 'endTime'
          },
          {
            title: '耗时',
            align: 'center',
            dataIndex: 'spendTimes'
          },
          {
            title: '状态',
            align: 'center',
            dataIndex: 'bpmStatus',
            customRender: (text) => {
              switch(text) {
                case '1':
                  return '待提交';
                case '2':
                  return '处理中';
                case '3':
                  return '已完成';
                case 'rejectProcess':
                  return '已驳回';
                case 'callBackProcess':
                  return '已取回';
                case 'invalidProcess':
                  return '已作废';
              }
              return text;
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            fixed: 'right',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 100
          }

        ],
        url: {
          list:"/act/task/historyProcessList",
          invalidProcess:"/act/task/invalidProcess",
          callBackProcess:"/act/task/callBackProcess",
        },
        path:"modules/bpm/task/form/FormLoading",
        formData:{},

      }
    },
    methods: {
      // 流程作废
      invalidProcess(record) {
        var that = this;
        var params = {
          processInstanceId:record.processInstanceId
        };//查询条件
        console.log("流程作废",params)
        putAction(that.url.invalidProcess, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
            that.loadData();
          }
        })
      },
      // 流程取回
      callBackProcess(record) {
        var that = this;
        var params = {
          processInstanceId:record.processInstanceId
        };//查询条件
        console.log("流程取回",params)
        putAction(that.url.callBackProcess, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
            that.loadData();
          }
        })
      },
      // 历史
      showHistory(record){
        this.getHisProcessNodeInfo(record);
      },
    }

  }
</script>
<style scoped>
  .ant-card-body {
    margin-bottom: 18px;
  }

  .table-operator button {
    margin-bottom: 18px;
    margin-right: 5px;
  }

  .ant-table-tbody .ant-table-row td {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .anty-row-operator button {
    margin: 0 5px
  }

  .ant-btn-danger {
    background-color: #ffffff
  }

  .ant-modal-cust-warp {
    height: 100%
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden
  }

  .anty-img-wrap {
    height: 25px;
    position: relative;
  }

  .anty-img-wrap > img {
    max-height: 100%;
  }

  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>