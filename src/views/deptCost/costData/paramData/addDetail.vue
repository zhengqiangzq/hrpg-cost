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
          <template #form-deptCode>
            <el-input
                v-model="state.data.deptCode"
                class="not-mongolia"
                type="input"
                placeholder="请选择科室名称"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector('')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-sourceDeptCode>
            <el-input
                v-model="state.data.sourceDeptCode"
                class="not-mongolia"
                type="input"
                placeholder="请选择服务科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector('source')"><Search /></el-icon>
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
    <SelectDeptArchivesTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>
<script setup>
import {watch} from "vue";
import {addParamDataDetail, updateParamDataDetail} from "@/api/paramData";

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

const template_column = [
  [],
  [
    {label: '科室编码', value: 'deptCode', span: 12, type: 'slot'},
    {label: '科室名称', value: 'deptName', span: 12, type: 'input', disabled: true},
    {label: '参数值', value: 'paramValue', span: 12, type: 'money'},
    {label: '备注', value: 'remark', span: 12, type: 'input'},
  ],
  [
    {label: '服务科室编码', value: 'sourceDeptCode', span: 12, type: 'slot'},
    {label: '服务科室名称', value: 'sourceDeptName', span: 12, type: 'input', disabled: true},
    {label: '收益科室编码', value: 'deptCode', span: 12, type: 'slot'},
    {label: '收益科室名称', value: 'deptName', span: 12, type: 'input', disabled: true},
    {label: '参数值', value: 'paramValue', span: 12, type: 'money'},
    {label: '备注', value: 'remark', span: 12, type: 'input'},
  ]
]

const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: template_column[props.colTemplate],
  data: {},
  rules: {
    deptCode: [{ required: true, message: '请选择收益科室'}],
    sourceDeptCode: [{ required: true, message: '请选择服务科室'}],
    paramValue: [{ required: true, message: '请输入参数值'}],
  },
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
const emit = defineEmits()

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      state.fieldList = template_column[props.colTemplate]
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
  const api = id ? updateParamDataDetail : addParamDataDetail
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.deptParamId) {
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

function openDeptSelector(target) {
  treeInfo.value.target = target
  treeInfo.value.title = '科室'
  treeInfo.value.visible = true
  treeInfo.value.isLeaf = true
}
function treeCallback(raw) {
  if (treeInfo.value.target === 'source') {
    state.data.sourceDeptId = raw.id
    state.data.sourceDeptCode = raw.code
    state.data.sourceDeptName = raw.name
  } else {
    state.data.deptId = raw.id
    state.data.deptCode = raw.code
    state.data.deptName = raw.name
  }
}
</script>
