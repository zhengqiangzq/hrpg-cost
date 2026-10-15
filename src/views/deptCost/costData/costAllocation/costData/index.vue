<!-- 成本数据页面 -->
<script setup name="allocationCostData">
import Modify from './modify.vue'
import Details from './details.vue'
import DetailList from './detailList.vue'
import {onMounted, ref} from "vue";
import {deleteCostData, enableCostData, exportCostData, pageCostData} from "@/api/costData";
import {exportTemplateExcel} from "@/api/pub";
import {getMonthFrist, getToDay} from "@/utils/slp";
import CollectDetail from "./collectDetail.vue";
import {useUpload} from "@/hooks/useUpload";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import {validateGeneralLedgerDataDeptCostData} from "@/api/generalLedgerDataDeptCostData";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'costData',
  type: '13033',
  action: '/deptCost/import/excelRecord',
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
    { type: 'button', label: '新增', show: proxy.$permission('costData:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('costData:delete'), event: () => deleteData() },
    { type: 'button', label: '采集', show: proxy.$permission('costData:collect'), event: collectData },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission('costData:collect'), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '校验', show: proxy.$permission('costData:check'), event: () => openCheckData() },
    { type: 'button', label: '确认', show: proxy.$permission('costData:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('costData:confirm'), event: () => enableData(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('costData:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('costData:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '业务日期', value: 'businessTimeValue' },
    { label: '会计期间', value: 'accountingPeriod' },
    { label: '总金额', value: 'money', align: 'right' },
    { label: '确认状态', value: 'statusValue' },
    { label: '备注', value: 'remark' },
    { label: '制单人', value: 'createUserName' },
    { label: '制单时间', value: 'createTime' },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('costData:update'),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('costData:delete'),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '成本数据'
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

const collectDetail = ref({
  visible: false
})

const checkRef = ref()
const checkInfo = ref({
  dialogVisible: false,
  formRef: null,
  formList: [
    { label: '会计期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
  ],
  formData: {},
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择会计期间', trigger: 'change' }]
  },
  visible: false,
  refresh: 1,
  initCurpage: 1,
  api: validateGeneralLedgerDataDeptCostData,
  fieldList: [
    { label: '校验项目', value: 'item', type: 'slot', headerAlign: 'center', align: 'left' },
    { label: '总账费用', value: 'ledger', headerAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row['ledger']) },
    { label: '成本数据', value: 'cost', headerAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row['cost']) },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '差异', value: 'difference', headerAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row['difference']) },
  ],
  data: []
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('成本数据')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })

onMounted(() => {
  tableInfo.value.api = pageCostData
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
    deleteCostData(ids).then(({ code }) => {
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

function checkInfoCancel() {
  checkInfo.value.dialogVisible = false
}
function checkInfoSubmit() {
  checkInfo.value.formRef.validate(flag => {
    if (flag) {
      checkInfo.value.copyQuery = {
        ...checkInfo.value.formData
      }
      checkInfo.value.dialogVisible = false
      checkInfo.value.visible = true
      checkInfo.value.data = []
      checkInfo.refresh = Math.random()
    }
  })
}
function openCheckData() {
  checkInfo.value.dialogVisible = true
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  enableCostData({
    ids, status
  }).then(({ code }) => {
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
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}总账成本`
  dialogInfo.value.visible = true
}

function openAccountingPeriodSelector(mark) {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = (raw) => {
    if (mark === 'check') {
      checkInfo.value.formData.accountingPeriodId = raw.id
      checkInfo.value.formData.accountingPeriodName = raw.periodYearAndMonth
    } else {
      filterInfo.value.query.accountingPeriodId = raw.id
      filterInfo.value.query.accountingPeriodName = raw.periodYearAndMonth
    }
  }
  tableParameter.value.visible = true
  const refs = [filterRef.value, checkRef.value]
  refs[mark === 'check' ? 1 : 0].openDialog(tableParameter.value, 'table')
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('deptCostTemplate', 'costData:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '成本数据导入模板')
    }
  })
}
function exportData() {
  exportCostData(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<template>
<!--  成本数据 科室成本-->
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
                  <el-icon @click="openAccountingPeriodSelector()"><Search /></el-icon>
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
    <el-dialog
        draggable
        :append-to-body="true"
        title="校验"
        width="30%"
        v-model="checkInfo.dialogVisible"
        custom-class="page-dialog"
        :close-on-click-modal="false"
        :modal="false"
        @close="checkInfoCancel"
    >
      <page-form
          ref="checkRef"
          v-model:ref-obj="checkInfo.formRef"
          :data="checkInfo.formData"
          :field-list="checkInfo.formList"
          :rules="checkInfo.rules"
          :label-width="checkInfo.labelWidth">
        <template #form-accountingPeriodName>
          <el-input
              v-model="checkInfo.formData.accountingPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择会计期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector('check')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="checkInfoSubmit">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="checkInfoCancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <el-drawer v-model="checkInfo.visible" size="40%">
      <div style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
        <table-container
            v-if="checkInfo.visible"
            :refresh="checkInfo.refresh"
            :init-curpage="checkInfo.initCurpage"
            v-model:data="checkInfo.data"
            :api="checkInfo.api"
            :query="checkInfo.copyQuery"
            :tabIndex="true"
            row-key="item"
            :pager="false"
            :check-box="false"
            :field-list="checkInfo.fieldList"
            :handle="checkInfo.handle"
        >
          <template #col-item="{ row }">
            <span v-html="row['item']"></span>
          </template>
        </table-container>
      </div>
    </el-drawer>
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
