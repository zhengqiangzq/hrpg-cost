<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {periodMonthByDate} from "@/api/base";
import {page, exportAnalysis} from "@/api/visitCost/deptTendency";
import {sectiontree} from "@/api/accountingDepartment";
import moment from "moment/moment";

const PERMISSION_CODE = 'visitCost:deptTendency'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
    deptLevel: dict_dept_level
  },
  copyQuery: {},
  query: {
    costType: '1',
    level: dict_dept_level[dict_dept_level.length - 1].value
  },
  list: [
    { label: '开始分析期间', value: 'startPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '结束分析期间', value: 'endPeriodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', clearable: false, required: true, type: 'select', list: 'deptLevel' },
    { label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '图形分析', event: () => analysisDetail() },
    { type: 'button', label: '导出', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() },
  ]
})
const BASE_FIELDLIST = [
  { label: '核算科室编码', value: 'deptCode', type: 'slot' },
  { label: '核算科室名称', value: 'deptName' },
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

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

watch(() => filterInfo.copyQuery.sectionIdList?.length, (val) => {
  const btns = filterInfo.btnList
  const analysisBtn = btns.find(it => it.label === '图形分析')
  analysisBtn.disabled = !val
}, { immediate: true })

onMounted(async () => {
  tableInfo.api = (params) => {
    return new Promise((resolve, reject) => {
      page(params).then(res => {
        if (res.success) {
          const data = res.data
          if (data.length > 0) {
            data.forEach(row => {
              row.details.forEach(it => {
                row[it.accountingPeriodId + 'cost'] = it.cost
                row[it.accountingPeriodId + 'costTrendRate'] = it.costTrendRate
              })
            })
            const details = data[0].details.slice(0, 20)
            tableInfo.fieldList = [
              ...BASE_FIELDLIST,
              ...details.map((it, index) => {
                let children = [
                  { label: '成本', value: it.accountingPeriodId + 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[it.accountingPeriodId + 'cost']) },

                ]
                if (index !== 0) {
                  children.push({ label: '增长率(%)', value: it.accountingPeriodId + 'costTrendRate', align: 'center' })
                }
                return { label: it.accountingPeriodName, type: 'multiHeader', children
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
        console.error(err)
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
    level: dict_dept_level[dict_dept_level.length - 1].value
  }
  await getDefaultPeriod()
  search()
}
function getDefaultPeriod() {
  return periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.query.startPeriodId = _data.id
    filterInfo.query.startPeriodName = _data.periodYearAndMonth
    filterInfo.query.endPeriodId = _data.id
    filterInfo.query.endPeriodName = _data.periodYearAndMonth
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
    sectionId: row.deptId
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
      filterInfo.query.endPeriodName = raw.periodYearAndMonth
    } else {
      filterInfo.query.startPeriodId = raw.id
      filterInfo.query.startPeriodName = raw.periodYearAndMonth
    }
  }
  openDialog(filterRef.value)
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemId = raw.id
    filterInfo.query.costItemName = raw.name
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
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !analysisInfo.visible">
      <div class="filter-wrapper">
        <page-filter
            ref="filterRef"
            :listTypeInfo="filterInfo.options"
            v-model:query="filterInfo.query"
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
          <template #filter-costItemName>
            <el-input
                v-model="filterInfo.query.costItemName"
                class="not-mongolia" placeholder="请选择成本项目" :disabled="true">
              <template #append><el-icon @click="openCostItemSelector"><Search /></el-icon></template>
            </el-input>
          </template>
        </page-filter>
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
        <template #col-deptCode="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ row.deptCode }}</span>
        </template>
      </table-container>
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
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query" />
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type" :query="detailInfo.query" />
  </div>
</template>

<style scoped lang="scss">

</style>