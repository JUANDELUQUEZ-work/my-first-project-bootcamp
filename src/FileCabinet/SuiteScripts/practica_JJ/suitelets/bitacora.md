# Ticket de práctica — Suitelet: solicitud básica de gasto

## Información general

| Campo                        | Información                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Tipo de script               | Suitelet                                                                           |
| Versión de SuiteScript       | 2.1                                                                                |
| Estado                       | Por desarrollar                                                                    |
| Responsable                  | Juan José Deluquez Hernandez                                                       |
| Fecha de creación del ticket | 15/09/2026                                                                         |
| Fuente de estudio            | Clase videograbada del profesor                                                    |
| Archivo de referencia        | `onboarding-bootcamp-main/src/FileCabinet/SuiteScripts/drt_bootcamp_2026_sl.js`    |
| Archivo de la práctica       | `src/FileCabinet/SuiteScripts/practica_JJ/suitelets/drt_suiteScriptSuitelet_sl.js` |

## Objetivo de la práctica

Construir un Suitelet en SuiteScript 2.1 que muestre un formulario de solicitud básica de gasto cuando reciba una petición `GET` y que, al enviarse mediante `POST`, recupere los valores capturados y muestre una confirmación.

La práctica reproduce la metodología utilizada por el profesor: identificar el método HTTP mediante `scriptContext.request.method`, construir la interfaz con `N/ui/serverWidget`, enviar el formulario con `scriptContext.response.writePage(form)` y procesar sus parámetros después de presionar el botón de envío.

El propósito principal no es guardar información permanentemente, sino comprender el ciclo completo de una petición y una respuesta en un Suitelet.

## Caso funcional

Como usuario de NetSuite, quiero capturar una solicitud básica de gasto con sus datos generales y un detalle, para enviar el formulario y comprobar que el Suitelet puede recibir y mostrar la información introducida.

## Aprendizajes esperados

Al terminar la práctica debo poder explicar y demostrar:

- Qué indican las anotaciones `@NApiVersion` y `@NScriptType`.
- Cómo se carga un módulo de SuiteScript mediante `define`.
- Por qué `onRequest` es el punto de entrada de un Suitelet.
- Qué contiene `scriptContext` y cómo se utilizan sus propiedades `request` y `response`.
- La diferencia entre una petición `GET` y una petición `POST` dentro del mismo Suitelet.
- Cómo crear un formulario, campos, una lista de selección, una sublista y un botón con `N/ui/serverWidget`.
- Cómo recuperar valores mediante `scriptContext.request.parameters`.
- Cómo registrar la ejecución y los errores en el Execution Log.

## Comportamiento esperado

| Momento                                                        | Método HTTP    | Responsabilidad del Suitelet              | Resultado esperado                                     |
| -------------------------------------------------------------- | -------------- | ----------------------------------------- | ------------------------------------------------------ |
| El usuario abre la URL del deployment                          | `GET`          | Construir el formulario y sus componentes | NetSuite muestra el formulario vacío                   |
| El usuario completa los campos y presiona **Enviar solicitud** | `POST`         | Leer y separar los parámetros recibidos   | Se muestra una confirmación con los valores capturados |
| Ocurre una excepción durante cualquiera de los dos flujos      | `GET` o `POST` | Capturar y registrar el error             | El detalle aparece en el Execution Log                 |

## Requerimientos funcionales

### Flujo `GET`: construcción del formulario

Cuando `scriptContext.request.method` sea igual a `GET`, el Suitelet deberá:

1. Crear un formulario con el título **Solicitud básica de gasto**.
2. Agregar los siguientes campos de cabecera:

   | Dato               | ID sugerido                 | Tipo de campo                     | Etiqueta             |
   | ------------------ | --------------------------- | --------------------------------- | -------------------- |
   | Solicitante        | `custpage_requester`        | `serverWidget.FieldType.TEXT`     | `Solicitante`        |
   | Fecha de solicitud | `custpage_request_date`     | `serverWidget.FieldType.DATE`     | `Fecha de solicitud` |
   | Monto estimado     | `custpage_estimated_amount` | `serverWidget.FieldType.CURRENCY` | `Monto estimado`     |
   | Categoría          | `custpage_expense_category` | `serverWidget.FieldType.SELECT`   | `Categoría`          |

3. Conservar la referencia del campo **Solicitante** y aplicar:
   - `serverWidget.FieldLayoutType.NORMAL` como tipo de diseño.
   - `serverWidget.FieldBreakType.STARTCOL` para iniciar una columna.

4. Agregar al campo **Categoría** estas opciones:

   | Valor interno | Texto visible |
   | ------------- | ------------- |
   | `travel`      | Viaje         |
   | `materials`   | Materiales    |
   | `training`    | Capacitación  |

5. Crear una sublista de tipo `serverWidget.SublistType.INLINEEDITOR` con:

   | Dato                  | ID sugerido                   | Tipo de campo                 | Etiqueta      |
   | --------------------- | ----------------------------- | ----------------------------- | ------------- |
   | Fecha del detalle     | `custpage_detail_date`        | `serverWidget.FieldType.DATE` | `Fecha`       |
   | Descripción del gasto | `custpage_detail_description` | `serverWidget.FieldType.TEXT` | `Descripción` |

