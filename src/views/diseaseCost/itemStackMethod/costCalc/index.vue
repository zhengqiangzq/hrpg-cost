<!-- 成本计算 -->
<script setup name="diseaseCostItemCostCalc">
import {getCurrentInstance, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  calcCalcData, calcFourCalcData,
  calcSecCalcData,
  calcThrCalcData,
  cancelCalcCalcData, cancelFourCalcCalcData,
  cancelSecCalcCalcData,
  cancelThrCalcCalcData,
  exportCalcData, exportFourCalcData,
  exportSecCalcData,
  exportThrCalcData,
  pageCalcData, pageFourCalcData,
  pageSecCalcData,
  pageThrCalcData
} from "@/api/diseaseCostItemCostCalc";
import {sectiontree} from "@/api/accountingDepartment";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostItemCostCalc'
const API = {
  query: pageCalcData,
  secQuery: pageSecCalcData,
  thrQuery: pageThrCalcData,
  fourQuery: pageFourCalcData,
  calc: calcCalcData,
  cancelCalc: cancelCalcCalcData,
  secCalc: calcSecCalcData,
  secCancelCalc: cancelSecCalcCalcData,
  thrCalc: calcThrCalcData,
  thrCancelCalc: cancelThrCalcCalcData,
  fourCalc: calcFourCalcData,
  fourCancelCalc: cancelFourCalcCalcData,
  export: exportCalcData,
  secExport: exportSecCalcData,
  thrExport: exportThrCalcData,
  fourExport: exportFourCalcData,
}

const {
  exportData
} = useUpload({ export: API.export }, null, null, null)
const {
  exportData: secExportData
} = useUpload({ export: API.secExport }, null, null, null)
const {
  exportData: thrExportData
} = useUpload({ export: API.thrExport }, null, null, null)
const {
  exportData: fourExportData
} = useUpload({ export: API.fourExport }, null, null, null)
const { tableParameter, openDialog } = useSelectTableData()

const activeStep = ref('1')

