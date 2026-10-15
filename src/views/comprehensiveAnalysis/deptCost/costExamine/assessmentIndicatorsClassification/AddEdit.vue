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
import {addAssessmentIndicatorsClassification} from "@/api/deptCost/assessmentIndicatorsClassification";

const props = defineProps({
  title: {
    type: String,
    default: '新增考核指标分类'
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
    enabledStatus: "1",
  },
  fieldList: [
    { label: '指标分类编码', span: 12, value: 'code', type: 'input' },
    { label: '指标分类名称', span: 12, value: 'name', type: 'input' },
    { label: '所属上级分类编码', span: 12, disabled: true, value: 'parentCode', type: 'input' },
    { label: '所属上级分类名称', span: 12, disabled: true, value: 'parentName', type: 'input' },
    { label: '启用状态', span: 12, disabled: true, value: 'enabledStatus', code: 'enabled_type', type: 'select-model' },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写指标分类编码' }],
    name: [{ required: true, message: '请填写指标分类名称' }],
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
      state.formData = {
        parentId: val.id === '-1' ? '' : val.parentId,
        parentCode: val.id === '-1' ? '' : val.parentCode,
        parentName: val.id === '-1' ? '' : val.parentName,
        enabledStatus: "1",
      }
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
  const api = addAssessmentIndicatorsClassification
  state.ref.validate((valid) => {
    if (valid) {
      api(state.formData).then((resp) => {
        if (resp.code === 200) {
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

