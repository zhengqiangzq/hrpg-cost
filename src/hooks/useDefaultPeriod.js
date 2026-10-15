import {periodMonthByDate} from "@/api/base";
import moment from "moment";

/**
 * 请求默认会计期间
 * @returns {{loadDefaultPeriod: ((function(boolean=): Promise<{periodId: null, periodName: null}|{periodId: null, periodName: null}>)|*)}}
 */
export function useDefaultPeriod() {
    let periodId = null, periodName = null
    async function loadDefaultPeriod(force = false) {
        if (!force && periodId) return { periodId, periodName }
        await periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
            const _data = data ? data[0] : {}
            periodId = _data?.id
            periodName = _data?.periodYearAndMonth
        })
        return { periodId, periodName }
    }
    return {
        loadDefaultPeriod
    }
}