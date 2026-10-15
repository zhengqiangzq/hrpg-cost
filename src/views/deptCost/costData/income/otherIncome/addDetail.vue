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
          <template #form-incomeItemValue>
            <el-input
                v-model="state.data.incomeItemValue"
                class="not-mongolia"
                type="input"
                placeholder="请选择收入项目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openFeeItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择执行科室"
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
    <SelectIncomeProject
        v-if="tableParameter.visible"
        v-model:showDialog="tableParameter.visible"
        :title="tableParameter.title"
        :checkStrictly="tableParameter.checkStrictly"
        :isLeaf="tableParameter.isLeaf"
        :query="tableParameter.query"
        :checkBox="tableParameter.checkBox"
        :api="tableParameter.api"
        :highlight-current="true"
        @callback="feeItemCallback" />
  </div>
</template>
<script setup>
import {ref, watch} from "vue";
import {OtherIncomeDetailadd, OtherIncomeDetailupdate} from "@/api/otherIncome";

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
    {label: '职能科室名称', value: 'deptName', span: 12, type: 'slot'},
    {label: '收入项目', value: 'incomeItemValue', span: 12, type: 'slot'},
    {label: '金额', value: 'money', span: 12, type: 'money'},
    {label: '备注', value: 'remark', span: 12, type: 'input'},
  ],
  data: {},
  rules: {
    deptName: [{ required: true, message: '请选择职能科室名称'}],
    incomeItemValue: [{ required: true, message: '请选择收入项目'}],
    money: [{ required: true, message: '请输入金额'},
      { pattern: /\d/, message: '请输入金额', trigger: 'blur' }],
  },
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
const emit = defineEmits()

const tableParameter = ref({
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  title: '收入项目',
  query: {
    name: ''
  }
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
  const api = id ? OtherIncomeDetailupdate : OtherIncomeDetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.deptOtherIncomeId) {
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

function openDeptSelector() {
  treeInfo.value.title = '职能科室'
  treeInfo.value.visible = true
  treeInfo.value.isLeaf = true
}
function treeCallback(raw) {
    state.data.deptId = raw.id
    state.data.deptCode = raw.code
    state.data.deptName = raw.name
}

function openFeeItemSelector() {
  tableParameter.value.visible = true
}
function feeItemCallback(raw) {
  state.data.incomeItemId = raw.id
  state.data.incomeItemCode = raw.code
  state.data.incomeItemValue = raw.name
}
</script>
