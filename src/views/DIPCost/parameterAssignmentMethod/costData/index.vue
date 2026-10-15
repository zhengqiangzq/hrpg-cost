<!-- 成本数据DIP -->
<script setup name="DIPParameterCostData">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import Modify from './modify.vue';
import {useUpload} from "@/hooks/useUpload";
import {
  collectCostData,
  deleteCostData,
  disableCostData,
  enableCostData,
  exportCostData,
  pageCostData
} from "@/api/DIPCost/DIPCostParameterCostData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useStorage} from "@vueuse/core";
import DetailList from "./detailList.vue";
import Detail from "./detail.vue";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const PERMISSION_CODE = 'DIPParameterCostData'
const API = {
  query: pageCostData,
  collect: collectCostData,
  delete: deleteCostData,
  enable: enableCostData,
  disable: disableCostData,
  download: exportTemplateExcel,
  export: exportCostData
}
const TEMPLATE_NAME = 'DIP成本数据-参数分配法导入模板'
const UPLOAD_PATH = '/dip/costData/import/excel'

const {
  downloadTemplate,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(),'DIPParameterCostData:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DIPParameterCostData',
  type: '13104',
  action: '/dip/costData/import/excelRecord',
})
const { tableParameter, openDialog } = useSelectTableData()
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '采集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => openCollectData() },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData() },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => disabledData() },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('','DIPParameterCostData:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '单据号', value: 'orderNo', type: 'slot' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '开始会计期间', value: 'startPeriod' },
    { label: '结束会计期间', value: 'endPeriod' },
    { label: '总金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney) },
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
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const detailListInfo = ref({
  visible: false
})
const modifyInfo = reactive({
  id: null,
  title: '成本数据',
  batch: false,
  visible: false
})
const detailInfo = reactive({
  visible: false,
})
const dialogInfoRef = ref()
const collectInfo = reactive({
  refObj: null,
  title: '采集',
  visible: false,
  data: {
    hospitalName: setting.value.hospitalName
  },
  fieldList: [
    { label: '业务单元', span: 12, value: 'hospitalName', type: 'input', disabled: true },
    { label: '核算期间', span: 12, value: 'accountingPeriodName', type: 'slot' },
    { label: '开始会计期间', span: 12, value: 'startPeriod', type: 'input', disabled: true },
    { label: '结束会计期间', span: 12, value: 'endPeriod', type: 'input', disabled: true },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: collectData }
  ]
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('成本数据(参数分配法)')

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '确认')
  const disabledBtn = btns.find(btn => btn.label === '取消确认')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status == 1)
  enableBtn.disabled = !rows.length || !!rows.find(it => it.status == 1)
  disabledBtn.disabled = !rows.length || !!rows.find(it => it.status == 0)
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}成本数据`
  modifyInfo.visible = true
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openCollectData() {
  collectInfo.data.orgId = setting.value.hospitalId
  collectInfo.data.hospitalName = setting.value.hospitalName
  collectInfo.visible = true
}

function collectData() {
  collectInfo.refObj.validate(flag => {
    if (flag) {
      API.collect(collectInfo.data).then(res => {
        if (res.success) {
          proxy.$message.success('采集成功')
          collectInfo.data = {}
          collectInfo.visible = false
          getList()
        }
      })
    }
  })
}

function enableData(row) {
  const rows = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  API.enable(rows).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function disabledData(row) {
  const rows = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  API.disable(rows).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function detail(row) {
  detailInfo.id = row.id
  detailInfo.visible = true
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openAccountingPeriod(mark) {
  tableParameter.type = 'DIPPeriod'
  tableParameter.query = {}
  tableParameter.mark = mark
  tableParameter.callBack = accountingPeriodCallback
  const ref = mark === 'collect' ? dialogInfoRef.value : filterRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  if (tableParameter.mark === 'collect') {
    collectInfo.data.accountingPeriodId = raw.id
    collectInfo.data.accountingPeriodName = raw.name
    collectInfo.data.startPeriod = raw.beginPeriodName
    collectInfo.data.endPeriod = raw.endPeriodName
    collectInfo.data.periodMonth = `${raw.name}(${raw.beginPeriodName},${raw.endPeriodName})`

  } else {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !pullDataLogInfoVisible && !detailInfo.visible && !detailListInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriod()"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-orderNo="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.orderNo }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <PullDataLog
        v-if="pullDataLogInfoVisible"
        :businessType="pullDataLogInfoCode"
        @returnBack="pullDataLogInfoVisible = false" />
    <dialog-form :title="collectInfo.title" :btList="collectInfo.btList" v-model:visible="collectInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="collectInfo.refObj"
          :label-width="collectInfo.labelWidth"
          :data="collectInfo.data"
          :field-list="collectInfo.fieldList"
          :rules="collectInfo.rules"
      >
        <template #form-accountingPeriodName>
          <el-input
              v-model="collectInfo.data.accountingPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriod('collect')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :batch="modifyInfo.batch"
        :title="modifyInfo.title"
        @returnModify="getList"
    />
    <Detail
        v-if="detailInfo.visible"
        :id="detailInfo.id"
        v-model:visible="detailInfo.visible"
        @returnBack="getList"
    ></Detail>
    <DetailList
        v-if="detailListInfo.visible"
        v-model:visible="detailListInfo.visible"
        @callback="getList"
    ></DetailList>
  </div>
</template>

<style scoped lang="scss">

</style>
