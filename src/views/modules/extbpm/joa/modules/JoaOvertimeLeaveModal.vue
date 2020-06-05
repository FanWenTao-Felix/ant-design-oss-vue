<template>
  <a-modal
    :title="title"
    :width="900"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
    class="model">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-card id="staffCard">
          <span id="staffTwdoTitle">调休申请单</span>
          <table border="3px" id="staffTwdoTable">
            <tr>
              <td class="colfirst">申请人</td>
              <td class="secend">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span>{{nickname}}</span>
                </a-form-item>
              </td>
              <td>部门</td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span>{{model.department}}</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="colfirst">申请时间</td>
              <td style="width:180px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                                class="input"
                                placeholder=""
                                format='YYYY-MM-DD'
                                disabled
                                v-decorator="[ 'applyTime', {}]"/>
                </a-form-item>
              </td>
              <td>调休时长</td>
              <td class="colfour">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-input
                    class="text"
                    placeholder="例如:1天4小时"
                    style="width:60%;"
                    v-decorator="[ 'leaveTime', {}]" />
                  （天/小时）
                </a-form-item>
              </td>
            </tr>

            <tr>
              <td class="colfirst">开始时间</td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                                class="input"
                                placeholder=""
                                showTime
                                format='YYYY-MM-DD HH:mm:ss'
                                v-decorator="[ 'beginTime', {}]"/>
                </a-form-item>
              </td>
              <td>结束时间</td>
              <td class="colfour">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                            class="input"
                            placeholder=""
                            v-decorator="[ 'endTime', {}]"
                            showTime
                            format='YYYY-MM-DD HH:mm:ss'/>

                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>注意</td>
              <td colspan="3">
                调休半天可以写0.5不能写0.1,.2等小数(切记)2.全天调休以00:00:00开始以23:59结束语。下午调休以12:00:00开始最小调休时间为0.5天，请各领导审批时注意
              </td>
            </tr>
            <tr>
              <td>调休期间联系方式</td>
              <td colspan="3">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-input class="text" placeholder="" v-decorator="[ 'contactWay', {}]"></a-input>
                </a-form-item>
              </td>
            </tr>
            <tr style="height: 120px;">
              <td class="colfirst">工作交接安排</td>
              <td colspan="3">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-textarea
                              v-decorator="[ 'workPlan', {}]"
                              style="resize:none;height:118px;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="colfirst">工作代理人</td>
              <td colspan="3" height="40px">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" placeholder="" v-decorator="[ 'workAgent', {}]"></a-input>
                </a-form-item>
              </td>
            </tr>
            <tr style="height:210px;" class="inlineTableTr" :hidden="hidden">
              <td colspan="4">
                <a-table
                  bordered
                  :dataSource="dataSource"
                  :columns="columns"
                  :pagination="false"
                  :scroll="{y: 100 ,x:600}"
                  class="inlineTable">
                  <template  slot="day">
                    <a-popover >
                      <template slot="content">
                        <p style="font-size: 12px">1.补偿天数不能大于未补偿天数</p>
                        <p style="font-size: 12px">2.不支持负数</p>
                        <p style="font-size: 12px">3.只能输入数字</p>
                        <p style="color:red;font-size: 10px">注:鼠标悬停调休申请天数，点击<a-icon type="edit"/>即可操作</p>
                      </template>
                      <span style="cursor:pointer;" ><a-icon type="edit"/> 天</span>
                    </a-popover>
                  </template>
                  <template  slot="hour">
                    <a-popover >
                      <template slot="content">
                        <p style="font-size: 12px">1.补偿小时不能大于未补偿小时</p>
                        <p style="font-size: 12px">2.不支持负数</p>
                        <p style="font-size: 12px">3.只能输入数字</p>
                        <p style="color:red;font-size: 10px">注:鼠标悬停调休申请小时，点击<a-icon type="edit"/>即可操作</p>
                      </template>
                      <span style="cursor:pointer;" ><a-icon type="edit"/> 小时</span>
                    </a-popover>
                  </template>
                  <template slot="day" slot-scope="text, record">
                    <editable-cell
                      :text="text"
                      :max="record.daysUnpaid"
                      @change="onCellChange(record.key, 'day', $event)"
                    />
                  </template>
                  <template slot="hour" slot-scope="text, record">
                    <editable-cell
                      :text="text"
                      :max="record.hourUnpaid"
                      @change="onCellChange(record.key, 'hour', $event)"
                    />
                  </template>
                </a-table>
              </td>
            </tr>
            <tr style="height: 40px;">
              <td class="colfirst">直接领导审批</td>
              <td>
                <span>{{model.leaderRemark}}</span>
              </td>
              <td class="colfour">部门领导审批</td>
              <td>
                <span>{{model.deptLeaderRemark}}</span>
              </td>
            </tr>
          </table>
        </a-card>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction,getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from 'moment'
  import AFormItem from 'ant-design-vue/es/form/FormItem'
  import EditableCell from './EditableCell'
  import store from '@/store'

  export default {
    name: 'JoaOvertimeLeaveModal',
    components: { AFormItem, EditableCell },
    data() {
      return {
        nickname:'',
        hidden: false,
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 30 }
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {},
        url: {
          add: '/joa/joaOvertimeLeave/add',
          edit: '/joa/joaOvertimeLeave/edit',
          applyUserQuery:'/joa/joaOvertimeLeave/queryByAppUser'
        },
        nowTime: '',
        dataSource: [],
        columns: [{
          title: '加班开始时间',
          width: '152px',
          dataIndex: 'beginTime',
          align: 'center',
          scopedSlots: { customRender: 'beginTime' }
        }, {
          title: '加班结束时间',
          width: '152px',
          dataIndex: 'endTime',
          align: 'center'
        }, {
          title: '总加班时间',
          align: 'center',
          width: '104px',
          children: [{
            title:'天',
            dataIndex: 'totalDay',
            align: 'center',
            key: 'totalDay',
            width:60,
          }, {
            title:'小时',
            dataIndex: 'totalHour',
            align: 'center',
            key: 'totalHour',
            width: 60,
          }]
        }, {
          title: '未经补偿时间',
          align: 'center',
          width: '119px',
          children: [{
            title:'天',
            dataIndex: 'daysUnpaid',
            align: 'center',
            key: 'daysUnpaid',
            width: 60,
          }, {
            title:'小时',
            dataIndex: 'hourUnpaid',
            align: 'center',
            key: 'hourUnpaid',
            width: 60,
          }]
        }, {
          title: '调休申请',
          children: [{
            dataIndex: 'day',
            key: 'day',
            width: 100,
            slots: { title: 'day' },
            scopedSlots: { customRender: 'day' },

          }, {
            dataIndex: 'hour',
            key: 'hour',
            width: 100,
            slots: { title: 'hour' },
            scopedSlots: { customRender: 'hour' },
          }]
        }]
      }

    },
    // 创建完成时
    created() {
      this.nowTimes();
    },
    // 挂载完成时
    mounted() {
      this.nowTimes();

    },
    methods: {
      onCellChange(key, dataIndex, value) {
        const dataSource = [...this.dataSource]
        const target = dataSource.find(item => item.key === key)
        if (target) {
          target[dataIndex] = value
          this.dataSource = dataSource
        }
      },
      applyUserQueryMethod(){
        var that=this;
        var params={applyUser:that.model.applyUser,department:this.model.department};
        getAction(this.url.applyUserQuery, params).then((res) => {
          if (res.success) {
            console.log(res.result);
            for(var i=0;i<res.result.length;i++){
              res.result[i].key=i;
            }
            this.dataSource=res.result;
          }
        })
      },
      add() {
        this.dataSource=[];
        this.edit({});
      },
      edit(record) {

        this.visible = true;
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.nickname=store.getters.nickname;
        this.model.applyUser=store.getters.username;
        this.model.department = '开发部门';
        this.model.leaderRemark = 'admin';
        this.model.deptLeaderRemark = 'admin';
        this.model.applyTime = this.nowTime;
        if(this.model.applyUser!=undefined&&this.model.applyUser!=''){
          this.applyUserQueryMethod();
        }
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'leaveTime', 'contactWay', 'workAgent', 'workPlan'))
          this.form.setFieldsValue({ applyTime: this.model.applyTime ? moment(this.model.applyTime) : null })
          this.form.setFieldsValue({ beginTime: this.model.beginTime ? moment(this.model.beginTime) : null })
          this.form.setFieldsValue({ endTime: this.model.endTime ? moment(this.model.endTime) : null })
          this.form.setFieldsValue({ updateDate: this.model.updateDate ? moment(this.model.updateDate) : null })
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }

            let formData = Object.assign(this.model,{dataSource:this.dataSource}, values);
            //时间格式化
            formData.applyTime = formData.applyTime ? formData.applyTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.beginTime = formData.beginTime ? formData.beginTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.endTime = formData.endTime ? formData.endTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.updateDate = formData.updateDate ? formData.updateDate.format('YYYY-MM-DD HH:mm:ss') : null
           httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.applyUserQueryMethod();
                that.$emit('ok');
                that.confirmLoading = false
                that.close()
              } else {
                that.confirmLoading = false
                that.$message.warning(res.message)
              }
            })

          }
        })
      },
      handleCancel() {
        this.close()
      },
      // 获取当前时间函数
      timeFormate(timeStamp) {
        let year = new Date(timeStamp).getFullYear()
        let month = new Date(timeStamp).getMonth() + 1 < 10 ? '0' + (new Date(timeStamp).getMonth() + 1) : new Date(timeStamp).getMonth() + 1
        let date = new Date(timeStamp).getDate() < 10 ? '0' + new Date(timeStamp).getDate() : new Date(timeStamp).getDate()
        this.nowTime = year + '-' + month + '-' + date
      },
      nowTimes() {
        this.timeFormate(new Date())
      }


    }
  }
