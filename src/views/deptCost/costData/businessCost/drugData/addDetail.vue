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
          <template #form-drugName>
            <el-input
                v-model="state.data.drugName"
                class="not-mongolia"
                type="input"
                placeholder="请选择药品名称"
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
import {deptDrugCostDetailadd, deptDrugCostDetailupdate} from "@/api/deptCost/costData/drugData";

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
    {label: '核算科室', span: 12, value: 'deptName', type: 'slot'},
    {label: '药品名称', span: 12, value: 'drugName', type: 'slot' },
    {label: '药品分类', span: 12, value: 'drugFinCategoryName', type: 'input', disabled: true },
    { label: '资金来源', span: 12, value: 'fundSource', type: 'select-model', code: 'asset_capital_source' },
    { label: '是否收费', span: 12, value: 'isChargeName', type: 'input', disabled: true },
    {label: '金额', span: 12, value: 'money', type: 'money'},
    {label: '数量', span: 12, value: 'qty', type: 'number'},
    {label: '备注', span: 12, value: 'remark', type: 'input'},
  ],
  data: {},
  rules: {
    deptName: [{ required: true, message: '请选择科室名称', trigger: 'blur'}],
    drugName: [{ required: true, message: '请选择药品名称', trigger: 'blur'}],
    fundSource: [{ required: true, message: '请选择资金来源', trigger: 'blur'}],
    money: [{ required: true, message: '请输入金额', trigger: 'blur'}],
    qty: [{ required: true, type: 'number', min: 0, message: '数量不能小于零', trigger: 'blur'}],
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
  const api = id ? deptDrugCostDetailupdate : deptDrugCostDetailadd
  formRef.value.validate((valid) => {
    if (valid) {
      state.data.unitPrice = Number(state.data.money) / Number(state.data.qty)
      state.data.unitPrice = state.data.unitPrice.toFixed(2)
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

// 物资信息
function openProjectSelector() {
  tableParameter.title = '药品信息'
  tableParameter.visible = true
  tableParameter.type = 'drugItem'
  tableParameter.query = {
    status: 1,
  }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}

function feeItemCallback(raw) {
  state.data.drugId = raw.id
  state.data.drugCode = raw.code
  state.data.drugName = raw.name
  state.data.drugFinCategoryId = raw.drugFinCategoryId
  state.data.drugFinCategoryCode = raw.drugFinCategoryCode
  state.data.drugFinCategoryName = raw.drugFinCategoryName
  state.data.isCharge = raw.charge
  state.data.isChargeName = raw.chargeName
}
</script>
