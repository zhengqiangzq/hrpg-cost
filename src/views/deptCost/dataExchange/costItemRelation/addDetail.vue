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
            ref="from"
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
                <el-icon @click="openaccountNameSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-costItemName>
            <el-input
                v-model="state.data.costItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择成本项目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openCostItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template v-for="(item,index) in state.fieldList.filter((it) => it.flag)" #[item.formvalue]>
              <el-input
                  :key="item.value"
                  v-model="state.accassItemList[index].accassValue"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择辅助项"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openaccassSelector(item)"><Search /></el-icon>
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
</template>
<script setup>
import {watch} from "vue";
import {
  costItemAccountRelationaccassItemValue,
  costItemAccountRelationupdate,
  saveCostItemRelationadd
} from "../../../../api/costItemRelation";

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

const from = ref()
const formRef = ref()


const accassitemTable = ref({
  visible: false,
  checkBox: true,
  type: 'accassItem',
  title: '',
  pager: false,
  checkStrictly: false,
  callback: null,
  filters: [
    { type: 'input', label: '编码', value: 'accassValueCode' },
    { type: 'input', label: '名称', value: 'accassValueName' },
  ],
  query: {}
})
const treeParameter = ref({
  visible: false,
  checkBox: true,
  title: '',
  api: null,
  pager: false,
  checkStrictly: true,
  callback: null,
  query: {}
})

const state = reactive({
  dialogVisible: false,
  ref: null,
  data: {},
  index: '',
  labelWidth: '120px',
  fieldList: [
    { label: '会计科目', show: true, span: 12, value: 'accountName', type: 'slot' },
    { label: '成本项目', show: true, span: 12, value: 'costItemName', type: 'slot' },
    {label: '资金来源', show: true, span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source'},
  ],
  accassItemList: [],
  rules: {
    accountName: [{ required: true, message: '请选择会计科目'}],
    costItemName: [{ required: true, message: '请选择成本项目'}],
    fundSource: [{ required: true, message: '请选择资金来源'}],
  },
})
const emit = defineEmits()

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      handleTableHeader()
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.data = val

    },
    {
      immediate: true,
    }
)

function handleTableHeader () {
  state.data = props.tableRow
  const addAccassItem = []
  state.fieldList = [
    { label: '会计科目', span: 12, value: 'accountName', type: 'slot' },
    { label: '成本项目', span: 12, value: 'costItemName', type: 'slot' },
    {label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source'},
  ]
  state.accassItemList = state.data?.accassItemList || []
  if(state.accassItemList.length > 0) {
    state.accassItemList.forEach((it) => {
      addAccassItem.push({
        label: it.name,
        accassCocde: it.code,
        value: it.accassId,
        type: 'slot',
        flag: true,
        tree: it.tree,
        formvalue: `form-${it.accassId}`
      })
    })
    state.fieldList.splice(1,0,...addAccassItem)
  }
  treeParameter.value.checkBox = !props.tableRow?.id;
  accassitemTable.value.checkBox = !props.tableRow?.id;
}


function cancel() {
  state.dialogVisible = false
  state.data = {}
  emit('callback', false)
}
function userUpdate() {
  const id = props.tableRow?.id
  console.log('保存数据', state.data)
  //新增or编辑用户
  const api = id ? costItemAccountRelationupdate : saveCostItemRelationadd
  formRef.value.validate ((valid) => {
    if (valid) {
      state.data.accassItemList = state.accassItemList;
      api(state.data).then(({code}) => {
        if (code === 200) {
          proxy.$message.success('保存成功')
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    }
  })
}


const treeInfo = ref({
  title: '会计科目',
  type: '',
  visible: false,
  checkBox: false,
  callback: null,
  fieldList: [],
  query: {}
})

function openaccountNameSelector() {
  treeInfo.value.visible = true
  treeInfo.value.type = 'costItemgetAccount'
  treeInfo.value.callBack = treeCallback
  from.value.openDialog(treeInfo.value, 'table')
}
function treeCallback(raw) {
  console.log('选择的会计科目数据', raw)
  state.data.accountCode = raw.accountCode;
  state.data.accountName = raw.accountName;
  state.data.accountId = raw.accountId;
  treeInfo.value.visible = false
  state.fieldList = [
    { label: '会计科目', span: 12, value: 'accountName', type: 'slot' },
    { label: '成本项目', span: 12, value: 'costItemName', type: 'slot' },
    {label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source'},
  ]
  const addAccassItem = []
  state.accassItemList = []
  raw.accassItemVOList && raw.accassItemVOList.forEach((it) => {
    addAccassItem.push({
      label: it.accassName,
      value: it.accassId,
      accassCocde: it.accassCocde,
      type: 'slot',
      flag: true,
      tree: it.tree,
      formvalue: `form-${it.accassId}`
    })
    state.accassItemList.push({
      accassId: it.accassId,
      accassCocde: it.accassCocde,
      value: it.accassId,
      accassValue: '',
      accassValueId: '',
      accassValueCode: '',
      accassValueIdList: []
    })
  })
  state.fieldList.splice(1,0,...addAccassItem)
}

const tableParameter = ref({
  visible: false,
  checkBox: false,
  type: '',
  title: '',
  callback: null,
  fieldList: [],
  filters: [
    { type: 'input', label: '编码/名称', value: 'name' },
  ],
  query: {
    last: true,
  }
})

function openCostItemSelector(row) {
  tableParameter.value.visible = true
  tableParameter.value.title = '成本项目'
  tableParameter.value.type = 'costItem'
  tableParameter.value.filters = [
    { type: 'input', label: '编码/名称', value: 'name' }
  ]
  tableParameter.value.currentRow = row
  tableParameter.value.callBack = costItemCallback
  from.value.openDialog(tableParameter.value, 'table')
}
function costItemCallback(raw) {
  const row = state.data
  row.costItemId = raw.id
  row.costItemCode = raw.code
  row.costItemName = raw.name
}


function openaccassSelector(row) {
  state.index = state.accassItemList.findIndex((it) => it.accassId === row.value)
  if(row.tree === 'true') {
    treeParameter.value.title = row.label;
    treeParameter.value.api = costItemAccountRelationaccassItemValue;
    treeParameter.value.query = {
      code: row.accassCocde,
    }
    treeParameter.value.visible = true
    treeParameter.value.callBack = accassItemCallback
    from.value.openDialog(treeParameter.value, 'tree')
  } else {
    accassitemTable.value.title = row.label;
    accassitemTable.value.query = {
      code: row.accassCocde,
    }
    accassitemTable.value.visible = true
    accassitemTable.value.callBack = accassItemCallback
    from.value.openDialog(accassitemTable.value, 'table')
  }
}

function accassItemCallback(raw) {
  const row = state.accassItemList
  row[state.index].accassValueId = ''
  row[state.index].accassValueCode = ''
  row[state.index].accassValueIdList = []
  row[state.index].accassValue = ''
  if(!raw) return;
  if(props.tableRow?.id) {
    row[state.index].accassValueId = raw.id
    row[state.index].accassValueCode = raw.code
    row[state.index].accassValue = raw.name
  } else {
    row[state.index].accassValueIdList = raw.map((it) => it.id)
    row[state.index].accassValue = raw.map((it) => it.name)
  }
}
</script>
