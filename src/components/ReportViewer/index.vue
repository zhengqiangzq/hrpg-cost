<script setup>
import {onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {doPrintData, getPreviewData, searchByReportName} from "@/api/report";
import {getToken} from "@/utils/auth";
import {printWithUrl} from "@/utils/exportUtil";
import qs from "qs";

const props = defineProps({
  query: {
    type: Object,
    default: () => ({})
  }
})
const exportType = reactive([
  { name: 'PDF', value: '/pdf' },
  { name: 'Word', value: '/word' },
  { name: 'Excel', value: '/excel' },
  { name: '分页Excel', value: '/excel/paging' },
  { name: '分页分SheetExcel', value: '/excel/sheet' },
])
const pageInfo = reactive({
  curPage: 1,
  pageSize: 20,
  pageSizes: [20, 50, 100, 200, 500],
  total: 0,
})
const reportInfo = ref({})
const content = ref('')
const contentId = `_ureport_table_${new Date().getTime()}`
let styleEl = null

onMounted(() => {
  getReport()
})

onBeforeUnmount(() => {
  getReportInfo()
  removeStyleEl()
})

function getReportInfo() {
  searchByReportName({ reportName: props.query._u }).then(
    (res) => {
      if (res && res.success) {
        reportInfo.value = res.data
      }
    }
  )
}

async function getReport() {
  const data = await getPreviewData({
    ...props.query,
    _i: pageInfo.curPage,
    pageSize: pageInfo.pageSize,
    token: getToken()
  })
  pageInfo.curPage = data.curPage
  pageInfo.pageSize = data.pageSize
  pageInfo.total = data.totalPage
  content.value = data.content
  addStyleEl(data.style.replaceAll(/(._)/g, `#${contentId} ._`))
}

function handleSizeChange() {
  pageInfo.curPage = 1
  getReport()
}
function goFirst() {
  pageInfo.curPage = 1
  getReport()
}
function goLast() {
  pageInfo.curPage = pageInfo.total
  getReport()
}
function handleCurrentChange(page) {
  pageInfo.curPage = page
  getReport()
}
function print() {
  doPrintData({
    ...props.query,
    pageSize: pageInfo.pageSize,
    _i: pageInfo.curPage,
    token: getToken(),
    query: {
      ...{ ...props.query, _u: undefined },
      pageSize: pageInfo.pageSize,
      createGroupId: reportInfo.value.createGroupId,
      createOrgId: reportInfo.value.createOrgId
    }
  }).then((res) => {
    isPrint(res)
  }).catch((error) => {
    console.error(error)
  })
}
function isPrint(res) {
  // 获取菜单xml名称
  if (res) {
    let blob = new Blob([res], {
      type: 'application/pdf',
    })
    printWithUrl(URL.createObjectURL(blob))
  }
}
function exportClick(item) {
  try {
    const params = {
      ...props.query,
      _i: pageInfo.curPage,
      curPage: pageInfo.curPage,
      page: false,
      pageSize: pageInfo.pageSize
    }
    let url =
      (import.meta.env.VITE_APP_ENV === 'development'
        ? import.meta.env.VITE_HOST_URL
        : window.origin) + `/api/basic/ureport${item.value}?${qs.stringify(params)}`
    console.log('导出地址==>' + url)
    const token = getToken()
    if (
      token &&
      token !== undefined &&
      token !== 'null' &&
      token !== 'undefined'
    ) {
      url += '&token=' + token
    }
    window.open(url, '_blank')
  } catch (error) {
    console.log(error)
  }
}
function addStyleEl(style) {
  removeStyleEl()
  styleEl = document.createElement('style')
  styleEl.type = 'text/css'
  styleEl.appendChild(document.createTextNode(style))
  document.body.appendChild(styleEl)
}
function removeStyleEl() {
  if (styleEl) {
    styleEl.remove()
  }
  styleEl = null
}
</script>

<template>
  <div class="report-viewer">
    <div class="pageBox">
      <div style="margin-top: 8px; margin-bottom: 8px">
        <el-pagination
          :small="true"
          v-model:page-size="pageInfo.pageSize"
          :background="true"
          v-model:current-page="pageInfo.curPage"
          :page-sizes="pageInfo.pageSizes"
          layout="prev, pager, next, slot, jumper"
          :page-count="pageInfo.total"
          class="pt0 elPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <!-- slot部分，跳转首页 -->
          <el-button class="firstPage" style="order: -1;" @click="goFirst">
            <el-icon><DArrowLeft /></el-icon>
            <span>首页</span>
          </el-button>
          <!-- slot部分，跳转末页 -->
          <el-button
            class="lastPage"
            style="background: rgba(245, 246, 247, 1)"
            @click="goLast"
          >
            <span>末页</span>
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </el-pagination>
      </div>
    </div>
    <div class="btnBox">
      <el-button
        @click="print()"
        type="primary"
        class="el-button el-button--medium filter-button"
        title="PDF在线打印"
      >
        <el-icon class="el-icon--left">
          <Printer />
        </el-icon>
        <div style="display: flex">
          <span>打印</span>
        </div>
      </el-button>
      <el-popover
        placement="bottom"
        :width="160"
        popper-class="popoverBox"
        trigger="click"
      >
        <template #reference>
          <button
            type="primary"
            class="el-button el-button--medium filter-button"
            title="选择导出格式"
          >
            <el-icon class="el-icon--left">
              <Upload />
            </el-icon>
            <div style="display: flex">
              <span>导出</span>
            </div>
          </button>
        </template>
        <div class="selectBox">
            <span
              v-for="item in exportType"
              :key="item.name"
              :title="item.name"
              @click="exportClick(item)"
              class="col"
            >{{ item.name }}</span
            >
        </div>
      </el-popover>
    </div>
    <div
      :id="contentId"
      class="_ureport_table extend"
      style="overflow-y: auto"
      v-html="content"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.report-viewer {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}
._ureport_table {
  flex: 1;
  min-height: 0;
}
.extend {
  :deep(table) {
    width: 100% !important;
    tr:hover {
     background: #f5f7fa !important;
    }
  }
}
:deep(table) {
  border-collapse: collapse;
  tr:hover {
    background: #f5f7fa !important;
  }
}
._ureport_table :deep(tbody) tr td {
  position: relative;
  min-width: 60px;
  box-sizing: border-box;
  width: revert-layer;
}
._ureport_table :deep(tbody) tr {
  .tdBefore:before,
  .tdRightBefore:before {
    position: absolute;
    top: 0px;
    left: -1px;
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-left: 1px solid black;
    border-bottom: 1px solid black;
    margin: 0;
    pointer-events: none;
  }
  .tdRightBefore:before {
    border-right: 1px solid black;
  }
}

.firstPage {
  background: none;
}
:deep(.el-pagination) {
  padding-top: 0;
}
:deep(.el-pagination).is-background .el-pager li:not(.disabled).is-active {
  background-color: rgb(22, 93, 255); // 进行修改选中项背景和字体
  color: #fff;
}
.btn {
  display: inline-block;
  color: rgb(96, 98, 102);
  padding: 0;
  background: #f8f8f8;
  border: none;
  margin: 3px;
  cursor: pointer;
}
.popoverBox {
  padding: 0 !important;
  .selectBox {
    .col {
      display: inline-block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 32px;
      line-height: 32px;
      padding: 0 6px;
      text-align: center;
      box-sizing: border-box;
      cursor: pointer;
    }
    .col:hover {
      background-color: #f5f7fa;
    }
  }
}
.table-filter {
  background-color: #fff;
  min-height: calc(100vh - 110px);
}
.pageBox,
.btnBox {
  display: flex;
  align-items: center;
  background: rgba(245, 246, 247, 1);
  padding: 0 8px;
}
.btnBox {
  padding-bottom: 8px;
}
:deep(.elPage) {
  .el-pagination__jump {
    align-items: baseline;
  }
}
</style>
