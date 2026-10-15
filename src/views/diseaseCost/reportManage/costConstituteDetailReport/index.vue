<script setup name="disease:costConstituteDetailReport">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useReport} from "@/hooks/useReport";

const PERMISSION_CODE = 'disease:costConstituteDetailReport'
const { searchReport } = useReport({
  reportName: '病种成本-医院病种成本构成明细表.ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()

const filterRef = ref(null)
const filterInfo = reactive({
  options: {},
  query: {},
  list: [
    {label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot'},
    {label: '病种', value: 'diseaseDefinitionName', showLabel: true, type: 'slot'},
  ],
  filterbtn: [
    {type: 'button', label: '查询', btType: 'primary', event: search,},
    {type: 'button', label: '重置', event: reset,},
  ],
})


function search() {
  searchReport(filterInfo.query)
}

function reset() {
  filterInfo.query = {}
  searchReport(filterInfo.query)
}

function openAccountingPeriod() {
  tableParameter.type = 'diseasePeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.periodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
  openDialog(filterRef.value)
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
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" disabled
            >
              <template #append>
                <el-icon @click="openAccountingPeriod">
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-diseaseDefinitionName>
            <el-input
                v-model="filterInfo.query.diseaseDefinitionName"
                class="not-mongolia" placeholder="请选择病种" :disabled="true">
              <template #append>
                <el-icon @click="openDiseaseSelector">
                  <Search/>
                </el-icon>
              </template>
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
