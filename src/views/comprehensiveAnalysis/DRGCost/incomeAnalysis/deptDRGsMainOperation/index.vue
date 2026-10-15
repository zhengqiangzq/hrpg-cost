<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {pageAccountingPeriod} from "@/api/DRGCostAccountingPeriod";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import {sectiontree} from "@/api/accountingDepartment";
import {exportDeptMainOperation, pageDeptMainOperation} from "@/api/DRGCost/deptMainOperation";

const PERMISSION_CODE = 'drg:deptMainOperation'
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
    surgeryLevel : '1'
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: '主要手术', value: 'icdNine', showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() },
  ]
})
const tableInfo = reactive({
  api: null,
  refresh: 1,
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '主要手术操作', value: 'icdNineName' },
    { label: '病例数', value: 'paramValue', align: 'center' },
    { label: '费用', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
    { label: '成本', value: 'previousCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.previousCost) },
    { label: '收益', value: 'otherCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '收益率(%)', value: 'otherPercent', align: 'center' },
  ]
})
const detailInfo = reactive({
  type: 'income',
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

onMounted(() => {
  tableInfo.api = pageDeptMainOperation
  getDefaultPeriod()
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
function reset() {
  filterInfo.query = {
    costType: '1',
    level: dict_dept_level[dict_dept_level.length - 1].value,
    surgeryLevel : '1'
  }
  getDefaultPeriod()
}
function getDefaultPeriod() {
  pageAccountingPeriod({
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
      search()
    }
  })
}

function detailIncomeAvg(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    icdNineId: row.icdNineId,
    deptId: row.deptId,
    icdNineName: row.icdNineName,
  }
  detailInfo.visible = true
}

function exportData() {
  exportDeptMainOperation(filterInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'DRGPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
    filterInfo.query.beginPeriodName = raw.beginPeriodName
    filterInfo.query.endPeriodName = raw.endPeriodName
  }
  openDialog(filterRef.value)
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.deptIds = raw.map(it => it.id)
  filterInfo.query.deptName = raw.map(it => it.name).join(',')
}

function openICDNineSelector() {
  tableParameter.type = 'ICD9File'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.icdNineId = raw.id
    filterInfo.query.icdNine = raw.name
  }
  openDialog(filterRef.value)
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible">
      <div class="filter-wrapper">
        <page-filter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list">
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-deptName>
            <el-input
                v-model="filterInfo.query.deptName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-icdNine>
            <el-input
                v-model="filterInfo.query.icdNine"
                class="not-mongolia" placeholder="请选择主要手术" :disabled="true">
              <template #append><el-icon @click="openICDNineSelector"><Search /></el-icon></template>
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
        <template #col-otherCost="{ row }">
          <span class="slip-edit" @click="detailIncomeAvg(row)">{{ $fn.TripartiteMethod(row.otherCost || '') }}</span>
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
        :accountAttribute="1"
        :diseaseAccountStatus="0"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
