<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_income_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import Analysis from "./analysis.vue";
import {page, exportAnalysis} from "@/api/deptCost/deptIncomeComposition";
import {sectiontree} from "@/api/accountingDepartment";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:deptIncomeComposition'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    incomeType: dict_income_type,
    deptLevel: dict_dept_level
  },
  copyQuery: {},
  query: {
    incomeType: '1',
    level: dict_dept_level[dict_dept_level.length - 1].value
  },
  list: [
    { label: '分析开始期间', value: 'startPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'endPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', clearable: false, required: true, type: 'select', list: 'deptLevel' },
    { label: '核算科室属性', value: 'accountAttribute', clearable: true, type: 'select-model', code: 'dept_type' },
    { label: '收入类型', value: 'incomeType', clearable: false, required: true, type: 'select', list: 'incomeType' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot', },
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
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '收费分类', value: 'feeCategoryName' },
    { label: '收入项目', value: 'incomeProjectName' },
    { label: '数量', value: 'num', align: 'center' },
    { label: '单价', value: 'price', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.price) },
    { label: '金额', value: 'money', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
    { label: '占比(%)', value: 'incomeRate', align: 'center' },
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

function openFeeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemIdList = raw.map(it => it.id)
    filterInfo.query.feeItemName = raw.map(it => it.name).join(',')
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
          <template #filter-feeItemName>
            <el-input
                v-model="filterInfo.query.feeItemName"
                class="not-mongolia" placeholder="请选择收费项目" :disabled="true">
              <template #append><el-icon @click="openFeeItemSelector"><Search /></el-icon></template>
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
