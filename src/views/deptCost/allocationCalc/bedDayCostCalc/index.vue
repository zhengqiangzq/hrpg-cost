<!-- 床日成本计算 -->
<script setup name="bedDayCostCalc">
import {onMounted} from "vue";
import moment from "moment";
import {useStorage} from "@vueuse/core";
import {periodMonthByDate} from "@/api/base";
import {
  costBedCliniccaculationValidate,
  costBedCliniccalculation,
  costBedClinicqueryList,
  costBedClinicunCalculation, exportBedClinicunCalculation
} from "@/api/bedDayCostCalc";
import {useUpload} from "@/hooks/useUpload";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const { exportData } = useUpload({
  export: exportBedClinicunCalculation
})
const filterInfo = ref({
  query: {
    interType: 2,
    orgId: setting.value.hospitalId,
  },
  list: [
    { label: '会计期间', value: 'periodName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      label: '分摊检查',
      btType: 'primary',
      show: proxy.$permission('bedDayCostCalc:inspect'),
      event: inspect,
      type: 'button',
    },
    {
      label: '分摊计算',
      show: proxy.$permission('bedDayCostCalc:calculate'),
      event: calculate,
      type: 'button',
    },
    {
      label: '取消计算',
      show: proxy.$permission('bedDayCostCalc:cancelCalculate'),
      event: cancelCalculate,
      type: 'button',
    },
    { type: 'button', label: '导出Excel', show: proxy.$permission('bedDayCostCalc:export'), event: () => exportData(filterInfo.value.copyQuery) },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '核算属性', value: 'deptAtrName' },
    { label: '住院床日数(床日)', value: 'paramValue', align: 'center' },
    {
      label: '住院成本',
      value: 'totalValue',
      type: 'multiHeader',
      children: [
        { label: '医疗成本', value: 'medicTreatmentCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicTreatmentCostMoney) },
        { label: '医疗全成本', value: 'medicTreatmentAllCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.medicTreatmentAllCostMoney) },
        { label: '医院全成本', value: 'hospAllCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.hospAllCostMoney) },
      ]
    },
    {
      label: '科室床日成本',
      value: 'totalValue',
      type: 'multiHeader',
      children: [
        { label: '医疗成本', value: 'ksMedicTreatmentCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.ksMedicTreatmentCostMoney) },
        { label: '医疗全成本', value: 'ksMedicTreatmentAllCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.ksMedicTreatmentAllCostMoney) },
        { label: '医院全成本', value: 'ksHospAllCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.ksHospAllCostMoney) },
      ]
    },
    {
      label: '医院床日成本',
      value: 'totalValue',
      type: 'multiHeader',
      children: [
        { label: '医疗成本', value: 'yyMedicTreatmentCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.yyMedicTreatmentCostMoney) },
        { label: '医疗全成本', value: 'yyMedicTreatmentAllCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.yyMedicTreatmentAllCostMoney) },
        { label: '医院全成本', value: 'yyHospAllCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.yyHospAllCostMoney) },
      ]
    },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
    { value: 'medicTreatmentCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'medicTreatmentAllCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'hospAllCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'ksMedicTreatmentCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'ksMedicTreatmentAllCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'ksHospAllCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'yyMedicTreatmentCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'yyMedicTreatmentAllCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'yyHospAllCostMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  sectionRows: []
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
  query: {}
})

onMounted(() => {
  tableInfo.value.api = costBedClinicqueryList
  updatePeriodMonth()
})

const updatePeriodMonth = () => {
  periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.value.query.periodId = _data?.id
    filterInfo.value.query.periodName = _data?.periodYearAndMonth
    search()
  })
}
function search() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  updatePeriodMonth()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

const checkDialog = ref({
  title: '',
  fieldList: [
    { label: '警告级别', width: '120', value: 'levelName' },
    { label: '内容', value: 'message' }
  ],
  visible: false,
  data: []
})

// 分摊检查
function inspect() {
  if(!filterInfo.value.query.periodId) return proxy.$message.warning('请选择会计期间')
  costBedCliniccaculationValidate(filterInfo.value.query).then(res => {
    if (res.code === 200) {
      checkDialog.value.data = res.data
      checkDialog.value.visible = true
      checkDialog.value.title = '分摊检查'
    }
  })
}

// 分摊计算
function calculate() {
  if(!filterInfo.value.query.periodId) return proxy.$message.warning('请选择会计期间')
  costBedCliniccalculation(filterInfo.value.query).then(res => {
    if (res.code === 200) {
      checkDialog.value.data = res.data
      checkDialog.value.visible = true
      checkDialog.value.title = '分摊计算'
    }
  })
}

// 取消计算
function cancelCalculate() {
  if(!filterInfo.value.query.periodId) return proxy.$message.warning('请选择会计期间')
  costBedClinicunCalculation(filterInfo.value.query).then(res => {
    if (res.code === 200) {
      proxy.$message.success('操作成功')
      search()
    }
  })
}

function checkDialogClose() {
  search()
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
  filterInfo.value.query.periodId = raw.id
  filterInfo.value.query.periodName = raw.periodYearAndMonth
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-periodName>
              <el-input
                  v-model="filterInfo.query.periodName"
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
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            :pager="false"
            :checkBox="false"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
  </div>
  <el-dialog :title="checkDialog.title" v-model="checkDialog.visible" @close="checkDialogClose">
    <dialog-table :check-box="false" :pager="false" :fieldList="checkDialog.fieldList" :data="checkDialog.data" />
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
