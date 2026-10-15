<!-- 参数数据 -->
<script setup name="paramData">
import Modify from './modify.vue'
import Details from './details.vue'
import {onMounted} from "vue";
import {deleteParamData, enableParamData, exportParamData, pageParamData} from "@/api/paramData";
import moment from "moment";
import DetailList from "./detailList.vue";
import {exportTemplateExcel} from "@/api/pub";
import {getMonthFrist, getToDay} from "@/utils/slp";
import CopyDetail from "./copyDetail.vue";
import collectionDialog from "./collectionDialog.vue";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'paramData',
  type: '13035',
  action: '/deptApportionmentParam/import/excelRecord',
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
    { label: '单据模板', value: 'apportionmentParamTemplate', type: 'select-model',code: 'cost_apportionment_param_template' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('paramData:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('paramData:delete'), event: () => deleteData() },
    { type: 'button', label: '采集', show: proxy.$permission('paramData:collect'), event: () => collectData() },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission('paramData:collect'), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '确认', show: proxy.$permission('paramData:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('paramData:confirm'), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('paramData:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('paramData:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '业务日期', value: 'businessTime', formatter: (row) => moment(row.businessTime).format('YYYY-MM-DD 00:00:00') },
    { label: '会计期间', value: 'accountingPeriodValue' },
    { label: '分摊参数', value: 'apportionmentParamName' },
    { label: '单据模板', value: 'apportionmentParamTemplateValue' },
    { label: '总参数值', value: 'totalValue', align: 'center' },
    { label: '确认状态', value: 'statusValue' },
    { label: '备注', value: 'remark' },
    { label: '制单人', value: 'createUserName' },
    { label: '制单时间', value: 'createTimeValue' },
  ],
  summaryFieldList: [
    { value: 'totalValue', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '复制',
        show: proxy.$permission('paramData:copy'),
        event: copyData
      },
      {
        label: '编辑',
        show: proxy.$permission('paramData:update'),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('paramData:delete'),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '参数数据'
})

const detailsInfo = ref({
  visible: false,
})
const detailListInfo = ref({
  visible: false
})
const copyInfo = ref({
  visible: false
})

const collectDetail = ref({
  visible: false
})

function collectData() {
  collectDetail.value.visible = true
}


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

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('参数数据')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = pageParamData
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
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

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}
function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}参数数据`
  dialogInfo.value.visible = true
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
    deleteParamData(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}
function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  enableParamData({ status, ids }).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('操作成功')
        getList()
      }
    })
}

function copyData(row) {
  copyInfo.value.row = {
    ids: [row.id]
  }
  copyInfo.value.visible = true
}

const copyDetailCallback = (flag) => {
  copyInfo.value.visible = false
  collectDetail.value.visible = false
  if (flag) {
    getList()
  }
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('deptApportionmentParamTemplate', 'paramData.download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '参数数据信息导入模板')
    }
  })
}

function exportData() {
  exportParamData(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
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
</script>

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
    <CopyDetail
        title="参数数据"
        :table-row="copyInfo.row"
        :visible="copyInfo.visible"
        @callback="copyDetailCallback"
    />
    <collectionDialog
        title="采集"
        :visible="collectDetail.visible"
        @callback="copyDetailCallback"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
