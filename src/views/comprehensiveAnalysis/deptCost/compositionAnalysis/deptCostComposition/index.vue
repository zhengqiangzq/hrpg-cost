<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import Analysis from "./analysis.vue";
import {page, exportAnalysis} from "@/api/deptCost/deptCostComposition";
import {sectiontree} from "@/api/accountingDepartment";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:deptCostComposition'
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
    { label: '科室级次', value: 'level', clearable: false, required: true, type: 'select', list: 'deptLevel' },
    { label: '核算科室属性', value: 'accountAttribute', clearable: true, type: 'select-model', code: 'dept_type' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', },
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
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类(大类)', value: 'rootCostCategoryName' },
    { label: '成本属性', value: 'costAttribute' },
    { label: '可控属性', value: 'costControlTypeName' },
    { label: '直接成本', value: 'directCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.directCost) },
    { label: '间接成本', value: 'indirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.indirectCost) },
    { label: '成本合计', value: 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.cost) },
    { label: '占比(%)', value: 'costRate', align: 'center' },
  ]
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
    level: dict_dept_level[dict_dept_level.length - 1].value
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
function openApportionmentLevelSelector() {
  tableParameter.type = 'analysisLevel'
  tableParameter.checkBox = false
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
    <div class="layui-card layui-col-md12" v-show="!analysisInfo.visible">
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
          <template #filter-costItemName>
            <el-input
                v-model="filterInfo.query.costItemName"
                class="not-mongolia" placeholder="请选择成本项目" :disabled="true">
              <template #append><el-icon @click="openCostItemSelector"><Search /></el-icon></template>
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
  </div>
</template>

<style scoped lang="scss">

</style>
