<template>
  <a-modal
    :title="title"
    width="90%"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :footer="null"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
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

        <span slot="nodeTimeoutRender" slot-scope="text">
            <template v-if="text === null || text === 0">
            </template>
            <template v-else>
                {{ text +' 小时' }}
            </template>
        </span>
      </a-table>
    </a-spin>
  </a-modal>

</template>

<script>
  import {getAction} from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import {filterObj} from '@/utils/util'

  export default {
    name: "ExtActProcessNodeDeploymentModal",
    data() {
      return {
        title: "操作",
        visible: false,
        model: {},
        labelCol: {
          xs: {span: 24},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
        },

        confirmLoading: false,
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
            title: '节点名称',
            align: "center",
            dataIndex: 'processNodeName'
          },
          {
            title: '节点编码',
            align: "center",
            dataIndex: 'processNodeCode'
          },
          {
            title: 'PC表单地址',
            align: "center",
            dataIndex: 'modelAndView'
          },
          {
            title: '移动表单地址',
            align: "center",
            dataIndex: 'modelAndViewMobile'
          },
          {
            title: '超时提醒（时）',
            align: "center",
            dataIndex: 'nodeTimeout',
            scopedSlots: {customRender: 'nodeTimeoutRender'},
          }
        ],
        //数据集
        dataSource: [],
        // 分页参数
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        isorter: {
          column: 'id',
          order: 'asc',
        },
        loading: false,
        selectedRowKeys: [],
        selectedRows: [],
        url: {
          list: "/process/extActProcessNodeDeployment/list",
        },
      }
    },
    created() {
    },
    methods: {
      nodeList(data) {
        console.log("流程节点", data);
        this.visible = true;
        this.queryParam.deploymentId = data.deploymentId;
        this.loadData(1);
      },
      close() {
        this.$emit('close');
        this.visible = false;
      },

      handleCancel() {
        this.close()
      },
      loadData(arg) {
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        this.loading = true;
        var params = this.getQueryParams();//查询条件
        getAction(this.url.list, params).then((res) => {
          if (res.success) {
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
          }
        }).catch(e => {
          console.error(e)
        }).then(() => {
          this.loading = false;
        })
      },
      getQueryParams() {
        var param = Object.assign({}, this.queryParam, this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      getQueryField() {
        //TODO 字段权限控制
        var str = "id,";
        for (var a = 0; a < this.columns.length; a++) {
          str += "," + this.columns[a].dataIndex;
        }
        return str;
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectionRows;
      },
      onClearSelected() {
        this.selectedRowKeys = [];
        this.selectionRows = [];
      },
      searchQuery() {
        this.loadData(1);
      },
      searchReset() {
        var that = this;
        that.queryParam = {};
        that.loadData(1);
      },
      handleTableChange(pagination, filters, sorter) {
        //分页、排序、筛选变化时触发
        console.log(sorter);
        //TODO 筛选
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
        }
        this.ipagination = pagination;
        this.loadData();
      },

    }
  }
</script>

<style scoped>

</style>