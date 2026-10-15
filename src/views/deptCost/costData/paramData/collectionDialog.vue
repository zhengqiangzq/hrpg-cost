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
      <page-form
          ref="pageFormRef"
          v-model:ref-obj="formRef"
          :data="state.data"
          :field-list="state.fieldList"
          :rules="state.rules"
          :label-width="state.labelWidth">
        <template #form-apportionmentParamName>
          <el-input
              v-model="state.data.apportionmentParamName"
              class="not-mongolia"
              type="input"
              placeholder="请选择分摊参数"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openapportionmentParamSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-accountingPeriodMonth>
          <el-input
              v-model="state.data.accountingPeriodMonth"
              class="not-mongolia"
              type="input"
              placeholder="请选择会计期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="userUpdate('ruleForm')">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {watch} from "vue";
import {deptApportionmentParamcollection} from "@/api/paramData";

const props = defineProps({
  title: {
    type: String,
    default: ''
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
  fieldList: [
    { label: '分摊参数', span: 12, value: 'apportionmentParamName', type: 'slot' },
    { label: '会计期间', span: 12, value: 'accountingPeriodMonth', type: 'slot' },
  ],
  data: {},
  rules: {
    apportionmentParamName: [{ required: true, message: '请选择分摊参数'}],
    accountingPeriodMonth: [{ required: true, message: '请选择会计期间'}],
  },
})
const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

const apporParameter = ref({
  visible: false,
  type: '',
  title: '',
  callback: null,
  filters: [],
  fieldList: [],
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
function cancel() {
  state.dialogVisible = false
  state.data = {}
  emit('callback', false)
}
function userUpdate() {

  formRef.value.validate((valid) => {
    if (valid) {
      state.data.businessTypeName = `科室成本-参数数据(${state.data.apportionmentParamName})`
      deptApportionmentParamcollection(state.data).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('采集成功')
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    } else {
      return false
    }
  })
}

function openapportionmentParamSelector() {
  apporParameter.value.title = '分摊参数'
  apporParameter.value.visible = true
  apporParameter.value.checkBox = true
  apporParameter.value.pager = false
  apporParameter.value.type = 'allocationParam'
  apporParameter.value.query = { status: 1 }
  apporParameter.value.callBack = apportionmentParamCallback
  pageFormRef.value.openDialog(apporParameter.value, 'table')
}
function apportionmentParamCallback(raw) {
  state.data.apportionmentParamIds = raw?.map(it => it.id)
  state.data.apportionmentParamName = raw?.map(it => it.name).toString()
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  state.data.accountingPeriodId = raw.id
  state.data.accountingPeriodMonth = raw.periodYearAndMonth
  state.data.periodMonth = raw.periodYearAndMonth
}
</script>

<style scoped lang="scss">

</style>
