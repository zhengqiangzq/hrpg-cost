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
            @handleEvent="handleEvent"
            :label-width="state.labelWidth">
          <template #form-salaryItemName>
            <el-input
                v-model="state.data.salaryItemName"
                type="input"
                placeholder="请选择薪酬项目"
            >
              <template #append>
                <el-icon @click="opensalaryItemSelector"><Search /></el-icon>
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
    <SelectSalaryTree
        v-if="salaryInfo.visible"
        v-model:showDialog="salaryInfo.visible"
        :title="salaryInfo.title"
        :checkStrictly="salaryInfo.checkStrictly"
        :isLeaf="salaryInfo.isLeaf"
        :query="salaryInfo.query"
        :checkBox="salaryInfo.checkBox"
        :api="salaryInfo.api"
        :highlight-current="true"
        @callback="treeSalaryCallback" />
  </div>
</template>
<script setup>
import {ref, watch} from "vue";
import {deptStaffSalaryDetailinsert, deptStaffSalaryDetailupdate} from "@/api/deptCost/costData/salaryData";

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
    {label: '薪酬项目', value: 'salaryItemName', span: 12, type: 'slot'},
    {label: '资金来源', value: 'fundSource', span: 12, type: 'select-model', code: 'asset_capital_source'},
    {label: '金额', value: 'money', span: 12, type: 'money'},
  ],
  data: {},
  rules: {
    salaryItemName: [{ required: true, message: '请选择薪酬项目'}],
    fundSource: [{ required: true, message: '请选择开单科室'}],
    money: [{ required: true, message: '请输入金额'}],
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
  const api = id ? deptStaffSalaryDetailupdate : deptStaffSalaryDetailinsert
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.majorId) {
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

const salaryInfo = ref({
  title: '薪酬项目',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
function opensalaryItemSelector() {
  salaryInfo.value.visible = true
}
function treeSalaryCallback(raw) {
  state.data.salaryItemId = raw.id
  state.data.salaryItemCode = raw.code
  state.data.salaryItemName = raw.name
}
</script>
