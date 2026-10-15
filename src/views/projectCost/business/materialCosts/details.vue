<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="物资成本详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('incomeData:update') &&
              basicInfo.data.status === '0'
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>基础信息</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="明细信息" />
          </div>
          <div class="model-panel-body">
            <!-- 条件栏 -->
            <PageFilter
                :isAddFlag="true"
                ref="dialogInfoRef"
                v-model:query="filterInfo.query"
                :filter-list="tableInfo.btnList"
            >
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
              <template #filter-productName>
                <el-input
                    v-model="filterInfo.query.productName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择物资信息"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openFinCategorySelector"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </PageFilter>
            <div class="flex_full_item">
              <el-form
                  ref="tableForm"
                  :model="tableInfo"
                  style="width: 100%">
                <!-- 表格 -->
                <page-table
                    :refresh="tableInfo.refresh"
                    :init-curpage="tableInfo.initCurpage"
                    v-model:data="tableInfo.data"
                    :pager="true"
                    :api="tableInfo.api"
                    :summary="false"
                    :tabIndex="true"
                    :check-box="false"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
                    :isDynamic="true"
                >
                </page-table>
              </el-form>
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
  <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :title="dialogInfo.title"
      :type="dialogInfo.type"
      @returnModify="initData"
  />

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
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";
import {
  itemProductCostdetail,
  itemProductCostDetailExcel,
  itemProductCostDetailpage
} from "@/api/materialCosts";

import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)

const { tableParameter, openDialog } = useSelectTableData()
const emits = defineEmits()
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
  },
  visible: false,
  flowFormType: '',
})
const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '核算期间', value: 'checkPeriodName' },
    { label: '总金额', value: 'totalMoney' },
    { label: '确认状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '',
  id: '',
  visible: false,
  type: '',
})

const filterInfo = ref({
  query: {
    itemProductCostId: props.id,
    orgId: setting.value.hospitalId,
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '物资编码', value: 'productCode' },
    { label: '物资名称', value: 'productName' },
    { label: '物资分类编码', value: 'productFinCategoryCode' },
    { label: '物资分类名称', value: 'productFinCategoryName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '是否收费', value: 'isChargeName' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '备注', value: 'remark' },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '科室信息', showLabel: true, value: 'deptName' },
    { type: 'slot', label: '物资信息', showLabel: true, value: 'productName' },
    { type: 'button', label: '查询', event: getList },
  ],
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  checkedList: [],
  query: {}
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    // 更新父组件visible
    emits('update:visible', val)
  },
})

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = itemProductCostDetailpage
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改物资成本'
  dialogInfo.value.visible = true
}
async function initData() {
  itemProductCostdetail({id: props.id}).then(({data}) => {
    basicInfo.value.data = data
    basicInfo.value.data.checkPeriodName = data.periodName
    getList()
  })
}

function exportData() {
  itemProductCostDetailExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}


function getList() {
  tableInfo.value.refresh = Math.random()
}
const dialogInfoRef = ref()
function openFinCategorySelector() {
  tableParameter.title = '物资信息'
  tableParameter.visible = true
  tableParameter.type = 'product'
  tableParameter.query = { status: '1' }
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}
function costItemCallback(raw) {
  filterInfo.value.query.productId = raw.id
  filterInfo.value.query.productName = raw.name
}

function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  const rows = raw.filter(it => !it.childList)
  filterInfo.value.query.deptIdList = rows.map(it =>it.id)
  filterInfo.value.query.deptName = rows.map(it => it.name).join(',')
}
</script>

<style scoped></style>
