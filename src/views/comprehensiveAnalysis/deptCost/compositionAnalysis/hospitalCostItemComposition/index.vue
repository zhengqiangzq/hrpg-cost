<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {page, exportAnalysis} from "@/api/deptCost/hospitalCostItemComposition";
import {periodMonthByDate} from "@/api/base";
import moment from "moment/moment";

const PERMISSION_CODE = 'dept:hospitalCostItemComposition'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
  },
  copyQuery: {},
  query: {
    costType: '1',
  },
  list: [
    { label: '分析开始期间', value: 'startPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '分析结束期间', value: 'endPeriod', required: true, showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '图形分析', event: () => analysisDetail() },
    { type: 'button', label: '导出', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() },
  ]
})
const BASE_FIELDLIST = [
  { label: '成本项目编码', value: 'costItemCode' },
  { label: '成本项目名称', value: 'costItemName' },
  { label: '成本分类(大类)', value: 'rootCostCategoryName' },
  { label: '总成本', value: 'cost', type: 'slot', headAlign: 'center', align: 'right' },
]
const tableInfo = reactive({
  api: null,
  refresh: 1,
  fieldList: [
      ...BASE_FIELDLIST
  ]
})
const detailInfo = reactive({
  type: 'cost',
  query: {},
  visible: false
})
const analysisInfo = reactive({
  query: {},
  visible: false
})

const selectCostType = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

onMounted(async () => {
  tableInfo.api = (params) => {
    return new Promise((resolve, reject) => {
      page(params).then(res => {
        if (res.success) {
          const data = res.data
          if (data.length > 0) {
            data.forEach(row => {
              row.details.forEach(it => {
                row[it.deptCode + 'directCost'] = it.directCost
                row[it.deptCode + 'indirectCost'] = it.indirectCost
                row[it.deptCode + 'cost'] = it.cost
              })
            })
            const details = data[0].details.slice(0, 20)
            tableInfo.fieldList = [
              ...BASE_FIELDLIST,
              ...details.map(it=> {
                return { label: it.deptName, type: 'multiHeader', children: [
                    { label: '直接成本', value: it.deptCode + 'directCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[it.deptCode + 'directCost']) },
                    { label: '间接成本', value: it.deptCode + 'indirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[it.deptCode + 'indirectCost']) },
                    { label: '合计', value: it.deptCode + 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[it.deptCode + 'cost']) },
                  ]
                }
              })
            ]
          } else {
            tableInfo.fieldList = [
              ...BASE_FIELDLIST
            ]
          }
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
  await getDefaultPeriod()
  search()
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
  tableInfo.refresh = Math.random()
}
async function reset() {
  filterInfo.query = {
    costType: '1',
  }
  await getDefaultPeriod()
  search()
}
function getDefaultPeriod() {
  return periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.query.periodId = _data.id
    filterInfo.query.startPeriodId = _data.id
    filterInfo.query.startPeriod = _data.periodYearAndMonth
    filterInfo.query.endPeriodId = _data.id
    filterInfo.query.endPeriod = _data.periodYearAndMonth
  })
}

function analysisDetail() {
  analysisInfo.query = {
    ...filterInfo.copyQuery,
  }
  analysisInfo.visible = true
}

function detailCost(row) {
  detailInfo.type = 'cost'
  detailInfo.query = {
    ...filterInfo.copyQuery,
    costItemId: row.costItemId,
    costItemIdList: [row.costItemId],
  }
  detailInfo.visible = true
}

function exportData() {
  exportAnalysis(filterInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function openAccountingPeriodSelector(mark) {
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (mark === 'end') {
      filterInfo.query.endPeriodId = raw.id
      filterInfo.query.endPeriod = raw.periodYearAndMonth
    } else {
      filterInfo.query.periodId = raw.id
      filterInfo.query.startPeriodId = raw.id
      filterInfo.query.startPeriod = raw.periodYearAndMonth
    }
  }
  openDialog(filterRef.value)
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemIdList = raw.map(it => it.id)
    filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !analysisInfo.visible">
      <div class="filter-wrapper">
        <NewPageFilter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
            :filter-btn="filterInfo.filterbtn"
            :filter-list="filterInfo.list">
          <template #filter-startPeriod>
            <el-input
                v-model="filterInfo.query.startPeriod"
                class="not-mongolia" placeholder="请选择分析开始期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-endPeriod>
            <el-input
                v-model="filterInfo.query.endPeriod"
                class="not-mongolia" placeholder="请选择分析结束期间" :disabled="true"
            >
              <template #append><el-icon @click="openAccountingPeriodSelector('end')"><Search /></el-icon></template>
            </el-input>
          </template>
          <template #filter-costItemName>
            <el-input
                v-model="filterInfo.query.costItemName"
                class="not-mongolia" placeholder="请选择成本项目" :disabled="true">
              <template #append><el-icon @click="openCostItemSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </NewPageFilter>
      </div>
      <div class="filter-wrapper">
        <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
      </div>
      <table-container
          :api="tableInfo.api"
          :field-list="tableInfo.fieldList"
          :query="filterInfo.copyQuery"
          :check-box="false"
          :refresh="tableInfo.refresh"
          v-model:data="tableInfo.data"
          tabIndex
      >
        <template #col-cost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.cost || '') }}</span>
        </template>
      </table-container>
    </div>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>
