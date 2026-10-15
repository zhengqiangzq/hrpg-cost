<script setup name="disease:deptComparisonExamples">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_dept_level, dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useReport} from "@/hooks/useReport";
import {sectiontree} from "@/api/accountingDepartment";
const {proxy} = getCurrentInstance()

const PERMISSION_CODE = 'disease:deptComparisonExamples'
const { searchReport } = useReport({
  reportName: '病种成本-科室病种例均对比分析.ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()

const filterRef = ref(null)
const defaultQuery = {
  deptLevel: dict_dept_level[dict_dept_level.length - 1].value,
  costKind: '1',
}
const filterInfo = reactive({
  options: {
    deptLevel: dict_dept_level,
    costType: dict_cost_type,
  },
  query: {
    ...defaultQuery
  },
  list: [
    { label: '核算期间', required: true, value: 'periodName', showLabel: true, type: 'slot' },
    { label: '对比期间', required: true, value: 'comperePeriodName', showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'deptLevel', clearable: false, type: 'select', list: 'deptLevel' },
    { label: '成本类型', required: true, value: 'costKind', clearable: false, type: 'select', list: 'costType' },
    { label: '病种', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
})

const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  api: sectiontree,
})

function search() {
  if(!filterInfo.query.periodId) return proxy.$message.warning('请选择核算期间')
  if(!filterInfo.query.comperePeriodId) return proxy.$message.warning('请选择对比期间')
  searchReport(filterInfo.query)
}
function reset() {
  filterInfo.query = {
    ...defaultQuery
  }
  search()
}

function openAccountingPeriod(mark) {
  tableParameter.type = 'diseasePeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'end') {
      filterInfo.query.comperePeriodId = raw.id
      filterInfo.query.comperePeriodName = raw.name
    } else {
      filterInfo.query.periodId = raw.id
      filterInfo.query.periodName = raw.name
    }
  }
  openDialog(filterRef.value)
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.deptId = raw.map(it => it.id).join(',')
  filterInfo.query.deptName = raw.map(it => it.name).join(',')
}
function openDiseaseSelector() {
  tableParameter.title = '病种'
  tableParameter.type = 'diseaseDefinition'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = diseaseDefinitionCallback
  openDialog(filterRef.value)
}
function diseaseDefinitionCallback(raw) {
  filterInfo.query.definitionId = raw.id
  filterInfo.query.diseaseDefinitionName = raw.name
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
          <template #filter-periodName>
            <el-input
                v-model="filterInfo.query.periodName"
                class="not-mongolia" placeholder="请选择核算期间" disabled
            >
              <template #append><el-icon @click="openAccountingPeriod()"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-comperePeriodName>
            <el-input
                v-model="filterInfo.query.comperePeriodName"
                class="not-mongolia" placeholder="请选择对比期间" disabled
            >
              <template #append><el-icon @click="openAccountingPeriod('end')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-deptName>
            <el-input
                v-model="filterInfo.query.deptName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-diseaseDefinitionName>
            <el-input
                v-model="filterInfo.query.diseaseDefinitionName"
                class="not-mongolia" placeholder="请选择病种" :disabled="true">
              <template #append><el-icon @click="openDiseaseSelector"><Search /></el-icon></template>
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
