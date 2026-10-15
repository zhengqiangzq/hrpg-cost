<script setup>
// 院级收支结余区间分析
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level, dict_income_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {sectiontree} from "@/api/accountingDepartment";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";
import {compareHospitalBalanceAnalysislist, exportCompareCostList} from "@/api/deptCost/hospitalIncomeBalanceInterval";

const PERMISSION_CODE = 'dept:hospitalIncomeBalanceInterval'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
    incomeType: dict_income_type,
    deptLevel: dict_dept_level
  },
  copyQuery: {},
  query: {
    costType: '1',
    level: dict_dept_level[dict_dept_level.length - 1].value,
    incomeType: '1',
    apportionmentLevelId: '',
    apportionmentLevelName: ''
  },
  list: [
    { label: '分析开始期间', value: 'analysisStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'analysisEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比开始期间', value: 'compareStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比结束期间', value: 'compareEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { label: '收入类型', value: 'incomeType', clearable: false, required: true, type: 'select', list: 'incomeType' },
    { label: '核算科室属性', value: 'accountAttribute', clearable: true, type: 'select-model', code: 'dept_type' },
    { label: '分摊级次', value: 'apportionmentLevelName', showLabel: true, required: true, type: 'slot' },
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
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '收入金额', value: 'analysisIncome', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisIncome) },
        { label: '收入占比(%)', value: 'analysisIncomeProportion', align: 'center' },
        { label: '成本金额', value: 'analysisCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisCost) },
        { label: '成本占比(%)', value: 'analysisCostProportion', align: 'center' },
        { label: '结余金额', value: 'analysisBalance', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisBalance) },
        { label: '收益率(%)', value: 'analysisBalanceRate', align: 'center' },
      ]
    },
    { label: '对比区间', type: 'multiHeader', children: [
        { label: '收入金额', value: 'compareIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareIncome) },
        { label: '收入占比(%)', value: 'compareIncomeProportion', headAlign: 'center', align: 'right' },
        { label: '成本金额', value: 'compareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCost) },
        { label: '成本占比(%)', value: 'compareCostProportion', headAlign: 'center', align: 'right' },
        { label: '结余金额', value: 'compareBalance', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareBalance) },
        { label: '收益率(%)', value: 'compareBalanceRate', align: 'center' },
      ]
    },
    { label: '对比增长率(%)', value: 'compareRate', align: 'center' }
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
  tableInfo.api = compareHospitalBalanceAnalysislist
  await getDefaultPeriod()
  await getDefaultApportionmentLevel()
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
    level: dict_dept_level[dict_dept_level.length - 1].value,
    incomeType: '1',
    apportionmentLevelId: '1'
  }
  await getDefaultPeriod()
  await getDefaultApportionmentLevel()
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
function getDefaultApportionmentLevel() {
  return pageApportionmentLevelList({
    sort: 'create_time desc',
    status: '1'
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.apportionmentLevelId = res.data[res.data.length - 1].id
      filterInfo.query.apportionmentLevelName = res.data[res.data.length - 1].name
    }
  })
}
function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.deptId,
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
    sectionId: row.deptId,
  }
  detailInfo.visible = true
}

function exportData() {
  exportCompareCostList(filterInfo.copyQuery).then((resp) => {
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

function openApportionmentLevelSelector() {
  tableParameter.type = 'analysisLevel'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.apportionmentLevelId = raw.id
    filterInfo.query.apportionmentLevelName = raw.name
  }
  openDialog(filterRef.value)
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.sectionIdList = raw.map(it => it.id)
  filterInfo.query.sectionName = raw.map(it => it.name).join(',')
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
          <template #filter-sectionName>
            <el-input
                v-model="filterInfo.query.sectionName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-apportionmentLevelName>
            <el-input
                v-model="filterInfo.query.apportionmentLevelName"
                class="not-mongolia" placeholder="请选择分摊级次" :disabled="true">
              <template #append><el-icon @click="openApportionmentLevelSelector"><Search /></el-icon></template>
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
<!--          收入-->
          <span class="slip-edit" @click="detailIncome(row)">{{ $fn.TripartiteMethod(row.analysisIncome || '') }}</span>
        </template>
        <template #col-analysisCost="{ row }">
          <!--          成本-->
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.analysisCost || '') }}</span>
        </template>
      </table-container>
    </div>
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :api="deptTreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" visible="" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
