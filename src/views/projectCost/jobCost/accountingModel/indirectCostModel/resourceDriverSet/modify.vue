<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {lastLeafCostCategory} from "@/api/costCategory";
import {
  itemResourceDriverConfigbatchSave,
  itemResourceDriverConfigId,
  itemResourceDriverConfigsave,
  itemResourceDriverConfigupdateById
} from "@/api/indirectCostModel";

const { proxy } = getCurrentInstance();

const store = useStore()
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
  title: '资源动因',
  fieldList: [
    { label: '核算属性', value: 'deptAttr', type: 'select-model', code: 'dept_type', show: props.batch },
    { label: '科室编码', value: 'deptCode', type: 'slot', show: !props.batch },
    { label: '科室名称', value: 'deptName', type: 'input', show: !props.batch, disabled: true },
    { label: '分摊方法', value: 'apportionmentMethod', type: 'select', collapseTags: true, list: 'accassItems', },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    deptAttr: [{ required: true, message: '请选择核算属性' }],
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
  btnList: [],
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

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    changeMethod(formInfo.value.data.apportionmentMethod)
  }
})
function handleEvent(row,data) {
  if(row.value === 'apportionmentMethod') {
    changeMethod(data)
  }
}

async function getMain() {
    await itemResourceDriverConfigId({id:props.id}).then(res => {
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
  if(props.batch) {
    //   批量新增
    if(formInfo.value.data.deptAttr === '3' || formInfo.value.data.deptAttr === '4') {
      return proxy.$message.warning('批量新增请选择临床服务类或医疗技术类')
    }
  }
  const api = props.id ? itemResourceDriverConfigupdateById : props.batch ? itemResourceDriverConfigbatchSave : itemResourceDriverConfigsave
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
    { label: '资源动因编码', value: 'resourceDriverCode', type: 'slot', rules: [{ required: true, message: '请选择资源动因' }] },
    { label: '资源动因名称', value: 'resourceDriverName' },
  ]
}

function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  formInfo.value.data.deptId = raw.id
  formInfo.value.data.deptCode = raw.code
  formInfo.value.data.deptName = raw.name
}
function openAllocationParamSelector(row) {
  tableParameter.value.type = 'driverresource'
  tableParameter.value.title = '资源动因'
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
  row.resourceDriverCode = raw.code
  row.resourceDriverName = raw.name
  row.resourceDriverId = raw.id
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm
        @handleEvent="handleEvent"
        :listTypeInfo="listTypeInfo" :form-info="formInfo">
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
      <template #col-resourceDriverCode="{ row }">
        <el-input
            v-model="row.resourceDriverCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择资源动因"
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
