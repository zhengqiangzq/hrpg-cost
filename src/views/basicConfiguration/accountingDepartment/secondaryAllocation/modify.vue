<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import AddDetail from "./addDetail.vue";
import axios from "axios";
import {
  oneSecondAllocationType,
  secondAllocationpage,
  secondAllocationdeleteByIds,
  secondAllocationTypeadd,
  secondAllocationTypeupdate, secondAllocationexportExcel,
} from "@/api/accountingDepartment";
import {exportTemplateExcel} from "@/api/pub";
import {ElLoading} from "element-plus";

const { proxy } = getCurrentInstance();


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
  title: '二次分配',
  fieldList: [
    { label: '成本来源', value: 'costSource', type: 'select-model', code: 'cost_source' },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    costSource: [{ required: true, message: '请选择成本来源' }],
  },
  data: {
    status: 0
  }
})
const uploadInfo = reactive({
  action: axios.defaults.baseURL + '/secondAllocation/importExcel',
  headers: {
    Authorization: proxy.$store.state.user.token,
    'x-auth-token': proxy.$store.state.user.token,
  },
  data: {
    typeId: ''
  },
  loading: {},
})


const tableInfo = ref({
  refresh: 1,
  query: {
    id: props.id
  },
  title: '明细信息',
  fieldList: [
    { label: '源科室编码', value: 'sourceSectionCode', },
    { label: '源科室名称', value: 'sourceSectionName' },
    { label: '承担科室编码', value: 'targetSectionCode' },
    { label: '承担科室名称', value: 'targetSectionName' },
    { label: '参数值', value: 'param' }
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => addDetail() },
    { type: 'button', label: '删除', event: delDetail },
    { type: 'button', show: props.id, label: '下载模板', event: downloadTemplate },
    { type: 'slot', show: props.id, label: '导入', value: 'uploadFile' },
    { type: 'button', show: props.id, label: '导出', event: exportData },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('costData:update'),
        event: addDetail,
      },
      {
        label: '删除',
        show: proxy.$permission('costData:delete'),
        event: remove,
      },
    ]
  },
  sectionRows: []
})
const tableParameter = ref({
  title: '',
  type: '',
  checkBox: false,
  visible: false,
  callBack: null,
  query: {}
})

onMounted(() => {
  if (props.id) {
    tableInfo.value.api = secondAllocationpage
    getMain()
  } else {

  }
})


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })


function getMain() {
  oneSecondAllocationType({
    id: props.id
  }).then(res => {
    formInfo.value.data = res.data
    uploadInfo.data.typeId = formInfo.value.data.id
    getDetail()
  })
}

function getDetail() {
  tableInfo.value.refresh = Math.random()
}

// 导出Excel
function exportData() {
  secondAllocationexportExcel({typeId: formInfo.value.data.id}).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('二次分配详情导入模板').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '二次分配详情导入模板')
    }
  })
}

// 新增明细
const addDetailInfo = ref({
  visible: false,
  row: null
})

// 打开新增明细
function addDetail(row) {
  addDetailInfo.value.index = tableInfo.value.data.indexOf(row)
  addDetailInfo.value.row = row ? JSON.parse(JSON.stringify(row)) : {
    secondAllocationTypeId: formInfo.value.data.id
  }
  addDetailInfo.value.visible = true;
}

function addDetailCallback(raw) {
  addDetailInfo.value.visible = false
  if (!raw) return
  if (typeof raw == 'object') {
    if (addDetailInfo.value.index === -1) {
      tableInfo.value.data.push({
        ...raw,
      })
    } else {
      tableInfo.value.data[addDetailInfo.value.index] = raw
    }
  } else {
    // 刷新明细
    getDetail()
  }
}

// 删除明细
function remove(row) {
  if (!formInfo.value.data.id) {
    const data = [row]
    tableInfo.value.data = tableInfo.value.data.filter(it => data.indexOf(it) === -1)
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    secondAllocationdeleteByIds([row.id]).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getDetail()
      }
    })
  })
}
// 删除明细
function delDetail(row) {
  if (!formInfo.value.data.id) {
    const data = row.id ? [row] : tableInfo.value.sectionRows
    tableInfo.value.data = tableInfo.value.data.filter(it => data.indexOf(it) === -1)
    return
  }
  const ids = row.id ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    secondAllocationdeleteByIds(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getDetail()
      }
    })
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
  console.log('保存数据-----', err)
  if (err) return
  const api = props.id ? secondAllocationTypeupdate : secondAllocationTypeadd
      api({...formInfo.value.data,
        details: tableInfo.value.data}).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        props.id = '';
        tableInfo.value.btnList[2].show = false;
        tableInfo.value.btnList[3].show = false;
        tableInfo.value.btnList[4].show = false;
        formInfo.value.data = {}
        tableInfo.value.data = []
        emit('returnModify', false)
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}
function beforeUpload(file) {
  //发生请求时打开加载动画
  uploadInfo.loading = ElLoading.service({
    fullscreen: true,
    background: 'rgba(255,255,255,.4)',
  })
  let fileType = ['xlsx']
  let fileSize = proxy.$store.state.permission.systemConfig.max_file_size
  let isFileType = fileType.some(
      (type) => file.name.split('.')[file.name.split('.').length - 1] === type
  )
  const isLt = file.size / 1024 / 1024 < fileSize
  if (!isFileType) {
    proxy.$message.error({
      message: `文件格式不正确, 请上传 ${fileType.join(' / ')} 格式文件!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.loading.close()
    return false
  }
  if (!isLt) {
    proxy.$message.error({
      message: `上传文件大小不能超过 ${fileSize} MB!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.loading.close()
    return false
  }
  return isFileType && isLt
}

function uploadSuccess(resp) {
  uploadInfo.loading.close()
  if (resp && resp.success) {
    proxy.$message.success({
      duration: 3000,
      showClose: true,
      message: resp.msg,
    })
    // 刷新明细
    getDetail()
  } else {
    proxy.$message.error({
      message: resp.msg,
      duration: 3000,
      showClose: true,
    })
  }
}
function uploadError(err) {
  if (err) {
    proxy.$message.error({
      message: JSON.parse(err.message).msg || '系统错误',
      duration: 3000,
      showClose: true,
    })
  }
  uploadInfo.loading.close()
}


// table选择
function SelectionChange(val,data) {
  if (val === 'tableCheck') {
    tableInfo.value.sectionRows = data
  }
}

</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo">
    </ModifyForm>
    <ModifyTable @handleEvent="SelectionChange" :pager="!!props.id" :checkbox="true" :isDynamic="true" :table-info="tableInfo">
      <template v-slot:filter-uploadFile="scope">
        <el-upload
            :headers="uploadInfo.headers"
            :show-file-list="false"
            :data="uploadInfo.data"
            :on-error="uploadError"
            :on-success="uploadSuccess"
            :before-upload="beforeUpload"
            :action="uploadInfo.action"
        >
          <el-button :disabled="scope.disabled">导入</el-button>
        </el-upload>
      </template>
    </ModifyTable>
  </ModifyPage>
  <AddDetail
      title="二次分配"
      :table-row="addDetailInfo.row"
      :visible="addDetailInfo.visible"
      @callback="addDetailCallback"
  />
</template>

<style scoped lang="scss">

</style>
