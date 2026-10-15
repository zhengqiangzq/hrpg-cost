<script setup>
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {project_dept_level} from "@/common/js/customDown";
const store = useStore()
import {itemsectionAdd, itemsectiontree, itemsectionUpdate} from "@/api/projectCost/accountingDept";

const { proxy } = getCurrentInstance()

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
  params: {
    type: Object,
    default: {},
  },
})
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
  title: '基础信息',
  options: {
    deptLevel: project_dept_level,
    accountList: [],
  },
  fieldList: [
    { label: '科室编码', value: 'code', type: 'input', disabled: props.id, },
    { label: '科室名称', value: 'name', type: 'input' },
    { label: '所属上级科室', value: 'parentName', type: 'slot' },
    { label: '科室级次', value: 'levelNum', clearable: false, type: 'select', list: 'deptLevel', disabled: true },
    { label: '核算属性', value: 'accountAttribute', type: 'select', list: 'accountList' },
    { label: "启用状态", value: "status", type: 'select-model', code: 'enabled_type', disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请填写科室编码', trigger: 'blur' }],
    name: [{ required: true, message: '请填写科室名称', trigger: 'blur' }],
    levelNum: [{ required: true, message: '请选择科室级次', trigger: 'blur' }],
    accountAttribute: [{ required: true, message: '请选择核算属性', trigger: 'blur' }],
  },
  data: {
    levelNum: 1,
    status: '1',
  }
})

const filterRef = ref()
const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  saveEmpty: true,
  query: {}
})

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    handleInfo()
  }
  formatterValue()
})


function formatterValue() {
  const source = store.state.permission.dict['dept_type']
  if(!source) return ''
  formInfo.value.options.accountList = []
  source.forEach((it) => {
    if(it.code === '1' || it.code === '2') {
      formInfo.value.options.accountList.push({
        key: it.name,
        value: it.code
      })
    }
  })
}

function handleInfo() {
  formInfo.value.data = {
    levelNum: 1,
    status: '1',
    ...props.params,
  }
}

function getMain() {
  formInfo.value.data = props.params || {}
}

function returnBack() {
  emit('returnModify', false)
}
const save = (err) => {
  if (err) return
  const api = props.id ? itemsectionUpdate : itemsectionAdd
  api(formInfo.value.data).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function openDeptSelector() {
  treeInfo.value.visible = true
  treeInfo.value.api = itemsectiontree
  treeInfo.value.callBack = (row) => {
    formInfo.value.data.parentId = row?.id
    formInfo.value.data.parentName = row?.name
    formInfo.value.data.levelNum = row ? Number(row.levelNum) + 1 : 1
  }
  filterRef.value.openDialog(treeInfo.value, 'tree')
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm ref="filterRef" :form-info="formInfo"
                :listTypeInfo="formInfo.options">
      <template v-slot:form-parentName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择所属上级科室"
            v-model="formInfo.data.parentName"
        >
          <template #append>
            <el-icon @click="openDeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
