<template>
  <div>
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
    <a-card>
      <a-steps progressDot :current="stepIndex" style="padding: 10px" size="default">
        <template v-if="resultObj.bpmLogListCount >3">
        <a-step>
          <template slot="title">
            <div class="task-title">...</div>
          </template>
        </a-step>
        </template>
        <template v-for="(item,index) in resultObj.bpmLogStepList">
          <a-step>
            <template slot="title">
              <div class="task-title">{{ item.taskName }}</div>
            </template>
            <template slot="description">
              <div class="task-date" style="text-align: left"> <span><j-ellipsis :length="15" :value="'办理时间：'+ item.opTime "></j-ellipsis></span></div>
              <div class="task-user" style="text-align: left"> 操作人：{{ item.opUserName }}</div>
            </template>
          </a-step>
        </template>
        <template v-if="resultObj.currTaskName&&resultObj.currTaskName!=''">
          <a-step >
            <template slot="title">
              <div class="task-title" >{{ resultObj.currTaskName }}</div>
            </template>
            <template slot="description">
              <div class="task-date" style="text-align: left"> <span style="color: #ff6d75;"><j-ellipsis :value="'开始时间：'+ resultObj.currTaskNameStartTime"></j-ellipsis></span></div>
              <div class="task-user" style="text-align: left"> 操作人：{{ resultObj.currTaskNameAssignee }}</div>
            </template>
          </a-step>
          <a-step>
            <template slot="title">
              <div class="task-title">...</div>
            </template>
          </a-step>
          <!--<a-step>
            <template slot="title">
              <div class="task-title"></div>
            </template>
          </a-step>-->
        </template>

      </a-steps>
    </a-card>
    <!-- 意见 -->
    <a-card title="意见信息——his" :bodyStyle="{padding:'0 20px'}" size="default" style="margin-top:20px">
      <a-list itemLayout="vertical">
        <template v-for="(item,index) in resultObj.bpmLogList">
          <a-list-item >
            <a-list-item-meta :description="item.remarks">
              <a slot="title">{{ item.opUserName }}<span style="color: #ff6d75;">[{{ item.taskName }}]</span> {{ item.opTime }}</a>
              <a-avatar slot="avatar" :size="36" icon="user" style="background-color: #51cbff;"></a-avatar>
            </a-list-item-meta>
            <template v-for="(file,index) in item.bpmFiles">
              <div class="ant-upload-list ant-upload-list-text">
                <div class="ant-upload-list-item ant-upload-list-item-done">
                  <div class="ant-upload-list-item-info">
                <span>
                    <a-icon type="paper-clip" />
                    <a target="_blank" rel="noopener noreferrer" :title="file.fileName" :href="getFileDownloadUrl(file.filePath)" class="ant-upload-list-item-name">{{ file.fileName }}</a>
                </span>
                  </div>
                </div>
              </div>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
    </a-spin>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { getAction,httpAction } from '@/api/manage'
  import SelectUserModal from "./SelectUserModal";
  import JEllipsis from "../../../../../components/jeecg/JEllipsis.vue";
  import { getFileAccessHttpUrl } from '@/api/manage';

  export default {
    components: {
      JEllipsis,
      SelectUserModal},
    name: 'HisTaskModule',
    props: ['formData'],
    data() {
      return {
        url: {
          getHisProcessTaskTransInfo: '/act/task/getHisProcessTaskTransInfo'
        },
        headers: {},
        resultObj:{},
        checkedNext: false,
        transition:[],
        hqUserSelectList:[],
        ccUserSelectList:[],
        model:{
          taskId:"",
          nextnode:"",
          nextCodeCount:"",
          reason:"",
          processModel:1,
          rejectModelNode:"",
          nextUserName:"",
          nextUserId:"",
          ccUserIds:"",
          ccUserRealNames:"",
        },
        bodyStyle:{
          padding: "10px"
        },
        checkedCc: false,
        loading:false,
      }
    },
    computed: {
      stepIndex: function () {
        if(this.resultObj.bpmLogListCount>3){
          return this.resultObj.bpmLogStepListCount+1;
        }
        return this.resultObj.bpmLogStepListCount;
      },
    },
    methods: {
      getFileDownloadUrl: function (path) {
        return getFileAccessHttpUrl(path);
      },
      handleChange() {
      },
      getHisProcessTaskTransInfo(formData){
        var params = {procInstId:formData.procInsId};//查询条件
        this.loading = true;
        getAction(this.url.getHisProcessTaskTransInfo,params).then((res)=>{
          if(res.success){
            console.log("流程流转信息",res);
            this.resultObj = res.result;
          }
          this.loading = false;
        })
      },
    },
    created() {
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = { 'X-Access-Token': token };
      console.log("任务办理组件数据：",this.formData);
      this.getHisProcessTaskTransInfo(this.formData);

    }
  }
</script>

<style scoped>
  .task-info {
    margin: 20px 0;
  }

  .task-title {
    font-weight: bold;
  }

  .task-date {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-steps-item-description {
    max-width: 200px !important;
  }

  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>