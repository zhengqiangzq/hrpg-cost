<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="titleName"
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
          :listTypeInfo="state.listTypeInfo"
          :rules="state.rules"
          :label-width="state.labelWidth"
      >
        <template v-slot:form-parentCode>
          <el-input
              class="not-mongolia"
              type="input"
              :disabled="true"
              placeholder="请选择成本项目"
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
          <el-button type="primary" @click="saveAdd()">
             保存新增
            </el-button>
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

import {costCategoryadd, costItemadd, costItemupdate} from "@/api/costInformation";
import PageForm from "@/components/PageForm/index.vue";

const props = defineProps({
  title: {
    type: String,
    default: ''
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
    controlType: 1
  },
  listTypeInfo: {
    controlType: [
      { key: '可控成本', value: 1 },
      { key: '不可控成本', value: 0 },
    ]
  },
  fieldList: [
    { label: "成本项目编码", span: 12, value: "code", type: "input", disabled: false, required: true },
    { label: "成本项目名称", span: 12, value: "name", type: "input", required: true },
    { label: "上级成本项目编码", span: 12, value: "parentCode",type: "slot" },
    { label: "上级成本项目名称", span: 12, value: "parentName", type: "input", disabled: true },
    { label: "所属成本分类编码", span: 12, value: "costCategoryCode", type: "input", disabled: true },
    { label: "所属成本分类名称", span: 12, value: "costCategoryName", type: "input", disabled: true },
    { label: '成本属性', span: 12, type: 'select-model', value: 'costAttribute', code: 'cost_attribute' },
    { label: '可控属性', span: 12, type: 'select', value: 'controlType', list: 'controlType' },
    { label: '是否药品', span: 12, type: 'select-model', value: 'drugStatus', code: 'yes_or_no', disabled: true },
    { label: '是否项目核算', span: 12, type: 'select-model', value: 'itemAccountStatus', code: 'yes_or_no' },
    { label: '是否病种核算', span: 12, type: 'select-model', value: 'diseaseAccountStatus', code: 'yes_or_no' },
    { label: "启用状态", span: 12, value: "status", code: "enabled_type", type: 'select-model', disabled: true },
    { label: "备注", value: "remark", type: "textarea" },
  ],
  rules: {
    code: [{ required: true, message: '请填写成本分项目编码' }],
    name: [{ required: true, message: '请填写成本分项目名称' }],
  },
})

const from = ref()
const titleName = ref('')
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
    () => props.title,
    (val) => {
      titleName.value = val
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.formData = Object.assign(state.formData, val)
      state.fieldList[0].disabled = !!val?.id
    },
    {
      immediate: true,
    }
)
const selectCostProject = ref({
  title: '上级成本项目',
  visible: false,
  saveEmpty: true,
  type: 'costItem',
  query: {},
  checkBox: false,
  checkedKey: {},
  callBack: callBackName,
})

function openCategoryList() {
  selectCostProject.value.visible = true
  from.value.openDialog(selectCostProject.value, 'table')
}

function callBackName(data) {
  state.formData.parentName = data.name;
  state.formData.parentId = data.id;
  state.formData.parentCode = data.code;
  selectCostProject.value.visible = false
}

function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}

async function saveAdd() {
  const api = props.id ? costItemupdate : costItemadd
  state.ref.validate((valid) => {
    if (valid) {
      api(state.formData).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('保存成功')
          state.formData.id = '';
          state.formData.code = '';
          state.formData.name = '';
          state.formData.remark = '';
          state.formData.status = 1;
          state.formData.controlType = '0';
          titleName.value = '新增成本项目'
          state.fieldList[0].disabled = false
          emit('callback', true)
        }
      })
    } else {
      return false
    }
  })
}

function userUpdate(formName) {
  //新增or编辑用户
  const api = props.id ? costItemupdate : costItemadd
  state.ref.validate((valid) => {
    if (valid) {
      api(state.formData).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('保存成功')
          state.dialogVisible = false
          emit('callback', true)
          emit('callback', false)
        }
      })
    } else {
      return false
    }
  })
}
</script>

