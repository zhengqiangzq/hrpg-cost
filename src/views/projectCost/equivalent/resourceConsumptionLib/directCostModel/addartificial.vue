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
  </div>
</template>
<script setup>
import {ref, watch, getCurrentInstance} from "vue";
import {
  updateLaborResourceConsumptionLibDirectCostModel
} from "@/api/projectCost/resourceConsumptionLibDirectCostModel";

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
    {label: '人力资源消耗相对值', span: 12, value: 'realRelativeVal', type: 'number', min: 0, precision: 2 },
  ],
  data: {},
  rules: {
    realRelativeVal: [{ required: true, message: '请输入人力资源消耗相对值', trigger: 'blur'}],
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
  //新增or编辑用户
  formRef.value.validate((valid) => {
    if (valid) {
      const fromData = [{
        ...state.data,
        deptId: props.tableRow.deptId
      }]
      updateLaborResourceConsumptionLibDirectCostModel(fromData).then(({ code, data }) => {
        if (code === 200) {
          proxy.$message.success('保存成功')
          state.dialogVisible = false
          emit('callback', data)
        }
      })
    }
  })
}
</script>
