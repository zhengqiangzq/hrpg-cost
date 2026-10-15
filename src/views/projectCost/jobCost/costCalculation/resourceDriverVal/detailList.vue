<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

import {
  itemResourceDriverValueexportExcel,
  itemResourceDriverValuequeryrtDetailListPage,
} from "@/api/resourceDriverVal";
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
    { label: '核算期间', value: 'checkPeriodName', showLabel: true, type: 'slot' },
    { label: '资源动因', value: 'resourceDriverName', showLabel: true, type: 'slot' },
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '作业字典', value: 'itemJobName', showLabel: true, type: 'slot' },
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
    { label: '核算期间', value: 'checkPeriodName' },
    { label: '开始会计期间', value: 'beginPeriodMth' },
    { label: '结束会计期间', value: 'endPeriodMth' },
    { label: '资源动因', value: 'resourceDriverName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '作业编码', value: 'itemJobCode' },
    { label: '作业名称', value: 'itemJobName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
    { label: '备注', value: 'cremark' },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
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
  tableInfo.value.api = itemResourceDriverValuequeryrtDetailListPage
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
  filterInfo.value.query.checkPeriodId = raw.id
  filterInfo.value.query.checkPeriodName = raw.name
}


function openresourcePeriodSelector() {
  tableParameter.title = '资源动因'
  tableParameter.filters = null
  tableParameter.pager = false
  tableParameter.callBack = resourceCallback
  tableParameter.type = 'driverresource'
  openDialog(pageFilterRef.value, 'table')
}
function resourceCallback(raw) {
  filterInfo.value.query.resourceDriverId = raw.id
  filterInfo.value.query.resourceDriverName = raw.name
}

function openjobSelector() {
  tableParameter.title = '作业字典'
  tableParameter.filters = null
  tableParameter.pager = false
  tableParameter.callBack = jobCallback
  tableParameter.type = 'itemjob'
  openDialog(pageFilterRef.value, 'table')
}
function jobCallback(raw) {
  filterInfo.value.query.itemJobId = raw.id
  filterInfo.value.query.itemJobName = raw.name
}

function exportData() {
  itemResourceDriverValueexportExcel(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function opendeptSelector() {
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
            <template #filter-resourceDriverName>
              <el-input
                  v-model="filterInfo.query.resourceDriverName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择资源动因"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openresourcePeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-checkPeriodName>
              <el-input
                  v-model="filterInfo.query.checkPeriodName"
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
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择科室信息"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="opendeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-itemJobName>
              <el-input
                  v-model="filterInfo.query.itemJobName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择作业"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openjobSelector"><Search /></el-icon>
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
