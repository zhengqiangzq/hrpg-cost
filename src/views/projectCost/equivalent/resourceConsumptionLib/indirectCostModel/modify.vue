<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {lastLeafCostCategory} from "@/api/costCategory";
import {
  addResourceConsumptionLibIndirectCostModel,
  oneResourceConsumptionLibIndirectCostModel, updateResourceConsumptionLibIndirectCostModel
} from "@/api/projectCost/resourceConsumptionLibIndirectCostModel";
import {allProfileConfigKeyFactors} from "@/api/projectCost/profileConfigKeyFactors";
import {lastLeafCostItem} from "@/api/costItem";

const store = useStore()
const { proxy } = getCurrentInstance();

const TABLE_FILED = {
  '1': [],
  '2': [
    { label: '成本分类编码', value: 'costCategoryCode' },
    { label: '成本分类名称', value: 'costCategoryName' },
  ],
  '3': [
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
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
  accassItems: (store.state.permission.dict['cost_apportionment_method'] || []).map(it => {
    return {
      key: it.name,
      value: it.code
    }
  }),
})
console.log(listTypeInfo)

const formInfo = ref({
  title: '计算方法',
  fieldList: [
    { label: '核算科室', value: 'deptName', type: 'slot' },
    { label: '分摊方法', value: 'apportionmentMethod', type: 'select', collapseTags: true, list: 'accassItems', },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    deptName: [{ required: true, message: '请选择科室' }],
    apportionmentMethod: [{ required: true, message: '请选择分摊方法' }],
  },
  data: {
    status: 0,
  }
})

const tableInfo = ref({
  title: '明细信息',
  fieldList: [],
  data: [],
  btnList: [
    { label: '一键设置', btType: 'primary', type: 'button', event: () => openKeyFactorsSelector() }
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
})
function handleEvent(row,data) {
  if(row?.label === '分摊方法') {
    changeMethod(data)
  }
}

function getMain() {
  tableInfo.value.data = []
  oneResourceConsumptionLibIndirectCostModel({id: props.id}).then(res => {
    formInfo.value.data = res.data
    tableInfo.value.data = res.data.detailVOList
    changeMethod(formInfo.value.data.apportionmentMethod,true)
  })
}

const save = (err, close = true) => {
  if (err) return
  const api = props.id ? updateResourceConsumptionLibIndirectCostModel : addResourceConsumptionLibIndirectCostModel
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
      tableInfo.value.data = [{ modelId: props.id }]
  } else if (way == 2 && !flag) {
    await lastLeafCostCategory({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          modelId: props.id,
          costCategoryId: row.id,
          costCategoryCode: row.code,
          costCategoryName: row.name
        }
      })
    })
  } else if (way == 3 && !flag) {
    await lastLeafCostItem({ enable: 1 }).then(res => {
      tableInfo.value.data = res.data.map(row => {
        return {
          modelId: props.id,
          costItemId: row.id,
          costItemCode: row.code,
          costItemName: row.name
        }
      })
    })
  }
  way = way || '1'
  tableInfo.value.fieldList = [
    ...TABLE_FILED[way],
    { label: '关键因素编码', value: 'keyFactorSettingCode', type: 'slot', rules: [{ required: true, message: '请选择关键因素' }] },
    { label: '关键因素名称', value: 'keyFactorSettingName' },
  ]

  // if(formInfo.value.data.deptId && !flag) {
  //   await getKeyFactors()
  // }
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

async function getKeyFactors() {
  await allProfileConfigKeyFactors({status: 1}).then(res => {
    if( res.data.length === 0 ) return
    tableInfo.value.data.forEach((it, index) => {
      const _data = res.data[index] || {}
      it.keyFactorSettingId = _data.id
      it.keyFactorSettingCode = _data.code
      it.keyFactorSettingName = _data.name
    })
  })
}

function openKeyFactorsSelector(row) {
  tableParameter.value.type = 'keyFactors'
  tableParameter.value.title = '关键因素'
  tableParameter.value.query = {}
  tableParameter.value.callBack = (raw) => {
    if (!row) {
      tableInfo.value.data.forEach(it => {
        it.keyFactorSettingId = raw.id
        it.keyFactorSettingCode = raw.code
        it.keyFactorSettingName = raw.name
      })
    } else {
      row.keyFactorSettingId = raw.id
      row.keyFactorSettingCode = raw.code
      row.keyFactorSettingName = raw.name
    }
  }
  tableParameter.value.visible = true
  tableInfo.value.tableRef.openDialog(tableParameter.value, 'table')
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm
        :listTypeInfo="listTypeInfo"
        :form-info="formInfo"
        @handleEvent="handleEvent"
    >
      <template #form-deptName>
        <el-input
            v-model="formInfo.data.deptName"
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
      <template #col-keyFactorSettingCode="{ row }">
        <el-input
            v-model="row.keyFactorSettingCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择关键因素编码"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openKeyFactorsSelector(row)"><Search /></el-icon>
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
