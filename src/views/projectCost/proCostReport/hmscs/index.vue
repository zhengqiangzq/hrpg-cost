<!-- 医院医疗服务项目成本汇总表(医院类别) -->
<script setup name="proCostReport_hmscs">
import {reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useReport} from "@/hooks/useReport";
import {useStorage} from "@vueuse/core";
import {requiredPageFilter} from "@/utils";

const PERMISSION_CODE = 'proCostReport_hmscs'
const { searchReport } = useReport({
  reportName: '项目成本-医院医疗服务项目成本汇总表(医院类别).ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()
const setting = useStorage('setting', {}, sessionStorage)

const filterRef = ref(null)
const defaultQuery = {

}
const filterInfo = reactive({
  options: {
  },
  query: {
    ...defaultQuery
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
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
  tableParameter.callBack = (raw) => {
    filterInfo.query.itemAccountingPeriodId = raw.id
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
