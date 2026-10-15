<script setup>
//科室成本分类区间分析
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {periodMonthByDate} from "@/api/base";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {page, exportAnalysis} from "@/api/deptCost/deptCostCategoryInterval";
import {sectiontree} from "@/api/accountingDepartment";
import moment from "moment";

const PERMISSION_CODE = 'dept:deptCostCategoryInterval'
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
    { label: '分析开始期间', value: 'analysisStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'analysisEndPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比开始期间', value: 'compareStartPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '对比结束期间', value: 'compareEndPeriod', required: true, showLabel: true, type: 'slot' },
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
    { label: '直接成本', value: 'totalDirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalDirectCost) },
    { label: '间接成本', value: 'totalIndirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalIndirectCost) },
    { label: '人员经费', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'personnelExpensesCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesCost) },
            { label: '占比(%)', value: 'personnelExpensesPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'personnelExpensesCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesCompareCost) },
            { label: '对比差异', value: 'personnelExpensesCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesCompareDifference) },
            { label: '增长率(%)', value: 'personnelExpensesCompareRate', align: 'center' },
          ]
        },
      ]
    },
    { label: '药品费', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'drugCost', headAlign: 'center', type: 'slot', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
            { label: '占比(%)', value: 'drugPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'drugCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCompareCost) },
            { label: '对比差异', value: 'drugCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCompareDifference) },
            { label: '增长率(%)', value: 'drugCompareRate', align: 'center' },
          ]
        },
      ]
    },
    { label: '卫生材料费', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'healthMaterialCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialCost) },
            { label: '占比(%)', value: 'healthMaterialPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'healthMaterialCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialCompareCost) },
            { label: '对比差异', value: 'healthMaterialCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialCompareDifference) },
            { label: '增长率(%)', value: 'healthMaterialCompareRate', align: 'center' },
          ]
        },
      ]
    },
    { label: '固定资产折旧费', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'fixedAssetsDepreciationCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationCost) },
            { label: '占比(%)', value: 'fixedAssetsDepreciationPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'fixedAssetsDepreciationCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationCompareCost) },
            { label: '对比差异', value: 'fixedAssetsDepreciationCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationCompareDifference) },
            { label: '增长率(%)', value: 'fixedAssetsDepreciationCompareRate', align: 'center' },
          ]
        },
      ]
    },
    { label: '无形资产摊销费', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'intangibleAssetsAmortizationCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationCost) },
            { label: '占比(%)', value: 'intangibleAssetsAmortizationPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'intangibleAssetsAmortizationCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationCompareCost) },
            { label: '对比差异', value: 'intangibleAssetsAmortizationCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationCompareDifference) },
            { label: '增长率(%)', value: 'intangibleAssetsAmortizationCompareRate', align: 'center' },
          ]
        },
      ]
    },
    { label: '计提医疗风险基金', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'medicalVentureFundCost', type: 'slot', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundCost) },
            { label: '占比(%)', value: 'medicalVentureFundPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'medicalVentureFundCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundCompareCost) },
            { label: '对比差异', value: 'medicalVentureFundCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundCompareDifference) },
            { label: '增长率(%)', value: 'medicalVentureFundCompareRate', align: 'center' },
          ]
        },
      ]
    },
    { label: '其他医疗费用', type: 'multiHeader', children: [
        { label: '分析区间', type: 'multiHeader', children: [
            { label: '金额', value: 'otherCost', headAlign: 'center', type: 'slot', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherCost) },
            { label: '占比(%)', value: 'otherPercent', align: 'center' },
          ]
        },
        { label: '对比区间', type: 'multiHeader', children: [
            { label: '金额', value: 'otherCompareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherCompareCost) },
            { label: '对比差异', value: 'otherCompareDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherCompareDifference) },
            { label: '增长率(%)', value: 'otherCompareRate', align: 'center' },
          ]
        },
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

watch(() => filterInfo.copyQuery.sectionIdList?.length, (val) => {
  const btns = filterInfo.btnList
  const analysisBtn = btns.find(it => it.label === '图形分析')
  analysisBtn.disabled = !val
}, { immediate: true })

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

function analysisDetail() {
  analysisInfo.query = {
    ...filterInfo.copyQuery,
  }
  analysisInfo.visible = true
}

function detailCost(row, category) {
  detailInfo.type = 'cost'
  console.log('141414141', category)
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.sectionId,
    direct: category === 'direct',
    indirect: category === 'indirect',
    costCategory: ['direct', 'indirect'].indexOf(category) !== -1 ? null : category
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
<!--        <template #col-personnelExpensesCost="{ row }">-->
<!--          <span class="slip-edit" @click="detailCost(row, 'direct')">{{ $fn.TripartiteMethod(row.personnelExpensesCost || '') }}</span>-->
<!--        </template>-->
<!--        <template #col-totalIndirectCost="{ row }">-->
<!--          <span class="slip-edit" @click="detailCost(row, 'indirect')">{{ $fn.TripartiteMethod(row.totalIndirectCost || '') }}</span>-->
<!--        </template>-->
        <template #col-personnelExpensesCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.personnelExpensesCostCategory)">{{ $fn.TripartiteMethod(row.personnelExpensesCost || '') }}</span>
        </template>
        <template #col-drugCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.drugCostCategory)">{{ $fn.TripartiteMethod(row.drugCost || '') }}</span>
        </template>
        <template #col-healthMaterialCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.healthMaterialCostCategory)">{{ $fn.TripartiteMethod(row.healthMaterialCost || '') }}</span>
        </template>
        <template #col-fixedAssetsDepreciationCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.fixedAssetsDepreciationCostCategory)">{{ $fn.TripartiteMethod(row.fixedAssetsDepreciationCost || '') }}</span>
        </template>
        <template #col-intangibleAssetsAmortizationCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.intangibleAssetsAmortizationCostCategory)">{{ $fn.TripartiteMethod(row.intangibleAssetsAmortizationCost || '') }}</span>
        </template>
        <template #col-medicalVentureFundCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.medicalVentureFundCostCategory)">{{ $fn.TripartiteMethod(row.medicalVentureFundCost || '') }}</span>
        </template>
        <template #col-otherCost="{ row }">
          <span class="slip-edit" @click="detailCost(row, row.otherCostCostCategory)">{{ $fn.TripartiteMethod(row.otherCost || '') }}</span>
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
