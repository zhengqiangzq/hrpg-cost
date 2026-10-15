<script setup name="ledgerRetrievalRules">
import {onMounted, watch} from "vue";
import DetailList from './detailList.vue'
import Modify from "./modify.vue";
import {finAccessRuledelete, finAccessRulepage,} from "@/api/ledgerRetrievalRules";
import Details from "./details.vue";
const {proxy} = getCurrentInstance()

const dialogInfo = ref({
  visible: false,
  title: '总账取数规则',
  id: null
})
const filterInfo = ref({
  query: {
  },
  list: [
    { label: '规则编码', value: 'code', type: 'input', event: search },
    { label: '规则名称', value: 'name', type: 'input', event: search },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('ledgerRetrievalRules:add'), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission('ledgerRetrievalRules:delete'), event: () => deleteRow() },
  ]
})

//由pageInfo更新
const page = ref({
  page: true,
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})
function pageInfo(obj) {
  page.value = obj
}

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '规则编码', value: 'code', type: 'slot' },
    { label: '规则名称', value: 'name' },
    { label: '发生方向', value: 'directValue' },
    { label: '取数公式', value: 'formulaValue' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('ledgerRetrievalRules:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('ledgerRetrievalRules:delete'),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: remove,
      },
    ]
  },
  sectionRows: []
})
const detailInfo = ref({
  visible: false,
  title: '明细页',
  id: null
})
const detailsInfo = ref({
  visible: false,
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { deep: true, immediate: true })

onMounted(() => {
  tableInfo.value.api = finAccessRulepage
  search()
})

function search() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = JSON.parse(JSON.stringify(filterInfo.value.query))
}
function clearSearch() {
  filterInfo.value.query = {}
  search()
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function ModifyBack(data) {
  if(data) {
    search()
  } else {
    openModify()
  }
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}总账取数规则`
  dialogInfo.value.visible = true
}
function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function deleteRow() {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('是否删除所选数据', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    finAccessRuledelete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        search()
      }
    })
  })
}

function remove(row) {
  finAccessRuledelete([row.id]).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('删除成功')
      search()
    }
  })
}
function openDeptSelector(name) {
  treeInfo.value.type = name
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  filterInfo.value.query.deptId = raw.id
  filterInfo.value.query.deptName = raw.name
}
</script>

<template>
<!--  总账取数规则-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !detailsInfo.visible && !dialogInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailInfo.visible = true">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
        <NewPageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
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
                <el-icon @click="openDeptSelector"><Search /></el-icon>
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
            @pageInfo="pageInfo"
        >
          <template #col-code="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.code }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :title="dialogInfo.title"
        @returnModify="ModifyBack"
    />
    <DetailList
        v-if="detailInfo.visible"
        v-model:visible="detailInfo.visible"
        @callback="search"
    ></DetailList>
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="search"
    ></Details>
    <SelectDeptArchivesTree
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
  </div>
</template>

<style scoped lang="scss">

</style>
