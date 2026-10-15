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
          <template #form-sourceDeptName>
            <el-input
                v-model="state.data.sourceDeptName"
                type="input"
                placeholder="请选择分摊科室"
            >
              <template #append>
                <el-icon @click="openDeptSelector('分摊科室')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-targetDeptName>
            <el-input
                v-model="state.data.targetDeptName"
                type="input"
                placeholder="请选择承担科室"
            >
              <template #append>
                <el-icon @click="openDeptSelector('承担科室')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-costItemName>
            <el-input
                v-model="state.data.costItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择成本项目"
            >
              <template #append>
                <el-icon @click="openProjectSelector"><Search /></el-icon>
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
import {ref, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {deptBigUserCostDetailadd, deptBigUserCostDetailupdate} from "@/api/deptCost/costData/largeUsers";

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
  labelWidth: '120px',
  fieldList: [
    {label: '分摊科室', span: 12, value: 'sourceDeptName', type: 'slot'},
    {label: '承担科室', span: 12, value: 'targetDeptName', type: 'slot'},
    {label: '成本项目', span: 12, value: 'costItemName', type: 'slot' },
    { label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source' },
    {label: '金额', span: 12, value: 'money', type: 'money'},
    {label: '备注', span: 12, value: 'remark', type: 'input'},
  ],
  data: {},
  rules: {
    sourceDeptName: [{ required: true, message: '请选择分摊科室', trigger: 'blur'}],
    targetDeptName: [{ required: true, message: '请选择承担科室', trigger: 'blur'}],
    costItemName: [{ required: true, message: '请选择成本项目', trigger: 'blur'}],
    fundSource: [{ required: true, message: '请选择资金来源', trigger: 'blur'}],
    money: [{ required: true, message: '请输入金额', trigger: 'blur'}],
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
  const api = id ? deptBigUserCostDetailupdate : deptBigUserCostDetailadd
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

const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {
    status: '1'
  }
})

// 科室
function openDeptSelector(name) {
  treeInfo.value.title = name
  treeInfo.value.visible = true
}

function treeCallback(raw) {
  if(treeInfo.value.title === '分摊科室') {
    state.data.sourceDeptId = raw.id
    state.data.sourceDeptCode = raw.code
    state.data.sourceDeptName = raw.name
  } else {
    state.data.targetDeptId = raw.id
    state.data.targetDeptCode = raw.code
    state.data.targetDeptName = raw.name
  }
}

// 物资信息
function openProjectSelector() {
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.type = 'costItem'
  tableParameter.query = {
    last: true,
  }
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'name' }
  ]
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}

function feeItemCallback(raw) {
  state.data.costItemId = raw.id
  state.data.costItemCode = raw.code
  state.data.costItemName = raw.name
}
</script>
