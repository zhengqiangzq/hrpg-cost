<script setup>
import Modify from './modify.vue'
import {getCurrentInstance, ref} from "vue";
import {useUpload} from "@/hooks/useUpload";
import {exportParamsDataDetail, oneParamsData, pageParamsDataDetail} from "@/api/DRGCostServiceUnitParamsData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PAGE_TITLE = '参数数据'
const PERMISSION_CODE = 'DRGCostServiceUnitParamsData'
const API = {
  query: oneParamsData,
  queryDetail: pageParamsDataDetail,
  export: exportParamsDataDetail
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
    { label: '归集参数', value: 'apportionmentParamName' },
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
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.copyQuery), },
    { type: 'slot', label: '服务单元', showLabel: true, value: 'serviceUnitName' },
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
  dialogInfo.title = '修改参数数据'
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
    serviceUnitName: undefined,
    orderId: props.id
  }
  tableInfo.refresh = Math.random()
}

function openServiceUnitSelector() {
  tableParameter.type = 'DRGServiceUnit'
  tableParameter.query = {
    status: '1'
  }
  tableParameter.callBack = serviceUnitCallback
  const ref = filterInfoRef.value
  openDialog(ref)
}
function serviceUnitCallback(raw) {
  const form = tableInfo.query
  form.serviceId = raw.id
  form.serviceUnitName = raw.name
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
              <template #filter-serviceUnitName>
                <el-input
                    v-model="tableInfo.query.serviceUnitName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择服务单元"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openServiceUnitSelector"><Search /></el-icon>
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
