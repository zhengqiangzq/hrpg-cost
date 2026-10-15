<!-- 门诊科室诊次成本收入结余分析 -->
<script setup name="consultation">
import {onMounted, reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useReport} from "@/hooks/useReport";
import {useStorage} from "@vueuse/core";
import {useDefaultPeriod} from "@/hooks/useDefaultPeriod";
import {requiredPageFilter} from "@/utils";

const PERMISSION_CODE = 'consultation'
const { searchReport } = useReport({
  reportName: '科室成本-门诊科室诊次成本收入结余分析.ureport.xml'
})
const { tableParameter, openDialog } = useSelectTableData()
const setting = useStorage('setting', {}, sessionStorage)

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
    { label: '开始会计期间', value: 'beginMonth', required: true, showLabel: true, type: 'slot' },
    { label: '结束会计期间', value: 'endMonth', required: true, showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, type: 'select', list: 'costType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
})


onMounted(async () => {
  const { periodId, periodName } = await useDefaultPeriod().loadDefaultPeriod()
  filterInfo.query.beginMonthId = filterInfo.query.endMonthId = periodId
  filterInfo.query.beginMonth = filterInfo.query.endMonth = periodName
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
