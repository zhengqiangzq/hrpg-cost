<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {pageAccountingPeriod} from "@/api/diseaseCostAccountingPeriod";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {pageDeptComparativeAnalysis, exportAnalysis} from "@/api/diseaseCost/comparativeClinicalPathway";

const PERMISSION_CODE = 'disease:comparativeClinicalPathway'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
  },
  copyQuery: {},
  query: {
    costType: '1',
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '病种', value: 'drgName', showLabel: true, type: 'slot' },
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
    { label: '病种编码', value: 'drgDefinitionCode', type: 'slot' },
    { label: '病种名称', value: 'drgDefinitionName' },
    { label: '非临床路径', type: 'multiHeader', children: [
        { label: '总收入', value: 'productCost', headAlign: 'center', align: 'right' },
        { label: '病例数', value: 'paramValue', align: 'center' },
        { label: '例均费用', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
        { label: '总成本', value: 'previousCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.previousCost) },
        { label: '例均成本', value: 'currentCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCost) },
        { label: '例均收益', value: 'incomeAvg', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.incomeAvg) },
        { label: '收益率(%)', value: 'otherPercent', width: 100, align: 'center' },
      ]
    },
    { label: '临床路径下', type: 'multiHeader', children: [
        { label: '总收入', value: 'productCostWay', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.productCostWay) },
        { label: '病例数', value: 'paramValueWay', align: 'center' },
        { label: '例均费用', value: 'drugCostWay', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCostWay) },
        { label: '总成本', value: 'previousCostWay', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.previousCostWay) },
        { label: '例均成本', value: 'currentCostWay', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCostWay) },
        { label: '例均收益', value: 'incomeAvgWay', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.incomeAvgWay) },
        { label: '收益率(%)', value: 'otherPercentWay', width: 100, align: 'center' },
      ]
    },
    { label: '例均费用增长率(%)', value: 'incomeGrowthRate', align: 'center' },
    { label: '例均成本增长(%)', value: 'costGrowthRate', align: 'center' },
  ]
})
const detailInfo = reactive({
  query: {},
  visible: false
})
const analysisInfo = reactive({
  query: {},
  visible: false
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

watch(() => filterInfo.copyQuery.accountingPeriodId, (val) => {
  const btns = filterInfo.btnList
  const analysisBtn = btns.find(it => it.label === '图形分析')
  analysisBtn.disabled = !val
}, { immediate: true })

onMounted(() => {
  tableInfo.api = pageDeptComparativeAnalysis
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
    costType: '1',
  }
  getDefaultPeriod()
}
function getDefaultPeriod() {
  pageAccountingPeriod({
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
    }
  })
}

function detailProductCost(row) {
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId,
  }
  detailInfo.visible = true
}

function analysisDetail() {
  analysisInfo.query = {
    ...filterInfo.copyQuery,
  }
  analysisInfo.visible = true
}

function exportData() {
  exportAnalysis(filterInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'diseasePeriod'
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
  tableParameter.type = 'diseaseDefinition'
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
                class="not-mongolia" placeholder="请选择病种" :disabled="true"
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
        <template #col-drgDefinitionCode="{ row }">
          <span class="slip-edit" @click="detailProductCost(row)">{{ row.drgDefinitionCode }}</span>
        </template>
      </table-container>
    </div>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" visible="" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :mainQuery="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
