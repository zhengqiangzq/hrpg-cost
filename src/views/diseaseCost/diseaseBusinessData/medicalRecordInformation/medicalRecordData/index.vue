<!-- 病案数据 -->
<script setup name="medicalRecordData">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {
  collectMedicalRecordData,
  deleteMedicalRecordData,
  exportMedicalRecordData,
  pageMedicalRecordData,
  updateDiseaseMedicalRecordData
} from "@/api/diseaseCostMedicalRecordData";
import Modify from './modify.vue'
import {useUpload} from "@/hooks/useUpload";
import {sectiontree} from "@/api/accountingDepartment";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useStorage} from "@vueuse/core";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const PERMISSION_CODE = 'medicalRecordData'
const API = {
  query: pageMedicalRecordData,
  delete: deleteMedicalRecordData,
  collect: collectMedicalRecordData,
  download: exportTemplateExcel,
  export: exportMedicalRecordData,
  update: updateDiseaseMedicalRecordData
}
const TEMPLATE_NAME = '病案数据导入模板'
const UPLOAD_PATH = '/businessData/diseaseMedicalRecordData/import/excel'

const {
  downloadTemplate,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), `${PERMISSION_CODE}:import`)
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13069',
  action: '/businessData/diseaseMedicalRecordData/import/excelRecord',
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
    { label: '病种', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
    { label: '患者姓名', value: 'patientName', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '采集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => openCollectData(), },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '病种更新', show: proxy.$permission(`${PERMISSION_CODE}:update`), event: () => updateData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(undefined, `${PERMISSION_CODE}:download`), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.query), },
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
    { label: '病种', value: 'diseaseDefinitionName', type: 'slot' },
    { label: '主要诊断', value: 'icdTenName' },
    { label: '主要手术操作', value: 'icdNineName' },
    { label: '手术等级', value: 'surgeryLevelName' },
    { label: '是否入径', value: 'isPathWaysValue' },
    { label: '临床路径', value: 'clinicalPathWays' },
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
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {},
  checkedList: []
})

const dialogInfoRef = ref()
const updateInfo = reactive({
  refObj: null,
  title: '病种更新',
  visible: false,
  data: {
  },
  fieldList: [
    { label: '开始会计期间', span: 12, value: 'startPeriodName', type: 'slot' },
    { label: '结束会计期间', span: 12, value: 'endPeriodName', type: 'slot' },
  ],
  rules: {
    startPeriodName: [{ required: true, message: '请选择开始会计期间', trigger: 'change' }],
    endPeriodName: [{ required: true, message: '请选择结束会计期间', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: updateDataHandle }
  ]
})
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
} = usePullDataLog('病种病案数据')

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

function updateData() {
  updateInfo.data = {}
  updateInfo.visible = true
}

function updateDataHandle() {
  updateInfo.refObj.validate((flag) => {
    if (flag) {
      API.update({
        startPeriod: updateInfo.data.startPeriod,
        endPeriod: updateInfo.data.endPeriod
      }).then(res => {
        if (res.success) {
          proxy.$message.success('更新成功')
          updateInfo.visible = false
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
  deptTreeInfo.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList && checkPropCondition(it))
  filterInfo.query.dischargeDept = datas?.map((it) => it.id);
  filterInfo.query.dischargeDeptList = datas?.map((it) => it.id);
  filterInfo.query.dischargeDeptName = datas?.map((it) => it.name);
}
function checkPropCondition(it) {
  return (it.accountAttribute == 1) && (it.diseaseAccountStatus == 1) && (it.sectionAttribute != 1)
}

function openDiseaseDefinitionSelector() {
  tableParameter.title = '病种'
  tableParameter.type = 'diseaseDefinition'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = diseaseDefinitionCallback
  openDialog(filterRef.value)
}
function diseaseDefinitionCallback(raw) {
  filterInfo.query.diseaseDefinitionId = raw.id
  filterInfo.query.diseaseDefinitionName = raw.name
}

function openPeriodSelector(mark) {
  tableParameter.title = '会计期间'
  tableParameter.type = 'accountingPeriod'
  tableParameter.query = {}
  tableParameter.mark = mark
  tableParameter.visible = true
  tableParameter.callBack = periodCallback
  openDialog(dialogInfoRef.value)
}
function periodCallback(raw) {
  if (tableParameter.mark === 'end') {
    updateInfo.data.endPeriod = raw.id
    updateInfo.data.endPeriodName = raw.periodYearAndMonth
  } else {
    updateInfo.data.startPeriod = raw.id
    updateInfo.data.startPeriodName = raw.periodYearAndMonth
  }
}

function openAccountingPeriod(mark) {
  tableParameter.type = 'diseasePeriod'
  tableParameter.query = {}
  tableParameter.mark = mark
  tableParameter.callBack = accountingPeriodCallback
  const ref = collectInfoRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  if (tableParameter.mark === 'collect') {
    collectInfo.data.itemAccountingPeriodId = raw.id
    collectInfo.data.accountingPeriodName = raw.name
    collectInfo.data.startPeriod = raw.beginPeriodName
    collectInfo.data.endPeriod = raw.endPeriodName
    collectInfo.data.periodMonth = `${raw.name}(${raw.beginPeriodName},${raw.endPeriodName})`

  }
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !pullDataLogInfoVisible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
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
            <template #filter-diseaseDefinitionName>
              <el-input
                  v-model="filterInfo.query.diseaseDefinitionName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择病种"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDiseaseDefinitionSelector"><Search /></el-icon>
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
    <dialog-form :title="updateInfo.title" width="800px" :btList="updateInfo.btList" v-model:visible="updateInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="updateInfo.refObj"
          :label-width="updateInfo.labelWidth"
          :data="updateInfo.data"
          :field-list="updateInfo.fieldList"
          :rules="updateInfo.rules"
      >
        <template #form-startPeriodName>
          <el-input
              v-model="updateInfo.data.startPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择开始会计期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openPeriodSelector()"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-endPeriodName>
          <el-input
              v-model="updateInfo.data.endPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择结束会计期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openPeriodSelector('end')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <dialog-form :title="collectInfo.title" width="800px" :btList="collectInfo.btList" v-model:visible="collectInfo.visible">
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
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
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
