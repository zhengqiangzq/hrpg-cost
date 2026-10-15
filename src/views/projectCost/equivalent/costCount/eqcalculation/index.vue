<script setup name="eqcalculation">
import {getCurrentInstance, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";
import {
  itemChargeItemEquivalentCostDetailcalculate,
  itemChargeItemEquivalentCostDetailcancelCalculate,
  itemChargeItemEquivalentCostDetaildeptPage,
  itemChargeItemEquivalentCostDetailexportExcel,
  itemChargeItemEquivalentCostDetailexportHospitalExcel,
  itemChargeItemEquivalentCostDetailhospitalCalculate,
  itemChargeItemEquivalentCostDetailcancelHospitalCalculate,
  itemChargeItemEquivalentCostDetailhospitalPage,
  calcThrCalc,
  calcThrQuery,
  calcThrCancelCalc,
  calcThrExport,
  calcFourQuery, calcFourCalc, calcFourCancelCalc, calcFourExport
} from "@/api/costCount";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'eqcalculation'
const API = {
  query: itemChargeItemEquivalentCostDetaildeptPage,
  calc: itemChargeItemEquivalentCostDetailcalculate,
  cancelCalc: itemChargeItemEquivalentCostDetailcancelCalculate,
  export: itemChargeItemEquivalentCostDetailexportExcel,
  secQuery: itemChargeItemEquivalentCostDetailhospitalPage,
  secCalc: itemChargeItemEquivalentCostDetailhospitalCalculate,
  secCancelCalc: itemChargeItemEquivalentCostDetailcancelHospitalCalculate,
  secExport: itemChargeItemEquivalentCostDetailexportHospitalExcel,
  thrQuery: calcThrQuery,
  thrCalc: calcThrCalc,
  thrCancelCalc: calcThrCancelCalc,
  thrExport: calcThrExport,
  fourQuery: calcFourQuery,
  fourCalc: calcFourCalc,
  fourCancelCalc: calcFourCancelCalc,
  fourExport: calcFourExport,
}

const {
  exportData: exportData
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

const step1Name = ref('1.直接成本计算')
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '服务项目', value: 'feeItemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('calc'), },
    { type: 'button', label: '取消计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('cancelCalc'), },
    { type: 'button', label: '下一步', show: true, event: () => activeStep.value = '2', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.query), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '人员经费', value: 'personCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.personCost) },
    { label: '卫生材料', value: 'materialsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.materialsCost) },
    { label: '固定资产折旧费', value: 'depreciationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.depreciationCost) },
    { label: '无形资产摊销费', value: 'amortizationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.amortizationCost) },
    { label: '计提风险基金', value: 'riskFundsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.riskFundsCost) },
    { label: '其他成本', value: 'otherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.otherCost) },
    { label: '合计', value: 'total', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.total) },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step2Name = ref('2.间接成本计算')
const filterSecRef = ref()
const filterSecInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '服务项目', value: 'feeItemName', showLabel: true, type: 'slot' },
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
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => secExportData(filterSecInfo.query), },
  ]
})
const tableSecInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '人员经费', value: 'personCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.personCost) },
    { label: '卫生材料', value: 'materialsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.materialsCost) },
    { label: '固定资产折旧费', value: 'depreciationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.depreciationCost) },
    { label: '无形资产摊销费', value: 'amortizationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.amortizationCost) },
    { label: '计提风险基金', value: 'riskFundsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.riskFundsCost) },
    { label: '其他成本', value: 'otherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.otherCost) },
    { label: '合计', value: 'total', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.total) },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step3Name = ref('3.科室级成本计算')
const filterThrRef = ref()
const filterThrInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
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
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => thrExportData(filterThrInfo.query), },
  ]
})
const tableThrInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '人员经费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directPersonCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directPersonCost) },
        { label: '间接成本', value: 'indirectPersonCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectPersonCost) },
        { label: '合计', value: 'totalPersonCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalPersonCost) },
      ] },
    { label: '卫生材料', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directMaterialsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directMaterialsCost) },
        { label: '间接成本', value: 'indirectMaterialsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectMaterialsCost) },
        { label: '合计', value: 'totalMaterialsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMaterialsCost) },
      ] },
    { label: '固定资产折旧费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directDepreciationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directDepreciationCost) },
        { label: '间接成本', value: 'indirectDepreciationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectDepreciationCost) },
        { label: '合计', value: 'totalDepreciationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalDepreciationCost) },
      ] },
    { label: '无形资产摊销费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directAmortizationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directAmortizationCost) },
        { label: '间接成本', value: 'indirectAmortizationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectAmortizationCost) },
        { label: '合计', value: 'totalAmortizationCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalAmortizationCost) },
      ] },
    { label: '计提医疗风险基金', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directRiskFundsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directRiskFundsCost) },
        { label: '间接成本', value: 'indirectRiskFundsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectRiskFundsCost) },
        { label: '合计', value: 'totalRiskFundsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalRiskFundsCost) },
      ] },
    { label: '其他成本', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directOtherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directOtherCost) },
        { label: '间接成本', value: 'indirectOtherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectOtherCost) },
        { label: '合计', value: 'totalOtherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalOtherCost) },
      ] },
    { label: '合计', value: 'total', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.total) },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step4Name = ref('4.院级成本计算')