const step1Name = ref('1.患者药耗成本计算')
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '病种信息', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
    { label: '住院号', value: 'hospitalAdmissionNumber', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('calc'), },
    { type: 'button', label: '取消计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('cancelCalc'), },
    { type: 'button', label: '下一步', show: true, event: () => activeStep.value = '2', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '病种信息', value: 'diseaseDefinitionName' },
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '患者名称', value: 'patientName' },
    { label: '药品费', value: 'drugValue', align: 'right' },
    { label: '单收费材料费', value: 'materialsValue', align: 'right' },
  ],
  summaryFieldList: [
    { value: 'drugValue', formatter: proxy.$fn.TripartiteMethod },
    { value: 'materialsValue', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step2Name = ref('2.患者病种成本计算')
const filterSecRef = ref()
const filterSecInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '病种信息', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
    { label: '住院号', value: 'hospitalAdmissionNumber', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getSecList, },
    { type: 'button', label: '重置', event: secReset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('calc'), },
    { type: 'button', label: '取消计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('cancelCalc'), },
    { type: 'button', label: '上一步', show: true, event: () => activeStep.value = '1', },
    { type: 'button', label: '下一步', show: true, event: () => activeStep.value = '3', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => secExportData(filterSecInfo.copyQuery), },
  ]
})
const tableSecInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '病种信息', value: 'diseaseDefinitionName' },
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '患者名称', value: 'patientName' },
    { label: '人员经费', value: 'personCost', align: 'right' },
    { label: '药品费', value: 'drugCost', align: 'right' },
    { label: '卫生材料费用', value: 'materialsCost', align: 'right' },
    { label: '固定资产折旧费', value: 'depreciationCost', align: 'right' },
    { label: '无形资产摊销费', value: 'amortizationCost', align: 'right' },
    { label: '计提风险医疗基金', value: 'riskFundsCost', align: 'right' },
    { label: '其他运行费用', value: 'otherCost', align: 'right' },
  ],
  summaryFieldList: [
    { value: 'personCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'drugCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'materialsCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'depreciationCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'amortizationCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'riskFundsCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'otherCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step3Name = ref('3.科室病种成本计算')
const filterThrRef = ref()
const filterThrInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '病种信息', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getThrList, },
    { type: 'button', label: '重置', event: thrReset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('calc'), },
    { type: 'button', label: '取消计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('cancelCalc'), },
    { type: 'button', label: '上一步', show: true, event: () => activeStep.value = '2', },
    { type: 'button', label: '下一步', show: true, event: () => activeStep.value = '4', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => thrExportData(filterThrInfo.copyQuery), },
  ]
})
const tableThrInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '患者数量', value: 'patientNum' },
    { label: '人员经费', value: 'personCost', align: 'right' },
    { label: '药品费', value: 'drugCost', align: 'right' },
    { label: '卫生材料费用', value: 'materialsCost', align: 'right' },
    { label: '固定资产折旧费', value: 'depreciationCost', align: 'right' },
    { label: '无形资产摊销费', value: 'amortizationCost', align: 'right' },
    { label: '计提风险医疗基金', value: 'riskFundsCost', align: 'right' },
    { label: '其他运行费用', value: 'otherCost', align: 'right' },
    { label: '合计', value: 'totalCost', align: 'right' },
  ],
  summaryFieldList: [
    { value: 'personCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'drugCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'materialsCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'depreciationCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'amortizationCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'riskFundsCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'otherCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step4Name = ref('4.院级病种成本计算')
const filterFourRef = ref()
const filterFourInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '病种信息', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getFourList, },
    { type: 'button', label: '重置', event: fourReset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('calc'), },
    { type: 'button', label: '取消计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('cancelCalc'), },
    { type: 'button', label: '上一步', show: true, event: () => activeStep.value = '3', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => fourExportData(filterFourInfo.copyQuery), },
  ]
})
const tableFourInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '病种编码', value: 'diseaseDefinitionCode' },
    { label: '病种名称', value: 'diseaseDefinitionName' },
    { label: '患者数量', value: 'paramValue', align: 'center' },
    { label: '医疗成本', type: 'multiHeader', children: [
        { label: '例均成本', value: 'medicalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalCost) },
        { label: '总成本', value: 'medicalAllCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalAllCost) },
      ]
    },
    {
      label: '医疗全成本', type: 'multiHeader', children: [
        {label: '例均成本', value: 'medicalFullCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalFullCost)},
        {label: '总成本', value: 'medicalFullAllCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalFullAllCost)},
      ]
    },
    { label: '医院全成本', type: 'multiHeader', children: [
        { label: '例均成本', value: 'hospitalFullCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.hospitalFullCost) },
        { label: '总成本', value: 'hospitalFullAllCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.hospitalFullAllCost) },
      ]
    },
  ],
  summaryFieldList: [
    { value: 'medicalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'medicalAllCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'medicalFullCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'medicalFullAllCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'hospitalFullCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'hospitalFullAllCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {}
})

const dialogInfoRef = ref()
const calcInfo = reactive({
  refObj: null,
  title: '计算',
  visible: false,
  data: {},
  fieldList: [
    { label: '核算期间', span: 12, value: 'accountingPeriodName', type: 'slot' },
    { label: '开始会计期间', span: 12, value: 'startPeriod', type: 'input', disabled: true },
    { label: '结束会计期间', span: 12, value: 'endPeriod', type: 'input', disabled: true },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: handleCalcData }
  ]
})

watch(activeStep, (val, oldVal) => {
  const filters = {
    '1': filterInfo,
    '2': filterSecInfo,
    '3': filterThrInfo,
    '4': filterFourInfo
  }
  Object.assign(filters[val].query, filters[oldVal].query)
})

// 查询
function getList() {
  if (!filterInfo.query.accountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableInfo.api = API.query
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    deptIdIn: filterInfo.query.deptIdsIn,
    deptIdsIn: undefined,
    deptName: undefined,
    diseaseDefinitionName: undefined,
    accountingPeriodName: undefined,
    hospitalAdmissionNumberLike: filterInfo.query.hospitalAdmissionNumber
  })
  tableInfo.refresh = Math.random()
}
// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}
// 查询
function getSecList() {
  if (!filterSecInfo.query.accountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableSecInfo.api = API.secQuery
  filterSecInfo.copyQuery = cloneDeep({
    ...filterSecInfo.query,
    accountingPeriodName: undefined,
    hospitalAdmissionNumberLike: filterSecInfo.query.hospitalAdmissionNumber
  })
  tableSecInfo.refresh = Math.random()
}
// 重置查询
function secReset() {
  filterSecInfo.query = {}
  getSecList()
}
// 查询
function getThrList() {
  if (!filterThrInfo.query.accountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableThrInfo.api = API.thrQuery
  filterThrInfo.copyQuery = cloneDeep({
    ...filterThrInfo.query,
    accountingPeriodName: undefined
  })
  tableThrInfo.refresh = Math.random()
}
// 重置查询
function thrReset() {
  filterThrInfo.query = {}
  getThrList()
}
// 查询
function getFourList() {
  if (!filterFourInfo.query.accountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableFourInfo.api = API.fourQuery
  filterFourInfo.copyQuery = cloneDeep({
    ...filterFourInfo.query,
    deptIdIn: filterFourInfo.query.deptIdsIn,
    deptIdsIn: undefined,
    deptName: undefined,
    diseaseDefinitionName: undefined,
    accountingPeriodName: undefined
  })
  tableFourInfo.refresh = Math.random()
}
// 重置查询
function fourReset() {
  filterFourInfo.query = {}
  getFourList()
}

function handleOpenCalcInfo(mark) {
  const filters = {
    '1': filterInfo.query,
    '2': filterSecInfo.query,
    '3': filterThrInfo.query,
    '4': filterFourInfo.query
  }
  calcInfo.data = cloneDeep(filters[activeStep.value])
  calcInfo.mark = mark
  calcInfo.title = calcInfo.mark === 'calc' ? '计算' : '取消计算'
  calcInfo.visible = true
}

function handleCalcData() {
  if (calcInfo.mark === 'calc') {
    calcData()
  } else if (calcInfo.mark === 'cancelCalc') {
    cancelCalcData()
  }
}

async function calcData() {
  const api = {
    '1': API.calc,
    '2': API.secCalc,
    '3': API.thrCalc,
    '4': API.fourCalc
  }
  let flag = 0;
  await calcInfo.refObj.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    api[activeStep.value](calcInfo.data).then(res => {
      if (res.success) {
        proxy.$message.success('计算成功')
        calcSuccessHandle()
      }
    })
  }
}

async function cancelCalcData() {
  const api = {
    '1': API.cancelCalc,
    '2': API.secCancelCalc,
    '3': API.thrCancelCalc,
    '4': API.fourCancelCalc
  }
  let flag = 0;
  await calcInfo.refObj.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    api[activeStep.value](calcInfo.data).then(res => {
      if (res.success) {
        proxy.$message.success('取消计算成功')
        calcSuccessHandle()
      }
    })
  }
}

function calcSuccessHandle() {
  calcInfo.visible = false
  const filters = { '1': filterInfo, '2': filterSecInfo, '3': filterThrInfo, '4': filterFourInfo }
  filters[activeStep.value].query = {
    ...filters[activeStep.value].query,
    ...calcInfo.data
  }
  const callback = { '1': getList, '2': getSecList, '3': getThrList, '4': getFourList }
  callback[activeStep.value]()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}
// 表格事件处理
const tableSecHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableSecInfo.sectionRows = raw
  }
}
// 表格事件处理
const tableThrHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableThrInfo.sectionRows = raw
  }
}
// 表格事件处理
const tableFourHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableFourInfo.sectionRows = raw
  }
}

