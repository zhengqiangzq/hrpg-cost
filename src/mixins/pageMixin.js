const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  selections: [],
})
// 过滤相关配置
const filterInfo = ref({
  sortArr: [],
  copyQueryMap: {},
  query: {
    sortString: '',
    queryMap: {},
    groupMap: {},
    groups: [],
    queryParams: {},
    customizeUserVO: {},
  },
  searchList: [],
  searchBtn: [
    { type: 'button', label: '查询', event: search },
    { type: 'button', label: '高级查询', event: advancedSearchShow },
    { type: 'button', label: '重置', event: clearSearch },
  ],
  btnList: [],
})
const detailListInfo = ref({
  visible: false,
})
const preferenceInfo = ref({
  visible: false,
})
const advancedSearchInfo = ref({
  visible: false,
  data: {},
})
const clearType = ref(true)
const slipSelectRequest = ref(true)

function setPreferenceCallback(obj) {
  updateUserCustomize(obj.customizeUserVO).then((res) => {
    if (res && res.success) {
      getCustomize(!slipSelectRequest.value)
    }
  })
}
function advancedSearchShow() {
  advancedSearchInfo.value.visible = true
}
async function advancedSearchCallback(obj) {
  filterInfo.value.query.queryMap = {}
  filterInfo.value.query.queryDtoList = [...obj.queryDtoList]
  advancedSearchInfo.value.data = obj.data
  await getList()
  clearType.value = !clearType.value
  filterInfo.value.query.queryMap = proxy.$fn.deepClone(
    filterInfo.value.copyQueryMap
  )
}
// 获取列表
async function getList() {
  tableInfo.value.refresh = Math.random()
}
// 搜索
function search() {
  // 重置分页
  advancedSearchInfo.value.data = {}
  filterInfo.value.query.queryDtoList = []
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  clearType.value = !clearType.value
  advancedSearchInfo.value.data = {}
  filterInfo.value.query.queryMap = proxy.$fn.deepClone(
    filterInfo.value.copyQueryMap
  )
  search()
}
// 触发事件
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = [...data]
      break
  }
}
function sortChange(column) {
  if (filterInfo.value.query.customizeUserVO.head.sortType === 0) {
    let arr = proxy.$fn.sortChange(column, filterInfo.value.sortArr)
    filterInfo.value.sortArr = arr
    filterInfo.value.query.sortString = arr.length ? arr.toString() : ''
    getList()
  }
}
/**
 * @description: 操作项目及回调
 * fn: 需要执行的函数
 * cb: 回调（可传空）
 * ...rest: 需要执行函数的参数
 */
async function mixinHandleItem(fn, cb, ...rest) {
  const { code, data } = await fn(...rest)
  if (code === 20000) {
    proxy.$message.success('操作成功')
    if (cb && typeof cb === 'function') {
      cb()
    }
  } else {
    proxy.$message.error(data || '操作失败，请重试')
  }
}
