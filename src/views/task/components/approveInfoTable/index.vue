<template>
  <div>
    <el-table
      :data="flowTaskCommentList"
      header-cell-class-name="table-header-gray"
      class="table"
      max-height="760px"
    >
      <el-table-column
        label="序号"
        header-align="center"
        align="center"
        type="index"
        width="60px"
      />
      <el-table-column label="流程环节" prop="taskName" />
      <el-table-column label="执行人" prop="createUsername" />
      <el-table-column label="操作">
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
      <el-table-column label="处理时间" prop="createTime" />
    </el-table>
  </div>
</template>

<script setup>
import flowDicts from '@/components/ProcessViewer/index.js'
const props = defineProps({
  flowTaskCommentList: {
    type: Array,
    default: () => {
      return []
    },
  },
})
const { proxy } = getCurrentInstance()
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
</script>
