<script setup name="deptMedicalIncome">
import Modify from './modify.vue'
import Details from './details.vue'
import DetailList from './detailList.vue'
import {onMounted} from "vue";
import {
  deleteDeptMedicalIncome,
  enableDeptMedicalIncome,
  exportDeptMedicalIncome,
  pageDeptMedicalIncome
} from "@/api/deptMedicalIncome";
import {exportTemplateExcel} from "@/api/pub";
import axios from "axios";
import {getMonthFrist, getToDay} from "@/utils/slp";
import CollectDetail from "./collectDetail.vue";
import moment from "moment";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'deptMedicalIncome',
  type: '13018',
  action: '/deptCost/deptGeneralLedgerIncome/import/excelRecord',
})

const filterInfo = ref({
  query: {
    docTimeEqAndGre: getMonthFrist(),
    docTimeEqAndLes: getToDay(),
  },
  list: [
    { label: '会计期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '业务开始日期', value: 'docTimeEqAndGre', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'docTimeEqAndLes', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('deptMedicalIncome:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('deptMedicalIncome:delete'), event: () => deleteData() },
    { type: 'button', label: '采集', show: proxy.$permission('deptMedicalIncome:collect'), event: collectData },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission('deptMedicalIncome:collect'), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '确认', show: proxy.$permission('deptMedicalIncome:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('deptMedicalIncome:confirm'), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('deptMedicalIncome:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('deptMedicalIncome:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '业务日期', value: 'docTime', formatter: (row) => moment(row.docTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriodName' },
    { label: '总金额', value: 'totalMoney', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalMoney) },
    { label: '确认状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
    { label: '制单人', value: 'createUserName' },
    { label: '制单时间', value: 'createTime' },
  ],
  summaryFieldList: [
    { value: 'totalMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('deptMedicalIncome:update'),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('deptMedicalIncome:delete'),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '科室医疗收入'
})
const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})
const uploadInfo = reactive({
  action: axios.defaults.baseURL + '/deptCost/deptGeneralLedgerIncome/import/excel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
  },
  loading: {},
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

const collectDetail = ref({
  visible: false
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('科室医疗收入(基础数据)')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = pageDeptMedicalIncome
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    accountingPeriodName: undefined
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    docTimeEqAndGre: getMonthFrist(),
    docTimeEqAndLes: getToDay(),
  }
  getList()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
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
    deleteDeptMedicalIncome(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function collectData() {
  collectDetail.value.visible = true
}

const collectDetailCallback = (flag) => {
  collectDetail.value.visible = false
  if (flag) {
    getList()
  }
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  enableDeptMedicalIncome(ids, status).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}科室医疗收入`
  dialogInfo.value.visible = true
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
  exportTemplateExcel('科室医疗收入导入模板').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '科室医疗收入导入模板')
    }
  })
}
function exportData() {
  exportDeptMedicalIncome(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<!--  科室医疗收入-->
<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailListInfo.visible && !pullDataLogInfoVisible && !detailsInfo.visible && !dialogInfo.visible">
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
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
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
    <PullDataLog
        v-if="pullDataLogInfoVisible"
        :businessType="pullDataLogInfoCode"
        @returnBack="pullDataLogInfoVisible = false" />
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
    <CollectDetail title="采集" :table-row="collectDetail.row" :visible="collectDetail.visible" @callback="collectDetailCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
