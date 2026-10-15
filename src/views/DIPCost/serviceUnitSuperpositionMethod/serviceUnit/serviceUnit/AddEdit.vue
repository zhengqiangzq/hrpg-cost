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
      <div class="model-panel-body paddingBox order-model-formBox">
      <page-form
          ref="from"
          v-model:ref-obj="state.ref"
          :data="state.formData"
          :field-list="state.fieldList"
          :rules="state.rules"
          :label-width="state.labelWidth"
      >
      </page-form>
      </div>
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
<script setup name="vehicleAddEdit">

import PageForm from "@/components/PageForm/index.vue";
import {addServiceUnit} from "@/api/DIPCost/DIPCostServiceUnit";

const props = defineProps({
  title: {
    type: String,
    default: '新增服务单元'
  },
  id: {
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
const state = reactive({
  ref: null,
  dialogVisible: false,
  formData: {
    status: "1",
  },
  fieldList: [
    { label: "服务单元编码", span: 12, value: "code", type: "input", required: true },
    { label: "服务单元名称", span: 12, value: "name", type: "input", required: true, disabled: false },
    { label: "启用状态", span: 12, value: "status", type: 'select-model', code: 'enabled_type', disabled: true },
    { label: "备注", value: "remark", type: "input" },
  ],
  rules: {
    code: [{ required: true, message: '请填写服务单元编码' }],
    name: [{ required: true, message: '请填写服务单元名称' }],
  },
})

const from = ref()
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
      state.formData = Object.assign(state.formData, val)
    },
    {
      immediate: true,
    }
)

function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}


function userUpdate(formName) {
  //新增or编辑用户
  const api = addServiceUnit
  state.ref.validate((valid) => {
    if (valid) {
      api(state.formData).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('保存成功')
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    } else {
      return false
    }
  })
}
</script>
