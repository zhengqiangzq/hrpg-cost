<script setup>
import {getCurrentInstance, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {lastLeafCostItem} from "@/api/costItem";
import {lastLeafCostCategory} from "@/api/costCategory";
import {
  addAllocationMethodDefinition,
  batchAddAllocationMethodDefinition, oneAllocationMethodDefinition,
  updateAllocationMethodDefinition
} from "@/api/allocationMethodDefinition";

const { proxy } = getCurrentInstance();

const TABLE_FILED = {
  '1': [],
  '2': [
    { label: '成本分类编码', value: 'costTypeCode' },
    { label: '成本分类名称', value: 'costTypeName' },
  ],
  '3': [
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' }
  ]
}

const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  batch: false,
  id: '',
  flowFormType: ''
})
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: true }
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = ref({
  title: '分摊方法',
  fieldList: [
    { label: '核算属性', value: 'accountAttribute', type: 'select-model', code: 'dept_type', show: props.batch },
    { label: '科室编码', value: 'deptCode', type: 'slot', show: !props.batch },
    { label: '科室名称', value: 'deptName', type: 'input', disabled: true },
    { label: '分摊方法', value: 'way', disabled: props.id, type: 'select-model', code: 'cost_apportionment_method' },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    accountAttribute: [{ required: true, message: '请选择核算属性' }],
    deptCode: [{ required: true, message: '请选择科室' }],
    way: [{ required: true, message: '请选择分摊方法' }],
  },
  data: {
    status: 0
  }
})

const tableInfo = ref({
  title: '明细信息',
  fieldList: [],
  data: [],
  btnList: [],
  handle: null,
  sectionRows: []
})
const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
const tableParameter = ref({
  title: '',
  type: '',
  pager: false,
  checkBox: false,
  visible: false,
  filters: [],
  fieldList: [],
  callBack: null,
  query: {}
})

const isUpdate = ref(false)

watch(() => formInfo.value.data.way, (way) => {
  if (!way) return
  changeMethod(way)
})

onMounted(() => {
  if (props.id) {
    getMain()
    isUpdate.value = true;
  } else {
    isUpdate.value = false;
    changeMethod(formInfo.value.data.way)
  }
})

function getMain() {
  oneAllocationMethodDefinition(props.id).then(res => {
    formInfo.value.data = res.data
    tableInfo.value.data = res.data.paramList

    console.log('表格劣币哦数据', tableInfo.value)
  })
}

function returnBack() {
  emit('returnModify', true)
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  const api = isUpdate.value ? updateAllocationMethodDefinition : props.batch ? batchAddAllocationMethodDefinition : addAllocationMethodDefinition
  api({
    ...formInfo.value.data,
    paramList: tableInfo.value.data
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        isUpdate.value = false;
        tableInfo.value.data = []
        formInfo.value.data = {
          way: '1'
        }
        changeMethod(formInfo.value.data.way)
        formInfo.value.fieldList[3].disabled = false;
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

async function changeMethod(way) {
  if (formInfo.value.isDetailInited) {
    delete formInfo.value.isDetailInited
    return
  }
  if (way == 1 && !isUpdate.value) {
    tableInfo.value.data = [{ apportionmentWayId: props.id }]
  } else if (way == 2 && !isUpdate.value) {
    await lastLeafCostCategory({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          apportionmentWayId: props.id,
          costTypeId: row.id,
          costTypeCode: row.code,
          costTypeName: row.name
        }
      })
    })
  } else if (way == 3 && !isUpdate.value) {
    await lastLeafCostItem({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          apportionmentWayId: props.id,
          costItemId: row.id,
          costItemCode: row.code,
          costItemName: row.name
        }
      })
    })
  }
  tableInfo.value.fieldList = [
    ...TABLE_FILED[way],
    { label: '分摊参数编码', value: 'apportionmentParamCode', type: 'slot', rules: [{ required: true, message: '请选择分摊参数' }] },
    { label: '分摊参数名称', value: 'apportionmentParamName' },
    { label: '备注', value: 'remark', type: 'input' }
  ]
}

function openDeptSelector() {
  treeInfo.value.visible = true
  treeInfo.value.isLeaf = true
}
function treeCallback(raw) {
  formInfo.value.data.deptId = raw.id
  formInfo.value.data.deptCode = raw.code
  formInfo.value.data.deptName = raw.name
}
function openAllocationParamSelector(row) {
  tableParameter.value.type = 'allocationParam'
  tableParameter.value.title = '分摊参数'
  tableParameter.value.currentRow = row
  tableParameter.value.query = {
    status: 1
  }
  tableParameter.value.callBack = allocationParamCallback
  tableParameter.value.visible = true
  tableInfo.value.tableRef.openDialog(tableParameter.value, 'table')
}
function allocationParamCallback(raw) {
  const row = tableParameter.value.currentRow
  row.apportionmentParamCode = raw.code
  row.apportionmentParamName = raw.name
  row.apportionmentParamId = raw.id
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" @returnBack="returnBack" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo">
      <template #form-deptCode>
        <el-input
            v-model="formInfo.data.deptCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择科室信息"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable :checkbox="false" :isDynamic="true" :table-info="tableInfo">
      <template #col-apportionmentParamCode="{ row }">
        <el-input
            v-model="row.apportionmentParamCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择分摊参数"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAllocationParamSelector(row)"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
    <SelectFilterShareDept
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
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
