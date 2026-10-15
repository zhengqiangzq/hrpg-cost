<!-- 科室医疗服务项目成本构成明细表 -->
<script setup name="proCostReport_dmsccd">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useReport} from "@/hooks/useReport";
import {useStorage} from "@vueuse/core";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {sectiontree} from "@/api/accountingDepartment";
import {requiredPageFilter} from "@/utils";

const PERMISSION_CODE = 'proCostReport_dmsccd'
const { searchReport } = useReport({
  reportName: '项目成本-科室医疗服务项目成本构成明细表.ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()
const setting = useStorage('setting', {}, sessionStorage)

const filterRef = ref(null)
const defaultQuery = {
  costType: '1',
  deptLevel: dict_dept_level[dict_dept_level.length - 1].value,
}
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
    deptLevel: dict_dept_level
  },
  query: {
    ...defaultQuery
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, type: 'select', list: 'costType' },
    { label: '医疗服务项目', value: 'feeItemName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'deptLevel', type: 'select', clearable: false, list: 'deptLevel' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
})


// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: false,
  mark: null,
  checkedList: [],
  api: sectiontree,
  query: {}
})

function search() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  searchReport({
    ...filterInfo.query,
    orgId: setting.value.hospitalId
  })
}
function reset() {
  filterInfo.query = {
    ...defaultQuery
  }
  search()
}

function openAccountingPeriod() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.title = '核算期间'
  tableParameter.checkBox = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.checkPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
  openDialog(filterRef.value)
}
function openFeeItemSelector() {
  tableParameter.title = '医疗服务项目'
  tableParameter.type = 'feeItem'
  tableParameter.checkBox = true
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemId = raw.map(it => it.id).join(',')
    filterInfo.query.feeItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
}
function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  deptTreeInfo.checkedList = raw
  filterInfo.query.deptId = raw.map(it => it.id).join(',')
  filterInfo.query.deptName = raw.map(it => it.name).join(',')
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="filter-wrapper">
        <NewPageFilter
          ref="filterRef"
          :listTypeInfo="filterInfo.options"
          v-model:query="filterInfo.query"
          :filter-btn="filterInfo.filterbtn"
          :filter-list="filterInfo.list">
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia"
                type="input"
                placeholder="请选择核算期间"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountingPeriod"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-feeItemName>
            <el-input
                v-model="filterInfo.query.feeItemName"
                class="not-mongolia" placeholder="请选择服务项目" :disabled="true">
              <template #append><el-icon @click="openFeeItemSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-deptName>
            <el-input
                v-model="filterInfo.query.deptName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </NewPageFilter>
      </div>
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
        :checkedList="deptTreeInfo.checkedList"
        :api="deptTreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">
.app-container-flex {
  flex-direction: column;
}
</style>
