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
          <template #form-accountName>
            <el-input
                v-model="state.data.accountName"
                class="not-mongolia"
                type="input"
                placeholder="请选择会计科目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
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
import {addDeptMedicalIncomeDetail, updateDeptMedicalIncomeDetail} from "@/api/deptMedicalIncome";

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
    // { label: '摘要', value: 'remark', type: 'input' },
    // { label: '凭证号', value: 'voucher', type: 'input' },
    { label: '会计科目', value: 'accountName', span: 12, labelTip: '请选择会计科目编码【410101医疗收入】及以下科目', type: 'slot' },
    { label: '核算科室', value: 'deptName', span: 12, type: 'slot' },
    { label: '资金来源', value: 'fundSource', span: 12, disabled: true, type: 'select-model', code: 'asset_capital_source' },
    { label: '金额', value: 'money', span: 12, type: 'number', precision: 2, min: 0 },
  ],
  data: {
  },
  rules: {
    remark: [{ required: true, message: '请输入摘要'}],
    accountName: [{ required: true, message: '请选择会计科目'}],
    deptName: [{ required: true, message: '请选择核算科室'}],
    fundSource: [{ required: true, message: '请选择资金来源'}],
    money: [{ required: true, message: '请输入金额'}],
  },
})
const tableParameter = ref({
  visible: false,
  type: 'accountingSubjects',
  title: '会计科目',
  checkBox: false,
  pager: true,
  callback: null,
  fieldList: [],
  query: { last: true, code: '410101'}
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
  const api = id ? updateDeptMedicalIncomeDetail : addDeptMedicalIncomeDetail
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.deptIncomeId) {
        state.dialogVisible = false
        const data = JSON.parse(JSON.stringify(state.data))
        const capitalSourceDict = proxy.$store.state.permission.dict['asset_capital_source']
        const option = capitalSourceDict.find(it => it.code == data.fundSource)
        data.fundSourceName = option.name
        emit('callback', data)
        return
      }
      api(state.data).then(({code, data}) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', true, data)
        }
      })
    }
  })
}

function openAccountSelector() {
  tableParameter.value.visible = true
  tableParameter.value.filters = [
    { label: '名称', value: 'name', type: 'input' }
  ]
  tableParameter.value.callBack = (raw) => {
    state.data.accountId = raw.id
    state.data.accountCode = raw.code
    state.data.accountName = raw.name
  }
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function openDeptSelector() {
  treeInfo.value.title = '科室'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  state.data.deptId = raw.id
  state.data.deptCode = raw.code
  state.data.deptName = raw.name
}
</script>
