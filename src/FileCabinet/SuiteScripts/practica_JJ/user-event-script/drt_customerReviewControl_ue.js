/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/log", "N/runtime", "N/ui/message"] /**
 * @param{log} log
 * @param{runtime} runtime
 * @param{message} message
 */, (log, runtime, message) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */
  const beforeLoad = (context) => {
    // Comprobar que el contexto de ejecición sea por medio de interfaz de usuario y que el tipo de evento que este pasando se a de creación de un registro e cliente.
    // Ambas condiciones se deben cumplir para que se ejecute el código dentro del if.
    if (
      context.type === context.UserEventType.CREATE &&
      runtime.executionContext === runtime.ContextType.USER_INTERFACE
    ) {
      // Crear un mensaje de advertencia para el usuario.
      context.form.addPageInitMessage({
        type: message.Type.INFORMATION,
        title: "Revisión de cliente",
        message:
          "Al guardar, este cliente sera marcado como penidente de revisión.",
        // Duraciòn en milisegundos que el mensaje se mostrara en pantalla antes de desaparecer.
        duration: 5000,
      });
    }
  };

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (context) => {
    // Constante de ID del campo personalizado
    const PENDING_REVIEW_FIELD_ID = "custentity_drt_ue_pending_review";

    // Comprobar que el contexto de ejecución sea por medio de interfaz de usuario y que el evento que pase sea de creación de un registro de cliente.
    if (
      context.type === context.UserEventType.CREATE &&
      runtime.executionContext === runtime.ContextType.USER_INTERFACE
    ) {
      // Establecer el valor del campo personalizado a falso (false) para indicar que el cliente está pendiente de revisión.
      context.newRecord.setValue({
        fieldId: PENDING_REVIEW_FIELD_ID,
        value: false,
      });
    }
  };

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (scriptContext) => {};

  return { beforeLoad, beforeSubmit, afterSubmit };
});
