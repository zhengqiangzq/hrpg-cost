import {getCurrentInstance, h, render} from "vue";
import ReportViewer from '@/components/ReportViewer'

export function useReport(options = {
    reportName: ''
}) {
    const { proxy, appContext } = getCurrentInstance()

    let div = null

    function searchReport(params) {
        clearDiv()
        const container = proxy.$el.querySelector('.app-container-flex')
        div = document.createElement('div')
        container.appendChild(div)
        div.className = 'report-view-container'
        div.style = 'flex: 1; min-height: 0; display: flex; flex-direction: column;'
        const vReportViewer = h(ReportViewer, {
            query: {
                ...params,
                _u: options.reportName,
            }
        })
        vReportViewer.appContext = appContext
        render(vReportViewer, div)
    }

    function clearDiv() {
        if (div != null) {
            render(null, div)
            div.remove()
            div = null
        }
    }

    return {
        searchReport
    }
}