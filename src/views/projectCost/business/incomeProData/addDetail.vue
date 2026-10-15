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
          <template #form-feeItemName>
            <el-input
                v-model="state.data.feeItemName"
                :class="{ 'not-mongolia': !id }"
                type="input"
                placeholder="请选择分摊参数"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openFeeItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-executeDeptName>
            <el-input
                v-model="state.data.executeDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择执行科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector('')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-orderDeptName>
            <el-input
                v-model="state.data.orderDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择开单科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector('order')"><Search /></el-icon>
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
import {itemdeptIncomedetailadd, itemdeptIncomedetailupdate} from "@/api/incomeProData";

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

const pageFormRef = ref()
const formRef = ref()

const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: [
    {label: '收费项目', span: 12, value: 'feeItemName', type: 'slot'},
    {label: '收费类别', span: 12, value: 'feeCategoryName', type: 'input', disabled: true},
    {label: '开单科室', span: 12, value: 'orderDeptName', type: 'slot'},
    {label: '执行科室', span: 12, value: 'executeDeptName', type: 'slot'},
    {label: '金额', span: 12, value: 'money', type: 'money'},
    {label: '数量', span: 12, value: 'qty', type: 'number'},
    {label: '备注', span: 12, value: 'remark', type: 'input'},
  ],
  data: {},
  rules: {
    feeItemName: [{ required: true, message: '请选择收费项目'}],
    orderDeptName: [{ required: true, message: '请选择开单科室'}],
    executeDeptName: [{ required: true, message: '请选择执行科室'}],
    money: [{ required: true, message: '请输入金额'}],
    qty: [
      { required: true, message: '请输入数量'},
      { pattern: /^[1-9].*$/, message: '数量需要大于零', trigger: 'blur' }
    ],
  },
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {}
})
const emit = defineEmits()

const tableParameter = ref({
  visible: false,
  type: '',
  title: '',
  callback: null,
  filters: [
    {
      type: 'input',
      label: '编码/名称',
      value: 'keyword',
    }
  ],
  fieldList: [],
  query: {}
})

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
  const api = id ? itemdeptIncomedetailupdate : itemdeptIncomedetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      state.data.unitPrice = (state.data.money / state.data.qty).toFixed(2)
      if (!state.data.itemDeptIncomeId) {
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

function openDeptSelector(target) {
  treeInfo.value.target = target
  treeInfo.value.title = target === 'order' ? '开单科室' : '执行科室'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  if (treeInfo.value.target === 'order') {
    state.data.orderDeptId = raw.id
    state.data.orderDeptCode = raw.code
    state.data.orderDeptName = raw.name
  } else {
    state.data.executeDeptId = raw.id
    state.data.executeDeptCode = raw.code
    state.data.executeDeptName = raw.name
  }
}

function openFeeItemSelector() {
  tableParameter.value.title = '收费项目'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'feeItem'
  tableParameter.value.query = { status: 1, accountingStatus: '1' }
  tableParameter.value.callBack = feeItemCallback
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function feeItemCallback(raw) {
  state.data.feeItemId = raw.id
  state.data.feeItemCode = raw.code
  state.data.feeItemName = raw.name
  state.data.feeCategoryCode = raw.feeCategoryCode
  state.data.feeCategoryName = raw.feeCategoryName
}
</script>
