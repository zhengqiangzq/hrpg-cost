import {ref, watch} from "vue";

export function useChart(opt = {}) {

    const chartRef = ref()

    function setOption(option) {
        chartRef.value.setOption(option)
    }

    function setData(data) {
        chartRef.value.setData(data)
    }

    function refresh() {
        chartRef.value.refresh()
    }

    watch(chartRef, (_dom) => {
        if (_dom) {
            chartRef.value.setOption(opt)
        }
    })
    return {
        chartRef,
        setOption,
        setData,
        refresh
    }
}