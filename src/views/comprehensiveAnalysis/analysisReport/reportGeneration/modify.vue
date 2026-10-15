<script setup>
import {getCurrentInstance, onMounted} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import OnlyOffice from "./OnlyOffice.vue"
import {analysisreportfile} from "@/api/reportGeneration";
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
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
  params: {
    type: Object,
    default: '',
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
const buttons = [
  { type: 'button', label: '保存', show: props.params.name === '报告生成', btType: 'primary', event: saveMethod, },
]

// 新增参数
const addInfo = ref({
  visible: false,
  ref: null,
  title: '保存报告',
  addOrUpdate: null,
  data: {},
  labelWidth: "100px",
  fieldList: [
    {
      label: "报告名称",
      value: "name",
      type: 'input',
      span: 24,
      required: true,
    },
    {
      label: "备注",
      value: "remark",
      span: 24,
      type: 'input',
    },
  ],
  rules: {
    accountSectionName: [{ required: true, message: '请填写报告名称' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})

const option = {
      url: '',
      isEdit: false,
      fileType: 'xlsx',
      title: '',
      user: {
        id: 'ceshi',
        name: 'ceshi',
      },
      // 是否可编辑 编辑-edit 预览-false
      mode: 'view',
      editUrl: '',
      key: '',
    }

onMounted(() => {
    getMain()
})

function getMain() {
  option.title = props.params.title
  option.editUrl = props.params.editUrl
  option.url = props.params.url
}
//  保存方法
function saveMethod() {
  addInfo.value.data = {
    name: props.params.title
  }
  addInfo.value.visible = true;
}

async function save() {
  const { code } = await analysisreportfile({
    ...addInfo.value.data,
    filePath: props.params.editUrl,
    reportCode: props.params.reportCode,
  })
  if(code === 200) {
    addInfo.value.visible = false;
    emit('returnModify', true)
    proxy.$message.success('保存成功')
  }
}
function goback() {
  addInfo.value.visible = false;
}

function returnBack() {
  emit('returnModify', false)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :btnList="buttons" :title="title" :noFullButton="true" @returnBack="returnBack">
    <OnlyOffice
        :option="option"
    />

  </ModifyPage>

  <!--    新增-->
  <PageDialog
      :title="addInfo.title"
      :visible="addInfo.visible"
      :btList="addInfo.btList"
      width="500px"
      class="model-panel-body paddingBox order-model-formBox"
      @reset="goback"
  >
    <!-- 条件栏 -->
    <page-form
        v-model:ref-obj="addInfo.ref"
        :data="addInfo.data"
        :field-list="addInfo.fieldList"
        :rules="addInfo.rules"
        :label-width="addInfo.labelWidth"
    >
    </page-form>
  </PageDialog>
</template>

<style scoped lang="scss">

</style>
