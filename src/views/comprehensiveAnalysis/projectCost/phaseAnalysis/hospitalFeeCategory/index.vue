<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {sectiontree} from "@/api/accountingDepartment";
import {pageDeptPhaseAnalysis, exportAnalysis} from "@/api/projectCost/hospitalFeeCategoryPhaseAnalysis";
import {itemaccountingPeriodpage} from "@/api/projectBase";

const PERMISSION_CODE = 'projectCost:hospitalFeeCategoryPhaseAnalysis'
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
    { label: '收费类别', value: 'feeCategoryName', showLabel: true, type: 'slot' },
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
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '服务项目数量', value: 'feeItemNumber', align: 'center' },
    { label: '盈利项目数量', value: 'profitItemNumber', align: 'center', type: 'slot', },
    { label: '盈利项目占比(%)', value: 'profitItemRate', align: 'center' },
    { label: '盈利金额', value: 'profitMoney', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.profitMoney) },
    { label: '亏损项目数量', value: 'lossItemNumber', align: 'center', type: 'slot',},
    { label: '亏损项目占比(%)', value: 'lossItemRate', align: 'center' },
    { label: '亏损金额', value: 'lossMoney', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.lossMoney) },
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

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {}
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

onMounted(async () => {
  tableInfo.api = pageDeptPhaseAnalysis
  await getDefaultPeriod()
  search()
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
async function reset() {
  filterInfo.query = {
    costType: '1',
  }
  await getDefaultPeriod()
  search()
}

function getDefaultPeriod() {
  return itemaccountingPeriodpage({
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
      filterInfo.query.beginPeriodName = res.data[0].beginPeriod
      filterInfo.query.endPeriodName = res.data[0].endPeriod
    }
  })
}
function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    feeCategoryId: row.feeCategoryId,
  }
  detailInfo.visible = true
}

function analysisDetail() {
  analysisInfo.query = {
    ...filterInfo.copyQuery,
  }
  analysisInfo.visible = true
}

function detailCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    feeCategoryId: row.feeCategoryId,
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
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.checkBox = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
    filterInfo.query.beginPeriodName = raw.beginPeriod
    filterInfo.query.endPeriodName = raw.endPeriod
  }
  openDialog(filterRef.value)
}

function openFeeCategorySelector() {
  tableParameter.title = '收费类别'
  tableParameter.type = 'feeCategory'
  tableParameter.checkBox = true
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeCategoryIds = raw.map(it => it.id)
    filterInfo.query.feeCategoryName = raw.map(it => it.name).join(',')
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
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-feeCategoryName>
            <el-input
                v-model="filterInfo.query.feeCategoryName"
                class="not-mongolia" placeholder="请选择收费类别" :disabled="true">
              <template #append><el-icon @click="openFeeCategorySelector"><Search /></el-icon></template>
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
        <template #col-lossItemNumber="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.lossItemNumber || '') }}</span>
        </template>
        <template #col-profitItemNumber="{ row }">
          <span class="slip-edit" @click="detailIncome(row)">{{ $fn.TripartiteMethod(row.profitItemNumber || '') }}</span>
        </template>
      </table-container>
    </div>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" visible="" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
