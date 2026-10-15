<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="科室成本数据详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('deptMedicalIncome:update') &&
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
            <p>收入数据</p>
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
                    placeholder="请选择核算科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector"><Search /></el-icon>
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
                    :query="filterInfo.copyQuery"
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
import {getCurrentInstance, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {oneGeneralLedgerDataDeptCostData, pageGeneralLedgerDataDeptCostDataDetail} from "@/api/generalLedgerDataDeptCostData";
import moment from "moment/moment";

const { proxy } = getCurrentInstance()

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
    { label: '单据号', value: 'docNum', },
    { label: '业务日期', value: 'docTime', formatter: (row) => moment(row.docTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriodName' },
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
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

const filterInfo = ref({
  query: {
    deptIncomeId: props.id
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  query: {},
  data: [],
  fieldList: [
    // { label: '摘要', value: 'remark' },
    // { label: '凭证号', value: 'voucher' },
    { label: '会计科目', value: 'accountName', formatter: (row) => row.accountCode + '-' + row.accountName },
    { label: '核算科室', value: 'deptName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '金额', value: 'money', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
  ],
  btnList: [
    { type: 'slot', label: '核算科室', showLabel: true, show: !!props.id, value: 'deptName' },
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
    tableInfo.value.api = pageGeneralLedgerDataDeptCostDataDetail
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改科室成本数据'
  dialogInfo.value.visible = true
}
async function initData() {
  oneGeneralLedgerDataDeptCostData(props.id).then(({data}) => {
    basicInfo.value.data = data
    getList()
  })
}
function openDeptSelector() {
  treeInfo.value.title = '科室'
  treeInfo.value.checkBox = true
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  filterInfo.value.query.deptIdIn = raw.map(it => it.id).join(',')
  filterInfo.value.query.deptName = raw.map(it => it.name).join(',')
}

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    deptName: undefined
  }
  tableInfo.value.refresh = Math.random()
}
</script>

<style scoped></style>
