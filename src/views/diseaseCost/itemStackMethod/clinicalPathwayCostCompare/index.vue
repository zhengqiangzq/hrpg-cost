<!-- 临床路径下成本对比 -->
<script setup name="clinicalPathwayCostCompare">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {
    exportClinicalPathwayCostCompare,
    pageClinicalPathwayCostCompare
} from "@/api/diseaseCost/clinicalPathwayCostCompare";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {sectiontree} from "@/api/accountingDepartment";
import DetailList from "./detailList.vue";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'clinicalPathwayCostCompare'
const API = {
  query: pageClinicalPathwayCostCompare,
  export: exportClinicalPathwayCostCompare
}

const dict_cost_type = [
    { key: '医疗成本', value: '1' },
    { key: '医疗全成本', value: '2' },
    { key: '医院全成本', value: '3' },
]

const { tableParameter, openDialog } = useSelectTableData()
const filterRef = ref()
const filterInfo = reactive({
  query: {
      costType: '1'
  },
  copyQuery: {},
    options: {
      dict_cost_type
    },
  list: [
    { type: 'slot', showLabel: true, label: '核算期间', required: true, value: 'accountingPeriod' },
    { type: 'slot', showLabel: true, label: '核算科室', value: 'deptName' },
    { type: 'slot', showLabel: true, label: '临床路径', value: 'wayName' },
    { type: 'select', list: 'dict_cost_type', clearable: false, label: '成本类型', value: 'costType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
      { type: 'button', btType: 'primary', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData }
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '临床路径编码', value: 'wayCode', type: 'slot' },
    { label: '临床路径名称', value: 'wayName' },
    { label: '本院临床路径', type: 'multiHeader', children: [
            { label: '总成本', value: 'allCost', align: 'right' },
            { label: '病例数', value: 'num', align: 'right' },
            { label: '例均成本', value: 'avgCost', align: 'right' },
        ] },
    { label: '标准临床路径', type: 'multiHeader', children: [
            { label: '总成本', value: 'allCostWay', align: 'right' },
            { label: '病例数', value: 'numWay', align: 'right' },
            { label: '例均成本', value: 'avgCostWay', align: 'right' },
        ] },
    { label: '例均成本增长率(%)', value: 'growthRate', align: 'center' },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

// 核算科室
const deptTreeInfo = reactive({
    title: '核算科室',
    visible: false,
    checkBox: false,
    checkStrictly: false,
    isLeaf: false,
    mark: null,
    api: sectiontree,
    query: {}
})
const detailListInfo = ref({
    visible: false
})

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  if(!filterInfo.query.accountingPeriod) return proxy.$message.warning('请选择核算期间')
  filterInfo.copyQuery = {
      ...filterInfo.query
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
      costType: '1'
  }
}

// 导出数据
function exportData() {
  API.export(filterInfo.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function detail(row) {
    detailListInfo.value.mainQuery = {
        wayId: row.wayId,
        costType: filterInfo.copyQuery.costType,
        accountingPeriodId: filterInfo.copyQuery.accountingPeriodId,
    }
    detailListInfo.value.visible = true
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openAccountingPeriod() {
    tableParameter.type = 'diseasePeriod'
    tableParameter.query = {}
    tableParameter.callBack = (raw) => {
        filterInfo.query.accountingPeriodId = raw.id
        filterInfo.query.accountingPeriod = raw.name
    }
    openDialog(filterRef.value)
}
function openClinicalPathway() {
    tableParameter.type = 'clinicalPathway'
    tableParameter.query = {}
    tableParameter.callBack = (raw) => {
        filterInfo.query.wayId = raw.id
        filterInfo.query.wayName = raw.wayName
    }
    openDialog(filterRef.value)
}
function openDeptSelector() {
    deptTreeInfo.visible = true
}
function treeCallback(raw) {
    filterInfo.query.deptId = raw.id;
    filterInfo.query.deptName = raw.name;
}
function checkPropCondition(it) {
    return (it.accountAttribute == 1) && (it.diseaseAccountStatus == 1) && (it.sectionAttribute != 1)
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailListInfo.visible">
      <div class="layui-card-body">
<!--        <div class="titleTab">-->
<!--          <div class="tab currentTab">列表页</div>-->
<!--          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>-->
<!--        </div>-->
<!--        <div>-->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :listTypeInfo="filterInfo.options"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
              <template #filter-accountingPeriod>
                  <el-input
                      v-model="filterInfo.query.accountingPeriod"
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
              <template #filter-deptName>
                  <el-input
                      v-model="filterInfo.query.deptName"
                      class="not-mongolia"
                      type="input"
                      placeholder="请选择核算科室"
                      :disabled="true"
                  >
                      <template #append>
                          <el-icon @click="openDeptSelector"><Search /></el-icon>
                      </template>
                  </el-input>
              </template>
              <template #filter-wayName>
                  <el-input
                      v-model="filterInfo.query.wayName"
                      class="not-mongolia"
                      type="input"
                      placeholder="请选择临床路径"
                      :disabled="true"
                  >
                      <template #append>
                          <el-icon @click="openClinicalPathway"><Search /></el-icon>
                      </template>
                  </el-input>
              </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
<!--        </div>-->
      </div>
      <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :checkBox="false"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
      >
          <template #col-wayCode="{ row }">
              <span class="slip-edit" @click="detail(row)">{{ row.wayCode }}</span>
          </template>
      </table-container>
    </div>
      <DetailList
          v-if="detailListInfo.visible"
          v-model:visible="detailListInfo.visible"
          :main-query="detailListInfo.mainQuery"
          @callback="getList"
      ></DetailList>
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
          :accountAttribute="1"
          :diseaseAccountStatus="1"
          :sectionAttributeNot="1"
          :highlight-current="true"
          @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
