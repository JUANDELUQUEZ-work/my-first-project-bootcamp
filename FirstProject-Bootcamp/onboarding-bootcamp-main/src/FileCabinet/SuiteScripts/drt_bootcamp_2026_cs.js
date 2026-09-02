/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["N/ui/dialog", "N/runtime"], function (dialog, modulo_runtime) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  const pageInit = (scriptContext) => {
    const options = {
      title: "Hola ",
      message: "Tu correo es: ",
    };
    try {
      options.title += modulo_runtime.getCurrentUser().name;
      options.message += modulo_runtime.getCurrentUser().email;
      dialog.alert(options);
      log.debug("Success", "Alert displayed successfully");
    } catch (e) {
      log.error(e.name, e.message);
    }
  };

  /**
   * Function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @since 2015.2
   */
  function fieldChanged(context) {
    try {
      log.debug(`fieldChanged context`, context);
      var currentRecord = context.currentRecord; // Esta obteniendo el registro actual del contexto
      var sublistName = context.sublistId; // Esta obteniendo el nombre de la sublista del contexto
      var sublistFieldName = context.fieldId; // Esta obteniendo el nombre del campo de la sublista del contexto..
      var line = context.line; // Esta obteniendo el numero de linea del contexto que cambio..
      log.debug(
        `valores context`,
        ` sublistName: ${sublistName} sublistFieldName: ${sublistFieldName} line: ${line}`,
      );

      // Condicionales
      if (sublistName === "item" && sublistFieldName === "item") {
        // Si el nombre de la sublista es "item" y el nombre del campo de la sublista es "item", entonces se ejecuta el siguiente bloque de código.
        debugger;
        const item = currentRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
        });
        const quantity = currentRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
        });
        log.debug(
          `valores line`,
          ` item: ${item} quantity: ${quantity} line: ${line}`,
        );
        // Primera condicional: Le da los siguientes valores a los campos de la sublista "item" en la linea actual.
        currentRecord.setValue({
          fieldId: "memo",
          value: `Item: ${item} is selected`,
        });
      }
    } catch (error) {
      log.error("error fieldChanged", error);
    }
  }

  /**
   * Function to be executed when field is slaved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   *
   * @since 2015.2
   */
  function postSourcing(scriptContext) {}

  /**
   * Function to be executed after sublist is inserted, removed, or edited.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  function sublistChanged(scriptContext) {}

  /**
   * Function to be executed after line is selected.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  function lineInit(scriptContext) {}

  /**
   * Validation function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @returns {boolean} Return true if field is valid
   *
   * @since 2015.2
   */
  function validateField(scriptContext) {}

  /**
   * Validation function to be executed when sublist line is committed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  function validateLine(scriptContext) {}

  /**
   * Validation function to be executed when sublist line is inserted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  function validateInsert(scriptContext) {}

  /**
   * Validation function to be executed when record is deleted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  function validateDelete(scriptContext) {}

  /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
  function saveRecord(scriptContext) {}

  return {
    fieldChanged,
    pageInit,
  };
});
