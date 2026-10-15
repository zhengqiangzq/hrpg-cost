const props = defineProps(['visible', 'id'])
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  summaryFieldList: [],
  selections: [],
  fieldList: [],
})
const filterInfo = ref({
  sortArr: [],
  copyQueryMap: {},
  query: {
    sortString: '',
    copyQueryMap: {},
    groupMap: {},
    groups: [],
    queryMap: {},
    queryParams: {},
    customizeUserVO: {},
  },
  searchList: [],
  searchBtn: [],
  btnList: [],
})
const affairTableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  api: undefined,
  query: {},
  fieldList: [],
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件shows
  },
})

function getAffairList() {
  affairTableInfo.value.refresh = Math.random()
}
// 触发事件
function handleEvent() {
  // switch (event) {
  //     // 对表格获取到的数据做处理
  // }
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
