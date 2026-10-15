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
          ref="pageFromRef"
          v-model:ref-obj="state.ref"
          :data="state.formData"
          :field-list="state.fieldList"
          :rules="state.rules"
          :label-width="state.labelWidth"
      >
        <template #form-parentName>
          <el-input
              v-model="state.formData.parentName"
              class="not-mongolia"
              type="input"
              placeholder="请选择上级目录"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openParentName()"><Search /></el-icon>
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
  </div>
</template>
<script setup name="addEdit">

import {getCurrentInstance, watch, ref, reactive} from "vue";
import PageForm from "@/components/PageForm/index.vue";
import {addMSProgramRegulateCatalog, treeMSProgramRegulateCatalog} from "@/api/projectCost/MSProgramRegulateCatalog";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const { tableParameter, openDialog } = useSelectTableData()
const props = defineProps({
  title: {
    type: String,
    default: '新增医疗服务项目规范目录'
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
const pageFromRef = ref()
const { proxy } = getCurrentInstance()
const state = reactive({
  ref: null,
  dialogVisible: false,
  formData: {
    status: "1",
  },
  fieldList: [
    { label: "规范目录编码", span: 12, value: "code", type: "input", required: true },
    { label: "规范目录名称", span: 12, value: "name", type: "input", required: true },
    { label: "所属上级目录", span: 12, value: "parentName", type: "slot" },
    { label: "备注", value: "remark", type: "input" },
  ],
  rules: {
    code: [{ required: true, message: '请填写规范目录编码' }],
    name: [{ required: true, message: '请填写规范目录名称' }],
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
function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}


function userUpdate(formName) {
  //新增or编辑用户
  const api = addMSProgramRegulateCatalog
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

function openParentName () {
  tableParameter.title = '服务项目规范目录'
  tableParameter.saveEmpty = true
  tableParameter.api = treeMSProgramRegulateCatalog
  tableParameter.callBack = (raw) => {
    state.formData.parentId = raw?.id
    state.formData.parentName = raw?.name
  }
  openDialog(pageFromRef.value, 'tree')
}
</script>
