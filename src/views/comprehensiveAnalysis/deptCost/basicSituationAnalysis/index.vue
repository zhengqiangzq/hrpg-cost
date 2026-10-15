<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import ReportCharts from '@/views/comprehensiveAnalysis/components/reportCharts/index.vue'
import {topGraphics} from "@/api/deptCost/basicSituationAnalysis";
import {dict_cost_type, dict_dept_level, dict_income_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import detail from './detail.vue'
import detailDirectIndirect from './detailDirectIndirect.vue'
import {periodMonthByDate} from "@/api/base";
import {sectiontree} from "@/api/accountingDepartment";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:deptCostBasicSituationAnalysis'
defineOptions({
  name: PERMISSION_CODE
})

const { proxy } = getCurrentInstance()

const title = '科室成本基本情况'
const info = reactive({
  income: '-',
  cost: '-',
  rest: '-'
})
const filterInfo = reactive({
  query: {
    costType: '1',
    level: dict_dept_level[dict_dept_level.length - 1].value,
    incomeType: '1'
  },
  copyQuery: {},
  options: {
    deptLevel: dict_dept_level,
    incomeType: dict_income_type,
    costType: dict_cost_type,
  },
  list: [
    { label: '开始分析期间', value: 'startPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '结束分析期间', value: 'endPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { label: '收入类型', value: 'incomeType', clearable: false, required: true, type: 'select', list: 'incomeType' },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: []
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

const { chartRef: infoLeftChartRef, setData: infoLeftSetData, setOption: infoLeftSetOption } = useChart({
  title: { text: '' },
  tooltip: { show: false },
  silent: true,
  color: ['#5470c6', '#c0c0c0'],
  series: [
    {
      type: 'pie',
      radius: [15, 20],
      center: ['50%', '50%'],
      data: [],
      cursor: 'none',
      startAngle: 90,
      labelLine: { show: false }
    }
  ]
})
const { chartRef: infoRightChartRef, setData: infoRightSetData, setOption: infoRightSetOption } = useChart({
  title: { text: '' },
  tooltip: { show: false },
  silent: true,
  color: ['#5470c6', '#c0c0c0'],
  series: [
    {
      type: 'pie',
      radius: [15, 20],
      center: ['50%', '50%'],
      data: [],
      cursor: 'none',
      startAngle: 90,
      labelLine: { show: false }
    }
  ]
})

const { chartRef: pieRef, setData: pieSetData, setOption: pieSetOption } = useChart({
  title: { text: '医院成本构成图' },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: 80,
      center: ['50%', '60%'],
      right: 0,
      data: [],
      label: {
        alignTo: 'edge',
        formatter: '{name|{b}}\n{time|{c} 元}',
        minMargin: 5,
        edgeDistance: 10,
        lineHeight: 15,
        rich: {
          time: {
            fontSize: 10,
            color: '#999'
          }
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})
const { chartRef: barChartRef, setData: barSetData, setOption: barSetOption } = useChart({
  title: { text: '医院收入成本趋势图' },
  grid: {
    left: '15%',
    right: '10%'
  },
  legend: {
    show: true,
    data: ['收入', '成本']
  },
  series: [
    {
      name: '收入',
      type: 'bar',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
    {
      name: '成本',
      type: 'bar',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
  ]
})

const tableInfo = reactive({
  fieldList: [
    { label: '科室编码', value: 'sectionCode' },
    { label: '科室名称', value: 'sectionName' },
    { label: '总收入', value: 'totalIncome', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '总成本', value: 'totalCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '收支结余', value: 'totalBalance', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalBalance) },
    { label: '人员经费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'personnelExpensesDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'personnelExpensesIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'personnelExpensesPercent', align: 'center' },
      ]
    },
    { label: '药品费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'drugDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'drugIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'drugPercent', align: 'center' },
      ]
    },
    { label: '卫生材料费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'healthMaterialDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'healthMaterialIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'healthMaterialPercent', align: 'center' },
      ]
    },
    { label: '固定资产折旧费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'fixedAssetsDepreciationDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'fixedAssetsDepreciationIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'fixedAssetsDepreciationPercent', align: 'center' },
      ]
    },
    { label: '无形资产摊销费', type: 'multiHeader', children: [
        { label: '直接成本', value: 'intangibleAssetsAmortizationDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'intangibleAssetsAmortizationIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'intangibleAssetsAmortizationPercent', align: 'center' },
      ]
    },
    { label: '计提医疗风险基金', type: 'multiHeader', children: [
        { label: '直接成本', value: 'medicalVentureFundDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'medicalVentureFundIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'medicalVentureFundPercent', align: 'center' },
      ]
    },
    { label: '其他', type: 'multiHeader', children: [
        { label: '直接成本', value: 'otherDirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '间接成本', value: 'otherIndirectCost', headAlign: 'center', align: 'right', type: 'slot' },
        { label: '占比(%)', value: 'otherPercent', align: 'center' },
      ]
    },
  ],
  data: []
})

const detailInfo = reactive({
  type: 'income',
  query: {},
  visible: false
})

const detailCostInfo = reactive({
  type: '',
  query: {},
  visible: false
})

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {}
})

onMounted(() => {
  getDefaultPeriod()
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
  topGraphics(filterInfo.copyQuery).then(({success, data}) => {
    info.income = data?.totalIncome ?? '-'
    info.cost = data?.totalCost ?? '-'
    info.rest = data?.totalBalance ?? '-'
    const labelStyle = {
      show: true,
      position: 'center',
      formatter: '{d}%\n{text|{b}}',
      rich: {
        text: {
          fontSize: 10,
        }
      }
    }
    const drugPercent = data?.drugPercent || 0
    const healthMaterialPercent = data?.healthMaterialPercent || 0
    infoLeftSetData([
      [{ name: '药占比', value: drugPercent, selected: true, label: labelStyle, }, { name: '其他', value: 100 - drugPercent }]
    ])
    infoRightSetData([
      [{ name: '卫生材料占比', value: healthMaterialPercent, selected: true, label: labelStyle, }, { name: '其他', value: 100 - healthMaterialPercent }]
    ])
    pieSetData([
      data?.pie?.pieList || []
    ])
    barSetOption({
      xAxis: { data: data?.histogram?.map(it => it.name) || [] }
    })
    barSetData([
        data.histogram?.map(it => it.income) || [],
        data.histogram?.map(it => it.cost) || []
    ])
    tableInfo.data = data?.deptIncomeAndCostAnalysis || []
  })
}

function reset() {
  filterInfo.query = {
    costType: '1',
    level: dict_dept_level[dict_dept_level.length - 1].value,
    incomeType: '1'
  }
  getDefaultPeriod()
}

function getDefaultPeriod() {
  return periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.query.startPeriodId = _data.id
    filterInfo.query.startPeriodName = _data.periodYearAndMonth
    filterInfo.query.endPeriodId = _data.id
    filterInfo.query.endPeriodName = _data.periodYearAndMonth
    search()
  })
}

function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.sectionId
  }
  detailInfo.visible = true
}

function detailCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    sectionId: row.sectionId
  }
  detailInfo.visible = true
}

