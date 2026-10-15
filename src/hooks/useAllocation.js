import {getCurrentInstance, reactive, ref} from "vue";

export function useAllocation(dataType, api = { allocation: () => {}, cancel: () => {} }, callback) {
    const { proxy } = getCurrentInstance()
    const selectLoids = ref([])
    const selectCodes = ref([])
    const selectAllocationInfo = reactive({
        visible: false,
        saveEmpty: true,
        query: {},
        checkedKey: {},
    })
    const selectAllocationDetailInfo = reactive({
        visible: false,
        query: {
            dataType: dataType,
            loid: '-2',
        },
        loids: [],
        allocation: api.allocation,
        cancel: api.cancel
    })

    function allocation() {
        selectAllocationInfo.visible = true
    }
    function selectAllocationCallBack(allNodes) {
        let params = {
            loids: selectLoids.value,
            codeList: selectCodes.value,
            groupOrgList: [],
        }
        if (allNodes && allNodes.length) {
            allNodes.map((item) => {
                let obj = {
                    groupId: item.groupId,
                    orgId: '-2',
                }
                if (item.type === '2') {
                    obj.orgId = item.id
                }
                params.groupOrgList.push(obj)
            })
        }
        api?.allocation(params).then((res) => {
            if (res && res.success) {
                proxy.$message.success({
                    message: '操作成功',
                    duration: 3000,
                    showClose: true,
                })
                callback && callback()
            }
        })
    }
    function allocationDetail(row) {
        selectAllocationDetailInfo.visible = true
        selectLoids.value = [row.loid]
        selectAllocationDetailInfo.query.loid = row.loid
    }
    function cancelAllocation() {
        let params = {
            loids: [],
            codeList: [],
            groupOrgList: [],
        }
        proxy
            .$confirm(selectCodes.value.length ? '取消分配后被分配的组织的附件要求说明会清空，请确认是否取消全部分配?' : '请确认是否取消全部分配?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
            .then(() => {
                params.loids = selectLoids.value
                params.codeList = selectCodes.value
                api?.cancel(params).then((res) => {
                    if (res && res.success) {
                        proxy.$message.success({
                            message: '操作成功',
                            duration: 3000,
                            showClose: true,
                        })
                        callback && callback()
                    }
                })
            })
    }
    return {
        allocationDataType: dataType,
        selectAllocationInfo,
        selectAllocationDetailInfo,
        selectLoids,
        selectCodes,
        allocation,
        selectAllocationCallBack,
        allocationDetail,
        cancelAllocation
    }
}