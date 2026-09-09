/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([

], (

) => {
    const getInputData = (inputContext) => {
        log.debug(`getInputData `, inputContext);
        let resultado = [];
        try {
            resultado = ["a", "a", "a", "b", "a", "d", "a", "c", "c", "c", "d", "d", "d", "a", "b"];
        } catch (error) {
            log.error(`getInputData error`, error);
        } finally {
            log.debug(`getInputData resultado`, resultado);
            return resultado;
        }
    }
    const map = (mapContext) => {
        log.debug(`map `, mapContext);
        let resultado = {
            key: "",
            value: ""
        };
        try {
            resultado.key = mapContext.value;
            resultado.value = mapContext.key;
        } catch (error) {
            log.error(`map error`, error);
        } finally {
            log.debug(`map resultado`, resultado);
            mapContext.write(resultado);
        }
    }
    const reduce = (reduceContext) => {
        log.debug(`reduce `, reduceContext);
        let resultado = {
            key: "",
            value: ""
        };
        try {
            resultado.key = reduceContext.key;
            resultado.value = reduceContext.values;
        } catch (error) {
            log.error(`reduce error`, error);
        } finally {
            log.debug(`reduce resultado`, resultado);
            reduceContext.write(resultado);
        }
    }
    const summarize = (summaryContext) => {
        log.debug(`summarize `, summaryContext);
        try {
            summaryContext.output.iterator().each(function (key, value) {
                log.debug(`key ${key}`, value);
                return true;
            });
        } catch (error) {
            log.error(`summarize error`, error);
        }
    }
    return {
        getInputData,
        map,
        reduce,
        summarize
    }
});