<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import {useStorage} from "@vueuse/core";
import {exportControlQuery, pageControlQuery} from "@/api/deptCost/controlQuery";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:targetConfig'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageControlQuery,
  export: exportControlQuery
}
const setting = useStorage('setting', {}, sessionStorage)

const {
  exportData,
} = useUpload(API)

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '目标方案', value: 'configName', showLabel: true, type: 'slot' },
    { label: '指标名称', value: 'indicatorsKeyword', type: 'input' },
    { label: '指标分类', value: 'classificationName', showLabel: true, type: 'slot' },
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
    { label: '目标方案', value: 'configName' },
    { label: '开始会计期间', value: 'startPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '指标代码', value: 'indicatorsCode' },
    { label: '指标名称', value: 'indicatorsName' },
    { label: '所属指标分类', value: 'classificationName' },
    { label: '目标值', value: 'targetValue', align: 'center' },
    { label: '执行值', value: 'execValue', align: 'center' },
    { label: '差异值', value: 'diffValue', align: 'center' },
    { label: '执行率(%)', value: 'execRate', align: 'center' },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const selectClassification = reactive({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

const { tableParameter, openDialog } = useSelectTableData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function openSelectConfig() {
  tableParameter.type = 'targetConfig'
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    filterInfo.query.configId = raw.id
    filterInfo.query.configName = raw.name
  }
  openDialog(filterRef.value)
}

function openSelectClassification() {
  selectClassification.visible = true
}
function selectClassificationCallback(raw) {
  filterInfo.query.classificationId = raw.id
  filterInfo.query.classificationName = raw.name
}
</script>

<template>
<!-- 成本控制查询 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-configName>
              <el-input
                  v-model="filterInfo.query.configName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择目标方案"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openSelectConfig"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-classificationName>
              <el-input
                  v-model="filterInfo.query.classificationName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择指标分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openSelectClassification"><Search /></el-icon>
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
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :summary="true"
            :check-box="false"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
          <template #col-code="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.code }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <SelectIndicatorsClassification
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        :checkStrictly="true"
        :check-box="false"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectIndicatorsClassification>
  </div>
</template>

<style scoped lang="scss">

</style>