6. Utilizar `custpage_expense_details` como ID sugerido de la sublista y **Detalle del gasto** como etiqueta.
7. Agregar un botón de envío con la etiqueta **Enviar solicitud**.
8. Mostrar el formulario mediante `scriptContext.response.writePage(form)`.

### Flujo `POST`: recepción de los datos

Cuando el formulario sea enviado, el Suitelet deberá:

1. Obtener los campos de cabecera desde `scriptContext.request.parameters` utilizando los mismos IDs definidos durante el `GET`.
2. Obtener la información serializada de la sublista. Siguiendo el patrón del ejemplo de clase, el parámetro esperado será el ID de la sublista seguido por `data`: `custpage_expense_detailsdata`.
3. Separar las columnas de la primera línea con el delimitador `/\u0001/`.
4. Recuperar la primera fecha y la primera descripción de la sublista.
5. Escribir una respuesta que confirme los siguientes valores:
   - solicitante;
   - fecha de solicitud;
   - monto estimado;
   - categoría seleccionada;
   - fecha del primer detalle;
   - descripción del primer detalle.

6. Para esta primera versión, procesar únicamente la primera línea de la sublista, igual que el ejemplo del profesor. El procesamiento de varias líneas quedará como mejora posterior.

## Requerimientos técnicos

- Incluir el encabezado:

  ```javascript
  /**
   * @NApiVersion 2.1
   * @NScriptType Suitelet
   */
  ```

- Cargar `N/ui/serverWidget` mediante el patrón AMD de SuiteScript:

  ```javascript
  define(["N/ui/serverWidget"], (serverWidget) => {
    // Implementación
  });
  ```

- Implementar `onRequest` como punto de entrada y recibir `scriptContext` como parámetro.
- Exportar el punto de entrada mediante `return { onRequest };`.
- Registrar el método HTTP recibido con `log.debug` para poder distinguir las ejecuciones `GET` y `POST`.
- Encerrar la lógica principal en un bloque `try...catch`.
- Registrar cualquier excepción con `log.error` y un título que identifique `onRequest`.
- Mantener separados visualmente los bloques de construcción del formulario y procesamiento de datos.
- Utilizar nombres descriptivos para variables, campos y sublistas.
- No importar `N/record`: esta versión no crea ni modifica registros de NetSuite.
- No colocar contraseñas, tokens ni información sensible en logs o respuestas.

## Metodología de desarrollo

La implementación se realizará de forma incremental para comprobar cada concepto antes de continuar.

### Etapa 1 — Preparar la estructura

1. Revisar el archivo del profesor e identificar encabezado, dependencia, callback de `define`, `onRequest` y objeto retornado.
2. Completar esa misma estructura en `drt_suiteScriptSuitelet_sl.js`.
3. Agregar el `log.debug`, el `try...catch` y la condición basada en `scriptContext.request.method`.
4. Confirmar que el archivo puede cargarse como un Suitelet antes de agregar campos.

### Etapa 2 — Construir y comprobar el `GET`

1. Crear únicamente el formulario y enviarlo con `writePage`.
2. Desplegarlo en Sandbox y abrir su URL.
3. Confirmar en el Execution Log que el método recibido sea `GET`.
4. Agregar los campos uno por uno y verificar su presentación.
5. Agregar las opciones de la categoría, la sublista y finalmente el botón.

### Etapa 3 — Implementar y comprobar el `POST`

1. Enviar inicialmente el formulario con una sola línea de detalle.
2. Revisar el log de `scriptContext` para reconocer los nombres y valores recibidos.
3. Leer los campos de cabecera desde `request.parameters`.
4. Separar la información de la sublista con `/\u0001/`.
5. Generar una respuesta sencilla con `response.write`.
6. Confirmar en el Execution Log que esta segunda ejecución utilice `POST`.

### Etapa 4 — Manejo de errores y documentación

1. Probar temporalmente un ID de parámetro incorrecto para observar cómo se registra una excepción y después restaurarlo.
2. Verificar que el `catch` reciba el objeto `error` y lo registre con `log.error`.
3. Documentar los resultados reales, problemas y decisiones en la sección de bitácora de este ticket.
4. No marcar los criterios de aceptación hasta contar con evidencia de cada comportamiento.

## Guía del flujo que debe implementarse

```text
Usuario abre la URL
        ↓
NetSuite ejecuta onRequest(scriptContext)
        ↓
¿request.method es GET?
   ├─ Sí → crear formulario → agregar componentes → response.writePage(form)
   └─ No → leer parameters → separar sublista → response.write(confirmación)
```

## Nomenclatura y configuración sugerida

### Archivo de la práctica

`drt_suiteScriptSuitelet_sl.js`

