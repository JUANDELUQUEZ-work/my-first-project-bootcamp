/**
 * Version de la API de NetSuite utilizada por el script.
 * tipo de script Suitelet.
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

// `define` registra el módulo mediante el sistema AMD que utiliza SuiteScript (metodo serverWidget).
define(["N/ui/serverWidget"] /**
 * @param{serverWidget} serverWidget
 */, (serverWidget) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    // registramos el metodo https y el contexto para facilitar la depuracion.
    log.debug(`scriptContext ${scriptContext.request.method}`, scriptContext);
    try {
    } catch (error) {}
  };

  return { onRequest };
});
