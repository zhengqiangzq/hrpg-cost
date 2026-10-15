<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="核算方法参数详情"
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
              <template #filter-feeItemName>
                <el-input
                    v-model="filterInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择收费项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openCostItemSelector"><Search /></el-icon>
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
                    :pager="false"
                    :api="tableInfo.api"
                    :summary="false"
                    :tabIndex="true"
                    :check-box="false"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
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
</template>

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";

import {useStorage} from "@vueuse/core";
import {indirectModelPramdetail, indirectModelPramdetailPage} from "@/api/accountingMethod";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";

const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)

const {tableParameter, openDialog} = useSelectTableData()
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
    {label: '单据号', value: 'docNum'},
    {label: '核算期间', value: 'itemAccountingPeriodName'},
    {label: '核算方法', value: 'itemParamIndirectModelName'},
    {label: '总参数值', value: 'value'},
    {label: '确认状态', value: 'statusValue'},
    {label: '备注', value: 'remark'},
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
    {label: '科室编码', value: 'deptCode'},
    {label: '科室名称', value: 'deptName'},
    {label: '收费项目编码', value: 'feeItemCode'},
    {label: '收费项目名称', value: 'feeItemName'},
    {label: '参数值', value: 'value', align: 'center'},
  ],
  btnList: [
    {type: 'slot', label: '收费项目', showLabel: true, value: 'feeItemName'},
    {type: 'button', label: '查询', event: getList},
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
const AllTableData = ref([])

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = indirectModelPramdetailPage
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}

// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改核算方法参数'
  dialogInfo.value.visible = true
}

async function initData() {
  indirectModelPramdetail(props.id).then(res => {
    basicInfo.value.data = res.data
    tableInfo.value.data = res.data.detailList
    AllTableData.value = res.data.detailList
  })
}

function getList() {
  const allData = JSON.parse(JSON.stringify(AllTableData.value))
  if(!filterInfo.value.query.feeItemId) return tableInfo.value.data = allData;
  tableInfo.value.data = allData && allData.filter((it) => it.feeItemId === filterInfo.value.query.feeItemId)
}

const dialogInfoRef = ref()

function openCostItemSelector() {
  tableParameter.title = '收费项目'
  tableParameter.visible = true
  tableParameter.type = 'feeItem'
  tableParameter.query = {status: 1}
  tableParameter.filters = [
    {type: 'input', label: '编码/名称', value: 'keyword'}
  ]
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value, 'table')
}

function costItemCallback(raw) {
  filterInfo.value.query.feeItemId = raw.id
  filterInfo.value.query.feeItemName = raw.name
}
</script>

<style scoped></style>
