<script setup>
//院级收入项目区间分析
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_income_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {page, exportAnalysis} from "@/api/deptCost/hospitalIncomeItemInterval";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:hospitaIncomeItemInterval'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    incomeType: dict_income_type,
  },
  copyQuery: {},
  query: {
    incomeType: '1',
  },
  list: [
    { label: '分析开始期间', value: 'analysisStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'analysisEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比开始期间', value: 'compareStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比结束期间', value: 'compareEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '收入类型', value: 'incomeType', clearable: false, required: true, type: 'select', list: 'incomeType' },
    { label: '收入项目', value: 'incomeProjectName', showLabel: true, type: 'slot', },
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
    { label: '收入项目编码', value: 'incomeProjectCode' },
    { label: '收入项目名称', value: 'incomeProjectName' },
    { label: '收费项目数量', value: 'incomeNum', align: 'center' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '金额', value: 'analysisIncome', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisIncome) },
        { label: '占比(%)', value: 'analysisIncomeProportion', align: 'center' },
      ]
    },
    { label: '对比区间', type: 'multiHeader', children: [
        { label: '金额', value: 'compareIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareIncome) },
        { label: '占比(%)', value: 'compareIncomeProportion', align: 'center' },
      ]
    },
    { label: '差异金额', value: 'compareIncomeDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareIncomeDifference) },
    { label: '对比增长率(%)', value: 'compareRate', align: 'center' },
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

const selectIncomeProject = ref({
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
    incomeType: '1',
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

function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    incomeProjectId: row.incomeProjectId
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
    filterInfo.query.periodId = raw.id
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

function openIncomeProjectSelector() {
  selectIncomeProject.value.checkBox = true
  selectIncomeProject.value.visible = true
}
function selectIncomeProjectCallback(raw) {
  filterInfo.query.incomeProjectIdList = raw.map(it => it.id)
  filterInfo.query.incomeProjectName = raw.map(it => it.name).join(',')
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
          <template #filter-incomeProjectName>
            <el-input
                v-model="filterInfo.query.incomeProjectName"
                class="not-mongolia" placeholder="请选择收入项目" :disabled="true">
              <template #append><el-icon @click="openIncomeProjectSelector"><Search /></el-icon></template>
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
        <template #col-analysisIncome="{ row }">
          <span class="slip-edit" @click="detailIncome(row)">{{ $fn.TripartiteMethod(row.analysisIncome || '') }}</span>
        </template>
      </table-container>
    </div>
    <SelectIncomeProject
        v-if="selectIncomeProject.visible"
        v-model:query="selectIncomeProject.query"
        v-model:show-dialog="selectIncomeProject.visible"
        title="收入项目"
        :checkStrictly="true"
        :check-box="selectIncomeProject.checkBox"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectIncomeProject.checkedKey"
        :saveEmpty="selectIncomeProject.saveEmpty"
        @callback="selectIncomeProjectCallback"
    ></SelectIncomeProject>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
