/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
// Se cargan los modulos de NetSuite que utilizara este Client Script.
// N/ui/dialog permite mostrar ventanas de dialogo en la interfaz del usuario.
// N/runtime permite consultar informacion del usuario que esta ejecutando el script.
define(["N/ui/dialog", "N/runtime"], function (dialog, modulo_runtime) {
  /**
   * Function to be executed after page is initialized.
   *
   * 
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  const pageInit = (scriptContext) => {
    // Se prepara el objeto con el titulo y el mensaje que se mostraran en la alerta.
    // Los textos iniciales se completan mas adelante con los datos del usuario actual.
    const options = {
      title: "Hola ",
      message: "Tu correo es: ",
    };
    try {
      // getCurrentUser() obtiene el usuario que tiene abierta la pagina de NetSuite.
      // Se agrega su nombre al titulo de la ventana.
      options.title += modulo_runtime.getCurrentUser().name;

      // Se agrega el correo del usuario actual al mensaje de la ventana.
      options.message += modulo_runtime.getCurrentUser().email;

      // Se muestra la ventana de dialogo utilizando el titulo y mensaje preparados.
      dialog.alert(options);

      // Se registra en el log que la alerta se mostro correctamente.
      log.debug("Success", "Alert displayed successfully");
    } catch (e) {
      // Si ocurre un error al obtener los datos o mostrar la alerta,
      // se registra el nombre y el mensaje del error para poder diagnosticarlo.
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
      // Se registra todo el contexto recibido por NetSuite cuando cambia un campo.
      // Este objeto contiene informacion del registro, la sublista y el campo modificado.
      log.debug(`fieldChanged context`, context);

      // Se obtiene el registro actual desde el contexto del evento.
      var currentRecord = context.currentRecord;

      // Se obtiene el identificador de la sublista donde ocurrio el cambio.
      var sublistName = context.sublistId;

      // Se obtiene el identificador del campo que fue modificado.
      var sublistFieldName = context.fieldId;

      // Se obtiene el numero de linea relacionado con el cambio.
      var line = context.line; // esto solo funciona en el evento fieldChanged, no en los demas eventos de sublista.

      // Se registran los valores importantes del evento para facilitar la depuracion.
      log.debug(
        `valores context`,
        ` sublistName: ${sublistName} sublistFieldName: ${sublistFieldName} line: ${line}`,
      );

      // Se valida que el cambio haya ocurrido en la sublista "item"
      // y especificamente en el campo "item".
      if (sublistName === "item" && sublistFieldName === "item") {
        // Pausa la ejecucion cuando las herramientas de desarrollo del navegador
        // tienen habilitado el modo de depuracion.
        debugger;

        // Se obtiene el articulo seleccionado en la linea actual de la sublista.
        const item = currentRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
        });

        // Se obtiene la cantidad introducida en la linea actual.
        const quantity = currentRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
        });

        // Se registran el articulo, la cantidad y la linea para comprobar
        // los valores que tenia la sublista cuando ocurrio el evento.
        log.debug(
          `valores line`,
          ` item: ${item} quantity: ${quantity} line: ${line}`,
        );

        // Se actualiza el campo "memo" del registro principal con un mensaje
        // que indica cual articulo fue seleccionado.
        currentRecord.setValue({
          fieldId: "memo",
          value: `Item: ${item} is selected`,
        });
      }
    } catch (error) {
      // Si alguna operacion del evento falla, se registra el error sin detener
      // de forma silenciosa la ejecucion del Client Script.
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
  // Este evento se ejecutaria despues de que NetSuite complete automaticamente
  // los valores relacionados con un campo. Actualmente no contiene logica.
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
  // Este evento se ejecutaria despues de insertar, eliminar o editar una linea
  // de una sublista. Actualmente no contiene logica.
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
  // Este evento se ejecutaria cuando el usuario selecciona una linea de sublista.
  // Actualmente no contiene logica.
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
  // Esta funcion serviria para validar un campo antes de aceptar su nuevo valor.
  // Actualmente no contiene logica de validacion.
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
  // Esta funcion serviria para validar una linea antes de confirmarla.
  // Actualmente no contiene logica de validacion.
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
  // Esta funcion serviria para decidir si se permite insertar una nueva linea.
  // Actualmente no contiene logica de validacion.
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
  // Esta funcion serviria para decidir si se permite eliminar una linea.
  // Actualmente no contiene logica de validacion.
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
  // Esta funcion serviria para validar el registro completo antes de guardarlo.
  // Actualmente no contiene logica de validacion.
  function saveRecord(scriptContext) {}

  // Se exponen las funciones que NetSuite puede ejecutar como puntos de entrada.
  // En este script solo se habilita fieldChanged; las demas funciones quedan
  // declaradas como ejemplos, pero no se registran como eventos activos.
  return {
    fieldChanged,
  };
});