- `drt_`: prefijo utilizado por el proyecto.
- `suiteScriptSuitelet`: descripción actual de la práctica.
- `_sl`: identificador del tipo Suitelet.
- `.js`: extensión del archivo SuiteScript.

### Objetos de NetSuite

| Elemento          | Nombre o ID sugerido                           |
| ----------------- | ---------------------------------------------- |
| Script Record     | `DRT - Solicitud básica de gasto SL`           |
| Script ID         | `customscript_drt_basic_expense_sl`            |
| Deployment title  | `DRT - Solicitud básica de gasto SL - Sandbox` |
| Deployment ID     | `customdeploy_drt_basic_expense_sl`            |
| Estado inicial    | `Testing`                                      |
| Audiencia inicial | Únicamente el rol o usuario de práctica        |

## Casos de prueba

| Caso                        | Acción                                                           | Resultado esperado                                                         | Resultado obtenido | Estado/Evidencia |
| --------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------ | ---------------- |
| Abrir el Suitelet           | Acceder a la URL del deployment                                  | Se muestra el formulario y el log indica `GET`                             | Pendiente          | Pendiente        |
| Revisar los controles       | Observar campos, categoría, sublista y botón                     | Todos los componentes aparecen con sus etiquetas correctas                 | Pendiente          | Pendiente        |
| Enviar información completa | Completar todos los campos, agregar una línea y enviar           | La respuesta contiene los seis valores y el log indica `POST`              | Pendiente          | Pendiente        |
| Cambiar la categoría        | Enviar una solicitud por cada opción                             | La respuesta refleja el valor interno seleccionado                         | Pendiente          | Pendiente        |
| Enviar valores mínimos      | Dejar campos opcionales vacíos y enviar                          | El Suitelet responde sin romperse o registra claramente el error observado | Pendiente          | Pendiente        |
| Probar el manejo de errores | Provocar de forma controlada un parámetro inválido y restaurarlo | El error aparece en el Execution Log                                       | Pendiente          | Pendiente        |

## Criterios de aceptación

- [ ] El archivo declara SuiteScript 2.1 y el tipo `Suitelet`.
- [ ] `N/ui/serverWidget` se carga correctamente mediante `define`.
- [ ] `onRequest` recibe `scriptContext` y se expone en el objeto retornado.
- [ ] Abrir el deployment ejecuta el flujo `GET` y muestra el formulario.
- [ ] El formulario contiene los campos `TEXT`, `DATE`, `CURRENCY` y `SELECT` solicitados.
- [ ] El campo de selección contiene Viaje, Materiales y Capacitación.
- [ ] La sublista `INLINEEDITOR` contiene una fecha y una descripción.
- [ ] El botón **Enviar solicitud** genera una petición `POST`.
- [ ] El flujo `POST` recupera correctamente los cuatro campos de cabecera.
- [ ] El flujo `POST` recupera la primera fecha y descripción de la sublista.
- [ ] La respuesta muestra los seis valores enviados de manera comprensible.
- [ ] Los métodos `GET` y `POST` pueden identificarse en el Execution Log.
- [ ] Las excepciones se registran mediante `log.error`.
- [ ] Las pruebas se realizaron en Sandbox y quedaron documentadas.

## Fuera del alcance de esta versión

- Crear o actualizar registros con `N/record`.
- Guardar la solicitud permanentemente.
- Procesar más de una línea de la sublista.
- Enviar correos o ejecutar integraciones externas.
- Agregar un Client Script para validaciones en el navegador.
- Publicar el deployment para todos los usuarios o moverlo a Producción.

Estas funcionalidades pueden convertirse en una segunda práctica después de dominar el flujo básico `GET`/`POST`.

---

# Bitácora de ejecución

## Datos reales de la implementación

| Campo                      | Valor       |
| -------------------------- | ----------- |
| Fecha de inicio            |             |
| Fecha de finalización      |             |
| URL o deployment utilizado |             |
| Script ID real             |             |
| Deployment ID real         |             |
| Usuario y rol de prueba    |             |
| Estado final               | No iniciado |

## Registro de avances

| Fecha | Actividad realizada | Resultado | Duda o incidencia | Siguiente paso |
| ----- | ------------------- | --------- | ----------------- | -------------- |
|       |                     |           |                   |                |

## Incidencias y decisiones

| Fecha | Situación | Diagnóstico | Solución o decisión | Estado |
| ----- | --------- | ----------- | ------------------- | ------ |
|       |           |             |                     |        |

## Evidencias

- Captura del formulario durante el `GET`:
- Captura de la confirmación después del `POST`:
- Captura del Execution Log:
- Valores utilizados durante la prueba:

## Reflexión final

- ¿Qué información recibí mediante `scriptContext.request`?
- ¿Cómo utilicé `scriptContext.response`?
- ¿Qué diferencia observé entre las ejecuciones `GET` y `POST`?
- ¿Cómo relacioné los IDs de los campos con `request.parameters`?
- ¿Qué dificultad encontré al recuperar la información de la sublista?
- ¿Qué cambiaría para procesar varias líneas en una siguiente versión?
