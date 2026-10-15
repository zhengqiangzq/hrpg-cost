<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import ReportCharts from '@/views/comprehensiveAnalysis/components/reportCharts/index.vue'
import {bottomList, topGraphics} from "@/api/projectCost/basicSituationAnalysis";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import detail from './detail.vue'
import {itemaccountingPeriodpage} from "@/api/projectBase";

const PERMISSION_CODE = 'projectCost:basicSituationAnalysis'
defineOptions({
  name: PERMISSION_CODE
})

const { proxy } = getCurrentInstance()

const title = '项目成本基本情况'
const info = ref({})
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
    { label: '服务项目', value: 'feeItemName', showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: []
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

const { chartRef: pieRef, setData: pieSetData, setOption: pieSetOption } = useChart({
  title: { text: '医院项目成本构成图' },
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
  title: { text: '医院服务项目分布图' },
})

const tableInfo = reactive({
  fieldList: [
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '收费类别', value: 'feeCategoryName' },
    { label: '单价', value: 'price', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.price) },
    { label: '单位成本', value: 'money', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
    { label: '成本收益率(%)', value: 'incomeRate', align: 'center' },
    { label: '工作量', value: 'workNum', align: 'center' },
    { label: '总收入', value: 'allIncome', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '总成本', value: 'allCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '总收益', value: 'allBalance', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.allBalance) },
  ],
  data: []
})

const detailInfo = reactive({
  type: 'income',
  query: {},
  visible: false
})

onMounted(() => {
  tableInfo.api = bottomList
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
    info.value = data
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
  tableInfo.refresh = Math.random()
}
function reset() {
  filterInfo.query = {
    costType: '1'
  }
  getDefaultPeriod()
}

function getDefaultPeriod() {
  itemaccountingPeriodpage({
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.accountingPeriodId = res.data[0].id
      filterInfo.query.accountingPeriodName = res.data[0].name
      filterInfo.query.beginPeriodName = res.data[0].beginPeriod
      filterInfo.query.endPeriodName = res.data[0].endPeriod
      search()
    }
  })
}

function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    feeItemId: row.feeItemId
  }
  detailInfo.visible = true
}

function detailCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    feeItemId: row.feeItemId
  }
  detailInfo.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.checkBox = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
    filterInfo.query.beginPeriodName = raw.beginPeriod
    filterInfo.query.endPeriodName = raw.endPeriod
  }
  openDialog(filterRef.value)
}
function openFeeItemSelector() {
  tableParameter.title = '服务项目'
  tableParameter.type = 'feeItem'
  tableParameter.checkBox = true
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemIds = raw.map(it => it.id)
    filterInfo.query.feeItemName = raw.map(it => it.name).join(',')
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
          <template #filter-feeItemName>
            <el-input
                v-model="filterInfo.query.feeItemName"
                class="not-mongolia" placeholder="请选择服务项目" :disabled="true"
            >
              <template #append><el-icon @click="openFeeItemSelector"><Search /></el-icon></template>
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
            <el-col :span="6">平均单价: <span class="money">{{ info.price !== '-' ? $fn.TripartiteMethod(info.price) : '-' }}元</span></el-col>
            <el-col :span="6">单位成本: <span class="money">{{ info.cost !== '-' ? $fn.TripartiteMethod(info.cost) : '-' }}元</span></el-col>
            <el-col :span="6">成本收益率: <span class="money">{{ info.rate }}%</span></el-col>
            <el-col :span="6">工作量: <span class="money">{{ info.num }}</span></el-col>
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
        <div class="data-title">服务项目收支情况分析</div>
        <table-container
            :field-list="tableInfo.fieldList"
            :query="filterInfo.copyQuery"
            :check-box="false"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :refresh="tableInfo.refresh"
            tabIndex
            :pager="true"
        >
          <template #col-allIncome="{ row }">
            <span class="slip-edit" @click="detailIncome(row)">{{ $fn.TripartiteMethod(row.allIncome || '') }}</span>
          </template>
          <template #col-allCost="{ row }">
            <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.allCost || '') }}</span>
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
