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
          <template #form-accountName>
            <el-input
                v-model="state.data.accountName"
                class="not-mongolia"
                type="input"
                placeholder="请选择会计科目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-itemName>
            <el-input
                v-model="state.data.itemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择部门预算支出经济分类"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openItemSelector"><Search /></el-icon>
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
import {
  addGeneralLedgerDataDeptCostDataDetail,
  updateGeneralLedgerDataDeptCostDataDetail
} from "@/api/generalLedgerDataDeptCostData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useDict} from "@/hooks/useDict";

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
const { formatterLabel } = useDict()

const pageFormRef = ref()
const formRef = ref()

const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: [
    // { label: '摘要', value: 'remark', type: 'input' },
    // { label: '凭证号', value: 'voucher', type: 'input' },
    { label: '会计科目', value: 'accountName', span: 12, labelTip: '请选择会计科目编码【5费用】及以下科目', type: 'slot' },
    { label: '核算科室', value: 'deptName', span: 12, type: 'slot' },
    { label: '资金来源', value: 'fundSource', span: 12, type: 'select-model', disabled: true, code: 'asset_capital_source' },
    { label: '金额', value: 'money', type: 'number', span: 12, precision: 2, min: 0 },
  ],
  data: {
    fundSource: 4
  },
  rules: {
    remark: [{ required: true, message: '请输入摘要'}],
    accountName: [{ required: true, message: '请选择会计科目'}],
    deptName: [{ required: true, message: '请选择核算科室'}],
    money: [{ required: true, message: '请输入金额'}],
  },
})
const { tableParameter, openDialog } = useSelectTableData()
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {}
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
  const api = id ? updateGeneralLedgerDataDeptCostDataDetail : addGeneralLedgerDataDeptCostDataDetail
  formRef.value.validate((valid) => {
    if (valid) {
      if (!state.data.deptIncomeId) {
        state.dialogVisible = false
        const data = {
          ...state.data,
          fundSourceName: formatterLabel('asset_capital_source', state.data.fundSource)
        }
        emit('callback', data)
        return
      }
      api(state.data).then(({code, data}) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', true, data)
        }
      })
    }
  })
}

function getFundSourceRef(code) {
  if (/^(500101|510101)/.test(code)) {
    return 1
  } else if (/^(500102|510102)/.test(code)) {
    return 2
  } else if (/^(500103|510103)/.test(code)) {
    return 3
  } else {
    return 4
  }
}

function openAccountSelector() {
  tableParameter.visible = true
  tableParameter.type = 'accountingSubjects'
  tableParameter.query = {
    last: true,
    codeLeftLike: '5'
  }
  tableParameter.filters = [{ label: '编码/名称', value: 'OrBatchLike#code#name', type: 'input' }]
  tableParameter.title = '会计科目'
  tableParameter.callBack = (raw) => {
    state.data.accountId = raw.id
    state.data.accountCode = raw.code
    state.data.accountName = raw.name
    state.data.accassId = undefined
    state.data.itemName = undefined
    state.data.fundSource = getFundSourceRef(raw.code)
  }
  openDialog(pageFormRef.value, 'table')
}
function openItemSelector() {
  tableParameter.visible = true
  tableParameter.type = 'generalLedgerDataDeptCostDataItem'
  tableParameter.query = {
    accountId: state.data.accountId
  }
  tableParameter.title = '部门预算支出经济分类'
  tableParameter.callBack = (raw) => {
    state.data.accassId = raw.id
    state.data.itemName = raw.name
  }
  openDialog(pageFormRef.value, 'table')
}
function openDeptSelector() {
  treeInfo.value.title = '科室'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  state.data.deptId = raw.id
  state.data.deptCode = raw.code
  state.data.deptName = raw.name
}
</script>
