<script setup name="indirectCosts">
import {onMounted, watch} from "vue";
import {paramindirectModel, paramindirectModelenable} from "@/api/accountingModel";
const {proxy} = getCurrentInstance()
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '核算方法编码', value: 'code'},
    {label: '核算方法名称', value: 'name'},
    {label: '启用状态', value: 'statusValue'},
    {label: '说明', value: 'remark'},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '100',
    btList: [
      {
        label: '启用',
        type: 'button',
        event: (row) => enable(JSON.parse(JSON.stringify(row))),
        show: proxy.$permission('indirectCosts:enable'),
        ifRender: (row) => row.status !== '1'
      },
    ],
  },
  data: [],
  sectionRows: []
})
const filterInfo = ref({
  query: {
  },
  searchList: [
    {
      type: 'input',
      label: '核算方法编码',
      value: 'code',
      showLabel: true,
      event: getList,
    },
    {
      type: 'input',
      label: '核算方法名称',
      value: 'name',
      showLabel: true,
      event: getList,
    },
    {
      type: 'button',
      label: '查询',
      btType: 'primary',
      event: getList,
      show: true,
    },
    {
      type: 'button',
      label: '重置',
      btType: 'primary',
      event: clearSearch,
      show: true,
    },
  ],
  list: [],
  btnList: []
})

onMounted(() => {
  tableInfo.value.api = paramindirectModel
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = JSON.parse(JSON.stringify(filterInfo.value.query))
}
const clearType = ref(true)
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = {}
  getList()
}

function enable(row) {
  proxy
      .$confirm('是否启用当前方法?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    paramindirectModelenable(row.id).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('启用成功')
        getList()
      }
    })
  })
}
function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

</script>

<template>
  <!--  间接成本模型-->
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <PageFilter
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.searchList"
          >
          </PageFilter>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :handle="tableInfo.handle"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="false"
            :pager="false"
            :checkBox="false"
            :field-list="tableInfo.fieldList"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
