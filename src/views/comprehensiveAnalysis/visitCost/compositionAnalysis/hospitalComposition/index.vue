<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import detail from './detail.vue'
import Analysis from "./analysis.vue";
import {periodMonthByDate} from "@/api/base";
import {page, exportAnalysis} from "@/api/visitCost/hospitalComposition";
import {sectiontree} from "@/api/accountingDepartment";
import moment from "moment";

const PERMISSION_CODE = 'visitCost:hospitalComposition'
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
    level: dict_dept_level[dict_dept_level.length - 1].value,
  },
  list: [
    {label: '分析期间', value: 'periodName', required: true, showLabel: true, type: 'slot'},
    {label: '核算科室', value: 'sectionName', showLabel: true, type: 'slot'},
    {label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel'},
    {label: '成本类型', value: 'costType', clearable: false, required: true, type: 'select', list: 'costType'},
    {type: 'button', label: '查询', btType: 'primary', event: search,},
    {type: 'button', label: '重置', btType: 'primary', event: reset,},
  ],
  btnList: [
    {type: 'button', label: '图形分析', event: () => analysisDetail()},
    {type: 'button', label: '导出', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData()},
  ]
})
const tableInfo = reactive({
  api: null,
  refresh: 1,
  fieldList: [
    {label: '核算科室编码', value: 'sectionCode'},
    {label: '核算科室名称', value: 'sectionName'},
    {label: '诊次成本', value: 'unitCost', type: 'slot', headAlign: 'center', align: 'right'},
    {
      label: '人员经费', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'personnelExpensesUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.personnelExpensesUnitCost)
        },
        {
          label: '占比(%)',
          value: 'personnelExpensesPercent', align: 'center'
        },
      ]
    },
    {
      label: '药品费', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'drugUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.drugUnitCost)
        },
        {
          label: '占比(%)',
          value: 'drugPercent', align: 'center'
        },
      ]
    },
    {
      label: '卫生材料费', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'healthMaterialUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.healthMaterialUnitCost)
        },
        {
          label: '占比(%)',
          value: 'healthMaterialPercent', align: 'center'
        },
      ]
    },
    {
      label: '固定资产折旧费', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'fixedAssetsDepreciationUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.fixedAssetsDepreciationUnitCost)
        },
        {
          label: '占比(%)',
          value: 'fixedAssetsDepreciationPercent', align: 'center'
        },
      ]
    },
    {
      label: '无形资产摊销费', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'intangibleAssetsAmortizationUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.intangibleAssetsAmortizationUnitCost)
        },
        {
          label: '占比(%)',
          value: 'intangibleAssetsAmortizationPercent', align: 'center'
        },
      ]
    },
    {
      label: '计提风险医疗基金', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'medicalVentureFundUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.medicalVentureFundUnitCost)
        },
        {
          label: '占比(%)',
          value: 'medicalVentureFundPercent', align: 'center'
        },
      ]
    },
    {
      label: '其他医疗费用', type: 'multiHeader', children: [
        {
          label: '成本',
          value: 'otherUnitCost',
          headAlign: 'center',
          align: 'right',
          formatter: row => proxy.$fn.TripartiteMethod(row.otherUnitCost)
        },
        {
          label: '占比(%)',
          value: 'otherPercent', align: 'center'
        },
      ]
    },
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
const {tableParameter, openDialog} = useSelectTableData()

onMounted(async () => {
  tableInfo.api = page
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
    level: dict_dept_level[dict_dept_level.length - 1].value,
  }
  await getDefaultPeriod()
  search()
}

function getDefaultPeriod() {
  return periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.query.periodId = _data.id
    filterInfo.query.periodName = _data.periodYearAndMonth
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
    sectionId: row.sectionId
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

function openAccountingPeriodSelector() {
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.periodId = raw.id
    filterInfo.query.periodName = raw.periodYearAndMonth
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
          <template #filter-periodName>
            <el-input
                v-model="filterInfo.query.periodName"
                class="not-mongolia" placeholder="请选择分析期间" :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountingPeriodSelector">
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-sectionName>
            <el-input
                v-model="filterInfo.query.sectionName"
                class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
              <template #append>
                <el-icon @click="openDeptSelector">
                  <Search/>
                </el-icon>
              </template>
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
        <template #col-unitCost="{ row }">
          <span class="slip-edit" @click="detailCost(row)">{{ $fn.TripartiteMethod(row.unitCost || '') }}</span>
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
        @callback="treeCallback"/>
    <analysis v-if="analysisInfo.visible" v-model:visible="analysisInfo.visible" :query="analysisInfo.query"/>
    <detail v-if="detailInfo.visible" v-model:visible="detailInfo.visible" :type="detailInfo.type"
            :query="detailInfo.query"/>
  </div>
</template>

<style scoped lang="scss">

</style>