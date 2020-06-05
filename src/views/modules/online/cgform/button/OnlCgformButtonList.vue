<template>
  <a-modal
    title="自定义按钮"
    :width="modalWidth"
    :style="modalStyle"
    :visible="visible"
    @cancel="handleCancel"
    cancelText="关闭">

    <template slot="footer">
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style=" margin-bottom: 18px;">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div :style="table_area_style">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <onlCgformButton-modal :code="code" ref="modalForm" @ok="modalFormOk"></onlCgformButton-modal>
  </a-modal>
</template>

<script>
  import OnlCgformButtonModal from './OnlCgformButtonModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { getAction } from '@/api/manage'
  export default {
    name: "OnlCgformButtonList",
    mixins:[JeecgListMixin],
    components: {
      OnlCgformButtonModal
    },
    data () {
      return {
        modalWidth: '100%',
        modalStyle: {
          'top': 0,
          'padding':0,
          'height':(window.innerHeight-5)+"px",
          'overflow-y':'auto'
        },
        table_area_style:{
          'height':(window.innerHeight-210)+"px",
        },
        visible:false,
        description: '自定义按钮管理页面',
        code:'',
        url: {
          list: "/online/cgform/button/list/",
          delete: "/online/cgform/button/delete",
          deleteBatch: "/online/cgform/button/deleteBatch",
        },
        isorter:{
          column: 'orderNum',
          order: 'asc',
        },
        // 表头
        columns: [
          {
            title: '按钮编码',
            align:"center",
            dataIndex: 'buttonCode'
          },{
            title: '按钮名称',
            align:"center",
            dataIndex: 'buttonName'
          },{
            title: '按钮样式',
            align:"center",
            dataIndex: 'buttonStyle',
            customRender:(text,row)=>{
              if(text==='form'){
                let p = row.optPosition;
                return text + '('+ (p=='2'?'底部':'侧面')+')';
              }else{
                return text
              }
            }
          },
          {
            title: '按钮类型',
            align:"center",
            dataIndex: 'optType'
          },{
            title: '排序',
            align:"center",
            dataIndex: 'orderNum'
          },{
            title: '按钮图标',
            align:"center",
            dataIndex: 'buttonIcon'
          },{
            title: '表达式',
            align:"center",
            dataIndex: 'exp'
          },{
            title: '按钮状态',
            align:"center",
            dataIndex: 'buttonStatus',
            customRender:function (text) {
              if(text==1){
                return '激活'
              }else{
                return '未激活'
              }
            }
          },{
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }]
      }
    },
    created() {
      //this.code = this.$route.params.code

    } ,
    methods: {
      loadData(arg) {
        if(!this.code){
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        getAction(this.url.list+this.code, params).then((res) => {
          if (res.success) {
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
          }
        })
      },
      handleCancel(){
        this.visible=false
        this.code = ''
      },
      show(code){
        this.code = code
        this.visible=true
        this.loadData(1)
      }
    }
  }
</script>
