<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

import {exportDetailListKeyFactorsValue, pageDetailListKeyFactorsValue} from "@/api/projectCost/keyFactorsValue";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const setting = useStorage('setting', {}, sessionStorage)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const pageFilterRef = ref()
const filterInfo = ref({
  query: {
  },
  data: {
  },
  list: [
    {label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot', event: getList},
    { label: '关键因素', value: 'keyFactorSettingName', showLabel: true, type: 'slot' },
    { label: '科室名称', value: 'deptName', showLabel: true, type: 'slot' },
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
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '开始会计期间', value: 'beginPeriodMth' },
    { label: '结束会计期间', value: 'endPeriodMth' },
    { label: '关键因素', value: 'keyFactorSettingName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '关键因素值', value: 'value' },
  ],
  summaryFieldList: [
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

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.value.api = pageDetailListKeyFactorsValue
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
  }
  getList()
}

function exportData() {
  exportDetailListKeyFactorsValue(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
const deptInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
function openDeptSelector() {
  deptInfo.value.visible = true
}
function treedeptCallback(raw) {
  deptInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptName = datas?.map((it) => it.name).join(',');
  filterInfo.value.query.deptIdIn = datas?.map((it) => it.id).join(',');
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.callBack = (raw) => {
    filterInfo.value.query.accountingPeriodId = raw.id
    filterInfo.value.query.accountingPeriodName = raw.name
  }
  tableParameter.visible = true
  openDialog(pageFilterRef.value)
}

function openKeyFactorsSelector() {
  tableParameter.type = 'keyFactors'
  tableParameter.title = '关键因素'
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    filterInfo.value.query.keyFactorSettingId = raw.id
    filterInfo.value.query.keyFactorSettingName = raw.name
  }
  tableParameter.visible = true
  openDialog(pageFilterRef.value)
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
            <template #filter-keyFactorSettingName>
              <el-input
                  v-model="filterInfo.query.keyFactorSettingName"
                  class="not-mongolia"
                  placeholder="请选择关键因素"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openKeyFactorsSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  placeholder="请选择核算科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
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
        v-if="deptInfo.visible"
        v-model:showDialog="deptInfo.visible"
        :title="deptInfo.title"
        :checkStrictly="deptInfo.checkStrictly"
        :isLeaf="deptInfo.isLeaf"
        :query="deptInfo.query"
        :checkBox="deptInfo.checkBox"
        :api="deptInfo.api"
        :highlight-current="true"
        @callback="treedeptCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
