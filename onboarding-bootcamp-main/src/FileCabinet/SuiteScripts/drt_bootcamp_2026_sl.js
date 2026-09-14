/**
 * Indica la versión de SuiteScript con la que NetSuite debe ejecutar el archivo.
 * SuiteScript 2.1 permite utilizar características modernas de JavaScript, como
 * funciones flecha, const, let y template literals (cadenas delimitadas por `).
 *
 * @NApiVersion 2.1
 * Identifica este archivo como un Suitelet. Un Suitelet responde solicitudes HTTP
 * y se usa, por ejemplo, para crear páginas y formularios dentro de NetSuite.
 *
 * @NScriptType Suitelet
 */

// `define` registra el módulo mediante el sistema AMD que utiliza SuiteScript.
// El primer arreglo declara las dependencias y la función recibe cada módulo en
// el mismo orden en el que aparece dentro del arreglo.
define([
    // Módulo nativo para construir formularios, campos y sublistas del lado servidor.
    'N/ui/serverWidget'
], (
    // Referencia local al módulo N/ui/serverWidget declarado arriba.
    serverWidget
) => {
    /**
     * Punto de entrada que NetSuite ejecuta cada vez que alguien abre o envía el
     * Suitelet.
     *
     * @param {Object} scriptContext Contexto de la solicitud HTTP actual.
     * @param {ServerRequest} scriptContext.request Contiene método y parámetros.
     * @param {ServerResponse} scriptContext.response Permite responder al cliente.
     */
    const onRequest = (scriptContext) => {
        // Registra el método HTTP y el contexto para facilitar la depuración.
        // `log` es un objeto global proporcionado por NetSuite, por eso no se importa.
        log.debug(`scriptContext ${scriptContext.request.method}`, scriptContext);

        // Evita que una excepción no controlada interrumpa el script sin quedar
        // registrada en el Execution Log de NetSuite.
        try {
            // GET se recibe normalmente al abrir la URL del Suitelet. En este caso
            // se construye y muestra el formulario. Cualquier otro método entra en
            // el bloque `else`, normalmente el POST generado por el botón Submit.
            if (
                scriptContext.request.method === 'GET'
            ) {
                // Crea el formulario que NetSuite renderizará como una página HTML.
                let form = serverWidget.createForm({
                    title: 'Simple Form'
                });

                // Agrega un campo de texto y conserva su referencia porque después
                // se modificarán opciones de diseño específicas de este campo.
                let field = form.addField({
                    // ID interno usado para identificar el campo al recibir el POST.
                    id: 'textfield',
                    // Tipo de dato y control visual que NetSuite debe mostrar.
                    type: serverWidget.FieldType.TEXT,
                    // Texto visible para la persona que usa el formulario.
                    label: 'Text'
                });

                // NORMAL aplica la disposición estándar de un campo de formulario.
                field.layoutType = serverWidget.FieldLayoutType.NORMAL;

                // STARTCOL coloca este campo al inicio de una nueva columna dentro
                // del diseño generado automáticamente por NetSuite.
                field.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                // Campo de fecha. No se guarda la referencia porque no necesita
                // configuraciones adicionales después de ser creado.
                form.addField({
                    id: 'datefield',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });

                // Campo monetario. NetSuite valida y presenta el valor de acuerdo
                // con el formato numérico configurado para el usuario o la cuenta.
                form.addField({
                    id: 'currencyfield',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Currency'
                });

                // Crea una lista desplegable. Se guarda su referencia para poder
                // añadir las opciones que estarán disponibles para seleccionar.
                let select = form.addField({
                    id: 'selectfield',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Select'
                });

                // Cada opción tiene un valor interno enviado al servidor (`a`) y
                // un texto visible para el usuario (`Albert`).
                select.addSelectOption({
                    value: 'a',
                    text: 'Albert'
                });

                // Segunda opción del desplegable: se enviará `b` si se elige Baron.
                select.addSelectOption({
                    value: 'b',
                    text: 'Baron'
                });

                // Agrega una sublista editable dentro del formulario. INLINEEDITOR
                // permite capturar varias líneas y crear nuevas líneas desde la UI.
                let sublist = form.addSublist({
                    id: 'sublist',
                    type: serverWidget.SublistType.INLINEEDITOR,
                    label: 'Inline Editor Sublist'
                });

                // Primera columna de la sublista: acepta valores de tipo fecha.
                sublist.addField({
                    id: 'sublist1',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });

                // Segunda columna de la sublista: acepta texto libre.
                sublist.addField({
                    id: 'sublist2',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Text'
                });

                // Añade el botón que envía el formulario. Al presionarlo, NetSuite
                // hace una solicitud POST al mismo Suitelet con los datos capturados.
                form.addSubmitButton({
                    label: 'Submit Button'
                });

                // Escribe el formulario en la respuesta HTTP para mostrarlo en pantalla.
                scriptContext.response.writePage(form);
            } else {
                // NetSuite serializa los valores de una línea de sublista usando el
                // carácter de control U+0001 como separador entre columnas.
                const delimiter = /\u0001/;

                // `parameters` contiene los valores enviados por los campos del
                // formulario. Las propiedades coinciden con los IDs definidos arriba.
                const textField = scriptContext.request.parameters.textfield;
                const dateField = scriptContext.request.parameters.datefield;
                const currencyField = scriptContext.request.parameters.currencyfield;
                const selectField = scriptContext.request.parameters.selectfield;

                // `sublistdata` contiene la información serializada de la sublista.
                // `split` la convierte en un arreglo separando sus columnas.
                const sublistData = scriptContext.request.parameters.sublistdata.split(delimiter);

                // Obtiene los dos primeros valores de la información de la sublista:
                // posición 0 para la fecha y posición 1 para el texto.
                const sublistField1 = sublistData[0];
                const sublistField2 = sublistData[1];

                // Devuelve una respuesta de texto con los datos recibidos. Los
                // template literals permiten insertar variables mediante ${...}.
                scriptContext.response.write(`You have entered: ${textField} ${dateField} ${currencyField} ${selectField} ${sublistField1} ${sublistField2}`);
            }
        } catch (error) {
            // Registra el detalle de cualquier error ocurrido durante GET o POST.
            // Actualmente solo se registra; no se genera una respuesta alternativa.
            log.error(`Error onRequest`, error);
        }
    }

    // Expone `onRequest` como punto de entrada público. NetSuite busca esta función
    // porque el encabezado declaró que el archivo es de tipo Suitelet.
    return {
        onRequest
    }

});
