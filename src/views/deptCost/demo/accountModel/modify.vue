<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" @returnBack="returnBack">
    <ModifyForm ref="formRef" :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-accountTable>
        <el-input
            v-model="formInfo.data.accountTableName"
            class="not-mongolia"
            placeholder="请选择科目表"
            :disabled="true"
        >
          <template #append>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable v-if="showAuxiliaryTable" :table-info="tableInfo">
    </ModifyTable>
  </ModifyPage>
</template>

<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";

const { proxy } = getCurrentInstance();
const formRef = ref()
const emit = defineEmits(['callback'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  id: '',
  tableRow: {
    type: Object,
    default: () => ({})
  }
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const formInfo = ref({
  title: '会计科目',
  listType: {
    accountTypeList: [
      { key: '资产', value: '1' },
      { key: '负债', value: '2' },
      { key: '净资产', value: '3' },
      { key: '收入', value: '4' },
      { key: '费用', value: '5' }
    ],
    directionList: [
      { key: '借方', value: 'debit' },
      { key: '贷方', value: 'credit' }
    ],
    cashCategoryList: [
      { key: '一般科目', value: '1' },
      { key: '现金科目', value: '2' }
    ],
    accountAttributeList: [
      { key: '财务科目', value: '1' },
      { key: '预算科目', value: '2' }
    ],
    controlLevelList: [
      { key: '控制到末级', value: '1' },
      { key: '控制到一级', value: '2' }
    ],
    statusList: [
      { key: '已启用', value: '1' },
      { key: '已停用', value: '0' }
    ]
  },
  fieldList: [
    { label: '*科目表', value: 'accountTableName', type: 'slot', disabled: true },
    { label: '编码规则', value: 'codeRule', type: 'input', disabled: true },
    { label: '*科目编码', value: 'code', type: 'input' },
    { label: '*科目名称', value: 'name', type: 'input' },
    { label: '*科目类型', value: 'accountType', type: 'select', list: 'accountTypeList' },
    { label: '*科目方向', value: 'direction', type: 'select', list: 'directionList' },
    { label: '*现金分类', value: 'cashCategory', type: 'select', list: 'cashCategoryList' },
    { label: '*科目属性', value: 'accountAttribute', type: 'select', list: 'accountAttributeList' },
    { label: '科目控制级次', value: 'controlLevel', type: 'select', list: 'controlLevelList' },
    { label: '*生效日期', value: 'effectiveDate', type: 'date' },
    { label: '账簿余额双向显示', value: 'balanceDisplay', type: 'checkbox' },
    { label: '余额方向控制', value: 'directionControl', type: 'checkbox' },
    { label: '发生额方向控制', value: 'amountDirectionControl', type: 'checkbox' },
    { label: '内部往来科目', value: 'internalContact', type: 'checkbox' },
    { label: '启用状态', value: 'status', type: 'select', list: 'statusList' },
    { label: '科目说明', value: 'remark', type: 'textarea' },
    { label: '账册号', value: 'accountBookNo', type: 'checkbox' },
    { label: '票据日期', value: 'billDate', type: 'checkbox' },
    { label: '结算方式', value: 'settlementMethod', type: 'checkbox' },
  ],
  rules: {
    code: [{required: true, message: '请输入科目编码'}],
    name: [{required: true, message: '请输入科目名称'}],
    accountType: [{required: true, message: '请选择科目类型'}],
    direction: [{required: true, message: '请选择科目方向'}],
    cashCategory: [{required: true, message: '请选择现金分类'}],
    accountAttribute: [{required: true, message: '请选择科目属性'}],
    effectiveDate: [{required: true, message: '请选择生效日期'}],
  },
  data: {
    effectiveDate: '0000-00-00',
    status: '1'
  }
})

const showAuxiliaryTable = computed(() => !!props.id || formInfo.value.data.auxiliaryList?.length)

const tableInfo = ref({
  title: '辅助核算信息',
  fieldList: [
    { label: '序号', value: 'index', type: 'index' },
    { label: '辅助核算编码', value: 'auxiliaryCode' },
    { label: '辅助核算名称', value: 'auxiliaryName' },
    { label: '余额方向控制', value: 'balanceControl', type: 'checkbox' },
    { label: '是否可为空', value: 'canBeNull', type: 'checkbox' },
    { label: '是否可选非末级', value: 'canSelectNonLast', type: 'checkbox' },
  ],
  data: [],
  sectionRows: [],
  btnList: [
    { type: 'button', label: '新增', btType: 'primary', event: addAuxiliaryRow, show: true },
    { type: 'button', label: '删除', event: deleteAuxiliaryRows, show: true },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '80',
    btList: [
      {
        label: '删除',
        show: true,
        event: deleteAuxiliaryRow,
      },
    ]
  },
})

watch(() => props.tableRow, (row) => {
  if (row && Object.keys(row).length) {
    formInfo.value.data = { ...row }
    if (row.auxiliaryList) {
      tableInfo.value.data = row.auxiliaryList
    }
  }
}, { immediate: true })

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btn = tableInfo.value.btnList.find(b => b.label === '删除')
  if (btn) {
    btn.disabled = !rows.length
  }
}, { immediate: true })

function addAuxiliaryRow() {
  tableInfo.value.data.push({
    auxiliaryCode: '',
    auxiliaryName: '',
    balanceControl: false,
    canBeNull: false,
    canSelectNonLast: false
  })
}

function deleteAuxiliaryRow(row) {
  const index = tableInfo.value.data.indexOf(row)
  if (index !== -1) {
    tableInfo.value.data.splice(index, 1)
  }
}

function deleteAuxiliaryRows() {
  const rows = tableInfo.value.sectionRows
  if (!rows.length) return proxy.$message.warning('请选择要删除的数据')
  
  tableInfo.value.data = tableInfo.value.data.filter(item => !rows.includes(item))
}

function returnBack() {
  emit('callback', false)
}

function save() {
  formRef.value.validate().then(() => {
    const data = {
      ...formInfo.value.data,
      auxiliaryList: tableInfo.value.data
    }
    
    if (props.id) {
      console.log('编辑保存:', data)
    } else {
      console.log('新增保存:', data)
    }
    
    proxy.$message.success('保存成功')
    emit('callback', true)
  }).catch(() => {})
}
</script>