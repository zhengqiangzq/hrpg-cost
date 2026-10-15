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
          <template #form-costItemCode>
            <el-input
                v-model="state.data.costItemCode"
                class="not-mongolia"
                type="input"
                placeholder="请选择成本项目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openCostItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-deptCode>
            <el-input
                v-model="state.data.deptCode"
                class="not-mongolia"
                type="input"
                placeholder="请选择科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
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
  </div>
</template>
<script setup>
import {watch} from "vue";
import {addCostDataDetail, updateCostDataDetail} from "@/api/costData";

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
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
    { label: '科室编码', value: 'deptCode', span: 12, type: 'slot' },
    { label: '科室名称', value: 'deptName', span: 12, type: 'input', disabled: true },
    { label: '成本项目编码', value: 'costItemCode', span: 12, type: 'slot' },
    { label: '成本项目名称', value: 'costItemName', span: 12, type: 'input', disabled: true },
    { label: '资金来源', value: 'capitalSource', span: 12, type: 'select-model', code: 'asset_capital_source' },
    { label: '金额', value: 'money', span: 12, type: 'money' },
    { label: '备注', value: 'remark', span: 12, type: 'input' },
  ],
  data: {},
  rules: {
    deptCode: [{ required: true, message: '请选择科室'}],
    costItemCode: [{ required: true, message: '请选择成本项目'}],
    capitalSource: [{ required: true, message: '请选择资金来源'}],
    money: [{ required: true, message: '请输入金额'},
      { pattern: /\d/, message: '请输入金额', trigger: 'blur' }],
  },
})
const tableParameter = ref({
  visible: false,
  type: 'costItem',
  title: '成本项目',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [
    { type: 'input', label: '编码/名称', value: 'name' }
  ],
  fieldList: [],
  query: {last: true}
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: { last: true}
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
  const api = id ? updateCostDataDetail : addCostDataDetail
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.deptCostId) {
        state.dialogVisible = false
        const data = JSON.parse(JSON.stringify(state.data))
        const capitalSourceDict = proxy.$store.state.permission.dict['asset_capital_source']
        const option = capitalSourceDict.find(it => it.code == data.capitalSource)
        data.capitalSourceValue = option.name
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

function openCostItemSelector() {
  tableParameter.value.visible = true
  tableParameter.value.callBack = costItemCallback
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function costItemCallback(raw) {
  state.data.costItemId = raw.id
  state.data.costItemCode = raw.code
  state.data.costItemName = raw.name
}
function openDeptSelector() {
  treeInfo.value.title = '科室'
  treeInfo.value.visible = true
  treeInfo.value.isLeaf = true
}
function treeCallback(raw) {
  state.data.deptId = raw.id
  state.data.deptCode = raw.code
  state.data.deptName = raw.name
}
</script>
