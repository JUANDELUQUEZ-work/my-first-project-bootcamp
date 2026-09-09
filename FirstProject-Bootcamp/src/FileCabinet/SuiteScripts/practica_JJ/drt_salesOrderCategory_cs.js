/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
// Modulos seleccionaos de NetSuite para el desarrollo del script.
define(["N/runtime", "N/ui/dialog"] /**
 * @param{runtime} runtime
 * @param{dialog} dialog
 */, function (runtime, dialog) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  function pageInit(scriptContext) {}

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
    // desarrollo de ticket - categorias de cliente...
    try {
      log.debug("fieldChanged context", context);
      /*         // imprimimos en con sola el id del valor que el usuario selecciona en el campo
        console.log("fieldValue", fieldValue); */
      // Declaramos una varaible para el registro actual que el usuario va a estar editando.
      var currentRecord = context.currentRecord;
      // Declaramos una variable para capturar el id del campo que se esta editanod.
      var fieldId = context.fieldId;
      // Construimos barrera condicional con el id del campo que queremos monitorear comparado con el id del campo que se esta editando.
      if (fieldId === "custentity_lead_category") {
        // Declaramos una variable para capturar el valor del campo que se esta editando.
        const fieldValue = currentRecord.getValue({ fieldId: fieldId });
        /*// imprimimos en con sola el id del valor que el usuario selecciona en el campo con...
      // console.log("fieldValue", fieldValue); */

        // Conicional para saber si el valor del campo es igual a 1 que son los valores de la categoria de cliente que nos interesa monitoreas.
        if (fieldValue == 1) {
          currentRecord.setValue({
            fieldId: "custentity_drt_descripcion_credito_ct",
            value:
              "El cliente es de categoria A, - Pendiente revisión de crédito.",
            // El parametro ignoreFieldChange evita que se dispare el evento fieldChanged nuevamente al cambiar el valor del campo.
            ignoreFieldChange: true,
          });
          // Alerta de editar credito del cliente - mediante objeto usando el modulo seleccionado de netsuite dialog.
          const options = {
            title: "Alerta de credito para cliente de categoria A",
            message:
              "El cliente es de categoria A, - Pendiente revisión de crédito.",
          };
          dialog.alert(options);
        }
      }
    } catch (error) {
      log.error("Error en fieldChange", error);
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
  };
});
