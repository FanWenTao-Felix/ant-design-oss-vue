<template>

  <a-transfer
    :titles="['未授权', '已授权']"
    :loading="loading"
    :dataSource="dataSource"
    :targetKeys="targetKeys"
    :selectedKeys="selectedKeys"
    :render="renderItem"
    :listStyle="{ width: 'calc(50% - 25px)'}"
    style="height: 100%;"
    @change="handleChange"
    @selectChange="handleSelectChange"
  />

</template>

<script>
  import { pushIfNotExist } from '@/utils/util'
  import { getAction, putAction } from '@api/manage'

  export default {
    name: 'AuthBatchTransfer',
    props: {
      authScopeCode: {
        type: String,
        required: true,
      },
      authScopeType: {
        type: String,
        required: true,
      },
      desformCode: {
        type: String,
        required: true,
      },
      permissionType: {
        type: String,
        required: true,
      },
      loading: Boolean,
      desformId: String,
      currentAuthScope: Object,
    },
    data() {
      return {
        dataSource: [],
        targetKeys: [],
        sourceSelectedKeys: [],
        targetSelectedKeys: [],
      }
    },
    computed: {
      url() {
        const suffix = '/desform/auth'
        return {
          list: `${suffix}/${this.authScopeType}List/${this.authScopeCode}/${this.permissionType}/${this.desformCode}`,
          soub: `${suffix}/saveOrUpdateBatch`
        }
      },
      selectedKeys() {
        return [...this.sourceSelectedKeys, ...this.targetSelectedKeys]
      },
    },
    watch: {
      ['url.list']: {
        immediate: true,
        handler() {
          this.refresh()
        },
      }
    },
    methods: {

      refresh() {
        if (this.authScopeType && this.permissionType && this.authScopeCode && this.desformCode) {
          this.loadData()
        }
      },

      loadData() {
        this.updateLoading(true)
        getAction(this.url.list).then(res => {
          const { success, message, result: { records, targetKeys } } = res
          if (success) {
            this.dataSource = records
            this.targetKeys = targetKeys
          } else {
            this.$message.warn('查询失败：' + message)
          }
        }).finally(() => {
          this.updateLoading(false)
        })
      },
      updateLoading(value) {
        this.$emit('update:loading', value)
      },

      /**
       *
       * @param nextTargetKeys
       * @param direction 方向（left or right）
       * left = 未授权；  从右至左的行去掉授权
       * right = 已授权； 从左至右的行添加授权
       * @param moveKeys
       */
      handleChange(nextTargetKeys, direction, moveKeys) {
        // this.targetKeys = nextTargetKeys
        // 整理授权
        let moveRows = moveKeys.map(key => this.filterByKey(key))
        moveRows.forEach(row => {
          let scopeValue = row['scopeValue']
          let scopeValues = scopeValue ? scopeValue.split(',') : []
          // 添加授权
          if (direction === 'right') {
            pushIfNotExist(scopeValues, this.authScopeCode)
          }
          // 删除授权
          if (direction === 'left') {
            let index = scopeValues.indexOf(this.authScopeCode)
            if (index !== -1) {
              scopeValues.splice(index, 1)
            }
          }
          row['scopeValue'] = scopeValues.join(',')
        })
        // 提交更改
        this.updateLoading(true)
        let params = this.currentAuthScope.getUpdateParams(moveRows)
        // 如果是按钮，可能存在临时数据的情况，需要填充一下
        if (this.permissionType === 'button') {
          this.fillTempButton(params)
        }

        putAction(this.url.soub, params).then(res => {
          const { success, message } = res
          if (success) {
            this.refresh()
          } else {
            this.$message.warn('更改授权失败：' + message)
          }
        }).finally(() => {
          this.updateLoading(false)
        })
      },

      fillTempButton(list) {
        const startText = 'temp-'
        list.forEach(item => {
          // 凡是以 temp- 开头的按钮，都是数据库里没有的临时数据
          if (item.id.startsWith(startText)) {
            delete item.id
            item['desformId'] = this.desformId
            item['desformCode'] = this.desformCode
            item['permissionType'] = this.permissionType
            item['authScopeIsAll'] = 'Y'
            item['status'] = 1
          }
        })
      },

      handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
        this.sourceSelectedKeys = sourceSelectedKeys
        this.targetSelectedKeys = targetSelectedKeys
      },

      filterByKey(key) {
        return this.dataSource.filter(i => i.key === key)[0]
      },

      renderItem(record) {
        if (record.authScopeIsAll === 'Y') {
          return (
            <span title={record.title}>
              <a-icon type="eye-invisible" style="margin-right:8px;"/>
              {record.title}
            </span>
          )
        }
        return record.title
      }


    },
  }
</script>

<style scoped>

</style>