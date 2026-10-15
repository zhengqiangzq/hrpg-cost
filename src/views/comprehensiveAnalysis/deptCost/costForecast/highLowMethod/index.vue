<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import {sectiontree} from "@/api/accountingDepartment";
import {exportHighLowMethod, pageHighLowMethod} from "@/api/deptCost/highLowMethod";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:highLowMethod'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageHighLowMethod,
  export: exportHighLowMethod
}

const {
    exportData,
} = useUpload(API)

const filterInfoRef = ref()
const filterInfo = reactive({
  options: {
    costType: dict_cost_type,
  },
  query: {
    costKind: '1'
  },
  copyQuery: {},
  list: [
    { label: '预测方案', value: 'schemeName', showLabel: true, required: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '成本类型', value: 'costKind', clearable: false, required: true, type: 'select', list: 'costType' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '预测方案', value: 'schemeName' },
    { label: '预测年度', value: 'year' },
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '业务量预算', value: 'workload', align: 'center' },
    { label: '上年最高期间业务量', value: 'maxWorkload', align: 'center' },
    { label: '上年最高期间成本', value: 'maxCostValue', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.maxCostValue) },
    { label: '上年最低期间业务量', value: 'minWorkload', align: 'center' },
    { label: '上年最低期间成本', value: 'minCostValue', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.minCostValue) },
    { label: '最终成本预测', value: 'forecastValue', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.forecastValue) },
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
  checkStrictly: true,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {}
})

const { tableParameter, openDialog } = useSelectTableData()

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  for (const field of filterInfo.list.filter(field => field.required)) {
    if (!filterInfo.query[field.value]) {
      proxy.$message.warning(errorMessage(field))
      return
    }
  }
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    deptName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
}

function openSchemeSelector() {
  tableParameter.type = 'forecastScheme'
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    filterInfo.query.schemeId = raw.id
    filterInfo.query.schemeName = raw.name
  }
  openDialog(filterInfoRef.value)
}

function openDeptSelector(cache) {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
  deptTreeInfo.cache = cache
}
function treeCallback(raw) {
  const row = deptTreeInfo.cache
  row.deptIdIn = raw.map(it => it.id).join(',')
  row.deptName = raw.map(it => it.name).join(',')
}
</script>

<template>
<!-- 高低点法预测 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterInfoRef"
              :listTypeInfo="filterInfo.options"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-schemeName>
              <el-input
                  v-model="filterInfo.query.schemeName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择预测方案"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openSchemeSelector"><Search /></el-icon>
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
                  <el-icon @click="openDeptSelector(filterInfo.query)"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
      </div>
      <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :check-box="false"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
      >
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
        :accountAttribute="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
