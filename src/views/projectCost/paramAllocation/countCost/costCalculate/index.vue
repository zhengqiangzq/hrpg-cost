<script setup name="costCalculate">
import {getCurrentInstance, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";
import {requiredPageFilter} from "@/utils";
import {
  costledgerhospitalCostExport,
  costledgerhospitalCostPage,
  paramcalculatecalculateDirectCost,
  paramcalculatecalculateHospitalCost,
  paramcalculatecalculateIndirectCost, paramcalculatedirectCostExport,
  paramcalculatedirectCostPage,
  paramcalculateindirectCostExport,
  paramcalculateindirectCostPage,
  paramcalculateunCalculateDirectCost, paramcalculateunCalculateHospitalCost,
  paramcalculateunCalculateIndirectCost
} from "@/api/costCountParameter";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'costCalculate'
const API = {
  query: paramcalculatedirectCostPage,
  secQuery: paramcalculateindirectCostPage,
  thrQuery: costledgerhospitalCostPage,
  calc: paramcalculatecalculateDirectCost,
  cancelCalc: paramcalculateunCalculateDirectCost,
  secCalc: paramcalculatecalculateIndirectCost,
  secCancelCalc: paramcalculateunCalculateIndirectCost,
  thrCalc: paramcalculatecalculateHospitalCost,
  thrCancelCalc: paramcalculateunCalculateHospitalCost,
  export: paramcalculatedirectCostExport,
  secExport: paramcalculateindirectCostExport,
  thrExport: costledgerhospitalCostExport,
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
const { tableParameter, openDialog } = useSelectTableData()

const activeStep = ref('1')

const step1Name = ref('1.直接成本计算')
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'itemAccountingPeriodName', required: true, showLabel: true, type: 'slot' },
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
    { label: '单位总成本', value: 'totalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalCost) },
    { label: '人力成本', value: 'laborCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.laborCost) },
    { label: '物资成本', value: 'suppliesCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.suppliesCost) },
    { label: '设备成本', value: 'assetsCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.assetsCost) },
    { label: '其他成本', value: 'otherCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.otherCost) },
  ],
  summaryFieldList: [
    { value: 'workNum', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'laborCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'suppliesCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'assetsCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'otherCost', formatter: proxy.$fn.TripartiteMethod },
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
    { label: '核算期间', value: 'itemAccountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
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
    { label: '科室总成本', value: 'deptTotalCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptTotalCost), labelTip: '项目差额=科室总成本-药品成本-单收费材料成本-对外协助成本+接收协助成本-项目总成本' },
    { label: '药品成本', value: 'deptDrugCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptDrugCost) },
    { label: '单独收费材料', value: 'deptChargeProductCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptChargeProductCost) },
    { label: '不参与核算成本', value: 'deptUnJoinAccountCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.deptUnJoinAccountCost) },
    { label: '对外协助成本', value: 'laborForeignCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.laborForeignCost) },
    { label: '接收协作成本', value: 'laborReceiveCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.laborReceiveCost) },
    { label: '项目直接成本', value: 'directCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCost) },
    { label: '项目间接成本', value: 'indirectCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectCost) },
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
    { value: 'indirectCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'itemTotalCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'itemDifferenceCost', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const step3Name = ref('3.院级成本计算')
const filterThrRef = ref()
const filterThrInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'itemAccountingPeriodName', required: true, showLabel: true, type: 'slot' },
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
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => thrExportData({
        itemAccountingPeriodId: filterThrInfo.query.itemAccountingPeriodId,
        itemAccountingPeriodName: filterThrInfo.query.itemAccountingPeriodName,
        feeItemIdList: filterThrInfo.query.feeItemIdList,
        feeItemName: filterThrInfo.query.feeItemName,
      }), },
  ]
})
const tableThrInfo = reactive({
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
    { label: '核算期间', span: 8, value: 'itemAccountingPeriodName', type: 'slot' },
  ],
  rules: {
    itemAccountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: handleCalcData }
  ]
})

watch(activeStep, (val, oldVal) => {
  const filters = {
    '1': filterInfo,
    '2': filterSecInfo,
    '3': filterThrInfo
  }
  Object.assign(filters[val].query, filters[oldVal].query)
})

// 查询
function getList(resetFlag) {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  if (!resetFlag && !filterInfo.query.itemAccountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableInfo.api = API.query
  filterInfo.copyQuery = cloneDeep({
    itemAccountingPeriodId: filterInfo.query.itemAccountingPeriodId,
    deptId: filterInfo.query.deptId,
    feeItemIdList: filterInfo.query.feeItemIdList,
    deptIdList: filterInfo.query.deptIdList,
  })
  tableInfo.refresh = Math.random()
}
// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}
// 查询
function getSecList(resetFlag) {
  const required = requiredPageFilter(filterSecInfo.list, filterSecInfo.query)
  if(!required) return;
  if (!resetFlag && !filterSecInfo.query.itemAccountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableSecInfo.api = API.secQuery
  filterSecInfo.copyQuery = cloneDeep({
    itemAccountingPeriodId: filterSecInfo.query.itemAccountingPeriodId,
    deptId: filterSecInfo.query.deptId,
    deptIdList: filterSecInfo.query.deptIdList,
  })
  tableSecInfo.refresh = Math.random()
}
// 重置查询
function secReset() {
  filterSecInfo.query = {}
  getSecList()
}
// 查询
function getThrList(resetFlag) {
  const required = requiredPageFilter(filterThrInfo.list, filterThrInfo.query)
  if(!required) return;
  if (!resetFlag && !filterThrInfo.query.itemAccountingPeriodId) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  tableThrInfo.api = API.thrQuery
  filterThrInfo.copyQuery = cloneDeep({
    itemAccountingPeriodId: filterThrInfo.query.itemAccountingPeriodId,
    feeItemIdList: filterThrInfo.query.feeItemIdList
  })
  tableThrInfo.refresh = Math.random()
}
// 重置查询
function thrReset() {
  filterThrInfo.query = {}
  getThrList()
}

function handleOpenCalcInfo(mark) {
  const filters = {
    '1': filterInfo.query,
    '2': filterSecInfo.query,
    '3': filterThrInfo.query
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
    '3': API.thrCalc
  }
  let flag = 0;
  await calcInfo.refObj.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    api[activeStep.value](calcInfo.data.itemAccountingPeriodId).then(res => {
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
    '3': API.thrCancelCalc
  }
  let flag = 0;
  await calcInfo.refObj.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    api[activeStep.value](calcInfo.data.itemAccountingPeriodId).then(res => {
      if (res.success) {
        proxy.$message.success('取消计算成功')
        calcSuccessHandle()
      }
    })
  }
}

function calcSuccessHandle() {
  calcInfo.visible = false
  const filters = { '1': filterInfo, '2': filterSecInfo, '3': filterThrInfo }
  filters[activeStep.value].query = {
    ...filters[activeStep.value].query,
    ...calcInfo.data
  }
  const callback = { '1': getList, '2': getSecList, '3': getThrList }
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

function openAccountingPeriod(mark) {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.checkBox = false
  tableParameter.query = {}
  tableParameter.title = '核算期间'
  tableParameter.mark = mark
  tableParameter.callBack = accountingPeriodCallback
  const ref = mark === 'thr' ? filterThrRef.value : mark === 'sec' ? filterSecRef.value : mark === 'calc' ? dialogInfoRef.value : filterRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  if (tableParameter.mark === 'calc') {
    calcInfo.data.itemAccountingPeriodId = raw.id
    calcInfo.data.itemAccountingPeriodName = raw.name
    calcInfo.data.startPeriod = raw.beginPeriodName
    calcInfo.data.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'thr') {
    filterThrInfo.query.itemAccountingPeriodId = raw.id
    filterThrInfo.query.itemAccountingPeriodName = raw.name
    filterThrInfo.query.startPeriod = raw.beginPeriodName
    filterThrInfo.query.endPeriod = raw.endPeriodName
  } else if (tableParameter.mark === 'sec') {
    filterSecInfo.query.itemAccountingPeriodId = raw.id
    filterSecInfo.query.itemAccountingPeriodName = raw.name
    filterSecInfo.query.startPeriod = raw.beginPeriodName
    filterSecInfo.query.endPeriod = raw.endPeriodName
  } else {
    filterInfo.query.itemAccountingPeriodId = raw.id
    filterInfo.query.itemAccountingPeriodName = raw.name
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
  const ref = mark === 'thr' ? filterThrRef.value : filterRef.value
  openDialog(ref,'table')
}
function feeItemCallback(raw) {
  if(tableParameter.mark === 'thr') {
    filterThrInfo.query.feeItemIdList = raw.map((it) => it.id)
    filterThrInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  } else {
    filterInfo.query.feeItemIdList = raw.map((it) => it.id)
    filterInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  }
}
</script>

<template>
<!-- 成本计算 参数 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <el-steps :active="activeStep" finish-status="success">
          <el-step :title="step1Name"></el-step>
          <el-step :title="step2Name"></el-step>
          <el-step :title="step3Name"></el-step>
        </el-steps>
        <div v-if="activeStep === '1'">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :filter-btn="filterInfo.filterbtn"
            >
              <template #filter-itemAccountingPeriodName>
                <el-input
                    v-model="filterInfo.query.itemAccountingPeriodName"
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
                    <el-icon @click="openfeeItemSelector('')"><Search /></el-icon>
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
              <template #filter-itemAccountingPeriodName>
                <el-input
                    v-model="filterSecInfo.query.itemAccountingPeriodName"
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
              <template #filter-itemAccountingPeriodName>
                <el-input
                    v-model="filterThrInfo.query.itemAccountingPeriodName"
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
        <template #form-itemAccountingPeriodName>
          <el-input
              v-model="calcInfo.data.itemAccountingPeriodName"
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
