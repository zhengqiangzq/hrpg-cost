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
          <template #form-feeItemName>
            <el-input
                v-model="state.data.feeItemName"
                :class="{ 'not-mongolia': !id }"
                type="input"
                placeholder="请选择收费项目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openFeeItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-executeDeptName>
            <el-input
                v-model="state.data.executeDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择执行科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector('')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-orderDeptName>
            <el-input
                v-model="state.data.orderDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择开单科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector('order')"><Search /></el-icon>
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
        :checkBox="title === '新增明细数据'"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>
<script setup>
import {ref, watch} from "vue";
import {addIncomeDataDetail, updateIncomeDataDetail} from "@/api/incomeData";

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

const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: [
    {label: '收费项目', value: 'feeItemName', span: 12, type: 'slot'},
    {label: '收费类别', value: 'feeCategoryName', span: 12, type: 'input', disabled: true},
    {label: '开单科室', value: 'orderDeptName', span: 12, type: 'slot'},
    {label: '执行科室', value: 'executeDeptName', span: 12, type: 'slot'},
    {label: '金额', value: 'money', span: 12, type: 'money'},
    {label: '数量', value: 'qty', span: 12, type: 'number'},
    {label: '备注', value: 'remark', span: 12, type: 'input'},
  ],
  data: {},
  rules: {
    feeItemName: [{ required: true, message: '请选择收费项目'}],
    orderDeptName: [{ required: true, message: '请选择开单科室'}],
    executeDeptName: [{ required: true, message: '请选择执行科室'}],
    money: [
        { required: true, message: '请输入金额'},
      { pattern: /\d/, message: '请输入金额', trigger: 'blur' }
    ],
    qty: [
      { required: true, message: '请输入数量'},
      { pattern: /^[1-9].*$/, message: '数量需要大于零', trigger: 'blur' }
    ],
  },
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {},
  checkedList: []
})
const emit = defineEmits()

const billingDept = ref([])
const executeDept = ref([])
const tableParameter = ref({
  visible: false,
  checkBox: false,
  pager: true,
  type: 'feeItem',
  title: '收费项目',
  callback: null,
  filters: [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ],
  fieldList: [],
  query: {
    status: 1,
  }
})

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      billingDept.value = []
      executeDept.value = []
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
  const api = id ? updateIncomeDataDetail : addIncomeDataDetail
  formRef.value.validate((valid) => {
    if (valid) {
      state.data.unitPrice = state.data.money / state.data.qty
      state.data.unitPrice = state.data.unitPrice.toFixed(2)
      if (!state.data.deptIncomeId) {
        state.dialogVisible = false
        const data = JSON.parse(JSON.stringify(state.data))
        emit('callback', data)
        return
      }
      let fromData = state.data;
      // 编辑 新增明细处理批量数据
      if(props.title === '新增明细数据') {
        fromData = handleDetail(state.data)
      }
      api(fromData).then(({code}) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    }
  })
}

function handleDetail(raw) {
  const orderDept = raw.orderDeptId
  const executeDept = raw.executeDeptId
  let detailData = []
  for (let i = 0; i < orderDept.length; i++) {
    for (let k = 0; k < executeDept.length; k++) {
      detailData.push({
        ...raw,
        orderDeptCode: raw.orderDeptCode[i],
        orderDeptId: raw.orderDeptId[i],
        orderDeptName: raw.orderDeptName[i],
        deptIncomeId: state.data.deptIncomeId,
        executeDeptCode: raw.executeDeptCode[k],
        executeDeptId: raw.executeDeptId[k],
        executeDeptName: raw.executeDeptName[k],
      })
    }
  }

  return detailData;
}

function openDeptSelector(target) {
  treeInfo.value.target = target
  treeInfo.value.title = target === 'order' ? '开单科室' : '执行科室'
  treeInfo.value.checkedList = target === 'order' ? billingDept.value : executeDept.value
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  if (treeInfo.value.target === 'order') {
    if(props.title === '新增明细数据') {
      billingDept.value = raw
      const rows = raw && raw.filter(it => !it.childList)
      state.data.orderDeptId = rows.map(it => it.id)
      state.data.orderDeptCode = rows.map(it => it.code)
      state.data.orderDeptName = rows.map(it => it.name)
    } else {
      state.data.orderDeptId = raw.id
      state.data.orderDeptCode = raw.code
      state.data.orderDeptName = raw.name
    }
  } else {
    if(props.title === '新增明细数据') {
      executeDept.value = raw
      const rows = raw && raw.filter(it => !it.childList)
      state.data.executeDeptId = rows.map(it => it.id)
      state.data.executeDeptCode = rows.map(it => it.code)
      state.data.executeDeptName = rows.map(it => it.name)
    } else {
      state.data.executeDeptId = raw.id
      state.data.executeDeptCode = raw.code
      state.data.executeDeptName = raw.name
    }
  }
}

function openFeeItemSelector() {
  tableParameter.value.visible = true
  tableParameter.value.callBack = feeItemCallback
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function feeItemCallback(raw) {
  state.data.chargeItemId = raw.id
  state.data.feeItemCode = raw.code
  state.data.feeItemName = raw.name
  state.data.feeCategoryCode = raw.feeCategoryCode
  state.data.feeCategoryName = raw.feeCategoryName
}
</script>

