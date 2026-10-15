<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {page, exportAnalysis} from "@/api/deptCost/hospitalCostCategoryComposition";
import {sectiontree} from "@/api/accountingDepartment";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:hospitalCostCategoryComposition'
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
    level: dict_dept_level[dict_dept_level.length - 1].value,
    apportionmentLevelId: '',
    apportionmentLevelName: ''
  },
  list: [
    { label: '分析开始期间', value: 'startPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'endPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: '核算科室属性', value: 'accountAttribute', clearable: true, type: 'select-model', code: 'dept_type' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
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
    { label: '核算科室编码', value: 'sectionCode' },
    { label: '核算科室名称', value: 'sectionName' },
    { label: '总成本', value: 'totalCost', type: 'slot', headAlign: 'center', align: 'right' },
    { label: '人员经费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'personnelExpensesDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesDirectCost) },
        { label: '间接成本', value: 'personnelExpensesIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesIndirectCost) },
        { label: '合计', value: 'personnelExpensesCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesCost) },
      ]
    },
    { label: '药品费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'drugDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugDirectCost) },
        { label: '间接成本', value: 'drugIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugIndirectCost) },
        { label: '合计', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
      ]
    },
    { label: '卫生材料费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'healthMaterialDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialDirectCost) },
        { label: '间接成本', value: 'healthMaterialIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialIndirectCost) },
        { label: '合计', value: 'healthMaterialCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialCost) },
      ]
    },
    { label: '固定资产折旧费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'fixedAssetsDepreciationDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationDirectCost) },
        { label: '间接成本', value: 'fixedAssetsDepreciationIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationIndirectCost) },
        { label: '合计', value: 'fixedAssetsDepreciationCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationCost) },
      ]
    },
    { label: '无形资产摊销费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'intangibleAssetsAmortizationDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationDirectCost) },
        { label: '间接成本', value: 'intangibleAssetsAmortizationIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationIndirectCost) },
        { label: '合计', value: 'intangibleAssetsAmortizationCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationCost) },
      ]
    },
    { label: '计提风险医疗基金', type: 'multiHeader', children: [
        { label: '直接成本', value: 'medicalVentureFundDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundDirectCost) },
        { label: '间接成本', value: 'medicalVentureFundIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundIndirectCost) },
        { label: '合计', value: 'medicalVentureFundCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundCost) },
      ]
    },
    { label: '其他医疗费用', type: 'multiHeader', children: [
        { label: '直接成本', value: 'otherDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherDirectCost) },
        { label: '间接成本', value: 'otherIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherIndirectCost) },
        { label: '合计', value: 'otherCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherCost) },
      ]
    },
  ]
})
const detailInfo = reactive({
  type: 'cost',
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
  tableInfo.api = page
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
    filterInfo.query.startPeriodId = _data.id
    filterInfo.query.startPeriod = _data.periodYearAndMonth
    filterInfo.query.endPeriodId = _data.id
    filterInfo.query.endPeriod = _data.periodYearAndMonth
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
    sectionId: row.sectionId
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
    if (mark === 'end') {
      filterInfo.query.endPeriodId = raw.id
      filterInfo.query.endPeriod = raw.periodYearAndMonth
    } else {
      filterInfo.query.periodId = raw.id
      filterInfo.query.startPeriodId = raw.id
      filterInfo.query.startPeriod = raw.periodYearAndMonth
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
          <template #filter-startPeriod>
            <el-input
                v-model="filterInfo.query.startPeriod"
                class="not-mongolia" placeholder="请选择分析开始期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-endPeriod>
            <el-input
                v-model="filterInfo.query.endPeriod"
                class="not-mongolia" placeholder="请选择分析结束期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('end')"><Search /></el-icon></template>
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
        <template #col-totalCost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.totalCost || '') }}</span>
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
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
