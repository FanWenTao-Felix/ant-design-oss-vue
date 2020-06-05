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
      <a-button @click="handleAdd" type="primary" icon="plus">部署流程</a-button>
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
        rowKey="deploymentId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :scroll="{ x: 1500}"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="resourceName" slot-scope="text, record">
          <a :href="getResourceURL(record.deploymentId, record.resourceName)" target="_blank">{{ record.resourceName | ellipsis }}</a>
        </span>

        <span slot="diagramResourceName" slot-scope="text, record">
          <a :href="getResourceURL(record.deploymentId, record.diagramResourceName)"
             target="_blank">{{ record.diagramResourceName | ellipsis}}</a>
        </span>

        <span slot="action" slot-scope="text, record">
          <a-popconfirm v-if="record.suspended" title="确定激活吗?" @confirm="() => handleActive(record.id)"><a>激活</a></a-popconfirm>
          <a-popconfirm v-else title="确定挂起吗?" @confirm="() => handleSuspend(record.id)"><a>挂起</a></a-popconfirm>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定转成模型吗?" @confirm="() => handleToModel(record.id)"><a>转模型</a></a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.deploymentId)"><a>删除</a></a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- TABLE区域-END -->

    <!-- 表单区域 -->
    <UploadProcess ref="uploadProcess" @ok="okCallback"></UploadProcess>
  </a-card>
</template>

<script>
  import {filterObj} from '@/utils/util'
  import {deleteAction, getAction} from '@/api/manage'
  import UploadProcess from './form/UploadProcess'
  import qs from 'qs'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "PorcessList",
    mixins: [JeecgListMixin],
    components: {
      UploadProcess
    },
    filters: {
      ellipsis: function(value) {
        if (!value) return ''
        if (value.length > 20) {
          return value.slice(0,20) + '...'
        }
        return value
      }
    },
    data() {
      return {
        description: '流程发布管理',
        // 查询条件
        queryParam: {},
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 50,
            align: "center",
            fixed: 'left',
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },
          {
            title: '流程名称',
            align: "center",
            dataIndex: 'name',
            width: 180,
            fixed: 'left'
          },
          {
            title: '流程ID',
            align: "center",
            dataIndex: 'id',
            width: 180,
            fixed: 'left'
          },
          {
            title: '标识',
            align: "center",
            dataIndex: 'key',
            width: 150,
            fixed: 'left'
          },
          {
            title: '部署ID',
            align: "center",
            dataIndex: 'deploymentId',
          },
          {
            title: '版本号',
            align: "center",
            dataIndex: 'version',
          },
          {
            title: 'XML',
            align: "center",
            dataIndex: 'resourceName',
            scopedSlots: {customRender: 'resourceName'},
          },
          {
            title: '图片',
            align: "center",
            dataIndex: 'diagramResourceName',
            scopedSlots: {customRender: 'diagramResourceName'},
          },
          {
            title: '发布时间',
            align: "center",
            dataIndex: 'deploymentTime',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
            width: 120,
            fixed: 'right',
          }
        ],
        url: {
          list: "/act/process/list",
          delete: "/act/process/delete",
          active: "/act/process/active/${id}",
          suspend: "/act/process/suspend/${id}",
          convertToModel: "/act/process/convertToModel/${deploymentId}",
        },

      }
    },
    methods: {
      // 获取静态资源访问地址
      getResourceURL(id, name) {
        var params = qs.stringify({
          //'token': Cookies.get('token'),
          'deploymentId': id,
          'resourceName': name
        })
        return `window._CONFIG['domianURL']/act/process/resource?${params}`
      },
      okCallback() {
        //重载列表
        this.loadData();
      },
      handleActive(id) {
        let url = this.url.active.replace('${id}', id)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleSuspend(id) {
        let url = this.url.suspend.replace('${id}', id)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleToModel(deploymentId) {
        let url = this.url.convertToModel.replace('${deploymentId}', deploymentId)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleAdd: function () {
        this.$refs.uploadProcess.add();
        this.$refs.uploadProcess.title = "部署流程文件";
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