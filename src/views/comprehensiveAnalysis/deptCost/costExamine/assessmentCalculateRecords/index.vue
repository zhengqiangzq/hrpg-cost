<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import {sectiontree} from "@/api/accountingDepartment";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {errorMessage} from "@/views/comprehensiveAnalysis/common/messageUtil";
import {
  exportAssessmentCalculateRecords,
  pageAssessmentCalculateRecords
} from "@/api/deptCost/assessmentCalculateRecords";
import Detail from "./detail.vue";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:assessmentCalculateRecords'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageAssessmentCalculateRecords,
  export: exportAssessmentCalculateRecords
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
    costKind: '1',
    forecastMethod: '0'
  },
  copyQuery: {},
  list: [
    { label: '考核方案', value: 'schemeName', showLabel: true, required: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
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
    { label: '考核方案', value: 'schemeName' },
    { label: '核算科室', value: 'deptName' },
    { label: '开始会计期间', value: 'startPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '考核得分', value: 'score', type: 'slot', align: 'center' },
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
const detailInfo = reactive({
  visible: false,
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
  tableParameter.type = 'assessmentScheme'
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

function detail(row) {
  detailInfo.schemeId = row.schemeId
  detailInfo.deptId = row.deptId
  detailInfo.visible = true
}
</script>

<template>
<!-- 成本考核分析 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible">
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
                  placeholder="请选择考核方案"
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
        <template #col-score="{ row }">
          <span class="slip-edit" @click="detail(row)">{{ row.score }}</span>
        </template>
      </table-container>
    </div>
    <Detail
        v-if="detailInfo.visible"
        :schemeId="detailInfo.schemeId"
        :deptId="detailInfo.deptId"
        v-model:visible="detailInfo.visible"
        @returnBack="getList"
    ></Detail>
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
  </div>
</template>

<style scoped lang="scss">

</style>
