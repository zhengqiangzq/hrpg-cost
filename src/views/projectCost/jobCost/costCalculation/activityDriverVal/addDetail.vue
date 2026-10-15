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
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
                type="input"
                placeholder="请选择科室名称"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-itemJobName>
            <el-input
                v-model="state.data.itemJobName"
                class="not-mongolia"
                type="input"
                placeholder="请选择作业名称"
            >
              <template #append>
                <el-icon @click="openFinCategorySelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-feeItemName>
            <el-input
                v-model="state.data.feeItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择收费项目"
            >
              <template #append>
                <el-icon @click="openFeeitemSelector"><Search /></el-icon>
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
    <SelectProDeptTree
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
import {ref, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {itemActivityDriverValueDetailadd, itemActivityDriverValueDetailbyPost} from "@/api/activityDriverVal";
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

const { tableParameter, openDialog } = useSelectTableData()
const pageFormRef = ref()
const formRef = ref()

const state = reactive({
  dialogVisible: false,
  fieldList: [
    {label: '科室名称', span: 12, value: 'deptName', type: 'slot'},
    {label: '收费项目', span: 12, value: 'feeItemName', type: 'slot' },
    {label: '作业名称', span: 12, value: 'itemJobName', type: 'slot' },
    {label: '参数值', span: 12, value: 'paramValue', type: 'number'},
    {label: '备注', span: 12, value: 'remark', type: 'input'},
  ],
  data: {},
  rules: {
    deptName: [{ required: true, message: '请选择科室名称'}],
    feeItemName: [{ required: true, message: '请选择收费项目'}],
    itemJobName: [{ required: true, message: '请选择作业名称'}],
    paramValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }, { type: 'number', min: 0, message: '参数值不能为负数', trigger: 'blur' }],
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
async function userUpdate() {
  const id = props.tableRow.id
  let isValid = true
  await formRef.value.validate(flag => isValid = flag)
  if (!isValid) return
  //新增or编辑用户
  const api = id ? itemActivityDriverValueDetailbyPost : itemActivityDriverValueDetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.activityDriverValueId) {
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

const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {}
})
// 科室
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
    state.data.deptId = raw.id
    state.data.deptCode = raw.code
    state.data.deptName = raw.name
}

// 作业名称
function openFinCategorySelector() {
  tableParameter.title = '作业名称'
  tableParameter.visible = true
  tableParameter.type = 'itemjob'
  tableParameter.query = { }
  tableParameter.filters = [
    { type: 'input', label: '作业名称', value: 'name' }
  ]
  tableParameter.callBack = finCategoryCallback
  openDialog(pageFormRef.value, 'table')
}
function finCategoryCallback(raw) {
  state.data.itemJobId = raw.id
  state.data.itemJobCode = raw.code
  state.data.itemJobName = raw.name
}

// 收费项目
function openFeeitemSelector() {
  tableParameter.title = '收费项目'
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.type = 'feeItem'
  tableParameter.query = { status: 1 }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  state.data.feeItemId = raw.id
  state.data.feeItemCode = raw.code
  state.data.feeItemName = raw.name
}
</script>
