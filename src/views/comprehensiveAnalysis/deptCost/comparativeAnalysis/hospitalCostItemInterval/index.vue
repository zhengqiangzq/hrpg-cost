<script setup>
//院级成本项目区间分析
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {periodMonthByDate} from "@/api/base";
import {page, exportAnalysis} from "@/api/deptCost/hospitalCostItemInterval";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:hospitalCostItemInterval'
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
    { label: '分析开始期间', value: 'analysisStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'analysisEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比开始期间', value: 'compareStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比结束期间', value: 'compareEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', },
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
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类(大类)', value: 'rootCostCategoryName' },
    { label: '成本属性', value: 'costAttribute' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '分析区间金额', value: 'analysisCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisCost) },
        { label: '占比(%)', value: 'analysisCostProportion', align: 'center' },
      ]
    },
    { label: '同比区间', type: 'multiHeader', children: [
        { label: '同比区间金额', value: 'compareCost', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCost) },
        { label: '占比(%)', value: 'compareCostProportion', align: 'center' },
      ]
    },
    { label: '差异金额', value: 'compareCostDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCostDifference) },
    { label: '对比增长率(%)', value: 'compareRate' },
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
    filterInfo.query.analysisStartPeriodId = _data.id
    filterInfo.query.analysisStartPeriod = _data.periodYearAndMonth
    filterInfo.query.analysisEndPeriodId = _data.id
    filterInfo.query.analysisEndPeriod = _data.periodYearAndMonth
    filterInfo.query.compareStartPeriodId = _data.id
    filterInfo.query.compareStartPeriod = _data.periodYearAndMonth
    filterInfo.query.compareEndPeriodId = _data.id
    filterInfo.query.compareEndPeriod = _data.periodYearAndMonth
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
    costItemId: row.costItemId
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
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === '1') {
      filterInfo.query.periodId = raw.id
      filterInfo.query.analysisStartPeriodId = raw.id
      filterInfo.query.analysisStartPeriod = raw.periodYearAndMonth
    } else if (mark === '2') {
      filterInfo.query.analysisEndPeriodId = raw.id
      filterInfo.query.analysisEndPeriod = raw.periodYearAndMonth
    } else if (mark === '3') {
      filterInfo.query.compareStartPeriodId = raw.id
      filterInfo.query.compareStartPeriod = raw.periodYearAndMonth
    } else {
      filterInfo.query.compareEndPeriodId = raw.id
      filterInfo.query.compareEndPeriod = raw.periodYearAndMonth
    }
  }
  openDialog(filterRef.value)
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemIdList = raw.map(it => it.id)
    filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
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
          <template #filter-analysisStartPeriod>
            <el-input
                v-model="filterInfo.query.analysisStartPeriod"
                class="not-mongolia" placeholder="请选择分析开始区间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('1')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-analysisEndPeriod>
            <el-input
                v-model="filterInfo.query.analysisEndPeriod"
                class="not-mongolia" placeholder="请选择分析结束区间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('2')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-compareStartPeriod>
            <el-input
                v-model="filterInfo.query.compareStartPeriod"
                class="not-mongolia" placeholder="请选择对比开始区间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('3')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-compareEndPeriod>
            <el-input
                v-model="filterInfo.query.compareEndPeriod"
                class="not-mongolia" placeholder="请选择对比结束区间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('4')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-costItemName>
            <el-input
                v-model="filterInfo.query.costItemName"
                class="not-mongolia" placeholder="请选择成本项目" :disabled="true">
              <template #append><el-icon @click="openCostItemSelector"><Search /></el-icon></template>
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
        <template #col-analysisCost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.analysisCost || '') }}</span>
        </template>
      </table-container>
    </div>
    <SelectCostType
        v-if="selectCostType.visible"
        v-model:query="selectCostType.query"
        v-model:show-dialog="selectCostType.visible"
        title="成本分类"
        :checkStrictly="false"
        :check-box="false"
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
