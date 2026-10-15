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
import {onBeforeMount, watch} from "vue";
import {deptIncomeSplitRulecopy} from "@/api/deptCost/incomeSplitRule";

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
  fieldList: [
    { label: '会计期间', value: 'accountingPeriodMonth', type: 'slot' },
  ],
  data: {},
  rules: {
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
  //新增or编辑用户
  const api = deptIncomeSplitRulecopy
  formRef.value.validate((valid) => {
    if (valid) {
      api(state.data).then(({code}) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    } else {
      return false
    }
  })
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
}
</script>
