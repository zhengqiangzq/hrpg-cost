<script setup>
import Modify from './modify.vue'
import {getCurrentInstance, ref} from "vue";
import {useUpload} from "@/hooks/useUpload";
import {exportCostDataDetail, oneCostData, pageCostDataDetail} from "@/api/diseaseCostItemStackCostData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PAGE_TITLE = '成本数据'
const PERMISSION_CODE = 'diseaseCostItemStackCostData'
const API = {
  query: oneCostData,
  queryDetail: pageCostDataDetail,
  export: exportCostDataDetail
}

const { proxy } = getCurrentInstance()

const {
  exportData
} = useUpload(API, null, null, null)
const {
  tableParameter,
  openDialog
} = useSelectTableData()

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
const basicInfo = reactive({
  data: {},
  fieldList: [
    { label: '单据号', value: 'orderNo' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '总金额', value: 'totalMoney' },
    { label: '确认状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = reactive({
  title: '',
  id: '',
  visible: false,
  type: '',
})

const filterInfoRef = ref()
const tableInfo = reactive({
  refresh: 1,
  initCurpage: 1,
  query: {},
  data: [],
  fieldList: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'capitalSourceName' },
    { label: '单位成本', value: 'price', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.price) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
  ],
  summaryFieldList: [
    { value: 'price', formatter: proxy.$fn.TripartiteMethod },
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '收费项目', showLabel: true, value: 'feeItemName' },
    { type: 'button', label: '查询', event: getList },
  ],
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
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.id = basicInfo.data.id
  dialogInfo.title = '修改成本数据'
  dialogInfo.visible = true
}

async function initData() {
  API.query(props.id).then(({data}) => {
    basicInfo.data = data
    getList()
  })
}

function getList() {
  tableInfo.api = API.queryDetail
  tableInfo.copyQuery = {
    ...tableInfo.query,
    feeItemName: undefined,
    orderId: props.id
  }
  tableInfo.refresh = Math.random()
}

function openFeeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.query = {
    status: '1',
    accountingStatus: 1
  }
  tableParameter.callBack = feeItemCallback
  const ref = filterInfoRef.value
  openDialog(ref)
}
function feeItemCallback(raw) {
  const form = tableInfo.query
  form.feeItemId = raw.id
  form.feeItemName = raw.name
}
</script>

<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          :title="PAGE_TITLE + '详情'"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission(`${PERMISSION_CODE}:update`) &&
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
            <p>{{ PAGE_TITLE }}</p>
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
                ref="filterInfoRef"
                v-model:query="tableInfo.query"
                :filter-list="tableInfo.btnList"
            >
              <template #filter-feeItemName>
                <el-input
                    v-model="tableInfo.query.feeItemName"
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
            </PageFilter>
            <div class="flex_full_item">
              <!-- 表格 -->
              <page-table
                  :refresh="tableInfo.refresh"
                  :init-curpage="tableInfo.initCurpage"
                  v-model:data="tableInfo.data"
                  :pager="true"
                  :api="tableInfo.api"
                  :summary="!!tableInfo.summaryFieldList.length"
                  :summaryFieldList="tableInfo.summaryFieldList"
                  :tabIndex="true"
                  :check-box="false"
                  :query="tableInfo.copyQuery"
                  :field-list="tableInfo.fieldList"
                  :handle="tableInfo.handle"
                  :isDynamic="true"
              >
              </page-table>
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
</template>

<style scoped></style>
