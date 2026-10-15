import {getCurrentInstance, render} from "vue";
import MonthCheckout from './index.vue'
import ReverseMonthCheckout from './reverse.vue'

export default function useMonthCheckout(options = {
    api: { check: () => {}, costType: 1, reCheck: () => {}, closeCheck: () => {}, cancelCloseCheck: () => {} }
}) {

    const { proxy, appContext } = getCurrentInstance()

    // 打开结账页面
    function openCheckout(row, cb) {
        const el = proxy.$el
        const otherEls = el.querySelector('.layui-card')
        otherEls.style.display = 'none'
        const div = document.createElement('div')
        div.className = 'month-checkout-page'
        div.style.height = '100%'
        el.appendChild(div)

        const vMonthCheckout = h(MonthCheckout, {
            costType: options.costType,
            api: options.api,
            form: row,
            'onClose': () => {
                render(null, div)
                div.remove()
                otherEls.style.display = 'block'
            },
            onDone: () => {
                cb && cb()
                render(null, div)
                div.remove()
                otherEls.style.display = 'block'
            }
        })
        vMonthCheckout.appContext = appContext
        render(vMonthCheckout, div)
    }

    // 打开反结账页面
    function openReCheckout(row, cb) {
        const el = proxy.$el
        const otherEls = el.querySelector('.layui-card')
        otherEls.style.display = 'none'
        const div = document.createElement('div')
        div.className = 'month-recheckout-page'
        div.style.height = '100%'
        el.appendChild(div)

        const vMonthCheckout = h(ReverseMonthCheckout, {
            costType: options.costType,
            api: options.api,
            form: row,
            'onClose': () => {
                render(null, div)
                div.remove()
                otherEls.style.display = 'block'
            },
            onDone: () => {
                cb && cb()
                render(null, div)
                div.remove()
                otherEls.style.display = 'block'
            }
        })
        vMonthCheckout.appContext = appContext
        render(vMonthCheckout, div)
    }

    return {
        openCheckout,
        openReCheckout
    }
}