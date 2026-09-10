/**
 * Indica que el script utiliza la versión 2.1 de SuiteScript.
 * @NApiVersion 2.1
 *
 * Declara que este archivo es un User Event Script: NetSuite lo ejecuta
 * antes o después de cargar o guardar un registro.
 * @NScriptType UserEventScript
 */
// `define` declara las dependencias del módulo y la función principal del script.
define([
  // Carga el módulo de errores de NetSuite.
  "N/error",
], (
  // Recibe el módulo `N/error` con este nombre local.
  // Actualmente no se utiliza dentro del script.
  modulo_error,
) => {
  // Esta función se ejecutaría antes de que NetSuite cargue el formulario.
  // No contiene lógica, por lo que no realiza ninguna acción.
  const beforeLoad = (scriptContext) => {};

  // Esta función se ejecuta antes de que NetSuite guarde el registro.
  // `context` contiene, entre otros datos, el tipo de evento y el registro nuevo.
  const beforeSubmit = (context) => {
    // Almacena el texto final que se escribirá en el campo memo.
    let resultado = "";
    // ID interno del campo de cuerpo donde se guardará el resumen calculado.
    const idCampo = "custbody_drt_bootcamp_memo";
    // Declara una variable para un valor de campo; actualmente no se usa.
    let valorCampo = "";

    // Inicia un bloque para capturar cualquier error durante el cálculo.
    try {
      // Solo calcula el resumen cuando se está creando o editando el registro.
      if (
        // Comprueba si el evento actual es una creación de registro.
        context.type == context.UserEventType.CREATE ||
        // Comprueba si el evento actual es una edición de registro.
        context.type == context.UserEventType.EDIT
      ) {
        // Obtiene cuántas líneas existen en la sublista de artículos (`item`).
        var numLines = context.newRecord.getLineCount({
          // Identificador de la sublista que contiene los artículos del registro.
          sublistId: "item",
        });

        // Inicializa el acumulador de las cantidades de todas las líneas.
        let totalQuantity = 0;
        // Inicializa el acumulador de los importes de todas las líneas.
        let totalRate = 0;

        // Recorre cada línea de la sublista, desde la posición 0 hasta la última.
        for (let line = 0; line < numLines; line++) {
          // Lee la cantidad de artículos indicada en la línea actual.
          var quantity = context.newRecord.getSublistValue({
            // Indica que el dato se obtiene de la sublista de artículos.
            sublistId: "item",
            // ID interno de la columna que contiene la cantidad.
            fieldId: "quantity",
            // Índice de la línea que se está procesando.
            line: line,
          });

          // Lee el importe de la línea actual (cantidad por precio, según el registro).
          var rate = context.newRecord.getSublistValue({
            // Indica que el dato se obtiene de la sublista de artículos.
            sublistId: "item",
            // ID interno de la columna que contiene el importe de la línea.
            fieldId: "amount",
            // Índice de la línea que se está procesando.
            line: line,
          });

          // Suma la cantidad de la línea al total acumulado de artículos.
          totalQuantity += quantity;
          // Suma el importe de la línea al valor total acumulado.
          totalRate += rate;
        }

        // Construye el mensaje que resume número de líneas, cantidad e importe total.
        resultado = `Numero de lineas: ${numLines} Cantidades de articulos: ${totalQuantity} Valor total: ${totalRate}`;
      }
      // Si ocurre un error en el bloque `try`, se recibe en esta variable.
    } catch (error) {
      // Guarda el detalle del error en el registro de ejecución de NetSuite.
      log.error("beforeSubmit error", error);
      // Este bloque se ejecuta siempre, haya ocurrido un error o no.
    } finally {
      // Registra información de depuración con el campo destino y el resultado calculado.
      log.debug("beforeSubmit", `idCampo: ${idCampo} resultado: ${resultado}`);
      // Escribe el resultado en el campo personalizado del registro que se guardará.
      // El `|| ""` intenta usar una cadena vacía si la llamada no devuelve un valor truthy.
      context.newRecord.setValue(idCampo, resultado) || "";
    }
  };

  // Esta función se ejecutaría después de guardar el registro.
  // No contiene lógica, por lo que no realiza ninguna acción.
  const afterSubmit = (scriptContext) => {};

  // Expone las funciones para que NetSuite pueda invocarlas en cada etapa del evento.
  return {
    // Punto de entrada que NetSuite llama antes de cargar el formulario.
    beforeLoad,
    // Punto de entrada que NetSuite llama antes de guardar el registro.
    beforeSubmit,
    // Punto de entrada que NetSuite llama después de guardar el registro.
    afterSubmit,
  };
});