const filterFourRef = ref()
const filterFourInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getFourList, },
    { type: 'button', label: '重置', event: fourReset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('calc'), },
    { type: 'button', label: '取消计算', show: proxy.$permission(`${PERMISSION_CODE}:calc`), event: () => handleOpenCalcInfo('cancelCalc'), },
    { type: 'button', label: '上一步', show: true, event: () => activeStep.value = '3', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => fourExportData({
        itemAccountingPeriodId: filterFourInfo.query.checkPeriodId,
        feeItemIdList: filterFourInfo.query.feeItemIdList,
      }), },
  ]
})
const tableFourInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '单价', value: 'price', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.price) },
    { label: '单位成本', type: 'multiHeader', children: [
        { label: '医疗成本', value: 'medicalCosts', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalCosts) },
        { label: '医疗全成本', width: '120px', value: 'medicalAllCosts', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalAllCosts) },
        { label: '医院全成本', width: '120px', value: 'hospitalCosts', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.hospitalCosts) },
      ]
    },
    { label: '成本收益率', value: 'incomeRate', align: 'center' },
    { label: '工作量', value: 'workNum', align: 'center' },
    { label: '总收入', value: 'allIncome', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allIncome) },
    { label: '总成本', value: 'allCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allCost) },
    { label: '总收益', value: 'allBalance', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allBalance) },
  ],
  summaryFieldList: [
    { value: 'unitMedicalCosts', formatter: proxy.$fn.TripartiteMethod },
    { value: 'unitMedicalFullCosts', formatter: proxy.$fn.TripartiteMethod },
    { value: 'unitHospitalFullCosts', formatter: proxy.$fn.TripartiteMethod },
    { value: 'qty', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalIncome', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalProfit', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})


// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: true,
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
    { label: '核算期间', value: 'accountingPeriodName', type: 'slot' },
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
function getList(resetFlag) {
  if (!resetFlag && !filterInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableInfo.api = API.query
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}
// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}
// 查询
function getSecList(resetFlag) {
  if (!resetFlag && !filterSecInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableSecInfo.api = API.secQuery
  filterSecInfo.copyQuery = cloneDeep(filterSecInfo.query)
  tableSecInfo.refresh = Math.random()
}
// 重置查询
function secReset() {
  filterSecInfo.query = {}
  getSecList()
}
// 查询
function getThrList(resetFlag) {
  if (!resetFlag && !filterThrInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableThrInfo.api = API.thrQuery
  filterThrInfo.copyQuery = cloneDeep(filterThrInfo.query)
  tableThrInfo.refresh = Math.random()
}
// 重置查询
function thrReset() {
  filterThrInfo.query = {}
  getThrList()
}
// 查询
function getFourList(resetFlag) {
  if (!resetFlag && !filterFourInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableFourInfo.api = API.fourQuery
  filterFourInfo.copyQuery = {
    ...filterFourInfo.query,
    itemAccountingPeriodId: filterFourInfo.query.checkPeriodId
  }
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
    '4': filterFourInfo.query,
  }
  calcInfo.data = cloneDeep(filters[activeStep.value])
  calcInfo.mark = mark
  calcInfo.title = mark === 'calc' ? '计算' : '取消计算'
  calcInfo.visible = true
}

function handleCalcData() {
  if (calcInfo.mark === 'calc') {
    calcInfo.title = '计算'
    calcData()
  } else if (calcInfo.mark === 'cancelCalc') {
    calcInfo.title = '取消计算'
    cancelCalcData()
  }
}

async function calcData() {
  const api = {
    '1': API.calc,
    '2': API.secCalc,
    '3': API.thrCalc,
    '4': API.fourCalc,
  }
  let flag = 0;
  await calcInfo.refObj.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    api[activeStep.value](calcInfo.data.checkPeriodId).then(res => {
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
    '4': API.fourCancelCalc,
  }
  let flag = 0;
  await calcInfo.refObj.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    api[activeStep.value](calcInfo.data.checkPeriodId).then(res => {
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
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.checkBox = false
  tableParameter.mark = mark
  tableParameter.filters = []
  tableParameter.title = '核算期间'
  tableParameter.callBack = accountingPeriodCallback
  const ref = { calc: dialogInfoRef.value, first: filterRef.value, sec: filterSecRef.value, thr: filterThrRef.value, four: filterFourRef.value }[mark]
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  const filter = { calc: calcInfo.data, first: filterInfo.query, sec: filterSecInfo.query, thr: filterThrInfo.query, four: filterFourInfo.query }[tableParameter.mark]
  filter.checkPeriodId = raw.id
  filter.accountingPeriodName = raw.name
  filter.startPeriod = raw.beginPeriodName
  filter.endPeriod = raw.endPeriodName
}


function openDeptSelector(mark) {
  deptTreeInfo.checkBox = true
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  let datas = raw?.filter((it) => !it.childList)
  const filter = { first: filterInfo.query, sec: filterSecInfo.query, thr: filterThrInfo.query, }[deptTreeInfo.mark]
  filter.deptId = datas?.map((it) => it.id);
  filter.deptIdList = datas?.map((it) => it.id);
  filter.deptName = datas?.map((it) => it.name);
}

function openFeeItemSelector(mark) {
  tableParameter.title = '收费项目'
  tableParameter.visible = true
  tableParameter.mark = mark
  tableParameter.checkBox = true
  tableParameter.pager = true
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.type = 'feeItem'
  tableParameter.query = { }
  const ref = { first: filterRef.value, sec: filterSecRef.value, thr: filterThrRef.value, four: filterFourRef.value }[mark]
  tableParameter.callBack = feeItemCallback
  openDialog(ref)
}
function feeItemCallback(raw) {
  const filter = { first: filterInfo.query, sec: filterSecInfo.query, thr: filterThrInfo.query, four: filterFourInfo.query }[tableParameter.mark]
  filter.feeItemIdList = raw.map((it) => it.id)
  filter.feeItemName = raw.map((it) => it.name).join(',')
}

</script>

<template>
  <!-- 成本计算 当量 -->
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
                    <el-icon @click="openAccountingPeriod('first')"><Search /></el-icon>
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
                    <el-icon @click="openDeptSelector('first')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-feeItemName>
                <el-input
                    v-model="filterInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择收费项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openFeeItemSelector('first')"><Search /></el-icon>
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
              <template #filter-feeItemName>
                <el-input
                    v-model="filterSecInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择收费项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openFeeItemSelector('sec')"><Search /></el-icon>
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
              <template #filter-accountingPeriodName>
                <el-input
                    v-model="filterThrInfo.query.accountingPeriodName"
                    class="not-mongolia"
                    placeholder="请选择核算期间"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openAccountingPeriod('thr')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-deptName>
                <el-input
                    v-model="filterThrInfo.query.deptName"
                    class="not-mongolia"
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector('thr')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-feeItemName>
                <el-input
                    v-model="filterThrInfo.query.feeItemName"
                    class="not-mongolia"
                    placeholder="请选择收费项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openFeeItemSelector('thr')"><Search /></el-icon>
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
              <template #filter-accountingPeriodName>
                <el-input
                    v-model="filterFourInfo.query.accountingPeriodName"
                    class="not-mongolia"
                    placeholder="请选择核算期间"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openAccountingPeriod('four')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-feeItemName>
                <el-input
                    v-model="filterFourInfo.query.feeItemName"
                    class="not-mongolia"
                    placeholder="请选择收费项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openFeeItemSelector('four')"><Search /></el-icon>
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
    <dialog-form :title="calcInfo.title" width="50%" :btList="calcInfo.btList" v-model:visible="calcInfo.visible">
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
    <SelectProDeptTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :api="deptTreeInfo.api"
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
