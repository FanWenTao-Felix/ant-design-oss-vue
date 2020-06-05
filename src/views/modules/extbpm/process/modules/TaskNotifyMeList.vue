<template>
    <div>

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
      </a-table>
    </div>
</template>

<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  export default {
    name: "TaskNotifyMeList",
    props: ['procInstId'],
    mixins:[JeecgListMixin],
    components: {
    },
    data () {
      return {
        description: '提醒我的',
        disableMixinCreated: true,
        queryParam:{},
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
           },
          {
            title: '流程名称',
            align:"center",
            dataIndex: 'procName'
          },
		      {
            title: '任务名称',
            align:"center",
            dataIndex: 'taskName'
           },
		   {
            title: '催办时间',
            align:"center",
            dataIndex: 'opTime'
           },
		   {
            title: '催办类型',
            align:"center",
            dataIndex: 'notifyType',
         customRender:function (text) {
           var srtArr = text.split(',');
           var value = "";
           if (srtArr.includes("1")) {
             value +=",页面通知"
           }
           if (srtArr.includes("2")) {
             value +=",邮件"
           }
           return value.substring(1);
         }
           },
		   {
            title: '催办说明',
            align:"center",
            dataIndex: 'remarks'
           }
        ],
		url: {
          list: "/process/extActTaskNotification/list",
       },
    }
  },
  computed: {
    importExcelUrl: function(){
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
    created() {
      //此处特殊，需要带参数查询数据，所以重新调用loadData()方法
      this.queryParam.procInstId = this.procInstId;
      console.log('this.procInstId',this.procInstId);
      this.loadData();
      //初始化字典配置 在自己页面定义
      this.initDictConfig();
    },
    methods: {
     
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>