/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define([
    'N/record',
    `./drt_bootcamp_2026_cm`
], (
    record,
    drt_bootcamp_2026_cm
) => {
    const get = (requestParams) => {
        log.debug(`get`, requestParams);
        let respuesta = {
            success: false,
            data: []
        };
        try {
            respuesta.data = drt_bootcamp_2026_cm.getDataEntity(requestParams.internalid);
            respuesta.success = respuesta.data.length > 0;
        } catch (error) {
            log.error(`get error`, error);
        } finally {
            log.debug(`get respuesta`, respuesta);
            return respuesta;
        }
    }

    const put = (requestBody) => {

    }

    const post = (requestBody) => {
        log.debug(`post`, requestBody);
        let respuesta = {
            success: false,
            data: "",
            error: "",
            request: requestBody
        };
        try {
            if (
                !!requestBody.type &&
                !!requestBody.id &&
                !!requestBody.values &&
                Object.keys(requestBody.values).length > 0
            ) {
                respuesta.data = record.submitFields(requestBody);
                respuesta.success = !!respuesta.data;
            }
        } catch (error) {
            log.error(`post`, error);
            respuesta.error = error.message;
        } finally {
            log.debug(`post respuesta`, respuesta);
            return respuesta;
        }
    }

    const doDelete = (requestParams) => {

    }

    return {
        get,
        post
    }

});
