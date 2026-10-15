<script setup name="allocationLevel">
import {onMounted} from "vue";
import {
  addAllocationLevel,
  deleteAllocationLevel,
  pageAllocationLevel,
  updateAllocationLevel
} from "@/api/allocationLevel";
import {useStorage} from "@vueuse/core";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const filterInfo = ref({
  query: {
  },
  list: [
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('allocationLevel:add'), event: () => openModify() },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '分摊级次编码', value: 'code' },
    { label: '分摊级次名称', value: 'name' },
    { label: '分摊级次等级', value: 'levelValue' },
    { label: '是否内置', value: 'sysFlagValue' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('allocationLevel:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
        ifRender: (row) => row.sysFlag != '1'
      },
      {
        label: '删除',
        show: proxy.$permission('allocationLevel:delete'),
        event: deleteRow,
        ifRender: (row) => row.sysFlag != '1'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  ref: null,
  visible: false,
  labelWidth: '120px',
  title: '分摊级次',
  btnList: [
    {show: true, label: '取消', event: () => dialogInfo.value.visible = false},
    {show: true, type: 'primary', label: '保存', event: save},
  ],
  fieldList: [
    { label: '分摊级次编码', value: 'code', span: 12, type: 'input' },
    { label: '分摊级次名称', value: 'name', span: 12, type: 'input' },
    { label: '分摊级次等级', value: 'apportionmentLevel', span: 12, type: 'select-model', code: 'cost_apportionment_level' },
    { label: '备注', value: 'remark', span: 12, type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请输入分摊级次编码' }],
    name: [{ required: true, message: '请输入分摊级次名称' }],
    apportionmentLevel: [{ required: true, message: '请选择分摊级次等级' }],
  },
  data: {}
})

onMounted(() => {
  tableInfo.value.api = pageAllocationLevel
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}
const tableHandler = () => {}

function openModify(row) {
  dialogInfo.value.data = row || {
    orgId: setting.value.hospitalId
  }
  dialogInfo.value.fieldList[0].disabled = !!dialogInfo.value.data.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}分摊级次`
  dialogInfo.value.visible = true
}
function save() {
  dialogInfo.value.ref.validate((valid, data) => {
    if (valid) {
      const form = dialogInfo.value.data
      const api = form.id ? updateAllocationLevel : addAllocationLevel
      api(form).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          dialogInfo.value.visible = false
          getList()
        }
      })
    }
  })
}

function deleteRow(row) {
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteAllocationLevel(row.id).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}
</script>

<template>
<!-- 分摊级次 -->
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <PageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
        ></PageFilter>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :pager="false"
            :check-box="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <page-dialog :title="dialogInfo.title" v-model:visible="dialogInfo.visible" :btList="dialogInfo.btnList">
      <!-- 这里的v-if是为了消除弹窗打开校验抖动 -->
      <div class="order-model-formBox" v-if="dialogInfo.visible">
        <page-form
            v-model:ref-obj="dialogInfo.ref"
            :data="dialogInfo.data"
            :field-list="dialogInfo.fieldList"
            :rules="dialogInfo.rules"
            :label-width="dialogInfo.labelWidth">
        </page-form>
      </div>
    </page-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
