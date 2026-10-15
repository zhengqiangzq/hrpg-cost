<template>
  <div>
    <div class="task-title">
      <div class="title">
        <span class="text">{{ flowInfo.processDefinitionName }}</span>
        <el-tag
          v-if="flowInfo.taskName"
          effect="dark"
          size="small"
          type="success"
          >{{ '当前节点：' + flowInfo.taskName || '启动流程' }}</el-tag
        >
        <el-tag
          v-if="flowInfo.processInstanceInitiator"
          effect="dark"
          size="small"
          type="info"
          >{{ '发起人：' + flowInfo.processInstanceInitiator }}</el-tag
        >
      </div>
      <label class="page-close-box">
        <el-button
          style="
            background: none;
            border: none;
            margin-top: 27px;
            margin-right: -2px;
          "
          type="text"
          @click="onClose(true)"
          icon="Close"
        />
      </label>
    </div>
    <el-row type="flex" justify="space-between" style="margin-bottom: 5px">
      <el-radio-group
        v-model="currentPage"
        style="min-width: 400px"
        size="small"
        @change="radioChange"
      >
        <el-radio-button label="formInfo">表单信息</el-radio-button>
        <el-radio-button
          v-if="route.query.processInstanceId"
          label="flowProcess"
          >流程图</el-radio-button
        >
        <el-radio-button
          v-if="route.query.processInstanceId"
          label="approveInfo"
          >审批记录</el-radio-button
        >
      </el-radio-group>
      <span>
        <el-button
          v-for="(operation, index) in flowOperationList"
          :key="index"
          size="small"
          :type="'primary'"
          :plain="operation.plain || false"
          @click="handlerOperation(operation)"
        >
          {{ operation.label }}
        </el-button>
      </span>
    </el-row>
  </div>
</template>

<script setup>
import flowDicts from '@/components/ProcessViewer/index.js'
const props = defineProps({
  flowInfo: {
    type: Object,
    default: () => {
      return {}
    },
  },
  operationList: {
    type: Array,
    default: () => {
      return []
    },
  },
})
const emits = defineEmits()
const route = useRoute()
const { proxy } = getCurrentInstance()
let currentPage = ref('formInfo')
const flowOperationList = computed(() => {
  if (Array.isArray(props.operationList)) {
    const arr = props.operationList.map((item) => {
      if (
        item.type === flowDicts.SysFlowTaskOperationType.MULTI_SIGN &&
        item.multiSignAssignee != null
      ) {
        let multiSignAssignee = {
          ...item.multiSignAssignee,
        }
        multiSignAssignee.assigneeList = item.multiSignAssignee.assigneeList
          ? multiSignAssignee.assigneeList.split(',')
          : undefined
        return {
          ...item,
          multiSignAssignee,
        }
      } else {
        return {
          ...item,
        }
      }
    })
    return arr
  } else {
    return []
  }
})
function getButtonType(type) {
  switch (type) {
    case flowDicts.SysFlowTaskOperationType.AGREE:
    case flowDicts.SysFlowTaskOperationType.TRANSFER:
    case flowDicts.SysFlowTaskOperationType.CO_SIGN:
    case flowDicts.SysFlowTaskOperationType.MULTI_AGREE:
    case flowDicts.SysFlowTaskOperationType.MULTI_SIGN:
    case flowDicts.SysFlowTaskOperationType.SET_ASSIGNEE:
      return 'primary'
    case flowDicts.SysFlowTaskOperationType.SAVE:
      return 'success'
    case flowDicts.SysFlowTaskOperationType.PARALLEL_REFUSE:
    case flowDicts.SysFlowTaskOperationType.MULTI_REFUSE:
      return 'default'
    case flowDicts.SysFlowTaskOperationType.REFUSE:
    case flowDicts.SysFlowTaskOperationType.REVOKE:
      return 'danger'
    case flowDicts.SysFlowTaskOperationType.REJECT_TO_START:
    case flowDicts.SysFlowTaskOperationType.REJECT:
      return 'warning'
    default:
      return 'default'
  }
}
function handlerOperation(val) {
  emits('handlerOperation', val)
}
function radioChange(val) {
  emits('radioChange', val)
}
function onClose(val) {
  emits('onClose', val)
}
</script>

<style lang="scss" scoped>
.task-title {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 3px solid #409eff;
  overflow: hidden;
}
.task-title .title {
  min-height: 28px;
}
.task-title .text {
  height: 28px;
  line-height: 28px;
  font-weight: 600;
  font-size: 16px;
  color: #383838;
}

.task-title .el-tag {
  margin-left: 10px;
}
</style>
