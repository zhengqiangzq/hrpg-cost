<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {pageAccountingPeriod} from "@/api/DRGCostAccountingPeriod";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {pageDoctorCompositionAnalysis, exportAnalysis} from "@/api/DRGCost/doctorCompositionAnalysis";

const PERMISSION_CODE = 'drg:doctorCompositionAnalysis'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
    deptLevel: dict_dept_level
  },
  copyQuery: {},
  query: {
    costType: '1',
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '主诊医生', value: 'mainDoctorName', type: 'input' },
    { label: 'DRGs', value: 'drgName', showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '图形分析', event: () => analysisDetail() },
    { type: 'button', label: '导出', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() },
  ]
})
const tableInfo = reactive({
  api: null,
  refresh: 1,
  fieldList: [
    { label: '主诊医生', value: 'mainDoctorName' },
    { label: 'DRGs编码', value: 'drgDefinitionCode' },
    { label: 'DRGs名称', value: 'drgDefinitionName' },
    { label: '支付标准', value: 'payStandard', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.payStandard) },
    { label: '病例数', value: 'paramValue', align: 'center' },
    { label: '平均住院天数', value: 'days', align: 'center' },
    { label: '总收入', value: 'productCost', type: 'slot', headAlign: 'center', align: 'right' },
    { label: '例均费用', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
    { label: '例均成本', value: 'currentCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCost) },
    { label: '总成本', value: 'previousCost', type: 'slot', headAlign: 'center', align: 'right' },
    { label: '人员经费', type: 'multiHeader', children: [
        { label: '金额', value: 'personnelAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelAmount) },
        { label: '占比', value: 'personnelPercent', align: 'center' },
      ] },
    { label: '药品费', type: 'multiHeader', children: [
        { label: '金额', value: 'drugAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugAmount) },
        { label: '占比', value: 'drugPercent', align: 'center' },
      ] },
    { label: '卫生材料费', type: 'multiHeader', children: [
        { label: '金额', value: 'healthMaterialAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialAmount) },
        { label: '占比', value: 'healthMaterialPercent', align: 'center' },
      ] },
    { label: '固定资产折旧费', type: 'multiHeader', children: [
        { label: '金额', value: 'fixedAssetsDepreciationAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationAmount) },
        { label: '占比', value: 'fixedAssetsDepreciationPercent', align: 'center' },
      ] },
    { label: '无形资产摊销费', type: 'multiHeader', children: [
        { label: '金额', value: 'intangibleAssetsAmortizationAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationAmount) },
        { label: '占比', value: 'intangibleAssetsAmortizationPercent', align: 'center' },
      ] },
    { label: '计提风险医疗基金', type: 'multiHeader', children: [
        { label: '金额', value: 'medicalVentureFundAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundAmount) },
        { label: '占比', value: 'medicalVentureFundPercent', align: 'center' },
      ] },
    { label: '其他医疗费用', type: 'multiHeader', children: [
        { label: '金额', value: 'otherOperatingExpensesAmount', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherOperatingExpensesAmount) },
        { label: '占比', value: 'otherOperatingExpensesPercent', align: 'center' },
      ] },
    { label: '例均收益', value: 'incomeAvg', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.incomeAvg) },
    { label: '收益率(%)', value: 'otherPercent', align: 'center' },
    { label: '结算差额', value: 'settleDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.settleDifference) },
  ]
})
const detailInfo = reactive({
  type: 'income',
  query: {},
  visible: false
})
const analysisInfo = reactive({
  query: {},
  visible: false
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

watch(() => filterInfo.copyQuery.mainDoctorName, (val) => {
  const btns = filterInfo.btnList
  const analysisBtn = btns.find(it => it.label === '图形分析')
  analysisBtn.disabled = !val
}, { immediate: true })

onMounted(() => {
  tableInfo.api = pageDoctorCompositionAnalysis
  getDefaultPeriod()
})

function buildFilterParams() {
  filterInfo.copyQuery = {
    ...filterInfo.query,
  }
}
function search() {
  buildFilterParams()
  for (const field of filterInfo.list.filter(field => field.required)) {
    if (!filterInfo.copyQuery[field.value]) {
      proxy.$message.warning(errorMessage(field))
      return
    }
  }
  tableInfo.refresh = Math.random()
}
function reset() {
  filterInfo.query = {
    costType: '1'
  }
  getDefaultPeriod()
}
function getDefaultPeriod() {
  pageAccountingPeriod({
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
      search()
    }
  })
}

function detailProductCost(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId,
    mainDoctorName: row.mainDoctorName,
  }
  detailInfo.visible = true
}

function analysisDetail() {
  analysisInfo.query = {
    ...filterInfo.copyQuery,
  }
  analysisInfo.visible = true
}

function detailPreviousCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId,
    mainDoctorName: row.mainDoctorName,
  }
  detailInfo.visible = true
}

function exportData() {
  exportAnalysis(filterInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'DRGPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
    filterInfo.query.beginPeriodName = raw.beginPeriodName
    filterInfo.query.endPeriodName = raw.endPeriodName
  }
  openDialog(filterRef.value)
}
function openDRGsSelector() {
  tableParameter.type = 'DRGGroup'
  tableParameter.callBack = (raw) => {
    filterInfo.query.drgId= raw.id
    filterInfo.query.drgName = raw.name
  }
  openDialog(filterRef.value)
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !analysisInfo.visible">
      <div class="filter-wrapper">
        <page-filter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list">
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-drgName>
            <el-input
                v-model="filterInfo.query.drgName"
                class="not-mongolia" placeholder="请选择DRGs" :disabled="true"
            >
              <template #append><el-icon @click="openDRGsSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </page-filter>
      </div>
      <div class="filter-wrapper">
        <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
      </div>
      <table-container
          :api="tableInfo.api"
          :field-list="tableInfo.fieldList"
          :query="filterInfo.copyQuery"
          :check-box="false"
          :refresh="tableInfo.refresh"
          v-model:data="tableInfo.data"
          tabIndex
      >
        <template #col-productCost="{ row }">
          <span class="slip-edit" @click="detailProductCost(row)">{{ $fn.TripartiteMethod(row.productCost || '') }}</span>
        </template>
        <template #col-previousCost="{ row }">
          <span class="slip-edit" @click="detailPreviousCost(row)">{{ $fn.TripartiteMethod(row.previousCost || '') }}</span>
        </template>
      </table-container>
    </div>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" visible="" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>