<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import ReportCharts from '@/views/comprehensiveAnalysis/components/reportCharts/index.vue'
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import detail from './detail.vue'
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";
import {
  contributionMarginAnalysisList, pageApportionmentLevelList
} from "@/api/deptCost/contributionProject";

const PERMISSION_CODE = 'projectCost:marginalContributionAnalysis'
defineOptions({
  name: PERMISSION_CODE
})

const { proxy } = getCurrentInstance()

const filterInfo = reactive({
  query: {
    costType: '1',
  },
  copyQuery: {},
  options: {
    costType: dict_cost_type,
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: search },
    { type: 'button', label: '重置', event: reset },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() }
  ]
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

const { chartRef: pieRef, setData: pieSetData, setOption: pieSetOption } = useChart({
  title: { text: '服务项目单位收益、边际贡献四象限' },
})
const { chartRef: barChartRef, setData: barSetData, setOption: barSetOption } = useChart({
  title: { text: '服务项目收益分布图' },
})

const tableInfo = reactive({
  fieldList: [
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '收费类型', value: 'feeCategoryName' },
    { label: '工作量', value: 'workNum', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.workNum) },
    { label: '总收入', value: 'totalIncome', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '总成本', value: 'totalCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '单位收入', value: 'avgTotalIncome', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgTotalIncome) },
    { label: '单位成本', type: 'multiHeader', children: [
        { label: '固定成本', value: 'avgFixedCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgFixedCost) },
        { label: '变动成本', value: 'avgInFixedCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgInFixedCost) },
        { label: '合计', value: 'avgTotalCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgTotalCost) },
      ]
    },
    { label: '单位收益', value: 'avgProfit', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgProfit) },
    { label: '边际贡献', value: 'avgContributionMargin', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgContributionMargin) },
    { label: '边际贡献率(%)', value: 'avgContributionMarginRate', align: 'right' },
  ],
  data: []
})

const detailInfo = reactive({
  type: 'income',
  query: {},
  visible: false
})


onMounted(() => {

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
  getTopGraphics()
}
function getTopGraphics() {
  contributionMarginAnalysisList(filterInfo.copyQuery).then(({success, data}) => {
    pieSetData([
      data?.map(it => {
        return [it.avgProfit, it.avgContributionMargin, it.feeItemName]
      }) || []
    ])
  pieSetOption({
      xAxis: { name: '单位收益' },
      yAxis: { name: '单位边际贡献' }
    })
    barSetOption({
      xAxis: { name: '数量' },
      yAxis: { name: '收益' }
    })
    barSetData([
      data?.map(it => {
        return [it.workNum, it.totalIncome, it.feeItemName]
      }) || []
    ])
    tableInfo.data = data || []
  })
}

function reset() {
  filterInfo.query = {
    costType: '1',
  }
}

function exportData() {
  pageApportionmentLevelList(filterInfo.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.sectionId,
    feeItemId: row.feeItemId,
    rateMoney: row.totalIncome,
  }
  detailInfo.visible = true
}

function detailCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.sectionId,
    feeItemId: row.feeItemId,
    rateMoney: row.totalCost,
  }
  detailInfo.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.title = '核算期间'
  tableParameter.pager = true
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
  openDialog(filterRef.value)
}

</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible">
      <div class="filter-wrapper">
        <PageFilter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-btn="filterInfo.filterbtn"
            :filter-list="filterInfo.list">
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </PageFilter>
      </div>
      <div class="filter-wrapper">
        <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
      </div>
      <el-row :gutter="10">
        <el-col :span="10">
          <report-charts ref="pieRef" type="scatter">
          </report-charts>
        </el-col>
        <el-col :span="14">
          <report-charts ref="barChartRef" type="scatter" />
        </el-col>
      </el-row>
      <div>
        <div class="data-title">边际贡献分析</div>
        <table-container
            :field-list="tableInfo.fieldList"
            :check-box="false"
            :data="tableInfo.data"
            tabIndex
            :pager="false"
        >
          <template #col-totalIncome="{ row }">
            <span class="slip-edit" @click="detailIncome(row)">{{ $fn.TripartiteMethod(row.totalIncome || '') }}</span>
          </template>
          <template #col-totalCost="{ row }">
            <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.totalCost || '') }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">
.box-border {
  border-radius: 5px;
  border: 1px solid rgba(170, 170, 170, 1);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, .2);
}
</style>
