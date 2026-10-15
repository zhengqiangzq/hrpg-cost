<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="title"
        v-model="state.dialogVisible"
        custom-class="page-dialog"
        :close-on-click-modal="false"
        :modal="false"
        @close="cancel"
    >
      <div class="model-panel-body paddingBox order-model-formBox flex_wrap_start_start" v-if="state.dialogVisible">
        <page-form
            ref="pageFormRef"
            v-model:ref-obj="formRef"
            :data="state.data"
            :field-list="state.fieldList"
            :rules="state.rules"
            :label-width="state.labelWidth">
          <template #form-deptCode>
            <el-input
                v-model="state.data.deptCode"
                type="input"
                placeholder="请选择科室编码"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-costItemName>
            <el-input
                v-model="state.data.costItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择成本项目"
            >
              <template #append>
                <el-icon @click="openProjectSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="userUpdate">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <SelectProDeptTree
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
<script setup>
import {ref, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

import {itemCostDetailadd, itemCostDetailupdate} from "@/api/costProData";
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  colTemplate: 1,
  tableRow: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()

const { tableParameter, openDialog } = useSelectTableData()
const pageFormRef = ref()
const formRef = ref()

const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: [
    {label: '科室编码', span: 12, value: 'deptCode', type: 'slot'},
    {label: '科室名称', span: 12, value: 'deptName', type: 'input', disabled: true},
    {label: '成本项目', span: 12, value: 'costItemName', type: 'slot' },
    { label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source' },
    // { label: '是否项目核算', value: 'itemAccountStatus', type: 'select-model', code: 'yes_or_no' },
    {label: '直接成本', span: 12, value: 'directAmount', type: 'money'},
    {label: '间接成本', span: 12, value: 'indirectAmount', type: 'money'},
  ],
  data: {},
  rules: {
    deptCode: [{ required: true, message: '请选择科室编码', trigger: 'blur'}],
    costItemName: [{ required: true, message: '请选择成本项目', trigger: 'blur'}],
    fundSource: [{ required: true, message: '请选择资金来源', trigger: 'blur'}],
    directAmount: [{ required: true, message: '请输入直接成本', trigger: 'blur'}],
    indirectAmount: [{ required: true, message: '请输入间接成本', trigger: 'blur'}],
  },
})
const emit = defineEmits()

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.data = Object.assign(state.data, val)
    },
    {
      immediate: true,
    }
)

function cancel() {
  state.dialogVisible = false
  state.data = {}
  emit('callback', false)
}
function userUpdate() {
  const id = props.tableRow.id
  //新增or编辑用户
  const api = id ? itemCostDetailupdate : itemCostDetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      state.data.totalMoney = Number(state.data.directAmount) + Number(state.data.indirectAmount)
      state.data.totalMoney = state.data.totalMoney.toFixed(2)
      if (!state.data.itemCostId) {
        state.dialogVisible = false
        const data = JSON.parse(JSON.stringify(state.data))
        emit('callback', data)
        return
      }
      api(state.data).then(({code}) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    }
  })
}

const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {}
})
// 科室
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
    state.data.deptId = raw.id
    state.data.deptCode = raw.code
    state.data.deptName = raw.name
}

// 成本项目
function openProjectSelector() {
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.type = 'costItem'
  tableParameter.query = {
    itemAccountStatus: '1',
    last: true,
  }

  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'name' }
  ]
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  state.data.costItemId = raw.id
  state.data.costItemCode = raw.code
  state.data.costItemName = raw.name
  state.data.itemAccountStatus = raw.itemAccountStatus
  state.data.itemAccountStatusName = raw.itemAccountStatusName
}
</script>
