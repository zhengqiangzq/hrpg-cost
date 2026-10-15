<script setup name="drg:hospitalComparisonExamples">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useReport} from "@/hooks/useReport";
const {proxy} = getCurrentInstance()

const PERMISSION_CODE = 'drg:hospitalComparisonExamples'
const { searchReport } = useReport({
  reportName: 'DRG成本-院级DRG例均对比分析.ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()

const filterRef = ref(null)
const defaultQuery = {
  costType: '1',
}
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
  },
  query: {
    ...defaultQuery
  },
  list: [
    { label: '核算期间', required: true, value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '往期期间', required: true, value: 'previousPeriodName', showLabel: true, type: 'slot' },
    { label: '成本类型', required: true, value: 'costType', clearable: false, type: 'select', list: 'costType' },
    { label: 'DRG', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
})


function search() {
  if(!filterInfo.query.accountingPeriodId) return proxy.$message.warning('请选择核算期间')
  if(!filterInfo.query.previousPeriodId) return proxy.$message.warning('请选择往期期间')
  searchReport({
    ...filterInfo.query,
  })
}
function reset() {
  filterInfo.query = {
    ...defaultQuery
  }
  search()
}

function openAccountingPeriod(mark) {
  tableParameter.type = 'DRGPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'start') {
      filterInfo.query.previousPeriodId = raw.id
      filterInfo.query.previousPeriodName = raw.name
    } else {
      filterInfo.query.accountingPeriodId = raw.id
      filterInfo.query.accountingPeriodName = raw.name
    }
  }
  openDialog(filterRef.value)
}

function openDiseaseSelector() {
  tableParameter.title = 'DRG'
  tableParameter.type = 'DRGGroup'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = diseaseDefinitionCallback
  openDialog(filterRef.value)
}
function diseaseDefinitionCallback(raw) {
  filterInfo.query.drgDefinitionId = raw.id
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
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" disabled
            >
              <template #append><el-icon @click="openAccountingPeriod()"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-previousPeriodName>
            <el-input
                v-model="filterInfo.query.previousPeriodName"
                class="not-mongolia" placeholder="请选择往期期间" disabled
            >
              <template #append><el-icon @click="openAccountingPeriod('start')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-diseaseDefinitionName>
            <el-input
                v-model="filterInfo.query.diseaseDefinitionName"
                class="not-mongolia" placeholder="请选择DIP" :disabled="true">
              <template #append><el-icon @click="openDiseaseSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </NewPageFilter>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-container-flex {
  flex-direction: column;
}
</style>
