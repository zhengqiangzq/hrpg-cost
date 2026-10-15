<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {periodMonthByDate} from "@/api/base";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {page, exportAnalysis} from "@/api/visitCost/deptCostCategory";
import {sectiontree} from "@/api/accountingDepartment";
import moment from "moment";

const PERMISSION_CODE = 'visitCost:deptCostCategory'
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
  },
  list: [
    { label: '分析期间', value: 'periodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
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
    { label: '核算科室编码', value: 'sectionCode' },
    { label: '核算科室名称', value: 'sectionName' },
    { label: '门急诊人次', value: 'workNum', align: 'center' },
    { label: '诊次成本', value: 'unitCost', type: 'slot', headAlign: 'center', align: 'right' },
    { label: '人员经费', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'personnelExpensesUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesUnitCost) },
            { label: '本期占比(%)', value: 'personnelExpensesPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'personnelExpensesPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesPreYearCost) },
            { label: '同比差异', value: 'personnelExpensesPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesPreYearDifference) },
            { label: '同比增长率(%)', value: 'personnelExpensesPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'personnelExpensesPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesPreMonthCost) },
            { label: '环比差异', value: 'personnelExpensesPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesPreMonthDifference) },
            { label: '环比增长率(%)', value: 'personnelExpensesPreMonthRate', align: 'center' },
          ]
        }
      ]
    },
    { label: '药品费', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'drugUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugUnitCost) },
            { label: '本期占比(%)', value: 'drugPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'drugPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugPreYearCost) },
            { label: '同比差异', value: 'drugPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugPreYearDifference) },
            { label: '同比增长率(%)', value: 'drugPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'drugPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugPreMonthCost) },
            { label: '环比差异', value: 'drugPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugPreMonthDifference) },
            { label: '环比增长率(%)', value: 'drugPreMonthRate', align: 'center' },
          ]
        }
      ]
    },
    { label: '卫生材料费', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'healthMaterialUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialUnitCost) },
            { label: '本期占比(%)', value: 'healthMaterialPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'healthMaterialPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialPreYearCost) },
            { label: '同比差异', value: 'healthMaterialPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialPreYearDifference) },
            { label: '同比增长率(%)', value: 'healthMaterialPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'healthMaterialPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialPreMonthCost) },
            { label: '环比差异', value: 'healthMaterialPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialPreMonthDifference) },
            { label: '环比增长率(%)', value: 'healthMaterialPreMonthRate', align: 'center' },
          ]
        }
      ]
    },
    { label: '固定资产折旧费', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'fixedAssetsDepreciationUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationUnitCost) },
            { label: '本期占比(%)', value: 'fixedAssetsDepreciationPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'fixedAssetsDepreciationPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationPreYearCost) },
            { label: '同比差异', value: 'fixedAssetsDepreciationPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationPreYearDifference) },
            { label: '同比增长率(%)', value: 'fixedAssetsDepreciationPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'fixedAssetsDepreciationPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationPreMonthCost) },
            { label: '环比差异', value: 'fixedAssetsDepreciationPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationPreMonthDifference) },
            { label: '环比增长率(%)', value: 'fixedAssetsDepreciationPreMonthRate', align: 'center' },
          ]
        }
      ]
    },
    { label: '无形资产摊销费', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'intangibleAssetsAmortizationUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationUnitCost) },
            { label: '本期占比(%)', value: 'intangibleAssetsAmortizationPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'intangibleAssetsAmortizationPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationPreYearCost) },
            { label: '同比差异', value: 'intangibleAssetsAmortizationPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationPreYearDifference) },
            { label: '同比增长率(%)', value: 'intangibleAssetsAmortizationPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'intangibleAssetsAmortizationPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationPreMonthCost) },
            { label: '环比差异', value: 'intangibleAssetsAmortizationPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationPreMonthDifference) },
            { label: '环比增长率(%)', value: 'intangibleAssetsAmortizationPreMonthRate', align: 'center' },
          ]
        }
      ]
    },
    { label: '计提医疗风险基金', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'medicalVentureFundUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundUnitCost) },
            { label: '本期占比(%)', value: 'medicalVentureFundPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'medicalVentureFundPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundPreYearCost) },
            { label: '同比差异', value: 'medicalVentureFundPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundPreYearDifference) },
            { label: '同比增长率(%)', value: 'medicalVentureFundPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'medicalVentureFundPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundPreMonthCost) },
            { label: '环比差异', value: 'medicalVentureFundPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundPreMonthDifference) },
            { label: '环比增长率(%)', value: 'medicalVentureFundPreMonthRate', align: 'center' },
          ]
        }
      ]
    },
    { label: '其他医疗费用', type: 'multiHeader', children: [
        { label: '本期', type: 'multiHeader', children: [
            { label: '本期金额', value: 'otherUnitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherUnitCost) },
            { label: '本期占比(%)', value: 'otherPercent', align: 'center' },
          ]
        },
        { label: '同比', type: 'multiHeader', children: [
            { label: '去年同期金额', value: 'otherPreYearCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherPreYearCost) },
            { label: '同比差异', value: 'otherPreYearDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherPreYearDifference) },
            { label: '同比增长率(%)', value: 'otherPreYearRate', align: 'center' },
          ]
        },
        { label: '环比', type: 'multiHeader', children: [
            { label: '上期金额', value: 'otherPreMonthCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherPreMonthCost) },
            { label: '环比差异', value: 'otherPreMonthDifference', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherPreMonthDifference) },
            { label: '环比增长率(%)', value: 'otherPreMonthRate', align: 'center' },
          ]
        }
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
    filterInfo.query.periodName = _data.periodYearAndMonth
  })
}
function getDefaultApportionmentLevel() {
  return pageApportionmentLevelList({
    sort: 'create_time desc',
    status: '1'
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.apportionmentLevelId = res.data[0].id
      filterInfo.query.apportionmentLevelName = res.data[0].name
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
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.sectionId,
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
        <page-filter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list">
          <template #filter-periodName>
            <el-input
                v-model="filterInfo.query.periodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
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
        <template #col-unitCost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.unitCost || '') }}</span>
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