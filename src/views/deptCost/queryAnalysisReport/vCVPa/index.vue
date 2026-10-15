<!-- 门诊本量利分析表 -->
<script setup name="queryAnalysisReport_vCVPa">
import {onMounted, reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useReport} from "@/hooks/useReport";
import {sectiontree} from "@/api/accountingDepartment";
import {useStorage} from "@vueuse/core";
import {useDefaultPeriod} from "@/hooks/useDefaultPeriod";

const PERMISSION_CODE = 'queryAnalysisReport_vCVPa'
const { searchReport } = useReport({
  reportName: '成本-门诊本量利分析表.ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()
const setting = useStorage('setting', {}, sessionStorage)

const filterRef = ref(null)
const defaultQuery = {
  level: dict_dept_level[dict_dept_level.length - 1].value
}
const filterInfo = reactive({
  options: {
    deptLevel: dict_dept_level
  },
  query: {
    ...defaultQuery
  },
  list: [
    { label: '开始会计期间', value: 'beginMonth', showLabel: true, type: 'slot' },
    { label: '结束会计期间', value: 'endMonth', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', clearable: false, type: 'select', list: 'deptLevel' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
})

const deptTreeInfo = reactive({
  visible: false,
  checkBox: false,
  api: sectiontree,
})

onMounted(async () => {
  const { periodId, periodName } = await useDefaultPeriod().loadDefaultPeriod()
  filterInfo.query.beginMonthId = filterInfo.query.endMonthId = periodId
  filterInfo.query.beginMonth = filterInfo.query.endMonth = periodName
})

function search() {
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

function openAccountingPeriodSelector(mark) {
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'end') {
      filterInfo.query.endMonthId = raw.id
      filterInfo.query.endMonth = raw.periodYearAndMonth
    } else {
      filterInfo.query.beginMonthId = raw.id
      filterInfo.query.beginMonth = raw.periodYearAndMonth
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
          <template #filter-beginMonth>
            <el-input
              v-model="filterInfo.query.beginMonth"
              class="not-mongolia" placeholder="请选择分析开始期间" disabled
            >
              <template #append><el-icon @click="openAccountingPeriodSelector()"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-endMonth>
            <el-input
              v-model="filterInfo.query.endMonth"
              class="not-mongolia" placeholder="请选择分析结束期间" disabled
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('end')"><Search /></el-icon></template>
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