function openAccountingPeriod(mark) {
  tableParameter.type = 'diseasePeriod'
  tableParameter.query = {}
  tableParameter.mark = mark
  tableParameter.checkBox = false
  tableParameter.callBack = accountingPeriodCallback
  const ref = mark === 'four' ? filterFourRef.value : mark === 'thr' ? filterThrRef.value : mark === 'calc' ? dialogInfoRef.value : mark === 'sec' ? filterSecRef.value : filterRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  if (tableParameter.mark === 'calc') {
    calcInfo.data.accountingPeriodId = raw.id
    calcInfo.data.accountingPeriodName = raw.name
    calcInfo.data.startPeriod = raw.beginPeriodName
    calcInfo.data.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'four') {
    filterFourInfo.query.accountingPeriodId = raw.id
    filterFourInfo.query.accountingPeriodName = raw.name
    filterFourInfo.query.startPeriod = raw.beginPeriodName
    filterFourInfo.query.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'thr') {
    filterThrInfo.query.accountingPeriodId = raw.id
    filterThrInfo.query.accountingPeriodName = raw.name
    filterThrInfo.query.startPeriod = raw.beginPeriodName
    filterThrInfo.query.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'sec') {
    filterSecInfo.query.accountingPeriodId = raw.id
    filterSecInfo.query.accountingPeriodName = raw.name
    filterSecInfo.query.startPeriod = raw.beginPeriodName
    filterSecInfo.query.endPeriod = raw.endPeriodName
  } else {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
    filterInfo.query.startPeriod = raw.beginPeriodName
    filterInfo.query.endPeriod = raw.endPeriodName
  }
}


