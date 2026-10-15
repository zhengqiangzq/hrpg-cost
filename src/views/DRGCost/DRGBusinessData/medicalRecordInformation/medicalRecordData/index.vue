<!-- 病案数据 -->
<script setup name="DRGCostMedicalRecordData">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {
  collectMedicalRecordData,
  deleteMedicalRecordData,
  exportMedicalRecordData,
  pageMedicalRecordData,
  updateDiseaseMedicalRecordData
} from "@/api/DRGCostMedicalRecordData";
import Modify from './modify.vue'
import {sectiontree} from "@/api/accountingDepartment";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useStorage} from "@vueuse/core";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const PERMISSION_CODE = 'DRGCostMedicalRecordData'
const API = {
  query: pageMedicalRecordData,
  delete: deleteMedicalRecordData,
  collect: collectMedicalRecordData,
  download: exportTemplateExcel,
  export: exportMedicalRecordData,
  update: updateDiseaseMedicalRecordData
}
const TEMPLATE_NAME = 'DRG成本-病案数据导入模板'
const UPLOAD_PATH = '/drg/businessData/medicalRecordData/import/excel'

const {
  downloadTemplate,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), 'DRGCostMedicalRecordData:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DRGCostMedicalRecordData',
  type: '13086',
  action: '/drg/businessData/medicalRecordData/import/excelRecord',
})
const { tableParameter, openDialog } = useSelectTableData()

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '出院开始日期', value: 'startDate', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '出院结束日期', value: 'endDate', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '病案号', value: 'medicalRecordNumber', type: 'input' },
    { label: '住院号', value: 'hospitalAdmissionNumber', type: 'input' },
    { label: '出院科室', value: 'dischargeDeptName', showLabel: true, type: 'slot' },
    { label: 'DRG组', value: 'drgDefinitionName', showLabel: true, type: 'slot' },
    { label: '患者姓名', value: 'patientName', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '采集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => openCollectData(), },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('','DRGCostMedicalRecordData:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '病案号', value: 'medicalRecordNumber' },
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '患者姓名', value: 'patientName' },
    { label: '性别', value: 'sexName' },
    { label: '年龄', value: 'age' },
    { label: '民族', value: 'nationName' },
    { label: '婚姻状况', value: 'marriageStatusName' },
    { label: '主诊医生', value: 'mainDoctorName' },
    { label: '入院日期', value: 'admissionTime' },
    { label: '入院科室名称', value: 'admissionDeptName' },
    { label: '出院日期', value: 'dischargeTime' },
    { label: '出院科室名称', value: 'dischargeDeptName' },
    { label: 'DRG组名称', value: 'drgDefinitionName' },
    { label: '主要诊断', value: 'icdTenName' },
    { label: '主要手术操作', value: 'icdNineName' },
    { label: '手术等级', value: 'surgeryLevelName' },
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
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '病案数据',
  visible: false
})

const filterRef = ref()

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {},
  checkedList: []
})

const dialogInfoRef = ref()

const collectInfoRef = ref()
const collectInfo = reactive({
  refObj: null,
  title: '采集',
  visible: false,
  data: {
    hospitalName: setting.value.hospitalName
  },
  fieldList: [
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
} = usePullDataLog('DRG病案数据')


watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
  })
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
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}病案数据`
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

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  deptTreeInfo.checkedList = raw
  const datas = raw?.filter((it) => !it.childList)
  filterInfo.query.dischargeDept = datas.map(it => it.id);
  filterInfo.query.dischargeDeptList = datas.map(it => it.id);
  filterInfo.query.dischargeDeptName = datas.map(it => it.name);
}

function openDRGGroupSelector() {
  tableParameter.title = 'DRG组'
  tableParameter.type = 'DRGGroup'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = DRGGroupCallback
  openDialog(filterRef.value)
}
function DRGGroupCallback(raw) {
  filterInfo.query.drgDefinitionId = raw.id
  filterInfo.query.drgDefinitionName = raw.name
}

function openAccountingPeriod() {
  tableParameter.type = 'DRGPeriod'
  tableParameter.query = {}
  tableParameter.callBack = accountingPeriodCallback
  const ref = collectInfoRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
    collectInfo.data.itemAccountingPeriodId = raw.id
    collectInfo.data.accountingPeriodName = raw.name
    collectInfo.data.startPeriod = raw.beginPeriodName
    collectInfo.data.endPeriod = raw.endPeriodName
    collectInfo.data.periodMonth = `${raw.name}(${raw.beginPeriodName},${raw.endPeriodName})`
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !pullDataLogInfoVisible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-dischargeDeptName>
              <el-input
                  v-model="filterInfo.query.dischargeDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择出院科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-drgDefinitionName>
              <el-input
                  v-model="filterInfo.query.drgDefinitionName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择DRG组"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDRGGroupSelector"><Search /></el-icon>
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
          <template #col-diseaseDefinitionName="{ row }">
            <div :class="{ 'error-style': row.diseaseDefinitionName === '未入组' }">{{ row.diseaseDefinitionName }}</div>
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
          ref="collectInfoRef"
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
              <el-icon @click="openAccountingPeriod()"><Search /></el-icon>
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
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :checkedList="deptTreeInfo.checkedList"
        :api="deptTreeInfo.api"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
