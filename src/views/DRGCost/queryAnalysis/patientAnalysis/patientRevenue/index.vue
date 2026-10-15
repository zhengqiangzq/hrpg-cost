<script setup name="drg:patientRevenue">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useReport} from "@/hooks/useReport";
import {sectiontree} from "@/api/accountingDepartment";
const {proxy} = getCurrentInstance()

const PERMISSION_CODE = 'drg:patientRevenue'
const { searchReport } = useReport({
  reportName: 'DRG成本-病人收益分析.ureport.xml'
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
    { label: '住院号', value: 'hospitalAdmissionNumber', showLabel: true, type: 'input' },
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
  tableParameter.type = 'DRGPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
  openDialog(filterRef.value)
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
