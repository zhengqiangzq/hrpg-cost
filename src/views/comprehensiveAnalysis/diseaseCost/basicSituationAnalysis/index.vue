<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import ReportCharts from '@/views/comprehensiveAnalysis/components/reportCharts/index.vue'
import {bottomList, topGraphics} from "@/api/diseaseCost/costBasicSituationAnalysis";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {pageAccountingPeriod} from "@/api/diseaseCostAccountingPeriod";
import detail from './detail.vue'

const PERMISSION_CODE = 'disease:costBasicSituationAnalysis'
defineOptions({
  name: PERMISSION_CODE
})

const { proxy } = getCurrentInstance()

const title = '病种成本基本情况'
const info = reactive({
  income: '-',
  cost: '-',
  rest: '-'
})
const filterInfo = reactive({
  query: {
    costType: '1'
  },
  copyQuery: {},
  options: {
    costType: dict_cost_type
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '病种', value: 'drgName', showLabel: true, type: 'slot' },
    { label: '是否单病种', value: 'isSingleDisease', type: 'select-model', code: 'yes_or_no' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
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
  title: { text: '病种成本构成图' },
  series: [
    {
      type: 'pie',
      radius: 80,
      center: ['50%', '60%'],
      right: '160px',
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
const { chartRef: scatterChartRef, setData: scatterSetData, setOption: scatterSetOption } = useChart({
  title: { text: '医院病种分布图' },
})

const tableInfo = reactive({
  fieldList: [
    { label: '病种编码', value: 'drgDefinitionCode' },
    { label: '病种名称', value: 'drgDefinitionName' },
    { label: '病例数', value: 'paramValue', align: 'center' },
    { label: '例均费用', value: 'drugCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.drugCost) },
    { label: '病种收入', value: 'productCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '收入占比(%)', value: 'incomePercent', align: 'center' },
    { label: '例均成本', value: 'currentCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.currentCost) },
    { label: '病种成本', value: 'previousCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '成本占比(%)', value: 'costPercent', align: 'center' },
    { label: '病种收益', value: 'otherCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.otherCost) },
    { label: '收益率', value: 'otherPercent', align: 'center' },
  ],
  data: []
})

const detailInfo = reactive({
  type: 'income',
  query: {},
  visible: false
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
  getList()
}
function getTopGraphics() {
  topGraphics(filterInfo.copyQuery).then(({success, data}) => {
    info.income = data?.incomeTotal ?? '-'
    info.cost = data?.costTotal ?? '-'
    info.rest = data?.earning ?? '-'
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
    const costTotal = data.costTotal || 1
    const drugCost = data.barList?.find(it => it.code === '02').value || 0
    const materialCost = data.barList?.find(it => it.code === '03').value || 0
    infoLeftSetData([
      [{ name: '药占比', value: drugCost / costTotal * 100, selected: true, label: labelStyle, }, { name: '其他', value: 100 - drugCost / costTotal * 100 }]
    ])
    infoRightSetData([
      [{ name: '卫生材料占比', value: materialCost / costTotal * 100, selected: true, label: labelStyle, }, { name: '其他', value: 100 - materialCost / costTotal * 100 }]
    ])
    pieSetOption({
      legend: { data: data.barList?.map(it => it.name) }
    })
    pieSetData([
      data.barList || []
    ])
    scatterSetData([
        data.pointList?.map(it => {
          return [it.number, it.money, it.name]
        }) || []
    ])
  })
}

function getList() {
  bottomList(filterInfo.copyQuery).then(res => {
    tableInfo.data = res.data || []
  })
}
function reset() {
  filterInfo.query = {
    costType: '1'
  }
  getDefaultPeriod()
}

function getDefaultPeriod() {
  pageAccountingPeriod({
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
      filterInfo.query.beginPeriodName = res.data[0].beginPeriodName
      filterInfo.query.endPeriodName = res.data[0].endPeriodName
      search()
    }
  })
}

function detailProductCost(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId
  }
  detailInfo.visible = true
}

function detailPreviousCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    drgId: row.drgDefinitionId
  }
  detailInfo.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'diseasePeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
    filterInfo.query.beginPeriodName = raw.beginPeriodName
    filterInfo.query.endPeriodName = raw.endPeriodName
  }
  openDialog(filterRef.value)
}
function openDiseaseDefinitionSelector() {
  tableParameter.type = 'diseaseDefinition'
  tableParameter.callBack = (raw) => {
    filterInfo.query.drgId= raw.id
    filterInfo.query.drgName = raw.name
  }
  openDialog(filterRef.value)
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible">
      <div class="filter-wrapper">
        <page-filter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list">
          <template #filter-accountingPeriodName>
            <el-input
                v-model="filterInfo.query.accountingPeriodName"
                class="not-mongolia" placeholder="请选择核算期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-drgName>
            <el-input
                v-model="filterInfo.query.drgName"
                class="not-mongolia" placeholder="请选择病种" :disabled="true"
            >
              <template #append><el-icon @click="openDiseaseDefinitionSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </page-filter>
      </div>
      <div class="filter-wrapper">
        <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
      </div>
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="10">
          <el-row class="box-border basic-info" align="middle">
            <el-col :span="24" class="info-title">{{ title }}</el-col>
            <el-col :span="12">成本类型：{{ dict_cost_type.find(it => it.value == filterInfo.copyQuery.costType)?.key }}</el-col>
            <el-col :span="12">分析期间：{{ filterInfo.copyQuery.beginPeriodName }}~{{ filterInfo.copyQuery.endPeriodName }}</el-col>
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
          <report-charts ref="scatterChartRef" type="scatter" />
        </el-col>
      </el-row>
      <div>
        <div class="data-title">病种收益情况分析</div>
        <table-container
            :field-list="tableInfo.fieldList"
            :check-box="false"
            :data="tableInfo.data"
            tabIndex
            :pager="false"
        >
          <template #col-productCost="{ row }">
            <span class="slip-edit" @click="detailProductCost(row)">{{ $fn.TripartiteMethod(row.productCost || '') }}</span>
          </template>
          <template #col-previousCost="{ row }">
            <span class="slip-edit" @click="detailPreviousCost(row)">{{ $fn.TripartiteMethod(row.previousCost || '') }}</span>
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
