<script setup>
import {onMounted} from "vue";
import {
  secondAllocationexportExcel,
  secondAllocation,
  secondAllocationpage,
  secondAllocationquery
} from "@/api/accountingDepartment";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const filterInfo = ref({
  query: {
  },
  list: [
    { label: '成本来源', value: 'costSource', type: 'select-model', code: 'cost_source', event: getList },
    { label: '源科室', value: 'sourceSectionName', showLabel: true, type: 'slot', event: getList },
    { label: '承担科室', value: 'targetSectionName', showLabel: true, type: 'slot', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '成本来源', value: 'costSource' },
    { label: '源科室编码', value: 'sourceSectionCode' },
    { label: '源科室名称', value: 'sourceSectionName' },
    { label: '承担科室编码', value: 'targetSectionCode' },
    { label: '承担科室名称', value: 'targetSectionName' },
    { label: '参数值', value: 'param' },
  ],
  summaryFieldList: [
    { value: 'param', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
const pageFilterRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.value.api = secondAllocationquery
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}


function exportData() {
  secondAllocationexportExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector() {
  treeInfo.value.title = '源科室'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  if(treeInfo.value.title === '源科室') {
    filterInfo.value.query.sourceSectionId = raw.id
    filterInfo.value.query.sourceSectionName = raw.name
  } else {
    filterInfo.value.query.targetSectionId = raw.id
    filterInfo.value.query.targetSectionName = raw.name
  }
}
function openCostItemSelector() {
  treeInfo.value.title = '承担科室'
  treeInfo.value.visible = true
}
</script>

<template>
  <div class="view-fill">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <PageFilter
              ref="pageFilterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-sourceSectionName>
              <el-input
                  v-model="filterInfo.query.sourceSectionName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择源科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-targetSectionName>
              <el-input
                  v-model="filterInfo.query.targetSectionName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择承担科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
          <el-button @click="showDialog = false">单据页</el-button>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            :checkBox="false"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
        </table-container>
      </div>
    </div>
<!--    查询科室-->
    <SelectDeptArchivesTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