</script>

<style>
  #staffCard {
    border: 1px solid white;
    width: 100%;
    height: auto;
    box-shadow: 0px 0px 1px 1px #aaa,
    3px 0px 5px 0px #aaa,
    0px 4px 7px 0px #aaa;
    padding-bottom: 40px;
  }

  #staffTwdoTable .input {
    width: 195px;
  }

  #staffTwdoTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
  }

  #staffTwdoTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;
  }

  #staffTwdoTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
  }

  #staffTwdoTable td {
    font-family: "微软雅黑";
    color: #000000;
  }
  #staffTwdoTable .text {
    border: 0px solid white !important;
    border-radius: 0px;
  }

  #staffTwdoTable .ant-form-item {
    margin: 0px;
  }

  #staffTwdoTable .colfirst {
    width: 90px;
  }

  #staffTwdoTable .colfour {
    width: 90px;
  }

  #staffTwdoTable .ant-form label {
    font-size: 12px;
  }

  /*内嵌表格-Srart*/
  .editable-cell {
    position: relative;
  }

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    line-height: 18px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell:hover .editable-cell-icon {
    display: inline-block;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }

  .inlineTable .ant-table-body {
    width: 100%;
  }

  .inlineTable table {
    font-size: 12px;
  }

  .model .ant-modal-content {
    width: 900px;
  }





  /*内嵌表格-End*/
</style>