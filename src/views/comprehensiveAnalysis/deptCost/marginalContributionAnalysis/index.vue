<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import ReportCharts from '@/views/comprehensiveAnalysis/components/reportCharts/index.vue'
import {dict_cost_type, dict_dept_level, dict_income_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import detail from './detail.vue'
import {periodMonthByDate} from "@/api/base";
import {sectiontree} from "@/api/accountingDepartment";
import moment from "moment/moment";
import {pageApportionmentLevelList} from "@/api/deptCost/basicSituationAnalysis";
import {
  contributionMarginAnalysisexport,
  contributionMarginAnalysisList,
} from "@/api/deptCost/contributionDeptCost";

const PERMISSION_CODE = 'dept:marginalContributionAnalysis'
defineOptions({
  name: PERMISSION_CODE
})

const { proxy } = getCurrentInstance()

const filterInfo = reactive({
  query: {
    costType: '1',
    level: '8',
    incomeType: '1',
    apportionmentLevelId: '',
    apportionmentLevelName: ''
  },
  copyQuery: {},
  options: {
    deptLevel: dict_dept_level,
    incomeType: dict_income_type,
    costType: dict_cost_type,
  },
  list: [
    { label: '开始分析期间', value: 'analysisStartPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '结束分析期间', value: 'analysisEndPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { label: '收入类型', value: 'incomeType', clearable: false, required: true, type: 'select', list: 'incomeType' },
    { label: '分摊级次', value: 'apportionmentLevelName', showLabel: true, required: true, type: 'slot' },
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
  title: { text: '科室收支结余、边际贡献四象限' },
})
const { chartRef: barChartRef, setData: barSetData, setOption: barSetOption } = useChart({
  title: { text: '科室收入成本分布图' },
})

const tableInfo = reactive({
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '总收入', value: 'totalIncome', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '总成本', value: 'totalCost', headAlign: 'center', align: 'right', type: 'slot' },
    { label: '成本构成', type: 'multiHeader', children: [
        { label: '直接成本', value: 'directCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.directCost) },
        { label: '间接成本', value: 'indirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.indirectCost) },
      ]
    },
    { label: '成本属性', type: 'multiHeader', children: [
        { label: '固定成本', value: 'fixedCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.fixedCost) },
        { label: '变动成本', value: 'inFixedCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.inFixedCost) },
      ]
    },
    { label: '可控属性', type: 'multiHeader', children: [
        { label: '不可控成本', value: 'inControlCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.inControlCost) },
        { label: '可控成本', value: 'controlCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.controlCost) },
      ]
    },
    { label: '收支结余', value: 'profit', align: 'right' },
    { label: '边际贡献', value: 'contributionMargin', align: 'right' },
    { label: '边际贡献率(%)', value: 'contributionMarginRate', align: 'right' },
  ],
  data: []
})

const detailInfo = reactive({
  type: 'income',
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

onMounted(async () => {
  await getDefaultApportionmentLevel()
  await getDefaultPeriod()
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
        return [it.profit, it.contributionMargin, it.deptName]
      }) || []
    ])
  pieSetOption({
      xAxis: { name: '科室收支结余' },
      yAxis: { name: '边际贡献' }
    })
    barSetOption({
      xAxis: { name: '成本' },
      yAxis: { name: '收入' }
    })
    barSetData([
      data?.map(it => {
        return [it.totalCost, it.totalIncome, it.deptName]
      }) || []
    ])
    tableInfo.data = data || []
  })
}

function reset() {
  filterInfo.query = {
    costType: '1',
    level: '1',
    incomeType: '1'
  }
  getDefaultPeriod()
}

function getDefaultPeriod() {
  return periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.query.analysisStartPeriodId = _data.id
    filterInfo.query.analysisStartPeriodName = _data.periodYearAndMonth
    filterInfo.query.analysisEndPeriodId = _data.id
    filterInfo.query.analysisEndPeriodName = _data.periodYearAndMonth
    search()
  })
}

function exportData() {
  contributionMarginAnalysisexport(filterInfo.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function detailIncome(row) {
  detailInfo.type = 'income'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    deptId: row.deptId,
    rateMoney: row.totalIncome,
  }
  detailInfo.visible = true
}

function detailCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    deptId: row.deptId,
    rateMoney: row.totalCost,
  }
  detailInfo.visible = true
}

function openAccountingPeriodSelector(mark) {
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'end') {
      filterInfo.query.analysisEndPeriodId = raw.id
      filterInfo.query.analysisEndPeriodName = raw.periodYearAndMonth
    } else {
      filterInfo.query.analysisStartPeriodId = raw.id
      filterInfo.query.analysisStartPeriodName = raw.periodYearAndMonth
    }
  }
  openDialog(filterRef.value)
}
function getDefaultApportionmentLevel() {
  return pageApportionmentLevelList({
    sort: 'create_time desc',
    status: '1'
  }).then(res => {
    if (res.data?.length > 0) {
      filterInfo.query.apportionmentLevelId = res.data[res.data.length - 1].id
      filterInfo.query.apportionmentLevelName = res.data[res.data.length - 1].name
    }
  })
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.sectionIdList = raw.map(it => it.id)
  filterInfo.query.sectionName = raw.map(it => it.name).join(',')
}
function openApportionmentLevelSelector() {
  tableParameter.type = 'analysisLevel'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.apportionmentLevelId = raw.id
    filterInfo.query.apportionmentLevelName = raw.name
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
          <template #filter-analysisStartPeriodName>
            <el-input
                v-model="filterInfo.query.analysisStartPeriodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-analysisEndPeriodName>
            <el-input
                v-model="filterInfo.query.analysisEndPeriodName"
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
          <template #filter-apportionmentLevelName>
            <el-input
                v-model="filterInfo.query.apportionmentLevelName"
                class="not-mongolia" placeholder="请选择分摊级次" :disabled="true">
              <template #append><el-icon @click="openApportionmentLevelSelector"><Search /></el-icon></template>
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
  </div>
</template>

<style scoped lang="scss">
.box-border {
  border-radius: 5px;
  border: 1px solid rgba(170, 170, 170, 1);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, .2);
}
</style>
