<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {page, exportAnalysis} from "@/api/deptCost/medicalTechComprehensive";
import {sectiontree} from "@/api/accountingDepartment";
import {periodMonthByDate} from "@/api/base";
import moment from "moment";

const PERMISSION_CODE = 'dept:medicalTechComprehensive'
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
    level: dict_dept_level[dict_dept_level.length - 1].value
  },
  list: [
    { label: '开始分析期间', value: 'startPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '结束分析期间', value: 'endPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', clearable: false, required: true, type: 'select', list: 'deptLevel' },
    { label: '成本类型', value: 'costType', clearable: false, required: false, type: 'select', list: 'costType' },
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
    { label: '医技工作量', value: 'workNum', align: 'center' },
    { label: '总收益', type: 'multiHeader', children: [
        { label: '收入', value: 'income', type: 'slot', headAlign: 'center', align: 'right' },
        { label: '成本', value: 'cost', type: 'slot', headAlign: 'center', align: 'right' },
        { label: '收益', value: 'balance', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.balance) },
      ]
    },
    { label: '单位收益', type: 'multiHeader', children: [
        { label: '单位收入', value: 'unitIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.unitIncome) },
        { label: '单位成本', value: 'unitCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.unitCost) },
        { label: '单位变动成本', value: 'unitVariableCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.unitVariableCost) },
        { label: '单位收益', value: 'unitBalance', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.unitBalance) },
      ]
    },
    { label: '固定成本', value: 'fixCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixCost) },
    { label: '变动成本', value: 'variableCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.variableCost) },
    { label: '保本工作量', value: 'safeWorkNum', align: 'center' },
    { label: '保本收入', value: 'safeIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.safeIncome) },
    { label: '边际贡献', value: 'marginalContribution', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.marginalContribution) },
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
    filterInfo.query.startPeriodId = _data.id
    filterInfo.query.startPeriodName = _data.periodYearAndMonth
    filterInfo.query.endPeriodId = _data.id
    filterInfo.query.endPeriodName = _data.periodYearAndMonth
  })
}

function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.deptId
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
    sectionId: row.deptId
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
      filterInfo.query.endPeriodName = raw.periodYearAndMonth
    } else {
      filterInfo.query.startPeriodId = raw.id
      filterInfo.query.startPeriodName = raw.periodYearAndMonth
    }
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
          <template #filter-startPeriodName>
            <el-input
                v-model="filterInfo.query.startPeriodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-endPeriodName>
            <el-input
                v-model="filterInfo.query.endPeriodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
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
        <template #col-income="{ row }">
          <span class="slip-edit" @click="detailIncome(row)">{{ $fn.TripartiteMethod(row.income || '') }}</span>
        </template>
        <template #col-cost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.cost || '') }}</span>
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
