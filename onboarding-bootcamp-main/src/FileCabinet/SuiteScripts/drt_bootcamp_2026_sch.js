/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    `./drt_bootcamp_2026_cm`,
    'N/record',
    'N/search'
], (
    drt_bootcamp_2026_cm,
    record,
    search
) => {
    const execute = (scriptContext) => {
        let resultado = "";
        try {
            log.debug(`execute scriptContext`, scriptContext);
            resultado = drt_bootcamp_2026_cm.getDataEntity();
        } catch (error) {
            log.debug(`execute error`, error);
        } finally {
            log.debug(`execute resultado`, resultado);
        }
    }

    return {
        execute
    }
});
