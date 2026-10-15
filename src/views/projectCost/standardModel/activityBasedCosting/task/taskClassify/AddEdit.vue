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
        <template v-slot:form-parentName>
          <el-input
              class="not-mongolia"
              type="input"
              :disabled="true"
              placeholder="请选择分类"
              v-model="state.formData.parentName"
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
    <SelectTaskType
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        title="作业分类"
        :checkStrictly="true"
        :check-box="false"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectTaskType>
  </div>
</template>
<script setup name="vehicleAddEdit">

import PageForm from "@/components/PageForm/index.vue";
import { ref, getCurrentInstance, reactive, watch } from "vue";
import {itemjobClassadd} from "@/api/projectBase";

const props = defineProps({
  title: {
    type: String,
    default: '新增作业分类'
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
    { label: "作业分类编码", span: 12, value: "code", type: "input", required: true },
    { label: "作业分类名称", span: 12, value: "name", type: "input", required: true, disabled: false },
    { label: "所属上级分类名称", span: 12, value: "parentName", type: "slot", required: false, disabled: false },
    { label: "启用状态", span: 12, value: "status", type: 'select-model', code: 'enabled_type', disabled: true },
    { label: "备注", value: "remark", type: "input" },
  ],
  rules: {
    code: [{ required: true, message: '请填写作业分类编码' }],
    name: [{ required: true, message: '请填写作业分类名称' }],
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
      state.formData = Object.assign(state.formData, val)
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
  state.formData.parentName = data.name;
  state.formData.parentId = data.id;
  state.formData.parentCode = data.code;
  selectClassification.value.visible = false
}

function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}


function userUpdate(formName) {
  //新增or编辑用户
  const api = itemjobClassadd
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
