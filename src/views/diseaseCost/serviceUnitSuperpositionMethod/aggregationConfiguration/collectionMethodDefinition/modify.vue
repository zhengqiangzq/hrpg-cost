<script setup>
import {getCurrentInstance, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {lastLeafCostItem} from "@/api/costItem";
import {lastLeafCostCategory} from "@/api/costCategory";
import {
  addCollectionMethodDefinition,
  oneCollectionMethodDefinition,
  updateCollectionMethodDefinition
} from "@/api/diseaseCostCollectionMethodDefinition";
import {sectiontree} from "@/api/accountingDepartment";

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
  id: '',
  flowFormType: ''
})
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: !props.id }
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
  title: '归集方法',
  fieldList: [
    { label: '科室编码', value: 'deptCode', type: 'slot' },
    { label: '科室名称', value: 'deptName', type: 'input', disabled: true },
    { label: '归集方法', value: 'way', type: 'select-model', code: 'cost_apportionment_method' },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    deptCode: [{ required: true, message: '请选择科室' }],
    way: [{ required: true, message: '请选择归集方法' }],
  },
  data: {
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

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  mark: null,
  api: sectiontree,
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

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    startWayWatch()
    changeMethod(formInfo.value.data.way)
  }
})

function startWayWatch() {
  watch(() => formInfo.value.data.way, (way) => {
    if (!way) return
    changeMethod(way)
  })
}

function getMain() {
  oneCollectionMethodDefinition({ id: props.id }).then(res => {
    formInfo.value.data = res.data
    changeMethod(formInfo.value.data.way, true)
    tableInfo.value.data = res.data.paramList
    startWayWatch()
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
  const api = props.id ? updateCollectionMethodDefinition : addCollectionMethodDefinition
  api({
    ...formInfo.value.data,
    paramList: tableInfo.value.data
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

async function changeMethod(way, noRequest) {
  if (!TABLE_FILED[way]) return
  tableInfo.value.fieldList = [
    ...TABLE_FILED[way],
    { label: '归集参数编码', value: 'apportionmentParamCode', type: 'slot', rules: [{ required: true, message: '请选择归集参数' }] },
    { label: '归集参数名称', value: 'apportionmentParamName' },
    { label: '备注', value: 'remark', type: 'input' }
  ]
  if (noRequest) return
  if (way == 1) {
    tableInfo.value.data = [{ apportionmentWayId: props.id }]
  } else if (way == 2) {
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
  } else if (way == 3) {
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
}

function openDeptSelector() {
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  formInfo.value.data.deptId = raw.id
  formInfo.value.data.deptCode = raw.code
  formInfo.value.data.deptName = raw.name
}
function openAllocationParamSelector(row) {
  tableParameter.value.type = 'diseaseAggregationParams'
  tableParameter.value.title = '归集参数'
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
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
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
            placeholder="请选择归集参数"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAllocationParamSelector(row)"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :api="deptTreeInfo.api"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