function openDeptSelector(mark) {
  deptTreeInfo.checkBox = true
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  deptTreeInfo.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList && checkPropCondition(it))
  if (deptTreeInfo.mark === 'sec') {
    filterSecInfo.query.deptIdsIn = datas?.map((it) => it.id).join(',');
    filterSecInfo.query.deptName = datas?.map((it) => it.name).join(',');
  } else if (deptTreeInfo.mark === 'thr') {
    filterThrInfo.query.deptIdsIn = datas?.map((it) => it.id).join(',');
    filterThrInfo.query.deptName = datas?.map((it) => it.name).join(',');
  } else if (deptTreeInfo.mark === 'four') {
    filterFourInfo.query.deptIdsIn = datas?.map((it) => it.id).join(',');
    filterFourInfo.query.deptName = datas?.map((it) => it.name).join(',');
  } else {
    filterInfo.query.deptIdsIn = datas?.map((it) => it.id).join(',');
    filterInfo.query.deptName = datas?.map((it) => it.name).join(',');
  }
}
function checkPropCondition(it) {
  return (it.accountAttribute == 1) && (it.diseaseAccountStatus == 1) && (it.sectionAttribute != 1)
}


function openDiseaseDefinitionSelector(mark) {
  tableParameter.title = '病种'
  tableParameter.type = 'diseaseDefinition'
  tableParameter.query = {}
  tableParameter.mark = mark
  tableParameter.checkBox = true
  tableParameter.visible = true
  tableParameter.callBack = diseaseDefinitionCallback
  const ref = mark === 'four' ? filterFourRef.value : mark === 'thr' ? filterThrRef.value : mark === 'sec' ? filterSecRef.value : filterRef.value
  openDialog(ref)
}
function diseaseDefinitionCallback(raw) {
  tableParameter.checkedList = raw;
  if (tableParameter.mark === 'sec') {
    filterSecInfo.query.diseaseIdsIn = raw.map(it => it.id).join(',')
    filterSecInfo.query.diseaseDefinitionName = raw.map(it => it.name).join(',')
  } else if (tableParameter.mark === 'thr') {
    filterThrInfo.query.diseaseIdsIn = raw.map(it => it.id).join(',')
    filterThrInfo.query.diseaseDefinitionName = raw.map(it => it.name).join(',')
  } else if (tableParameter.mark === 'four') {
    filterFourInfo.query.diseaseIdsIn = raw.map(it => it.id).join(',')
    filterFourInfo.query.diseaseDefinitionName = raw.map(it => it.name).join(',')
  } else {
    filterInfo.query.diseaseIdsIn = raw.map(it => it.id).join(',')
    filterInfo.query.diseaseDefinitionName = raw.map(it => it.name).join(',')
  }
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <el-steps :active="activeStep" finish-status="success">
          <el-step :title="step1Name"></el-step>
          <el-step :title="step2Name"></el-step>
          <el-step :title="step3Name"></el-step>
          <el-step :title="step4Name"></el-step>
        </el-steps>
        <div v-if="activeStep === '1'">
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
                    placeholder="请选择核算期间"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openAccountingPeriod('')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-deptName>
                <el-input
                    v-model="filterInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector('')"><Search /></el-icon>
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
                    <el-icon @click="openDiseaseDefinitionSelector('')"><Search /></el-icon>
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
              :check-box="false"
              :summary="!!tableInfo.summaryFieldList?.length"
              :summaryFieldList="tableInfo.summaryFieldList"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
          >
          </table-container>
        </div>
        <div v-if="activeStep === '2'">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterSecRef"
                v-model:query="filterSecInfo.query"
                :filter-list="filterSecInfo.list"
                :filter-btn="filterSecInfo.filterbtn"
            >
              <template #filter-accountingPeriodName>
                <el-input
                    v-model="filterSecInfo.query.accountingPeriodName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算期间"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openAccountingPeriod('sec')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-deptName>
                <el-input
                    v-model="filterSecInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector('sec')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-diseaseDefinitionName>
                <el-input
                    v-model="filterSecInfo.query.diseaseDefinitionName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择病种"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDiseaseDefinitionSelector('sec')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter :filter-btn="filterSecInfo.btnList">
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableSecInfo.refresh"
              :init-curpage="tableSecInfo.initCurpage"
              v-model:data="tableSecInfo.data"
              :api="tableSecInfo.api"
              :query="filterSecInfo.copyQuery"
              :tabIndex="true"
              :check-box="false"
              :summary="!!tableSecInfo.summaryFieldList?.length"
              :summaryFieldList="tableSecInfo.summaryFieldList"
              :field-list="tableSecInfo.fieldList"
              :handle="tableSecInfo.handle"
              @handleEvent="tableSecHandler"
          >
          </table-container>
        </div>
        <div v-if="activeStep === '3'">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterThrRef"
                v-model:query="filterThrInfo.query"
                :filter-list="filterThrInfo.list"
                :filter-btn="filterThrInfo.filterbtn"
            >
              <template #filter-deptName>
                <el-input
                    v-model="filterThrInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector('thr')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-accountingPeriodName>
                <el-input
                    v-model="filterThrInfo.query.accountingPeriodName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算期间"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openAccountingPeriod('thr')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-diseaseDefinitionName>
                <el-input
                    v-model="filterThrInfo.query.diseaseDefinitionName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择病种"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDiseaseDefinitionSelector('thr')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter :filter-btn="filterThrInfo.btnList">
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableThrInfo.refresh"
              :init-curpage="tableThrInfo.initCurpage"
              v-model:data="tableThrInfo.data"
              :api="tableThrInfo.api"
              :query="filterThrInfo.copyQuery"
              :tabIndex="true"
              :check-box="false"
              :summary="!!tableThrInfo.summaryFieldList?.length"
              :summaryFieldList="tableThrInfo.summaryFieldList"
              :field-list="tableThrInfo.fieldList"
              :handle="tableThrInfo.handle"
              @handleEvent="tableThrHandler"
          >
          </table-container>
        </div>
        <div v-if="activeStep === '4'">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterFourRef"
                v-model:query="filterFourInfo.query"
                :filter-list="filterFourInfo.list"
                :filter-btn="filterFourInfo.filterbtn"
            >
              <template #filter-deptName>
                <el-input
                    v-model="filterFourInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector('four')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-accountingPeriodName>
                <el-input
                    v-model="filterFourInfo.query.accountingPeriodName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算期间"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openAccountingPeriod('four')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-diseaseDefinitionName>
                <el-input
                    v-model="filterFourInfo.query.diseaseDefinitionName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择病种"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDiseaseDefinitionSelector('four')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter :filter-btn="filterFourInfo.btnList">
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableFourInfo.refresh"
              :init-curpage="tableFourInfo.initCurpage"
              v-model:data="tableFourInfo.data"
              :api="tableFourInfo.api"
              :query="filterFourInfo.copyQuery"
              :tabIndex="true"
              :check-box="false"
              :summary="!!tableFourInfo.summaryFieldList?.length"
              :summaryFieldList="tableFourInfo.summaryFieldList"
              :field-list="tableFourInfo.fieldList"
              :handle="tableFourInfo.handle"
              @handleEvent="tableFourHandler"
          >
          </table-container>
        </div>
      </div>
    </div>
    <dialog-form :title="calcInfo.title" :btList="calcInfo.btList" v-model:visible="calcInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="calcInfo.refObj"
          :label-width="calcInfo.labelWidth"
          :data="calcInfo.data"
          :field-list="calcInfo.fieldList"
          :rules="calcInfo.rules"
      >
        <template #form-accountingPeriodName>
          <el-input
              v-model="calcInfo.data.accountingPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriod('calc')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
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
:deep(.el-step__head.is-success) {
  color: #165DFF;
  border-color: #165DFF;
}
:deep(.el-step__title.is-success) {
  color: #165DFF;
}
</style>
