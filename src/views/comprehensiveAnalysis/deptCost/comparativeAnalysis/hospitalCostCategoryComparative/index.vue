<script setup>
// 院级成本分类期间分析
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {page, exportAnalysis} from "@/api/deptCost/hospitalCostCategoryComparative";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:hospitalCostCategoryComparative'
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
    { label: '分析期间', value: 'periodName', required: true, showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { label: '成本分类', value: 'costCategoryName', showLabel: true, type: 'slot', },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
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
    { label: '成本分类编码', value: 'costCategoryCode' },
    { label: '成本分类名称', value: 'costCategoryName' },
    { label: '成本分类(大类)', value: 'rootCostCategoryName' },
    { label: '本期', type: 'multiHeader', children: [
        { label: '本期金额', value: 'currentCost', type: 'slot', headAlign: 'center', align: 'right' },
        { label: '本期占比(%)', value: 'currentCostProportion', align: 'center' },
      ]
    },
    { label: '同比', type: 'multiHeader', children: [
        { label: '去年同期金额', value: 'preYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.preYearCost) },
        { label: '同比差异', value: 'preYearCostDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.preYearCostDifference) },
        { label: '同比增长率(%)', value: 'preYearRate', align: 'center' },
      ]
    },
    { label: '环比', type: 'multiHeader', children: [
        { label: '上期金额', value: 'preMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.preMonthCost) },
        { label: '环比差异', value: 'preMonthCostDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.preMonthCostDifference) },
        { label: '环比增长率(%)', value: 'preMonthRate', align: 'center' },
      ]
    }
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

const selectCostType = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

onMounted(async () => {
  tableInfo.api = page
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
  return periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.query.periodId = _data.id
    filterInfo.query.periodName = _data.periodYearAndMonth
  })
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
    costCategoryId: row.costCategoryId
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
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.periodId = raw.id
    filterInfo.query.periodName = raw.periodYearAndMonth
  }
  openDialog(filterRef.value)
}

function openCostCategorySelector() {
  selectCostType.value.checkBox = true
  selectCostType.value.visible = true
}
function selectCostCategoryCallback(raw) {
  filterInfo.query.costCategoryIdList = raw.map(it => it.id)
  filterInfo.query.costCategoryName = raw.map(it => it.name).join(',')
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !analysisInfo.visible">
      <div class="filter-wrapper">
        <NewPageFilter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-btn="filterInfo.filterbtn"
            :filter-list="filterInfo.list">
          <template #filter-periodName>
            <el-input
                v-model="filterInfo.query.periodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-costCategoryName>
            <el-input
                v-model="filterInfo.query.costCategoryName"
                class="not-mongolia" placeholder="请选择成本分类" :disabled="true">
              <template #append><el-icon @click="openCostCategorySelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </NewPageFilter>
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
        <template #col-currentCost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.currentCost || '') }}</span>
        </template>
      </table-container>
    </div>
    <SelectCostType
        v-if="selectCostType.visible"
        v-model:query="selectCostType.query"
        v-model:show-dialog="selectCostType.visible"
        title="成本分类"
        :checkStrictly="false"
        :check-box="selectCostType.checkBox"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectCostType.checkedKey"
        :saveEmpty="selectCostType.saveEmpty"
        @callback="selectCostCategoryCallback"
    ></SelectCostType>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" visible="" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
