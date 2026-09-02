/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/error'
], (
    modulo_error
) => {
    const beforeLoad = (scriptContext) => {

    }

    const beforeSubmit = (context) => {
        let resultado = "";
        const idCampo = "custbody_drt_bootcamp_memo";
        let valorCampo = "";
        try {
            if (
                context.type == context.UserEventType.CREATE ||
                context.type == context.UserEventType.EDIT
            ) {
                var numLines = context.newRecord.getLineCount({
                    sublistId: 'item'
                });
                let totalQuantity = 0;
                let totalRate = 0;
                for (let line = 0; line < numLines; line++) {
                    var quantity = context.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: line
                    });
                    var rate = context.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: line
                    });
                    totalQuantity += quantity;
                    totalRate += rate;
                }
                resultado = `Numero de lineas: ${numLines} Cantidades de articulos: ${totalQuantity} Valor total: ${totalRate}`;
            }
        } catch (error) {
            log.error("beforeSubmit error", error);
        } finally {
            log.debug("beforeSubmit", `idCampo: ${idCampo} resultado: ${resultado}`);
            context.newRecord.setValue(idCampo, resultado) || "";
        }
    }

    const afterSubmit = (scriptContext) => {

    }
    return {
        beforeLoad,
        beforeSubmit,
        afterSubmit
    }
});
