<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="8" :sm="12">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入名称查询" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="标识">
              <a-input placeholder="请输入名称查询" v-model="queryParam.key"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增流程</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a
        style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <a :href="getDesignrURL(record.id)" target="_blank"
             class="el-button el-button--text el-button--small">在线设计</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定发布吗?" @confirm="() => handleDeploy(record.id)"><a>发布</a></a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定导出吗?" @confirm="() => handleExport(record.id)"><a>导出</a></a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)"><a>删除</a></a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <BpmModel ref="bpmModel" @ok="okCallback"></BpmModel>
  </a-card>
</template>

<script>
  import {filterObj} from '@/utils/util'
  import {deleteAction, getAction, postAction} from '@/api/manage'
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'
  import BpmModel from './form/BpmModel'
  import qs from 'qs'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "ModelList",
    mixins: [JeecgListMixin],
    components: {
      BpmModel
    },
    data() {
      return {
        description: '流程设计管理',
        // 查询条件
        queryParam: {},
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: "center",
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },
          {
            title: '流程名称',
            align: "center",
            dataIndex: 'name'
          },
          {
            title: '标识',
            align: "center",
            dataIndex: 'key'
          },
          {
            title: '版本号',
            align: "center",
            dataIndex: 'version'
          },
          {
            title: '创建时间',
            align: "center",
            dataIndex: 'createTime',
          },
          {
            title: '更新时间',
            align: "center",
            dataIndex: 'lastUpdateTime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
          }
        ],
        url: {
          list: "/act/model/list",
          delete: "/act/model/delete",
          deploy: "/act/model/deploy/${id}",
          export: "/act/model/export/${id}",
        },

      }
    },
    methods: {
      // 流程设计器URL
      getDesignrURL(id) {
        var params = qs.stringify({
          //'token': Cookies.get('token'),
          'modelId': id
        })
        return `${window._CONFIG['domianURL']}/modeler.html?modelId=${id}`
      },
      okCallback(modelId) {
        console.log('modelId :' + modelId)
        window.open(`${window._CONFIG['domianURL']}/modeler.html?modelId=${modelId}`, '_blank')
        //重载列表
        this.loadData();
      },
      handleDeploy(modelId) {
        let url = this.url.deploy.replace('${id}', modelId)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
          }
        })
      },
      handleExport(modelId) {
        let url = this.url.export.replace('${id}', modelId)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleAdd: function () {
        this.$refs.bpmModel.add();
        this.$refs.bpmModel.title = "新增流程";
      },
    }
  }
</script>
<style scoped>
  .ant-card-body .table-operator {
    margin-bottom: 18px;
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
</style>