function openAccountingPeriodSelector(mark) {
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'end') {
      filterInfo.query.endPeriodId = raw.id
      filterInfo.query.endPeriodName = raw.periodYearAndMonth
    } else {
      filterInfo.query.startPeriodId = raw.id
      filterInfo.query.startPeriodName = raw.periodYearAndMonth
    }
  }
  openDialog(filterRef.value)
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.sectionIdList = raw.map(it => it.id)
  filterInfo.query.sectionName = raw.map(it => it.name).join(',')
}

// 直接成本
function detailDirectCost(row, type) {
  detailCostInfo.type = 'direct'
  detailCostInfo.query = {
    ...filterInfo.copyQuery,
    deptId: row.sectionId,
    sectionId: row.sectionId,
    type,
  }
  detailCostInfo.visible = true
}

// 间接成本
function detailIndirectCost(row, type) {
  detailCostInfo.type = 'indirect'
  detailCostInfo.query = {
    ...filterInfo.copyQuery,
    deptId: row.sectionId,
    sectionId: row.sectionId,
    type,
  }
  detailCostInfo.visible = true
}



</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !detailCostInfo.visible">
      <div class="filter-wrapper">
        <PageFilter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-btn="filterInfo.filterbtn"
            :filter-list="filterInfo.list">
          <template #filter-startPeriodName>
            <el-input
                v-model="filterInfo.query.startPeriodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-endPeriodName>
            <el-input
                v-model="filterInfo.query.endPeriodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('end')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-sectionName>
            <el-input
                v-model="filterInfo.query.sectionName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </PageFilter>
      </div>
      <div class="filter-wrapper">
        <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
      </div>
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="10">
          <el-row class="box-border basic-info" align="middle">
            <el-col :span="24" class="info-title">{{ title }}</el-col>
            <el-col :span="12">成本类型：{{ dict_cost_type?.find(it => it.value == filterInfo.copyQuery.costType)?.key }}</el-col>
            <el-col :span="12">分析期间：{{ filterInfo.copyQuery.startPeriodName }}~{{ filterInfo.copyQuery.endPeriodName }}</el-col>
          </el-row>
        </el-col>
        <el-col :span="14">
          <el-row class="box-border analysis-info" align="middle">
            <el-col :span="6">收入: <span class="money">{{ info.income !== '-' ? $fn.TripartiteMethod(info.income) : '-' }}元</span></el-col>
            <el-col :span="6">成本: <span class="money">{{ info.cost !== '-' ? $fn.TripartiteMethod(info.cost) : '-' }}元</span></el-col>
            <el-col :span="6">结余: <span class="money">{{ info.rest !== '-' ? $fn.TripartiteMethod(info.rest) : '-' }}元</span></el-col>
            <el-col :span="3">
              <report-charts ref="infoLeftChartRef" type="pie" no-border style="height: 55px;">
              </report-charts>
            </el-col>
            <el-col :span="3">
              <report-charts ref="infoRightChartRef" type="pie" no-border style="height: 55px;">
              </report-charts>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="10">
          <report-charts ref="pieRef" type="pie">
          </report-charts>
        </el-col>
        <el-col :span="14">
          <report-charts ref="barChartRef" type="bar" />
        </el-col>
      </el-row>
      <div>
        <div class="data-title">科室收支情况分析</div>
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
          <template #col-personnelExpensesDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '01')">{{ $fn.TripartiteMethod(row.personnelExpensesDirectCost || '') }}</span>
          </template>
          <template #col-personnelExpensesIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '01')">{{ $fn.TripartiteMethod(row.personnelExpensesIndirectCost || '') }}</span>
          </template>
          <template #col-drugDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '03')">{{ $fn.TripartiteMethod(row.drugDirectCost || '') }}</span>
          </template>
          <template #col-drugIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '03')">{{ $fn.TripartiteMethod(row.drugIndirectCost || '') }}</span>
          </template>
          <template #col-healthMaterialDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '02')">{{ $fn.TripartiteMethod(row.healthMaterialDirectCost || '') }}</span>
          </template>
          <template #col-healthMaterialIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '02')">{{ $fn.TripartiteMethod(row.healthMaterialIndirectCost || '') }}</span>
          </template>
          <template #col-fixedAssetsDepreciationDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '04')">{{ $fn.TripartiteMethod(row.fixedAssetsDepreciationDirectCost || '') }}</span>
          </template>
          <template #col-fixedAssetsDepreciationIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '04')">{{ $fn.TripartiteMethod(row.fixedAssetsDepreciationIndirectCost || '') }}</span>
          </template>
          <template #col-intangibleAssetsAmortizationDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '05')">{{ $fn.TripartiteMethod(row.intangibleAssetsAmortizationDirectCost || '') }}</span>
          </template>
          <template #col-intangibleAssetsAmortizationIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '05')">{{ $fn.TripartiteMethod(row.intangibleAssetsAmortizationIndirectCost || '') }}</span>
          </template>
          <template #col-medicalVentureFundDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '06')">{{ $fn.TripartiteMethod(row.medicalVentureFundDirectCost || '') }}</span>
          </template>
          <template #col-medicalVentureFundIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '06')">{{ $fn.TripartiteMethod(row.medicalVentureFundIndirectCost || '') }}</span>
          </template>
          <template #col-otherDirectCost="{ row }">
            <span class="slip-edit" @click="detailDirectCost(row, '07')">{{ $fn.TripartiteMethod(row.otherDirectCost || '') }}</span>
          </template>
          <template #col-otherIndirectCost="{ row }">
            <span class="slip-edit" @click="detailIndirectCost(row, '07')">{{ $fn.TripartiteMethod(row.otherIndirectCost || '') }}</span>
          </template>
        </table-container>
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
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
    <detailDirectIndirect v-if="detailCostInfo.visible" v-model:visible="detailCostInfo.visible" :type="detailCostInfo.type" :query="detailCostInfo.query" />
  </div>
</template>

<style scoped lang="scss">
.box-border {
  border-radius: 5px;
  border: 1px solid rgba(170, 170, 170, 1);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, .2);
}
.basic-info, .analysis-info {
  height: 65px;
  text-align: center;
}
.analysis-info {
  font-size: 1.25em;
  .money {
    color: #B80017;
  }
}
.info-title {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
