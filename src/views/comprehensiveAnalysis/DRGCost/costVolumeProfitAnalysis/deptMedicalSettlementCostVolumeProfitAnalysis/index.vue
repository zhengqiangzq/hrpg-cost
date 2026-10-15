<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {pageAccountingPeriod} from "@/api/DRGCostAccountingPeriod";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {sectiontree} from "@/api/accountingDepartment";
import {
  pageDeptMedicalSettlementCostVolumeProfitAnalysis, exportAnalysis
} from "@/api/DRGCost/deptMedicalSettlementCostVolumeProfitAnalysis";

const PERMISSION_CODE = 'drg:deptMedicalSettlementCostVolumeProfitAnalysis'
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
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: 'DRGs', value: 'drgName', showLabel: true, type: 'slot' },
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
    {label: '核算科室编码', value: 'deptCode'},
    {label: '核算科室名称', value: 'deptName'},
    { label: 'DRGs编码', value: 'drgDefinitionCode' },
    { label: 'DRGs名称', value: 'drgDefinitionName' },
    { label: '病例数', value: 'paramValue', align: 'center' },
    { label: '平均住院天数', value: 'days', align: 'center' },
    { label: '例均费用', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
    { label: 'RW', value: 'rw', align: 'center' },
    { label: 'CMI', value: 'cmi', align: 'center' },
    { label: '例均成本', value: 'currentCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCost) },
    { label: '例均成本', type: 'multiHeader', children: [
        { label: '固定成本', value: 'fixedCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedCost) },
        { label: '变动成本', value: 'fluctuationCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fluctuationCost) },
      ]
    },
    { label: '单位差异', value: 'incomeAvg', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.incomeAvg) },
    { label: '总结算', value: 'settle', type: 'slot', headAlign: 'center', align: 'right' },
    { label: '总成本', value: 'previousCost', type: 'slot', headAlign: 'center', align: 'right' },
    { label: '保本病例数', value: 'guaranteedParamValue', align: 'center' },
    { label: '保本收入', value: 'guaranteedIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.guaranteedIncome) },
    { label: '边际贡献', value: 'contributionMargin', align: 'center' },
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
const {tableParameter, openDialog} = useSelectTableData()

watch(() => filterInfo.copyQuery.deptIds?.length, (val) => {
  const btns = filterInfo.btnList
  const analysisBtn = btns.find(it => it.label === '图形分析')
  analysisBtn.disabled = !val
}, {immediate: true})

onMounted(() => {
  tableInfo.api = pageDeptMedicalSettlementCostVolumeProfitAnalysis
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
    level: dict_dept_level[dict_dept_level.length - 1].value
  }
  getDefaultPeriod()
}

function getDefaultPeriod() {
  pageAccountingPeriod({}).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
      search()
    }
  })
}

function detailProductCost(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId,
    deptId: row.deptId,
  }
  detailInfo.visible = true
}

function analysisDetail() {
  analysisInfo.query = {
    ...filterInfo.copyQuery,
  }
  analysisInfo.visible = true
}

function detailPreviousCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId,
    deptId: row.deptId,
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

function openDRGsSelector() {
  tableParameter.type = 'DRGGroup'
  tableParameter.callBack = (raw) => {
    filterInfo.query.drgId = raw.id
    filterInfo.query.drgName = raw.name
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
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountingPeriodSelector">
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-deptName>
            <el-input
                v-model="filterInfo.query.deptName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append>
                <el-icon @click="openDeptSelector">
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-drgName>
            <el-input
                v-model="filterInfo.query.drgName"
                class="not-mongolia" placeholder="请选择DRGs" :disabled="true"
            >
              <template #append>
                <el-icon @click="openDRGsSelector">
                  <Search/>
                </el-icon>
              </template>
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
        <template #col-settle="{ row }">
          <span class="slip-edit" @click="detailProductCost(row)">{{
              $fn.TripartiteMethod(row.settle || '')
            }}</span>
        </template>
        <template #col-previousCost="{ row }">
          <span class="slip-edit" @click="detailPreviousCost(row)">{{
              $fn.TripartiteMethod(row.previousCost || '')
            }}</span>
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
        @callback="treeCallback"/>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query"
              visible=""/>
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type"
            :query="detailInfo.query"/>
  </div>
</template>

<style scoped lang="scss">

</style>
