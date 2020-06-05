<template>
  <div>
    <a-card :bordered="false" title="jeecg 在线表单测试">
      <online-form ref="onlineForm" @onSuccess="handleSuccess" :formSchema="schema" :uiSchema="uiSchema" :submiting="submiting"></online-form>
    </a-card>
  </div>
</template>

<script>
  import OnlineForm from '@/components/online/autoform/OnlineForm.vue';
  export default {
    name: 'JeecgOnlineTest',
    components:{
      OnlineForm
    },
    mounted(){
      let that = this;
      setTimeout(()=>{
        //新增模拟
        //that.$refs.onlineForm.add();

        //编辑模拟
        that.$refs.onlineForm.edit({
          name:"123",
          password:"aaaaaaa",
          sex:"2",
          skill:"3",
          birthday:"2018-01-03",
          createDate:"2018-01-03 11:11:11",
          remark:"快乐风男",
          fruit:"Apple,Orange",
          age:26,
          myrate:5,
          myswitch:true,
          myupload:"user/20190318/45252_1552896112371.jpg,user/20190318/1234_1552896115006.jpg"
        });
      },2000)
    },
    data(){
      return {
        submiting:false,
        uiSchema:{
          formTemplate:"1",
          method:'post',
          url:"/test/jeecgDemo/testOnlineAdd",
          footerItemattr:{
            style:{
              "width":"90%",
              "text-align":"center",
              "margin-top":"24px"
            }
          },
          itemattrs: {
            labelCol: {
              xs: { span: 6 },
              sm: { span: 6 },
            },
            wrapperCol: {
              xs: { span: 16 },
              sm: { span: 12 },
              md: { span: 10 },
            }
          },
          name: {
            errors: {
              required: '姓名为必填项',
            },
          },
          password: {
            errors: {
              minLength: '密码长度至少6位',
              maxLength: '密码长度最多10位',
              pattern: '密码必须是字母',
            }
          }
        },
        schema:{
          required: ['name','myupload'],
          properties: {
            name: {
              type: 'string',
              view: 'text',
              title: '姓名'
            },
            password: {
              type: 'string',
              view: 'password',
              title: '密码',
              pattern: '^[A-Za-z]+$'
            },
            sex: {
              type: 'string',
              view: 'list',
              title: '性别',
              enum: [
                { label: '男', value: '1'},
                { label: '女', value: '2'}
              ]
            },
            age:{
              type: 'integer',
              view: 'number',
              title: '年龄'
            },
            birthday: {
              type: 'string',
              view: 'date',
              title: '生日'
            },
            skill: {
              type: 'string',
              view: 'radio',
              title: '特长',
              enum: [
                { label: '敲代码', value: '1'},
                { label: '打游戏', value: '2'},
                { label: '吃零食', value: '3'}
              ]
            },
            fruit: {
              type: 'string',
              view: 'checkbox',
              title: '喜欢吃的水果',
              enum: [
                { label: '苹果', value: 'Apple' },
                { label: '橘子', value: 'Orange' },
                { label: '梨', value: 'Pear' },
              ]
            },
            myrate:{
              type: 'number',
              view: 'rate',
              title: '给自己打分',
            },
            myswitch:{
              type: 'boolean',
              view: 'switch',
              title: '是否打过酱油',
            },
            createDate: {
              type: 'string',
              view: 'datetime',
              title: '创建时间'
            },
            myupload: {
              type: 'string',
              view: 'file',
              title: '我的上传测试'
            },
            remark:{
              type:"string",
              view:'textarea',
              title:"备注"
            },
            myeditor:{
              type:"string",
              view:'umeditor',
              title:"富文本编辑器"
            }
          }
        }

      }
    },
    methods:{
      handleSuccess(values){
        console.log("表单数据提交",values)
        this.submiting = true;
        setTimeout(() => {
          this.submiting = false;
          this.$message.success("handleSuccess-->测试提交完成")
        }, 1000);
      }
    }
  }
</script>

<style scoped>

</style>