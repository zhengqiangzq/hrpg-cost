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
      <div class="model-panel-body paddingBox order-model-formBox flex_wrap_start_start">
        <page-form
            ref="pageFormRef"
            v-model:ref-obj="formRef"
            :data="state.data"
            :field-list="state.fieldList"
            :rules="state.rules"
            :label-width="state.labelWidth"
            @handleEvent="handleFormEvent"
        >
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
                class="not-mongolia"
                placeholder="请选择承担科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openTargetDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-apportionmentParamName>
            <el-input
                v-model="state.data.apportionmentParamName"
                class="not-mongolia"
                placeholder="请选择分摊参数"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openApportionmentParamSelector"><Search /></el-icon>
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
  </div>
  <SelectDeptArchivesTree
      v-if="treeInfo.visible"
      v-model:showDialog="treeInfo.visible"
      :title="treeInfo.title"
      :checkStrictly="treeInfo.checkStrictly"
      :isLeaf="treeInfo.isLeaf"
      :query="treeInfo.query"
      :checkedList="treeInfo.checkedList"
      :checkBox="title === '新增明细数据'"
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="treeInfo.callback" />
</template>
<script setup>
import {watch} from "vue";

const store = useStore()
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
    { label: '承担科室', span: 12, value: 'deptName', type: 'slot' },
    { label: '参数来源', span: 12, value: 'paramSource', type: 'select-model', code: 'direct_cost_split_rule_calculate_type', event: changeParamSource },
    { label: '分摊参数', span: 12, value: 'apportionmentParamName', type: 'slot' },
    { label: '参数值', span: 12, value: 'paramValue', type: 'number', }
  ],
  data: {},
  rules: {
    deptName: [{required: true, message: '请选择承担科室'}],
    apportionmentParamName: [{required: true, message: '请选择分摊参数'}],
    paramValue: [{required: true, message: '请输入参数值', trigger: 'blur'}],
    paramSource: [{required: true, message: '请选择参数来源', trigger: 'blur'}],
  },
})
const tableParameter = ref({
  visible: false,
  type: '',
  title: '',
  callback: null,
  fieldList: [],
  filters: [],
  query: {}
})
const emit = defineEmits()
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {},
  callback: null,
  checkedList: []
})

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      treeInfo.value.checkedList = []
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.data = Object.assign(state.data, val)
      changeParamSource(state.data.paramSource)
    },
    {
      immediate: true,
    }
)

function changeParamSource(val) {
  const field_param = state.fieldList.find(it => it.value === 'apportionmentParamName')
  const field_value = state.fieldList.find(it => it.value === 'paramValue')
  if (val == 1) {
    field_param.show = false
    field_value.show = true
    delete state.rules.apportionmentParamName
    state.rules.paramValue = [{required: true, message: '请输入参数值', trigger: 'blur'}]
    state.data.apportionmentParamId = undefined
    state.data.apportionmentParamCode = undefined
    state.data.apportionmentParamName = undefined
  } else {
    field_value.show = false
    field_param.show = true
    delete state.rules.paramValue
    state.rules.apportionmentParamName = [{required: true, message: '请选择分摊参数'}]
    state.data.paramValue = undefined
  }
}

function handleFormEvent(event, data) {
  if(!event) return
  if (typeof event === 'function') {
    event(event, data)
  } else {
    event.event && event.event(data)
  }
}

function cancel() {
  state.dialogVisible = false
  state.data = {}
  emit('callback', false)
}
function userUpdate() {
  formRef.value.validate((valid) => {
    if (valid) {
      // 处理数据
      state.data.paramSourceName = store.state.permission.dict['direct_cost_split_rule_calculate_type']?.find(it => it.code === state.data.paramSource)?.name
      state.dialogVisible = false
      const data = JSON.parse(JSON.stringify(state.data))
      emit('callback', data)
    }
  })
}

function openTargetDeptSelector() {
  treeInfo.value.title = '承担科室'
  treeInfo.value.checkStrictly = false
  treeInfo.value.callback = targetDeptCallback
  treeInfo.value.visible = true
}

function targetDeptCallback(raw) {
  state.data.deptId = '';
  state.data.deptCode = '';
  state.data.deptName = '';
  treeInfo.value.checkedList = [];
  if(props.title === '新增明细数据') {
    treeInfo.value.checkedList = raw;
    const rows = raw && raw.filter(it => !it.childList)
    state.data.deptId = rows.map(it => it.id)
    state.data.deptCode = rows.map(it => it.code)
    state.data.deptName = rows.map(it => it.name)
  } else {
    state.data.deptId = raw.id
    state.data.deptCode = raw.code
    state.data.deptName = raw.name
  }
}

function openApportionmentParamSelector() {
  tableParameter.value.title = '分摊参数'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = false
  tableParameter.value.pager = false
  tableParameter.value.filters = []
  tableParameter.value.type = 'allocationParam'
  tableParameter.value.callBack = apportionmentParamCallback
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function apportionmentParamCallback(raw) {
  state.data.apportionmentParamId = raw.id
  state.data.apportionmentParamCode = raw.code
  state.data.apportionmentParamName = raw.name
}
</script>

