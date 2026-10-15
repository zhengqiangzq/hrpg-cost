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
        <template v-slot:form-parentCode>
          <el-input
              class="not-mongolia"
              type="input"
              :disabled="true"
              placeholder="请选择分类"
              v-model="state.formData.parentCode"
          >
            <template #append>
              <el-icon @click="openCategoryList"><Search /></el-icon>
            </template>
          </el-input>
        </template>
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
    <SelectCostType
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        title="成本分类"
        :checkStrictly="true"
        :check-box="false"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectCostType>
  </div>
</template>
<script setup name="vehicleAddEdit">

import {costCategoryadd} from "@/api/costInformation";

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
const state = reactive({
  ref: null,
  dialogVisible: false,
  formData: {
    status: "1",
  },
  fieldList: [
    { label: '成本分类编码', span: 12, value: 'code', type: 'input' },
    { label: '成本分类名称', span: 12, value: 'name', type: 'input' },
    { label: '所属上级分类编码', span: 12, disabled: true, value: 'parentCode', type: 'slot' },
    { label: '所属上级分类名称', span: 12, disabled: true, value: 'parentName', type: 'input' },
    { label: '启用状态', span: 12, disabled: true, value: 'status', code: 'enabled_type', type: 'select-model' },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写成本分类编码' }],
    name: [{ required: true, message: '请填写成本分类名称' }],
    parentCode: [{ required: true, message: '请选择所属上级分类' }],
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
        parentId: val.id === '-1' ? '' : val.id,
        parentCode: val.id === '-1' ? '' : val.code,
        parentName: val.id === '-1' ? '' : val.name,
        status: "1",
      }
    },
    {
      immediate: true,
    }
)
const selectClassification = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

function openCategoryList() {
  selectClassification.value.visible = true
}

function selectClassificationCallback(data) {
  if (data) {
    state.formData.parentId = data.id
    state.formData.parentCode = data.code
    state.formData.parentName = data.name
  } else {
    state.formData.parentId = ''
    state.formData.parentCode = ''
    state.formData.parentName = ''
  }
  selectClassification.value.visible = false
}

function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}
function userUpdate(formName) {
  //新增or编辑用户
  const api = costCategoryadd
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

