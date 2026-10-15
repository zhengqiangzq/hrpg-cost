<template>
  <div class="app-container" style="height: calc(100vh - 81px)">
    <el-row :gutter="20" class="minNoPadddingHeight">
      <el-col :span="4" :xs="24" class="borderR">
        <ElTree
          :deptOptions="deptOptions"
          views="commissionTask"
          @handleNodeClick="handleNodeClick"
        />
      </el-col>
      <el-col :span="20" :xs="24">
        <!-- 条件栏 -->
        <NewPageFilter
          v-model:query="filterInfo.query"
          :clearType="clearType"
          :listTypeInfo="listTypeInfo"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.searchBtn"
        >
        </NewPageFilter>
        <!-- 表格 -->
        <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="getTodoPage"
          v-model:query="filterInfo.query"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          :check-box="false"
          :tab-index="true"
          @handleEvent="handleEvent"
        >
          <template v-slot:col-title="scope">
            <span
              v-if="$permission('flow:transaction')"
              class="slip-edit"
              @click="detail(scope.row)"
              >{{ scope.row.title || '-' }}</span
            >
            <span v-else>{{ scope.row.title || '-' }}</span>
          </template>
        </table-container>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// name="myPendingTask" 此页面对数据及时性要求比较高，去除路由缓存
import { getTodoPage } from '@/api/task.js'
import ElTree from '../components/elTree/index'
import { _getFlowCategoryTree, getStatusList, fieldList } from '../js'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const defaultMenuList = ref(proxy.$store.state.permission.dict['flow_module'])
const clearType = ref(true)
const deptOptions = ref([])
const listTypeInfo = ref({
  statusList: [],
})

// 过滤相关配置
const filterInfo = ref({
  data: {},
  query: { status: null },
  copyQueryMap: {},
  searchList: [
    {
      label: '接收',
      value: 'flowDate',
      asValue: 'flowDate',
      event: search,
      componentType: 'daterange',
    },
    // {
    //   label: '流程状态',
    //   value: 'status',
    //   asValue: 'status',
    //   componentType: 'select',
    //   list: 'statusList',
    //   hidden: false,
    //   show: true,
    //   event: search,
    //   clearable: true,
    // },
    {
      label: '流程发起人',
      value: 'submitUserName',
      asValue: 'submitUser',
      componentType: 'select-user',
      event: search,
      highlightRow: true,
      checkBox: false,
    },
    {
      label: '流程发起人部门',
      value: 'submitUserDeptName',
      asValue: 'submitDeptIds',
      componentType: 'select-dept',
      event: search,
      highlightRow: false,
      checkBox: true,
    },
  ],
  searchBtn: [
    { type: 'button', label: '查询', event: search },
    {
      type: 'button',
      label: '重置',
      event: clearSearch,
    },
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  selections: [],
  fieldList,
  handle: {
    fixed: 'right',
    label: '操作',
    width: '100',
    btList: [
      {
        label: '审批',
        type: 'button',
        event: detail,
        show: proxy.$permission('flow:transaction'),
      },
    ],
  },
})

watch(
  () => proxy.$store.state.permission.dict['flow_module'],
  (val) => {
    if (val && val.length) {
      defaultMenuList.value = val
      getTree()
    }
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => proxy.$store.state.permission.dict['flow_audit_status'],
  (val) => {
    if (val && val.length) {
      listTypeInfo.value['statusList'] = getStatusList(val)
    }
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => filterInfo.value.query.flowDate,
  (val) => {
    if (val && val.indexOf(',') !== -1) {
      let dateArr = val.split(',')
      filterInfo.value.query['createStartDate'] = dateArr[0]
      filterInfo.value.query['createEndDate'] = dateArr[1]
    }
    if (!val) {
      filterInfo.value.query['createStartDate'] = ''
      filterInfo.value.query['createEndDate'] = ''
    }
  },
  {
    deep: true,
  }
)
watch(
  () => router.currentRoute.value.path,
  (newVal, oldVal) => {
    if (oldVal === '/task/myPendingDetails') {
      search()
      getTree()
    }
  },
  {
    immediate: true,
    deep: true,
  }
)
// 获取分类树
async function getTree() {
  deptOptions.value = await _getFlowCategoryTree(defaultMenuList.value)
}
// 查询
function search() {
  // 重置分页
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
  getTree()
}
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQueryMap)
  filterInfo.value.query.categoryId = ''
  search()
}
function detail(val) {
  proxy.$fn.setFlowData(val, 'myPending', route)
}
// 触发事件
function handleEvent(event, data) {
  switch (event) {
    // 对表格获取到的数据做处理
    case 'tableCheck':
      tableInfo.value.selections = data
      break
  }
}
/** 节点单击事件 */
function handleNodeClick(data) {
  if (data.categoryName && data.categoryName === 'all') {
    delete filterInfo.value.query.categoryId
    search()
    return
  }
  filterInfo.value.query.categoryId = (data.id || -2) + ''
  search()
}
filterInfo.value.copyQueryMap = proxy.$fn.deepClone(filterInfo.value.query)
</script>
