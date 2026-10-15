<template>
  <div class="app-container-flex">
    <page-form
        class="paddingBox order-model-formBox flex_wrap_start_start"
        ref="from"
        v-model:ref-obj="formInfo.ref"
        :data="formInfo.data"
        :field-list="formInfo.fieldList"
        :rules="formInfo.rules"
        :label-width="formInfo.labelWidth"
    >
      <template v-slot:form-name>
        <el-input
            v-model="formInfo.data.name"
            class="not-mongolia"
            type="input"
            placeholder="请选择项目"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="opentableSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template v-slot:form-centDeptName>
        <el-input
            v-model="formInfo.data.centDeptName"
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
    </page-form>
  </div>
</template>


<script setup name="home">

const formInfo = reactive({
  ref: null,
  data: {
  },
  fieldList: [
    { label: '预算年度', value: 'year', type: 'date', dateType: 'year', valueFormat: 'YYYY' },
    { label: '预算项目名称', value: 'name', type: 'slot' },
    { label: '预算项目编码', value: 'code', type: 'input', disabled: true },
    { label: '归口科室', value: 'centDeptName', type: 'slot' },
    { label: '业务科室', value: 'deptName', type: 'input' },
    { label: '预算金额', value: 'totalAmount', type: 'input', disabled: true },
    { label: '数据来源', value: 'dataSourceName', type: 'input', disabled: true },
  ],
  rules: {
    year: [{ required: true, message: '请选择预算年度', trigger: 'change' }],
  },
  labelWidth: '140px',
})

const from = ref()

const tableParameter = ref({
  title: '预算项目',
  type: 'project',
  visible: false,
  checkBox: false,
  callBack: callBackName,
  filters: [
    {
      type: 'input',
      label: '名称/编码',
      value: 'OrBatchLike#name#code',
    },
    {
      type: 'input',
      label: '单位',
      value: 'OrBatchLike#unit',
    }
  ],
  fieldList: [
    {label: '单位', value: 'unit'},
  ],
  query: {

  }
})
function callBackName(data) {
  formInfo.data.name = data.name;
  formInfo.data.projectId = data.id;
  formInfo.data.code = data.code;
  tableParameter.value.visible = false
}


function opentableSelector() {
  tableParameter.value.visible = true
  from.value.openDialog(tableParameter.value, 'table')
}

const treeParameter = ref({
  title: '归口科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  callBack: callBackDept,
  query: {}
})
function callBackDept(data) {
  formInfo.data.centDeptName = data.name;
  formInfo.data.centDeptId = data.id;
  treeParameter.value.visible = false
}

function openDeptSelector() {
  treeParameter.value.visible = true
  from.value.openDialog(treeParameter.value, 'tree')
}



</script>






