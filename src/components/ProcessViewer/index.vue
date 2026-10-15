<template>
  <div class="process-viewer">
    <div
      class="process-canvas"
      style="height: 100%"
      ref="processCanvas"
      v-show="!isLoading"
    />
    <!-- 自定义箭头样式，用于已完成状态下流程连线箭头 -->
    <defs ref="customDefs">
      <marker
        id="sequenceflow-end-white-success"
        viewBox="0 0 20 20"
        refX="11"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path
          class="success-arrow"
          d="M 1 5 L 11 10 L 1 15 Z"
          style="
            stroke-width: 1px;
            stroke-linecap: round;
            stroke-dasharray: 10000, 1;
          "
        ></path>
      </marker>
      <marker
        id="conditional-flow-marker-white-success"
        viewBox="0 0 20 20"
        refX="-1"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path
          class="success-conditional"
          d="M 0 10 L 8 6 L 16 10 L 8 14 Z"
          style="
            stroke-width: 1px;
            stroke-linecap: round;
            stroke-dasharray: 10000, 1;
          "
        ></path>
      </marker>
    </defs>
    <div style="position: absolute; top: 0px; left: 0px; width: 100%">
      <el-row type="flex" justify="end">
        <el-button-group key="scale-control" size="default">
          <el-button
            size="default"
            type="default"
            :plain="true"
            :disabled="defaultZoom <= 0.3"
            icon="ZoomOut"
            @click="processZoomOut()"
          />
          <el-button size="default" type="default" style="width: 90px">{{
            Math.floor(defaultZoom * 10 * 10) + '%'
          }}</el-button>
          <el-button
            size="default"
            type="default"
            :plain="true"
            :disabled="defaultZoom >= 3.9"
            icon="ZoomIn"
            @click="processZoomIn()"
          />
          <el-button
            size="default"
            type="default"
            icon="ScaleToOriginal"
            @click="processReZoom()"
          />
          <slot />
        </el-button-group>
      </el-row>
    </div>
    <!-- 已完成节点悬浮弹窗-->
    <el-dialog draggable
      v-model="dialogVisible"
      :title="dlgTitle || '审批记录'"
      :append-to-body="true"
      width="800px"
    >
      <el-row>
        <el-col :span="24">
          <div v-if="isCurrentItem">
            <el-table
              :data="tableSetting.tableData"
              header-cell-class-name="table-header-gray"
              max-height="500px"
              class="table"
            >
              <el-table-column
                label="序号"
                header-align="center"
                align="center"
                type="index"
                width="55px"
              />
              <el-table-column label="审批人" prop="name" />
              <el-table-column label="部门名称" prop="deptName" />
              <el-table-column label="电话" prop="tel" />
              <el-table-column label="创建时间" prop="createTime" />
            </el-table>
          </div>
          <el-table
            v-if="!isCurrentItem"
            :data="taskCommentList"
            header-cell-class-name="table-header-gray"
            max-height="500px"
            class="table"
          >
            <el-table-column
              label="序号"
              header-align="center"
              align="center"
              type="index"
              width="55px"
            />
            <el-table-column
              label="执行人"
              prop="createUsername"
              width="150px"
            />
            <el-table-column label="操作类型" width="150px">
              <template #default="scope">
                <el-tag
                  size="small"
                  :type="getOperationTagType(scope.row.approvalType)"
                  class="bgNone bdNone pdNone"
                  >{{
                    flowDicts.SysFlowTaskOperationType.getValue(
                      scope.row.approvalType
                    )
                  }}</el-tag
                >
                <el-tag
                  v-if="scope.row.delegateAssginee != null"
                  size="small"
                  type="success"
                  style="margin-left: 10px"
                  class="bgNone bdNone pdNone"
                  >{{ scope.row.delegateAssginee }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip label="审批意见">
              <template #default="scope">
                <span>{{ scope.row.comment ? scope.row.comment : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="处理时间" prop="createTime" width="160px" />
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup name="ProcessView">
import BpmnModeler from 'bpmn-js/lib/Modeler'
import './css/index.scss'
import { getCurrentItem } from '@/api/flowable'
import flowDicts from './index.js'
const { proxy } = getCurrentInstance()

const props = defineProps({
  xml: {
    type: String,
    default: '',
  },
  finishedInfo: {
    type: Object,
    default: () => {
      return {}
    },
  },
  // 所有节点审批记录
  allCommentList: {
    type: Array,
    default: () => {
      return []
    },
  },
  processInstanceId: {
    type: String,
    default: '',
  },
})

let dialogVisible = ref(false)
let dlgTitle = ref(undefined)
let defaultZoom = ref(1)
// 是否正在加载流程图
let isLoading = ref(true)
let bpmnViewer = ref(undefined)
// 已完成流程元素
let processNodeInfo = ref(undefined)
// 当前任务id
let selectTaskId = ref(undefined)
// 任务节点审批记录
let taskCommentList = ref([])
// 已完成任务悬浮延迟Timer
let hoverTimer = ref(null)
// 是否点击当前处理节点
let isCurrentItem = ref(false)
// table 组件基础设置
const tableSetting = ref({
  // 列表数据
  tableData: [],
})

watchEffect(() => {
  if (props.xml) {
    proxy.$nextTick(() => {
      importXML(props.xml)
    })
  }
})

// 监听弹窗变化执行相应操作
watch(
  () => props.finishedInfo,
  (val) => {
    setProcessStatus(val)
  },
  {
    immediate: true,
  }
)
onUnmounted(() => {
  clearViewer()
})

function processReZoom() {
  defaultZoom.value = 1
  bpmnViewer.value.get('canvas').zoom('fit-viewport', 'auto')
}
function processZoomIn(zoomStep = 0.1) {
  let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100
  if (newZoom > 4) {
    throw new Error(
      '[Process Designer Warn ]: The zoom ratio cannot be greater than 4'
    )
  }
  defaultZoom.value = newZoom
  bpmnViewer.value.get('canvas').zoom(defaultZoom.value)
}
function processZoomOut(zoomStep = 0.1) {
  let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100
  if (newZoom < 0.2) {
    throw new Error(
      '[Process Designer Warn ]: The zoom ratio cannot be less than 0.2'
    )
  }
  defaultZoom.value = newZoom
  bpmnViewer.value.get('canvas').zoom(defaultZoom.value)
}
function getOperationTagType(type) {
  switch (type) {
    case flowDicts.SysFlowTaskOperationType.AGREE:
    case flowDicts.SysFlowTaskOperationType.MULTI_AGREE:
    case flowDicts.SysFlowTaskOperationType.SET_ASSIGNEE:
      return 'success'
    case flowDicts.SysFlowTaskOperationType.PARALLEL_REFUSE:
    case flowDicts.SysFlowTaskOperationType.MULTI_REFUSE:
      return 'warning'
    case flowDicts.SysFlowTaskOperationType.REFUSE:
    case flowDicts.SysFlowTaskOperationType.STOP:
    case flowDicts.SysFlowTaskOperationType.REJECT:
    case flowDicts.SysFlowTaskOperationType.REJECT_TO_START:
    case flowDicts.SysFlowTaskOperationType.REVOKE:
      return 'danger'
    default:
      return ''
  }
}
// 流程图预览清空
function clearViewer() {
  if (proxy.$refs.processCanvas) proxy.$refs.processCanvas.innerHTML = ''
  if (bpmnViewer.value) bpmnViewer.value.destroy()
  bpmnViewer.value = null
}
// 添加自定义箭头
function addCustomDefs() {
  const canvas = bpmnViewer.value.get('canvas')
  const svg = canvas._svg
  const customDefs = proxy.$refs.customDefs
  svg.appendChild(customDefs)
}
// 任务悬浮弹窗
function onSelectElement(element) {
  selectTaskId.value = undefined
  dlgTitle.value = undefined
  if (
    processNodeInfo.value == null ||
    processNodeInfo.value.finishedTaskSet == null
  )
    return
  if (
    element == null ||
    (processNodeInfo.value.finishedTaskSet.indexOf(element.id) === -1 &&
      processNodeInfo.value.unfinishedTaskSet.indexOf(element.id) === -1)
  ) {
    return
  }
  selectTaskId.value = element.id
  dlgTitle.value = element.businessObject
    ? element.businessObject.name
    : undefined
  // 计算当前悬浮任务审批记录，如果记录为空不显示弹窗
  taskCommentList.value = (props.allCommentList || []).filter((item) => {
    return item.taskKey === selectTaskId.value
  })
  // 如果点击的是当前节点
  if (processNodeInfo.value.unfinishedTaskSet.indexOf(element.id) !== -1) {
    const params = {
      processInstanceId: props.processInstanceId,
      taskId: element.id,
    }
    getCurrentItem(params).then((res) => {
      tableSetting.value.tableData = res.data
      console.log(tableSetting.value.tableData)
    })
    isCurrentItem.value = true
  } else {
    isCurrentItem.value = false
  }
  dialogVisible.value = true
}
// 显示流程图
async function importXML(xml) {
  clearViewer()
  if (xml != null && xml !== '') {
    try {
      bpmnViewer.value = new BpmnModeler({
        container: proxy.$refs.processCanvas,
        additionalModules: [
          {
            labelEditingProvider: ['value', ''], //禁用节点编辑
            move: ['value', ''], //禁用单个图形拖动
            bendpoints: ['value', {}], //禁用连线拖动
          },
        ],
      })
      // 任务节点点击事件
      bpmnViewer.value.on('element.click', ({ element }) => {
        onSelectElement(element)
      })
      isLoading.value = true
      await bpmnViewer.value.importXML(xml)
      addCustomDefs()
    } catch (e) {
      clearViewer()
    } finally {
      isLoading.value = false
      setProcessStatus(processNodeInfo.value)
    }
  }
}
// 设置流程图元素状态
function setProcessStatus(nodeInfo) {
  processNodeInfo.value = nodeInfo
  if (
    isLoading.value ||
    processNodeInfo.value == null ||
    bpmnViewer.value == null
  )
    return
  let {
    finishedSequenceFlowSet,
    finishedTaskSet,
    unfinishedTaskSet,
    refuseTaskSet,
  } = processNodeInfo.value
  const canvas = bpmnViewer.value.get('canvas')
  const elementRegistry = bpmnViewer.value.get('elementRegistry')
  if (Array.isArray(finishedSequenceFlowSet)) {
    finishedSequenceFlowSet.forEach((item) => {
      if (item != null) {
        try {
          canvas.addMarker(item, 'success')
          let element = elementRegistry.get(item)
          const conditionExpression = element.businessObject.conditionExpression
          if (conditionExpression) {
            canvas.addMarker(item, 'condition-expression')
          }
        } catch (error) {
          console.log(error)
        }
      }
    })
  }
  if (Array.isArray(finishedTaskSet)) {
    finishedTaskSet.forEach((item) => {
      canvas.addMarker(item, 'success')
    })
  }
  if (Array.isArray(unfinishedTaskSet)) {
    unfinishedTaskSet.forEach((item) => {
      canvas.addMarker(item, 'current')
    })
  }
  if (Array.isArray(refuseTaskSet)) {
    refuseTaskSet.forEach((item) => {
      canvas.addMarker(item, 'refuse')
    })
  }
}
</script>

<style scoped lang="scss">
.process-viewer {
  width: 100%;
}
</style>
