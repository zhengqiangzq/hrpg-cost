<!-- 成本归集 -->
<script setup name="costAllocationCostAllocation">
import Details from './details.vue'
import {onMounted} from "vue";
import {
  deleteCostAllocation,
  enableCostAllocation,
  exportCostAllocation,
  pageCostAllocation
} from "@/api/costAllocation";
import CollectDetail from "./collectDetail.vue";
import CheckDetail from "./checkDetail.vue";
import DetailList from "./detailList.vue";
const {proxy} = getCurrentInstance()
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '会计期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '归集校验', show: proxy.$permission('costAllocation:check'), event: checkData },
    { type: 'button', btType: 'primary', label: '归集', show: proxy.$permission('costAllocation:collect'), event: collectData },
    { type: 'button', label: '确认', show: proxy.$permission('costAllocation:confirm'), event: () => confirmData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('costAllocation:confirm'), event: () => confirmData(0) },
    { type: 'button', label: '导出Excel', show: proxy.$permission('costAllocation:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '会计期间', value: 'accountingPeriodMonth' },
    { label: '总金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney) },
    { label: '确认状态', value: 'statusValue' },
    { label: '制单人', value: 'createUserName' },
    { label: '制单时间', value: 'createTime' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: proxy.$permission('costAllocation:delete'),
        event: deleteData,
        ifRender: (row) => row.status == '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '成本归集'
})

const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})
const collectDetail = ref({
  visible: false
})
const checkDetail = ref({
  visible: false
})
const pageFilterRef = ref()
const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

const checkDialog = ref({
  title: '',
  fieldList: [{ label: '警告级别', value: 'levelName', width: '80' }, { label: '内容', value: 'message' }],
  visible: false,
  data: []
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const confirmBtn = btns.filter(it => it.label === '确认')[0]
  const cancelBtn = btns.filter(it => it.label === '取消确认')[0]
  confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status != 0).length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status == 0).length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = pageCostAllocation
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function confirmData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  enableCostAllocation(status, ids).then(res => {
    if (res.code == 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function collectData() {
  collectDetail.value.visible = true
}

function checkData() {
  checkDetail.value.visible = true
}

function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteCostAllocation(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

const collectDetailCallback = (flag) => {
  collectDetail.value.visible = false
  if (flag) {
    getList()
  }
}

const checkDetailCallback = (data) => {
  checkDetail.value.visible = false
  if (data) {
    if(data.length === 0) {
      return proxy.$message.success('校验成功')
    }
    checkDialog.value.data = data
    checkDialog.value.visible = true
    checkDialog.value.title = '归集校验'
  }
}

function exportData() {
  exportCostAllocation(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.periodYearAndMonth
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailsInfo.visible && !detailListInfo.visible && !dialogInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="pageFilterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-docNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.docNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <DetailList
        v-if="detailListInfo.visible"
        v-model:visible="detailListInfo.visible"
        @callback="getList"
    ></DetailList>
  </div>
  <CollectDetail title="成本归集" :table-row="collectDetail.row" :visible="collectDetail.visible" @callback="collectDetailCallback" />
  <CheckDetail title="归集校验" :table-row="checkDetail.row" :visible="checkDetail.visible" @callback="checkDetailCallback" />
  <el-dialog :title="checkDialog.title" v-model="checkDialog.visible" @close="checkDialog.visible = false">
    <dialog-table :check-box="false" :pager="false" :fieldList="checkDialog.fieldList" :data="checkDialog.data" />
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
