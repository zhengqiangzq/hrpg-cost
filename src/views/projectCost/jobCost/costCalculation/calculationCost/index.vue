<script setup name="calculationCost">
import {getCurrentInstance, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";
import {useStorage} from "@vueuse/core";
import {
  itemCostComputequeryActivityComputeList,
  itemCostComputedirectCostCompute,
  itemCostComputeactivityCompute,
  itemCostComputeresourceCompute,
  itemCostComputequeryDirectComputeList,
  itemCostComputequeryResourceComputeList,
  itemCostComputeunCalculateDirectCost,
  itemCostComputeunResourceCompute,
  itemCostComputeunActivityCompute,
  itemCostComputehospitalCompute,
  itemCostComputeunHospitalCompute,
  itemCostComputeexportDirectComputeList,
  itemCostComputeexportResourceComputeList,
  itemCostComputeexportActivityComputeList
} from "@/api/calculationCost";
import {costledgerhospitalCostPage, costledgerhospitalCostExport} from "@/api/costCountParameter";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'calculationCost'
const API = {
  query: itemCostComputequeryDirectComputeList,
  secQuery: itemCostComputequeryResourceComputeList,
  thrQuery: itemCostComputequeryActivityComputeList,
  fourQuery: costledgerhospitalCostPage,
  calc: itemCostComputedirectCostCompute,
  cancelCalc: itemCostComputeunCalculateDirectCost,
  secCalc: itemCostComputeresourceCompute,
  secCancelCalc: itemCostComputeunResourceCompute,
  thrCalc: itemCostComputeactivityCompute,
  thrCancelCalc: itemCostComputeunActivityCompute,
  fourCalc: itemCostComputehospitalCompute,
  fourCancelCalc: itemCostComputeunHospitalCompute,
  export: itemCostComputeexportDirectComputeList,
  secExport: itemCostComputeexportResourceComputeList,
  thrExport: itemCostComputeexportActivityComputeList,
  fourExport: costledgerhospitalCostExport,
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

const setting = useStorage('setting', {}, sessionStorage)
const step1Name = ref('1.直接成本计算')
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'checkPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
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
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '工作量', value: 'workNum', align: 'center' },
    { label: '人力成本', value: 'laborCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.laborCost) },
    { label: '物资成本', value: 'suppliesCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.suppliesCost) },
    { label: '设备成本', value: 'assetsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.assetsCost) },
    { label: '其他成本', value: 'otherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.otherCost) },
    { label: '总成本', value: 'totalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalCost) },
  ],
  summaryFieldList: [
    { value: 'workNum', formatter: proxy.$fn.TripartiteMethod },
    { value: 'laborCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'suppliesCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'assetsCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'otherCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step2Name = ref('2.资源成本计算')
const filterSecRef = ref()
const filterSecInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'checkPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
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
    { label: '科室总成本', value: 'deptTotalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptTotalCost) },
    { label: '药品成本', value: 'deptDrugCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptDrugCost) },
    { label: '单独收费材料', value: 'deptChargeProductCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptChargeProductCost) },
    { label: '不参与核算成本', value: 'deptUnJoinAccountCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptUnJoinAccountCost) },
    { label: '对外协助成本', value: 'laborForeignCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.laborForeignCost) },
    { label: '接收协作成本', value: 'laborReceiveCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.laborReceiveCost) },
    { label: '项目直接成本', value: 'directCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCost) },
    { label: '作业成本', value: 'activityCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.activityCost) },
    { label: '项目总成本', value: 'itemTotalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.itemTotalCost) },
    { label: '项目差额', value: 'itemDifferenceCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.itemDifferenceCost) },
  ],
  summaryFieldList: [
    { value: 'deptTotalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'deptDrugCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'deptChargeProductCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'deptUnJoinAccountCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'laborForeignCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'laborReceiveCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'directCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'activityCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'itemTotalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'itemDifferenceCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step3Name = ref('3.作业成本计算')
const filterThrRef = ref()
const filterThrInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'checkPeriodName', required: true, showLabel: true, type: 'slot' },
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
    { label: '作业总成本', value: 'activityTotalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.activityTotalCost) },
    { label: '项目作业成本合计', value: 'projectActivityTotalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.projectActivityTotalCost) },
    { label: '差额', value: 'itemDifferenceCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.itemDifferenceCost) },
  ],
  summaryFieldList: [
    { value: 'activityTotalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'projectActivityTotalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'itemDifferenceCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})
const step4Name = ref('4.院级成本计算')
const filterfourRef = ref()
const filterfourInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'checkPeriodName', required: true, showLabel: true, type: 'slot' },
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
        checkPeriodId: filterfourInfo.query.checkPeriodId,
        itemAccountingPeriodId: filterfourInfo.query.checkPeriodId,
        checkPeriodName: filterfourInfo.query.checkPeriodName,
        feeItemIdList: filterfourInfo.query.feeItemIdList,
        feeItemName: filterfourInfo.query.feeItemName,
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
        { label: '医疗全成本', value: 'medicalAllCosts', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicalAllCosts) },
        { label: '医院全成本', value: 'hospitalCosts', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.hospitalCosts) },
      ]
    },
    { label: '成本收益率', value: 'incomeRate', align: 'center' },
    { label: '工作量', value: 'workNum', align: 'center' },
    { label: '总收入', value: 'allIncome', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allIncome) },
    { label: '总成本', value: 'allCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allCost) },
    { label: '总收益', value: 'allBalance', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allBalance) },
  ],
  summaryFieldList: [
    { value: 'medicalCosts', formatter: proxy.$fn.TripartiteMethod },
    { value: 'medicalAllCosts', formatter: proxy.$fn.TripartiteMethod },
    { value: 'hospitalCosts', formatter: proxy.$fn.TripartiteMethod },
    { value: 'workNum', formatter: proxy.$fn.TripartiteMethod },
    { value: 'allIncome', formatter: proxy.$fn.TripartiteMethod },
    { value: 'allCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'allBalance', formatter: proxy.$fn.TripartiteMethod },
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
    { label: '核算期间', span: 12, value: 'checkPeriodName', type: 'slot' },
  ],
  rules: {
    checkPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'blur' }],
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
    '4': filterfourInfo
  }
  Object.assign(filters[val].query, filters[oldVal].query)
})

// 查询
function getList() {
  if (!filterInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableInfo.api = API.query
  filterInfo.copyQuery = cloneDeep({
    checkPeriodId: filterInfo.query.checkPeriodId,
    deptId: filterInfo.query.deptId,
    deptIdList: filterInfo.query.deptIdList,
    orgId: setting.value.hospitalId,
    feeItemIdList: filterInfo.query.feeItemIdList,
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
  if (!filterSecInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableSecInfo.api = API.secQuery
  filterSecInfo.copyQuery = cloneDeep({
    checkPeriodId: filterSecInfo.query.checkPeriodId,
    deptId: filterSecInfo.query.deptId,
    deptIdList: filterSecInfo.query.deptIdList,
    orgId: setting.value.hospitalId,
    feeItemIdList: filterSecInfo.query.feeItemIdList,
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
  if (!filterThrInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableThrInfo.api = API.thrQuery
  filterThrInfo.copyQuery = cloneDeep({
    checkPeriodId: filterThrInfo.query.checkPeriodId,
    deptId: filterThrInfo.query.deptId,
    deptIdList: filterThrInfo.query.deptIdList,
    orgId: setting.value.hospitalId,
    feeItemIdList: filterThrInfo.query.feeItemIdList,
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
  if (!filterfourInfo.query.checkPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableFourInfo.api = API.fourQuery
  filterfourInfo.copyQuery = cloneDeep({
    checkPeriodId: filterfourInfo.query.checkPeriodId,
    itemAccountingPeriodId: filterfourInfo.query.checkPeriodId,
    // deptId: filterfourInfo.query.deptId,
    orgId: setting.value.hospitalId,
    feeItemIdList: filterfourInfo.query.feeItemIdList,
  })
  tableFourInfo.refresh = Math.random()
}
// 重置查询
function fourReset() {
  filterfourInfo.query = {}
  getFourList()
}

function handleOpenCalcInfo(mark) {
  const filters = {
    '1': filterInfo.query,
    '2': filterSecInfo.query,
    '3': filterThrInfo.query,
    '4': filterfourInfo.query
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
    api[activeStep.value]({
      orgId: setting.value.hospitalId,
      checkPeriodId: calcInfo.data.checkPeriodId,
    }).then(res => {
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
    api[activeStep.value]({
      orgId: setting.value.hospitalId,
      checkPeriodId: calcInfo.data.checkPeriodId,
    }).then(res => {
      if (res.success) {
        proxy.$message.success('取消计算成功')
        calcSuccessHandle()
      }
    })
  }
}

function calcSuccessHandle() {
  calcInfo.visible = false
  const filters = { '1': filterInfo, '2': filterSecInfo, '3': filterThrInfo, '4': filterfourInfo }
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
  tableParameter.checkBox = false
  tableParameter.query = {}
  tableParameter.title = '核算期间'
  tableParameter.mark = mark
  tableParameter.callBack = accountingPeriodCallback
  const ref = mark === 'thr' ? filterThrRef.value : mark === 'four' ? filterfourRef.value : mark === 'sec' ? filterSecRef.value :mark === 'calc' ? dialogInfoRef.value : filterRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  if (tableParameter.mark === 'calc') {
    calcInfo.data.checkPeriodId = raw.id
    calcInfo.data.checkPeriodName = raw.name
    calcInfo.data.startPeriod = raw.beginPeriodName
    calcInfo.data.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'thr') {
    filterThrInfo.query.checkPeriodId = raw.id
    filterThrInfo.query.checkPeriodName = raw.name
    filterThrInfo.query.startPeriod = raw.beginPeriodName
    filterThrInfo.query.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'four') {
    filterfourInfo.query.checkPeriodId = raw.id
    filterfourInfo.query.checkPeriodName = raw.name
    filterfourInfo.query.startPeriod = raw.beginPeriodName
    filterfourInfo.query.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'sec') {
    filterSecInfo.query.checkPeriodId = raw.id
    filterSecInfo.query.checkPeriodName = raw.name
    filterSecInfo.query.startPeriod = raw.beginPeriodName
    filterSecInfo.query.endPeriod = raw.endPeriodName
  } else {
    filterInfo.query.checkPeriodId = raw.id
    filterInfo.query.checkPeriodName = raw.name
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
  let datas = raw?.filter((it) => !it.childList)
  if(deptTreeInfo.mark === 'sec') {
    filterSecInfo.query.deptId = datas?.map((it) => it.id);
    filterSecInfo.query.deptIdList = datas?.map((it) => it.id);
    filterSecInfo.query.deptName = datas?.map((it) => it.name);
  } else if(deptTreeInfo.mark === 'thr') {
    filterThrInfo.query.deptId = datas?.map((it) => it.id);
    filterThrInfo.query.deptIdList = datas?.map((it) => it.id);
    filterThrInfo.query.deptName = datas?.map((it) => it.name);
  } else if(deptTreeInfo.mark === 'four') {
    // filterfourInfo.query.deptId = datas?.map((it) => it.id);
    // filterfourInfo.query.deptIdList = datas?.map((it) => it.id);
    // filterfourInfo.query.deptName = datas?.map((it) => it.name);
  } else {
    filterInfo.query.deptId = datas?.map((it) => it.id);
    filterInfo.query.deptIdList = datas?.map((it) => it.id);
    filterInfo.query.deptName = datas?.map((it) => it.name);
  }
}

function openfeeItemSelector(mark) {
  tableParameter.title = '收费项目'
  tableParameter.checkBox = true
  tableParameter.mark = mark
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.type = 'feeItem'
  tableParameter.query = { status: 1 }
  tableParameter.callBack = feeItemCallback
  const ref = mark === 'thr' ? filterThrRef.value : mark === 'four' ? filterfourRef.value : mark === 'sec' ? filterSecRef.value : filterRef.value
  openDialog(ref,'table')
}
function feeItemCallback(raw) {
  if(tableParameter.mark === 'thr') {
    filterThrInfo.query.feeItemIdList = raw.map((it) => it.id)
    filterThrInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  } else if(tableParameter.mark === 'four') {
    filterfourInfo.query.feeItemIdList = raw.map((it) => it.id)
    filterfourInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  } else if(tableParameter.mark === 'sec') {
    filterSecInfo.query.feeItemIdList = raw.map((it) => it.id)
    filterSecInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  } else {
    filterInfo.query.feeItemIdList = raw.map((it) => it.id)
    filterInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  }
}
</script>

<template>
  <!-- 成本计算 作业 -->
  <div class="app-container">
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
              <template #filter-checkPeriodName>
                <el-input
                    v-model="filterInfo.query.checkPeriodName"
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
              <template #filter-deptName>
                <el-input
                    v-model="filterInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector()"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-feeItemName>
                <el-input
                    v-model="filterInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择费用项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openfeeItemSelector()"><Search /></el-icon>
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
              <template #filter-checkPeriodName>
                <el-input
                    v-model="filterSecInfo.query.checkPeriodName"
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
                    placeholder="请选择费用项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openfeeItemSelector('sec')"><Search /></el-icon>
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
              <template #filter-checkPeriodName>
                <el-input
                    v-model="filterThrInfo.query.checkPeriodName"
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
              <template #filter-feeItemName>
                <el-input
                    v-model="filterThrInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择费用项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openfeeItemSelector('thr')"><Search /></el-icon>
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
                ref="filterfourRef"
                v-model:query="filterfourInfo.query"
                :filter-list="filterfourInfo.list"
                :filter-btn="filterfourInfo.filterbtn"
            >
              <template #filter-checkPeriodName>
                <el-input
                    v-model="filterfourInfo.query.checkPeriodName"
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
              <template #filter-deptName>
                <el-input
                    v-model="filterfourInfo.query.deptName"
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
              <template #filter-feeItemName>
                <el-input
                    v-model="filterfourInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择费用项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openfeeItemSelector('four')"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter :filter-btn="filterfourInfo.btnList">
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableFourInfo.refresh"
              :init-curpage="tableFourInfo.initCurpage"
              v-model:data="tableFourInfo.data"
              :api="tableFourInfo.api"
              :query="filterfourInfo.copyQuery"
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
        <template #form-checkPeriodName>
          <el-input
              v-model="calcInfo.data.checkPeriodName"
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
