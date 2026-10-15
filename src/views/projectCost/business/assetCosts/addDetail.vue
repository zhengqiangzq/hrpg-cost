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
          <template #form-assetsItemCode>
            <el-input
                v-model="state.data.assetsItemCode"
                class="not-mongolia"
                type="input"
                placeholder="请选择资产名称"
            >
              <template #append>
                <el-icon @click="openFinCategorySelector"><Search /></el-icon>
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
import {
  itemAssetsCostDetailadd, itemAssetsCostDetailupdate,
} from "@/api/assetCosts";
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
    {label: '科室名称', span: 12, value: 'deptName', type: 'slot'},
    {label: '资产编码', span: 12, value: 'assetsItemCode', type: 'slot' },
    {label: '资产名称', span: 12, value: 'assetsItemName', type: 'input', disabled: true },
    {label: '资产分类名称', span: 12, value: 'assetsFinCategoryName', type: 'input', disabled: true},
    { label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source' },
    {label: '原值', span: 12, value: 'originalAmount', type: 'money'},
    {label: '累计折旧', span: 12, value: 'totalDepreciationAmount', type: 'money'},
    {label: '折旧金额', span: 12, value: 'epreciationAmount', type: 'money'},
    {label: '备注', span: 12, value: 'remark', type: 'input'},
  ],
  data: {},
  rules: {
    deptName: [{ required: true, message: '请选择科室名称', trigger: 'blur'}],
    assetsItemCode: [{ required: true, message: '请选择资产编码', trigger: 'blur'}],
    fundSource: [{ required: true, message: '请选择资金来源', trigger: 'blur'}],
    originalAmount: [{ required: true, message: '请输入原值', trigger: 'blur'}],
    totalDepreciationAmount: [{ required: true, message: '请输入累计折旧', trigger: 'blur'}],
    epreciationAmount: [{ required: true, message: '请输入折旧金额', trigger: 'blur'}],
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
  const api = id ? itemAssetsCostDetailupdate : itemAssetsCostDetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      state.data.unitPrice = state.data.money / state.data.qty
      if (!state.data.paramDistributeAssetsCostId) {
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

// 资产卡片
function openFinCategorySelector() {
  tableParameter.title = '资产卡片'
  tableParameter.visible = true
  tableParameter.type = 'assets'
  tableParameter.query = { }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  state.data.assetsItemId = raw.id
  state.data.assetsItemCode = raw.code
  state.data.assetsItemName = raw.name
  state.data.assetsFinCategoryId = raw.assetsFinCategoryId
  state.data.assetsFinCategoryCode = raw.assetsFinCategoryCode
  state.data.assetsFinCategoryName = raw.assetsFinCategoryName
}
</script>
