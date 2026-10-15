<script setup name="otherIncome">
import Modify from './modify.vue'
import Details from './details.vue'
import {getMonthFrist, getToDay} from "@/utils/slp";
import {getCurrentInstance, onMounted} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import DetailList from "./detailList.vue";
import {
  deptOtherIncomeotherpage,
  otherIncomeconfirm,
  OtherIncomedelete,
  OtherIncomeexportExcel
} from "@/api/otherIncome";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'otherIncome',
  type: '13024',
  action: '/deptOtherIncome/import/excelRecord',
})
const filterInfo = ref({
  query: {
    businessTimeStart: getMonthFrist(),
    businessTimeEnd: getToDay(),
  },
  list: [
    { label: '会计期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '业务开始日期', value: 'businessTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'businessTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('otherIncome:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('otherIncome:delete'), event: () => deleteData() },
    { type: 'button', label: '确认', show: proxy.$permission('otherIncome:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('otherIncome:confirm'), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('otherIncome:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('otherIncome:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '业务日期', value: 'businessTime' },
    { label: '会计期间', value: 'accountingPeriod' },
    { label: '总金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '确认状态', value: 'statusValue' },
    { label: '备注', value: 'remark' },
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
        label: '编辑',
        show: proxy.$permission('otherIncome:update'),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('otherIncome:delete'),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '其他收入'
})

const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})

const filterRef = ref()
const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = deptOtherIncomeotherpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    type: 'financeAndEduc'
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    businessTimeStart: getMonthFrist(),
    businessTimeEnd: getToDay(),}
  getList()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}
function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}其他收入`
  dialogInfo.value.visible = true
}
function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  otherIncomeconfirm({
    ids: ids,
    status: status,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
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
    OtherIncomedelete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.periodYearAndMonth
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('deptOtherIncomeTemplate', 'otherIncome:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '其他收入信息导入模板')
    }
  })
}

function exportData() {
  OtherIncomeexportExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<!--  其他收入-->
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
              ref="filterRef"
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
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :title="dialogInfo.title"
        @returnModify="getList"
    />
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
</template>

<style scoped lang="scss">

</style>
