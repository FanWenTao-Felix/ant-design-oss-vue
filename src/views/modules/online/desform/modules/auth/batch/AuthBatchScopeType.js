/** 角色 */
export const role = {
  name: '角色',
  codeName: 'roleCode',
  columns: [
    { title: '角色编码', align: 'center', dataIndex: 'roleCode' },
    { title: '角色名称', align: 'center', dataIndex: 'roleName' },
  ],
  url: {
    list: '/sys/role/list',
  },
  getUpdateParams(moveRows) {
    return moveRows.map(row => {
      return {
        id: row.key,
        authField: row.authField,
        authScopeRolesVal: row.scopeValue
      }
    })
  },
}

/** 部门 （用到时再完善） */
export const depart = {
  name: '部门',
  codeName: 'id',
  columns: [],
  url: {
    list: '',
  },
  getUpdateParams(moveRows) {
  }
}