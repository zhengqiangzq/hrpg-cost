import _ from 'lodash'
const loading = ref(false)
const listPage = ref(0)
const scrollTop = ref(0)
const tableInfo = ref({
  list: [],
})
const oldDataIndex = ref(-1)
const box = ref(undefined)
const newFullScreenClass = ref('scrollY' + new Date().getTime())
watch(
  () => tableData.value.data,
  (val) => {
    if (val.length) {
      val.forEach((item, index) => {
        item.tableIndex = index + 1
      })
    }
  },
  {
    deep: true,
  }
)

function handleScroll() {
  // 获取eagleMapContainer的真实高度
  const box = document.getElementsByClassName(newFullScreenClass.value)[0]
  const boxHeight = box.offsetHeight
  // 获取table_list的真实高度（浮动内容的真实高度）
  const tableHeight = document.getElementById('table-list').offsetHeight
  const tableDom = document.getElementById('table-box')
  // boxHeight和滑块浮动的高度相差小于50 && 不在加载中 && 不是最后一页
  if (
    tableHeight - (box.scrollTop + boxHeight) < 50 &&
    !loading.value &&
    listPage.value + 1 < tableInfo.value.data.length / 50
  ) {
    // 第一次触发时，记录滑块高度
    // data里scrollTop，listPage默认为0
    if (!scrollTop.value) {
      scrollTop.value = box.scrollTop
    }
    // 触发下拉加载更多
    queryMoreStat(true, tableHeight, boxHeight)
  } else if (box.scrollTop <= tableDom.offsetTop + 200 && !loading.value) {
    // 如果滑块上拉到顶部，则向上加载50条
    queryMoreStat(false, tableHeight, boxHeight)
  }
}
function queryMoreStat(type, tableHeight, boxHeight) {
  loading.value = true
  // 触底加载
  const tableData = tableInfo.value.data
  if (type) {
    listPage.value = listPage.value + 1
    const centerPage = listPage.value * 50
    const startPage = centerPage >= 50 ? centerPage - 50 : centerPage
    const endPage = centerPage + 50
    const newList = tableData.slice(startPage, endPage)
    if (listPage.value > 0) {
      const box = document.getElementsByClassName(newFullScreenClass.value)[0]
      // 视图跳到触发的数据，补回50的高度差值
      box.scrollTop = scrollTop.value - 50
    }
    tableInfo.value.list = newList
  } else {
    // 置顶加载
    if (listPage.value > 0) {
      listPage.value = listPage.value - 1
      const centerPage = listPage.value * 50
      const startPage = centerPage >= 50 ? centerPage - 50 : centerPage
      const endPage = centerPage + 50
      const newList = tableData.slice(startPage, endPage)
      if (listPage.value > 0) {
        const tableDom = document.getElementById('table-box')
        const box = document.getElementsByClassName(newFullScreenClass.value)[0]
        // box.scrollTop = tableHeight - scrollTop.value - boxHeight

        box.scrollTop = tableDom.offsetTop + 220
      }
      tableInfo.value.list = newList
    } else {
      tableInfo.value.list = tableData.slice(0, 50)
    }
  }
  proxy.$nextTick(() => {
    loading.value = false
  })
}
function indexMethod(row) {
  // const centerPage = listPage.value * 50
  // const startPage = centerPage >= 50 ? centerPage - 50 : centerPage
  // return startPage + index + 1;
  return row.tableIndex
}
function getSummaries({ columns, data }) {
  const sums = []
  const tableData = tableInfo.value.data
  const summaryFieldList = tableInfo.value.summaryFieldList
  if (summaryFieldList.length === 0) return sums
  columns.forEach((column, index) => {
    let arrIndex = -1
    if (typeof summaryFieldList[0] === 'string') {
      arrIndex = _.findIndex(summaryFieldList, column.property)
    } else if (typeof summaryFieldList[0] === 'object') {
      arrIndex = _.findIndex(summaryFieldList, function (o) {
        return o.value === column.property
      })
    }
    if (arrIndex !== -1) {
      const values = tableData.map((item) => Number(item[column.property]))
      let formatter = summaryFieldList[arrIndex].formatter || ''
      if (!values.every((value) => isNaN(value))) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            if (formatter) {
              return proxy.$fn.accAdd(
                proxy.$fn.TripartiteReturnNumber(formatter(prev)),
                proxy.$fn.TripartiteReturnNumber(formatter(curr))
              )
            } else {
              return proxy.$fn.accAdd(prev, curr)
            }
          } else {
            return prev
          }
        }, 0)
        if (formatter) {
          sums[index] = formatter(sums[index])
        }
      } else {
        sums[index] = ''
      }
    }
  })
  // if (checkBox.value) {
  //   sums[1] = "合计";
  // } else {
  sums[0] = '合计'
  // }
  return sums
}
function debounce(fn, delay) {
  let timer = null
  return function () {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(fn, delay)
  }
}
function throttle(fn, delay) {
  let timer = null,
    startTime = new Date()
  return function () {
    let curTime = new Date()
    let remaining = delay - (curTime - startTime)
    clearTimeout(timer)
    if (remaining <= 0) {
      startTime = new Date()
      fn.apply(proxy, arguments)
    } else {
      timer = setTimeout(fn, remaining)
    }
  }
}

onMounted(() => {
  box.value = document.getElementsByClassName(newFullScreenClass.value)[0]
  box.value && box.value.addEventListener('scroll', throttle(handleScroll, 30))
})
onBeforeUnmount(() => {
  box.value &&
    box.value.removeEventListener('scroll', throttle(handleScroll, 30))
})
