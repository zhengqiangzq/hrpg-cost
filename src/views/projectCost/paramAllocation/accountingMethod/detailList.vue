<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

import {indirectModelPramdetailPage, indirectModelPramexportDetailExcel} from "@/api/accountingMethod";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const setting = useStorage('setting', {}, sessionStorage)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId,
  },
  data: {
  },
  list: [
    { label: '核算期间', value: 'itemAccountingPeriodName', showLabel: true, type: 'slot', event: getList },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot', event: getList },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot', event: getList },
    { label: '核算方法', value: 'itemParamIndirectModelName', showLabel: true, type: 'slot', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('costData:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '核算期间', value: 'itemAccountingPeriodName' },
    { label: '核算方法', value: 'itemParamIndirectModelName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '参数值', value: 'value', align: 'center' },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'value', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
const { tableParameter, openDialog } = useSelectTableData()

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
  tableInfo.value.api = indirectModelPramdetailPage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    orgId: setting.value.hospitalId,
  }
  getList()
}

function openAccountingPeriodSelector() {
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.callBack = accountingPeriodCallback
  openDialog(pageFilterRef.value)
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.itemAccountingPeriodId = raw.id
  filterInfo.value.query.itemAccountingPeriodName = raw.name
}


function openFeeItemSelector() {
  tableParameter.title = '收费项目'
  tableParameter.visible = true
  tableParameter.checkBox = true
  tableParameter.pager = true
  tableParameter.type = 'feeItem'
  tableParameter.query = { status: 1, feeCategoryId: filterInfo.value.data?.feeCategoryId }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFilterRef.value, 'table')
}
function feeItemCallback(raw) {
  tableParameter.checkedList = raw;
  filterInfo.value.query.feeItemIdList = raw.map((it) => it.id)
  filterInfo.value.query.feeItemName = raw.map((it) => it.name).join(',')
}

function openIndirectSelector() {
  tableParameter.title = '间接模型'
  tableParameter.pager = false
  tableParameter.type = 'indirectModel'
  tableParameter.callBack = IndirectCallback
  openDialog(pageFilterRef.value, 'table')
}
function IndirectCallback(raw) {
  filterInfo.value.query.itemParamIndirectModelId = raw.id
  filterInfo.value.query.itemParamIndirectModelName = raw.name
}
function exportData() {
  indirectModelPramexportDetailExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector() {
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
}
</script>

<template>
  <div class="view-fill">
    <div class="layui-card layui-col-md12" v-if="!detailsInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="pageFilterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-feeItemName>
              <el-input
                  v-model="filterInfo.query.feeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-itemAccountingPeriodName>
              <el-input
                  v-model="filterInfo.query.itemAccountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-itemParamIndirectModelName>
              <el-input
                  v-model="filterInfo.query.itemParamIndirectModelName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算方法"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openIndirectSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择科室信息"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
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
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :check-box="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
        </table-container>
      </div>
    </div>
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <SelectProDeptTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
