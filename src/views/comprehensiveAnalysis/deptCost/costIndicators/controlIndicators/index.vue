<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  deleteControlIndicators, disableControlIndicators, enableControlIndicators,
  exportControlIndicators,
  pageControlIndicators
} from "@/api/deptCost/controlIndicators";
import {useUpload} from "@/hooks/useUpload";
import Modify from "./modify.vue";
import Detail from "./detail.vue";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:controlIndicators'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageControlIndicators,
  delete: deleteControlIndicators,
  export: exportControlIndicators,
  enable: enableControlIndicators,
  disable: disableControlIndicators,
}

const {
  exportData,
} = useUpload(API)

const filterInfoRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'input', label: '指标编码/名称', value: 'OrBatchLike#name#code', event: getList },
    { type: 'slot', label: '指标分类', showLabel: true, value: 'classificationName', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(), type: 'button', },
    { label: '停用', event: () => disableData(), show: proxy.$permission(`${PERMISSION_CODE}:enable`), type: 'button', },
    { type: 'button', label: '导出Excel', btType: 'primary', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '指标代码', value: 'code', type: 'slot' },
    { label: '指标名称', value: 'name' },
    { label: '所属指标分类', value: 'classificationName', type: 'slot' },
    { label: '取值类型', value: 'valueTypeName' },
    { label: '启用状态', value: 'enabledStatusName' },
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
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        ifRender: (row) => row.builtIn === '0' && row.enabledStatus === '0',
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        ifRender: (row) => row.builtIn === '0' && row.enabledStatus === '0',
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})

const selectClassification = reactive({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

const modifyInfo = reactive({
  id: null,
  title: '成本控制指标',
  batch: false,
  visible: false
})

const { tableParameter, openDialog } = useSelectTableData()
const dialogInfoRef = ref()

const detailInfo = reactive({
  visible: false,
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '启用')
  const disableBtn = btns.find(btn => btn.label === '停用')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.builtIn === '1' || it.enabledStatus === '1')
  enableBtn.disabled = !rows.length || !!rows.find(it => it.enabledStatus === '1')
  disableBtn.disabled = !rows.length || !!rows.find(it => it.enabledStatus === '0')
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    classificationName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = row ? '修改成本控制指标' : '新增成本控制指标'
  modifyInfo.visible = true
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

// 启用数据
function enableData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  API.enable(ids).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('启用成功')
      getList()
    }
  })
}

// 禁用数据
function disableData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  API.disable(ids).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('禁用成功')
      getList()
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function detail(row) {
  detailInfo.id = row.id
  detailInfo.visible = true
}

function openSelectClassification() {
  selectClassification.visible = true
}
function selectClassificationCallback(raw) {
  filterInfo.query.classificationId = raw.id
  filterInfo.query.classificationName = raw.name
}
</script>

<template>
<!-- 成本控制指标 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailInfo.visible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterInfoRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-classificationName>
              <el-input
                  v-model="filterInfo.query.classificationName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择指标分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openSelectClassification"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
      </div>
      <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
      >
        <template #col-code="{ row }">
          <span class="slip-edit" @click="detail(row)">{{ row.code }}</span>
        </template>
        <template #col-classificationName="{ row }">
          {{ row.classificationCode }}-{{ row.classificationName }}
        </template>
      </table-container>
    </div>
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :batch="modifyInfo.batch"
        :title="modifyInfo.title"
        @returnModify="getList"
    />
    <Detail
        v-if="detailInfo.visible"
        :id="detailInfo.id"
        v-model:visible="detailInfo.visible"
        @returnBack="getList"
    ></Detail>
    <SelectIndicatorsClassification
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        :checkStrictly="true"
        :check-box="false"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectIndicatorsClassification>
  </div>
</template>

<style scoped lang="scss">

</style>
