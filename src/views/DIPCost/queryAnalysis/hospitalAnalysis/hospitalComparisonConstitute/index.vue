<script setup name="dip:hospitalComparisonConstitute">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useReport} from "@/hooks/useReport";
import {sectiontree} from "@/api/accountingDepartment";
const {proxy} = getCurrentInstance()

const PERMISSION_CODE = 'dip:hospitalComparisonConstitute'
const { searchReport } = useReport({
  reportName: 'DIP成本-院级DIP例均构成分析.ureport.xml'
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
    { label: 'DIP', value: 'diseaseDefinitionName', showLabel: true, type: 'slot' },
    { label: '成本类型', required: true, value: 'costType', clearable: false, type: 'select', list: 'costType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
})


function search() {
  if(!filterInfo.query.accountingPeriodId) return proxy.$message.warning('请选择核算期间')
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

function openAccountingPeriod() {
  tableParameter.type = 'DIPPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
  openDialog(filterRef.value)
}

function openDiseaseSelector() {
  tableParameter.title = 'DIP'
  tableParameter.type = 'DIPGroup'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = diseaseDefinitionCallback
  openDialog(filterRef.value)
}
function diseaseDefinitionCallback(raw) {
  filterInfo.query.diseaseDefinitionId = raw.id
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
              <template #append><el-icon @click="openAccountingPeriod"><Search /></el-icon></template>
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
