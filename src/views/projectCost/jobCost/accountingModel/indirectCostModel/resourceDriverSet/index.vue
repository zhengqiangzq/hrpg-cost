<script setup name="resourceDriverSet">
import {onMounted, ref, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import Modify from "./modify.vue";
const store = useStore()
import {
  itemResourceDriverConfigdelByIds,
  itemResourceDriverConfigexportExcel,
  itemResourceDriverConfigqueryListByPage, itemResourceDriverConfigsureByIds, itemResourceDriverConfigunSureByIds
} from "@/api/indirectCostModel";
import Details from "./details.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'resourceDriverSet',
  type: '13051',
  action: '/item/itemResourceDriverConfig/import/excelRecord',
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

const filterInfo = ref({
  query: {},
  list: [
    {label: '科室信息', value: 'deptName', showLabel: true, type: 'slot', event: getList},
    {label: '分摊方法', value: 'apportionmentMethod', type: 'select-model', code: 'cost_apportionment_method', event: getList},
    {label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', event: getList},
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      show: proxy.$permission('resourceDriverSet:add'),
      event: () => openModify()
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('resourceDriverSet:delete'),
      event: () => deleteRow()
    },
    {
      type: 'button',
      label: '批量新增',
      show: proxy.$permission('resourceDriverSet:add'),
      event: () => openModify(null, true)
    },
    { type: 'button', label: '确认', show: proxy.$permission('resourceDriverSet:confirm'), event: () => enableData(1) },
    { type: 'button', label: '取消确认', show: proxy.$permission('resourceDriverSet:confirm'), event: () => enableData(0) },
    {
      type: 'button',
      label: '下载模板',
      show: proxy.$permission('resourceDriverSet:download'),
      event: downloadTemplate
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      show: proxy.$permission('resourceDriverSet:export'),
      event: exportData
    },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '科室编码', value: 'deptCode', type: 'slot'},
    {label: '科室名称', value: 'deptName'},
    {label: '分摊方法', value: 'apportionmentMethodName'},
    {label: '确认状态', value: 'statusName'},
    {label: '备注', value: 'remark'},
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('resourceDriverSet:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('resourceDriverSet:delete'),
        event: deleteRow,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '资源动因设置',
  id: null
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
const detailsInfo = ref({
  visible: false
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, {deep: true, immediate: true})

onMounted(() => {
  tableInfo.value.api = itemResourceDriverConfigqueryListByPage
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = JSON.parse(JSON.stringify(filterInfo.value.query))
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}
function reset() {
  filterInfo.value.query = {}
  getList()
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('ItemResourceDriverConfigTemplate', 'resourceDriverSet:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '资源动因配置导入模板')
    }
  })
}

function exportData() {
  itemResourceDriverConfigexportExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  const api = status === 1 ? itemResourceDriverConfigsureByIds : itemResourceDriverConfigunSureByIds
  api(ids).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row, batch = false) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.batch = batch
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}资源动因设置`
  dialogInfo.value.visible = true
}

function deleteRow(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemResourceDriverConfigdelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openDeptSelector(name) {
  treeInfo.value.type = name
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}

function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
}
</script>

<template>
  <!--  资源动因设置-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!dialogInfo.visible && !detailsInfo.visible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
        <!-- 条件栏 -->
        <NewPageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :listTypeInfo="listTypeInfo"
            :filter-btn="filterInfo.filterbtn"
        >
          <template #filter-deptName>
            <el-input
                v-model="filterInfo.query.deptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择科室信息"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector">
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </template>
        </NewPageFilter>
          </div>
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
            :pager="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-deptCode="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.deptCode }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :batch="dialogInfo.batch"
        :title="dialogInfo.title"
        @returnModify="getList"
    />
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <SelectProDeptTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback"/>
  </div>
</template>

<style scoped lang="scss">

</style>
