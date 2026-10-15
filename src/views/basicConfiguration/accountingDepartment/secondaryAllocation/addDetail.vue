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
          <template #form-sourceSectionName>
            <el-input
                v-model="state.data.sourceSectionName"
                class="not-mongolia"
                type="input"
                placeholder="请选择源科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openCostItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-targetSectionName>
            <el-input
                v-model="state.data.targetSectionName"
                class="not-mongolia"
                type="input"
                placeholder="请选择承担科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
          <el-button type="primary" @click="userUpdate">{{
              $t('btn_confirm')
            }}</el-button>
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
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>
<script setup>
import {watch} from "vue";
import {addCostDataDetail, updateCostDataDetail} from "@/api/costData";
import {secondAllocationadd, secondAllocationupdate} from "@/api/accountingDepartment";

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
  labelWidth: '120px',
  fieldList: [
    { label: '源科室', value: 'sourceSectionName', type: 'slot' },
    { label: '承担科室', value: 'targetSectionName', type: 'slot' },
    { label: '参数值', value: 'param', type: 'input' },
  ],
  data: {},
  rules: {
    sourceSectionName: [{ required: true, message: '请选择源科室'}],
    targetSectionName: [{ required: true, message: '请选择承担科室'}],
    param: [{ required: true, message: '请选择参数值'}],
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
  const api = id ? secondAllocationupdate : secondAllocationadd
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.secondAllocationTypeId) {
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
  title: '源科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

function openCostItemSelector() {
  treeInfo.value.visible = true
  treeInfo.value.isLeaf = false
  treeInfo.value.title = '源科室'

}
function openDeptSelector() {
  treeInfo.value.visible = true
  treeInfo.value.isLeaf = true
  treeInfo.value.title = '承担科室'
}
function treeCallback(raw) {
  if(treeInfo.value.title === '源科室') {
    state.data.sourceSectionId = raw.id
    state.data.sourceSectionCode = raw.code
    state.data.sourceSectionName = raw.name
  } else {
    state.data.targetSectionId = raw.id
    state.data.targetSectionCode = raw.code
    state.data.targetSectionName = raw.name
  }
  treeInfo.value.visible = false
}
</script>

