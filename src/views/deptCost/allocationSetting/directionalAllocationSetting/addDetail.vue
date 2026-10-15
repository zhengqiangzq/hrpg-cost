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
            style="width: 40%"
            v-model:ref-obj="formRef"
            :data="state.data"
            :field-list="state.fieldList"
            :rules="state.rules"
            :label-width="state.labelWidth"
            @handleEvent="handleFormEvent"
        >
          <template #form-targetDeptName>
            <el-input
                v-model="state.data.targetDeptName"
                class="not-mongolia"
                placeholder="请选择承担科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openTargetDeptSelector"><Search /></el-icon>
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
    { label: '承担科室', span: 12, value: 'targetDeptName', type: 'slot' },
    { label: '备注', value: 'remark', type: 'textarea', }
  ],
  data: {},
  rules: {
    targetDeptName: [{required: true, message: '请选择承担科室'}],
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
  title: '承担科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {},
  checkedList: [],
  callback: null
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
    },
    {
      immediate: true,
    }
)

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
      state.dialogVisible = false
      const data = JSON.parse(JSON.stringify(state.data))
      emit('callback', data)
    }
  })
}

function openTargetDeptSelector() {
  treeInfo.value.callback = targetDeptCallback
  treeInfo.value.visible = true
}

function targetDeptCallback(raw) {
  state.data.targetDeptId = '';
  state.data.targetDeptCode = '';
  state.data.targetDeptName = '';
  treeInfo.value.checkedList = [];
  if(props.title === '新增明细数据') {
    treeInfo.value.checkedList = raw;
    const rows = raw && raw.filter(it => !it.childList)
    state.data.targetDeptId = rows.map(it => it.id)
    state.data.targetDeptCode = rows.map(it => it.code)
    state.data.targetDeptName = rows.map(it => it.name)
  } else {
    state.data.targetDeptId = raw.id
    state.data.targetDeptCode = raw.code
    state.data.targetDeptName = raw.name
  }
}
</script>

