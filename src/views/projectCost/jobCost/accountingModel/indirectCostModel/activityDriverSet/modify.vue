<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {lastLeafCostCategory} from "@/api/costCategory";
const store = useStore()
import {
  batchAddAllocationMethodDefinition,
} from "@/api/allocationMethodDefinition";
import {
  itemActivityDriverConfigId, itemActivityDriverConfigsave, itemActivityDriverConfigupdateById,
} from "@/api/indirectCostModel";
import {itemdeptWorkRelation} from "@/api/relation";

const { proxy } = getCurrentInstance();

const TABLE_FILED = {
  '1': [],
  '2': [
    { label: '成本分类编码', value: 'costCategoryCode' },
    { label: '成本分类名称', value: 'costCategoryName' },
  ],
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

const listTypeInfo = ref({
  accassItems: [],
})

function formatterValue() {
  const source = store.state.permission.dict['cost_apportionment_method']
  if(!source) return ''
  listTypeInfo.value.accassItems = []
  source.forEach((it) => {
    if(it.code !== '3') {
      listTypeInfo.value.accassItems.push({
        key: it.name,
        value: it.code
      })
    }
  })
}
formatterValue()
const formInfo = ref({
  title: '作业动因',
  fieldList: [
    { label: '核算属性', value: 'accountAttribute', type: 'select-model', code: 'dept_type', show: props.batch },
    { label: '科室编码', value: 'deptCode', type: 'slot', show: !props.batch },
    { label: '科室名称', value: 'deptName', type: 'input', disabled: true },
    { label: '分摊方法', value: 'apportionmentMethod', type: 'select', disabled: false, collapseTags: true, list: 'accassItems', },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    accountAttribute: [{ required: true, message: '请选择核算属性' }],
    deptCode: [{ required: true, message: '请选择科室' }],
    apportionmentMethod: [{ required: true, message: '请选择分摊方法' }],
  },
  data: {
    status: 0
  }
})

const tableInfo = ref({
  title: '明细信息',
  fieldList: [],
  data: [],
  btnList: [
    { label: '一键设置', btType: 'primary', type: 'button', event: () => openAllocationParamSelector() }
  ],
  handle: null,
  sectionRows: []
})
const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {}
})
const tableParameter = ref({
  title: '',
  type: '',
  pager: false,
  checkBox: false,
  visible: false,
  fieldList: [],
  callBack: null,
  query: {}
})

const tableData = ref()

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    changeMethod(formInfo.value.data.apportionmentMethod)
  }
  formInfo.value.fieldList[3].disabled = !!props.id
})
function handleEvent(row,data) {
  if(row?.label === '分摊方法') {
    changeMethod(data)
  }
}

function getMain() {
  tableInfo.value.data = []
  itemActivityDriverConfigId({id: props.id}).then(res => {
    formInfo.value.data = res.data
    tableInfo.value.data = res.data.detailVOList
    changeMethod(formInfo.value.data.apportionmentMethod,true)
  })
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
  const api = props.id ? itemActivityDriverConfigupdateById : props.batch ? batchAddAllocationMethodDefinition : itemActivityDriverConfigsave
  api({
    ...formInfo.value.data,
    detailVOList: tableInfo.value.data
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.value.data = {}
        tableInfo.value.data = []
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

async function changeMethod(way,flag) {
  if (formInfo.value.isDetailInited) {
    delete formInfo.value.isDetailInited
    return
  }
  if (way == 1 && !flag) {
      tableInfo.value.data = [{ resourceDriverConfigId: props.id }]
  } else if (way == 2 && !flag) {
    await lastLeafCostCategory({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          resourceDriverConfigId: props.id,
          costCategoryId: row.id,
          costCategoryCode: row.code,
          costCategoryName: row.name
        }
      })
    })
  }
  way = way || '1'
  tableInfo.value.fieldList = [
    ...TABLE_FILED[way],
    { label: '作业编码', value: 'itemJobCode' },
    { label: '作业名称', value: 'itemJobName' },
    { label: '作业动因编码', value: 'activityDriverCode', type: 'slot', rules: [{ required: true, message: '请选择作业动因' }] },
    { label: '作业动因名称', value: 'activityDriverName' },
  ]

  if(formInfo.value.data.deptId && !flag) {
    await getjob(formInfo.value.data.deptId)
  }
}

function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  formInfo.value.data.deptId = raw.id
  formInfo.value.data.deptCode = raw.code
  formInfo.value.data.deptName = raw.name
  changeMethod(formInfo.value.data.apportionmentMethod)
}

async function getjob(deptId) {
  await itemdeptWorkRelation({deptId: deptId}).then(res => {
    const datas = []
    if( res.data.length === 0 ) return
    tableInfo.value.data.forEach((it) => {
      res.data.forEach((item) => {
        datas.push({
          ...it,
          itemJobId: item.itemJobId,
          itemJobCode: item.itemJobCode,
          itemJobName: item.itemJobName,
        })
      })
    })
    tableInfo.value.data = datas;
  })
}

function openAllocationParamSelector(row) {
  tableParameter.value.type = 'driveractivity'
  tableParameter.value.title = '作业动因'
  tableParameter.value.currentRow = row
  tableParameter.value.query = {
    type: 'resource'
  }
  tableParameter.value.callBack = allocationParamCallback
  tableParameter.value.visible = true
  tableInfo.value.tableRef.openDialog(tableParameter.value, 'table')
}
function allocationParamCallback(raw) {
  const row = tableParameter.value.currentRow
  if (!row) {
    tableInfo.value.data.forEach(_row => {
      _row.activityDriverCode = raw.code
      _row.activityDriverName = raw.name
      _row.activityDriverId = raw.id
    })
    return
  }
  row.activityDriverCode = raw.code
  row.activityDriverName = raw.name
  row.activityDriverId = raw.id
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm
        :listTypeInfo="listTypeInfo"
        :form-info="formInfo"
        @handleEvent="handleEvent"
    >
      <template #form-deptCode>
        <el-input
            v-model="formInfo.data.deptCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择科室信息"
            :disabled="true"
        >
          <template #append>
            <el-icon v-if="!props.id" @click="openDeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable :checkbox="false" :isDynamic="true" :table-info="tableInfo">
      <template #col-activityDriverCode="{ row }">
        <el-input
            v-model="row.activityDriverCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择作业动因"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAllocationParamSelector(row)"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
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
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
