<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dipAccountingPeriodPage} from "@/api/DIPCost/DIPCostAccountingPeriod";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {pageDoctorComparativeAnalysis, exportAnalysis} from "@/api/DIPCost/doctorComparativeAnalysis";

const PERMISSION_CODE = 'DIP:doctorComparativeAnalysis'
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
    { label: '对比期间', value: 'contrastPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '主诊医生', value: 'mainDoctorName', type: 'input' },
    { label: 'DIP组', value: 'dipName', showLabel: true, type: 'slot' },
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
    { label: 'DIP组编码', value: 'dipDefinitionCode' },
    { label: 'DIP组名称', value: 'dipDefinitionName' },
    { label: '支付标准', value: 'payStandard', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.payStandard) },
    { label: '本期', type: 'multiHeader', children: [
        { label: '总收入', value: 'productCost', type: 'slot', headAlign: 'center', align: 'right' },
        { label: '病例数', value: 'paramValue', align: 'center' },
        { label: '例均费用', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
        { label: 'RW', value: 'rw', align: 'center' },
        // { label: 'CMI', value: 'cmi', align: 'center' },
        { label: '结算差额', value: 'settleDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.settleDifference) },
        { label: '总成本', value: 'previousCost', type: 'slot', headAlign: 'center', align: 'right' },
        { label: '例均成本', value: 'currentCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCost) },
        { label: '例均收益', value: 'incomeAvg', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.incomeAvg) },
        { label: '收益率(%)', value: 'otherPercent', align: 'center' },
      ]
    },
    { label: '对比期间', type: 'multiHeader', children: [
        { label: '总收入', value: 'productCostContrast', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.productCostContrast) },
        { label: '病例数', value: 'paramValueContrast', align: 'center' },
        { label: '例均费用', value: 'drugCostContrast', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCostContrast) },
        { label: 'RW', value: 'rwContrast', align: 'center' },
        // { label: 'CMI', value: 'cmiContrast', align: 'center' },
        { label: '结算差额', value: 'settleDifferenceContrast', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.settleDifferenceContrast) },
        { label: '总成本', value: 'previousCostContrast', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.previousCostContrast) },
        { label: '例均成本', value: 'currentCostContrast', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCostContrast) },
        { label: '例均收益', value: 'incomeAvgContrast', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.incomeAvgContrast) },
        { label: '收益率(%)', value: 'otherPercentContrast', align: 'center' },
      ]
    },
    { label: '例均费用增长率(%)', value: 'incomeGrowthRate', align: 'center' },
    { label: '例均成本增长(%)', value: 'costGrowthRate', align: 'center' },
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
  tableInfo.api = pageDoctorComparativeAnalysis
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
  dipAccountingPeriodPage({
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
    }
  })
}

function detailProductCost(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    dipId: row.dipDefinitionId,
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
    dipId: row.dipDefinitionId,
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

function openAccountingPeriodSelector(mark) {
  tableParameter.type = 'DIPPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'contrast') {
      filterInfo.query.contrastPeriodId = raw.id
      filterInfo.query.contrastPeriodName = raw.name
    } else {
      filterInfo.query.accountingPeriodId = raw.id
      filterInfo.query.accountingPeriodName = raw.name
      filterInfo.query.beginPeriodName = raw.beginPeriodName
      filterInfo.query.endPeriodName = raw.endPeriodName
    }
  }
  openDialog(filterRef.value)
}
function openDIPsSelector() {
  tableParameter.type = 'DIPGroup'
  tableParameter.callBack = (raw) => {
    filterInfo.query.dipId= raw.id
    filterInfo.query.dipName = raw.name
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
          <template #filter-contrastPeriodName>
            <el-input
                v-model="filterInfo.query.contrastPeriodName"
                class="not-mongolia" placeholder="请选择对比期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('contrast')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-dipName>
            <el-input
                v-model="filterInfo.query.dipName"
                class="not-mongolia" placeholder="请选择DIP组" :disabled="true"
            >
              <template #append><el-icon @click="openDIPsSelector"><Search /></el-icon></template>
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
