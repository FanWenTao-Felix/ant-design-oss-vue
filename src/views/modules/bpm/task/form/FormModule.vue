<template>
  <a-form>

    <a-form-item label="请假标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input placeholder="请输入请假标题"/>
    </a-form-item>

    <a-form-item label="请假人" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input placeholder="请输入请假人"/>
    </a-form-item>

    <a-form-item label="性别" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select defaultValue="0">
        <a-select-option value="0">请选择</a-select-option>
        <a-select-option value="1">男</a-select-option>
        <a-select-option value="2">女</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="请假开始时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-date-picker placeholder="请选择请假开始时间"/>
    </a-form-item>

    <a-form-item label="请假结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-date-picker placeholder="请选择请假结束时间"/>
    </a-form-item>


    <a-form-item label="请假天数" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input placeholder="请输入请假天数"/>
    </a-form-item>


    <a-form-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select defaultValue="0">
        <a-select-option value="0">请选择</a-select-option>
        <a-select-option value="1">北京国炬软件</a-select-option>
      </a-select>
    </a-form-item>


    <a-form-item label="请假原因" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-textarea placeholder="请输入请假原因"/>
    </a-form-item>


  </a-form>
</template>

<script>
  export default {
    name: 'FormModule',
    data() {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 2 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        }
      }
    }
  }
</script>

<style scoped>

</style>