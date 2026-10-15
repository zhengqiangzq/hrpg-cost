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
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
                type="input"
                placeholder="请选择科室名称"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-productName>
            <el-input
                v-model="state.data.productName"
                class="not-mongolia"
                type="input"
                placeholder="请选择物资名称"
            >
              <template #append>
                <el-icon @click="openFinCategorySelector"><Search /></el-icon>
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
import {itemProductCostDetailadd, itemProductCostDetailupdate} from "@/api/materialCosts";
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
    {label: '科室名称', span: 12, value: 'deptName', type: 'slot'},
    {label: '物资名称', span: 12, value: 'productName', type: 'slot' },
    {label: '物资分类名称', span: 12, value: 'productFinCategoryName', type: 'input', disabled: true},
    { label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source' },
    {label: '金额', span: 12, value: 'money', type: 'money'},
    {label: '数量', span: 12, value: 'qty', type: 'number'},
    {label: '备注', span: 12, value: 'remark', type: 'input'},
  ],
  data: {},
  rules: {
    deptName: [{ required: true, message: '请选择科室名称'}],
    productName: [{ required: true, message: '请选择物资名称'}],
    orderDeptName: [{ required: true, message: '请选择开单科室'}],
    fundSource: [{ required: true, message: '请选择资金来源'}],
    executeDeptName: [{ required: true, message: '请选择执行科室'}],
    money: [{ required: true, message: '请输入金额'}],
    qty: [
      { required: true, message: '请输入数量'},
      { pattern: /^[1-9].*$/, message: '数量需要大于零', trigger: 'blur' }
    ],
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
  const api = id ? itemProductCostDetailupdate : itemProductCostDetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      state.data.unitPrice = state.data.money / state.data.qty
      if (!state.data.itemProductCostId) {
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

// 物资目录
function openFinCategorySelector() {
  tableParameter.title = '物资目录'
  tableParameter.visible = true
  tableParameter.type = 'product'
  tableParameter.query = { status: '1' }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  state.data.productId = raw.id
  state.data.productCode = raw.code
  state.data.productName = raw.name
  state.data.isCharge = raw.isCharge
  state.data.isChargeName = raw.isChargeName
  state.data.productFinCategoryId = raw.productFinCategoryId
  state.data.productFinCategoryCode = raw.productFinCategoryCode
  state.data.productFinCategoryName = raw.productFinCategoryName
}
</script>
