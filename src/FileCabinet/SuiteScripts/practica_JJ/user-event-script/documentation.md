# Ticket de práctica — User Event Script: revisión inicial de clientes

## Objetivo de la práctica

Construir un **User Event Script (UE)** en SuiteScript 2.1 que se ejecute sobre el registro **Customer**. Al crear un cliente, el script deberá marcarlo como **pendiente de revisión** mediante un campo personalizado y dejar evidencia en el Execution Log. Con esta práctica se estudiará el ciclo de vida completo de un User Event Script: carga del formulario, validación/preparación antes de guardar y acciones posteriores al guardado.

El alcance se limita a NetSuite. No se requiere una conexión externa a una base de datos: el registro que entrega `scriptContext.newRecord` ya representa el dato que NetSuite está creando o actualizando.

## Caso funcional

Como usuario que crea clientes en NetSuite, quiero que cada cliente nuevo quede identificado como pendiente de revisión, para que el equipo responsable pueda confirmar posteriormente sus datos.

### Comportamiento esperado

| Momento                                     | Evento         | Resultado esperado                                                                                     |
| ------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| Se abre el formulario para crear un cliente | `beforeLoad`   | Se muestra un aviso informativo: el cliente será marcado como pendiente de revisión al guardarse.      |
| Se guarda un cliente nuevo                  | `beforeSubmit` | El campo personalizado de revisión se establece en `true` (pendiente).                                 |
| Se edita un cliente existente               | `beforeSubmit` | El script no modifica el estado de revisión que ya tenga el cliente.                                   |
| NetSuite termina de guardar                 | `afterSubmit`  | Se registra en el Execution Log el ID del cliente, el tipo de evento y el valor del campo de revisión. |

> Decisión final: en el checkbox de NetSuite, `true` significa “pendiente de revisión” y `false` significa “no pendiente”. Esta correspondencia coincide con el nombre y el estado visual del campo.

## Requerimientos

### Funcionales

- El script deberá ser de tipo `UserEventScript` y usar SuiteScript 2.1.
- Deberá desplegarse sobre el tipo de registro **Customer**.
- Solo actuará sobre `CREATE` durante la primera versión; `EDIT` se observará en el log, pero no deberá cambiar el campo personalizado.
- En `beforeLoad`, el aviso deberá mostrarse solo al crear un registro desde la interfaz de usuario.
- En `beforeSubmit`, se deberá validar el tipo de ejecución con `scriptContext.UserEventType.CREATE` antes de cambiar el valor.
- En `afterSubmit`, se deberá usar `N/log` para registrar datos útiles, sin registrar información sensible como contraseñas, tokens o datos bancarios.
- El script no deberá crear, editar ni eliminar otros registros durante esta primera práctica.

### Técnicos

- Usar el encabezado:

  ```javascript
  /**
   * @NApiVersion 2.1
   * @NScriptType UserEventScript
   */
  ```

- Usar el patrón AMD de SuiteScript: `define([...], (...) => { ... })`.
- Módulos iniciales: `N/log`, `N/ui/message` y `N/runtime`. No incluir `N/record` a menos que se necesite trabajar con otro registro; para esta práctica basta con `scriptContext.newRecord`.
- El ID del campo personalizado deberá comenzar con `custentity_`, porque pertenece a Customer.
- Usar comentarios JSDoc para explicar cada punto de entrada y las decisiones de negocio.
- Probar en Sandbox antes de realizar cualquier despliegue a Producción.

### Configuración requerida en NetSuite

Antes de programar, crear un campo personalizado de tipo checkbox:

| Propiedad             | Valor propuesto                               |
| --------------------- | --------------------------------------------- |
| Tipo de campo         | `Customer` / Entity Field                     |
| Etiqueta              | `Pendiente de revisión`                       |
| ID sugerido           | `custentity_drt_ue_pending_review`            |
| Tipo de dato          | Checkbox                                      |
| Valor predeterminado  | Desmarcado (`false`); el script lo marca al crear el cliente |
| Mostrar en formulario | Sí                                            |
| Acceso                | El rol de pruebas debe poder verlo y editarlo |

Si NetSuite genera un ID distinto al sugerido, se debe copiar el ID real y usarlo tanto en el código como en esta documentación.

## Nomenclatura y archivos por crear

La nomenclatura definitiva para esta práctica es `drt_customerReviewControl_ue.js`.

- `drt_`: prefijo usado por el proyecto.
- `customerReviewControl`: describe que el script controla el estado de revisión de los clientes.
- `_ue`: identifica un **User Event Script**.
- `.js`: extensión del archivo SuiteScript.

Archivos del ejercicio:

```text
src/FileCabinet/SuiteScripts/practica_JJ/user-event-script/
├── documentation.md                         # Este ticket y bitácora de avance
└── drt_customerReviewControl_ue.js          # Script de la práctica
```

Nombres que se crearán en NetSuite:

| Elemento            | Nombre/ID sugerido                            |
| ------------------- | --------------------------------------------- |
| Archivo             | `drt_customerReviewControl_ue.js`             |
| Script record       | `DRT - Customer Review Control UE`            |
| Script ID           | `customscript_drt_customer_review_control_ue` |
| Deployment title    | `DRT - Customer Review Control UE - Sandbox`  |
| Deployment ID       | `customdeploy_drt_customer_review_control_ue` |
| Campo personalizado | `custentity_drt_ue_pending_review`            |

## Paso a paso de creación

### 1. Revisar la plantilla de la clase

1. Abrir `src/FileCabinet/SuiteScripts/drt_bootcamp_jjdh_ue.js`.
2. Identificar los tres eventos disponibles: `beforeLoad`, `beforeSubmit` y `afterSubmit`.
3. Observar que el `return { beforeLoad, beforeSubmit, afterSubmit };` es lo que expone los eventos a NetSuite.
4. Crear `drt_customerReviewControl_ue.js` en la carpeta `user-event-script`; no modificar el archivo de clase.

### 2. Crear el campo de práctica

1. Entrar a **Customization > Lists, Records, & Fields > Entity Fields > New** en Sandbox.
2. Seleccionar tipo **Checkbox**.
3. Configurar la etiqueta y el ID indicados en la tabla de configuración.
4. Confirmar que el campo se encuentra disponible para el formulario y rol que se usarán en las pruebas.
5. Guardar el campo y anotar su ID real en la sección de bitácora de este documento.

### 3. Crear el archivo SuiteScript

1. Copiar únicamente la estructura base del ejemplo de clase al nuevo archivo.
2. Cambiar la dependencia a `define(["N/log", "N/ui/message", "N/runtime"], (log, message, runtime) => { ... })`.
3. Declarar una constante para el ID del campo, por ejemplo:

   ```javascript
   const PENDING_REVIEW_FIELD = "custentity_drt_ue_pending_review";
   ```

4. En `beforeLoad`, comprobar que `scriptContext.type` sea `scriptContext.UserEventType.CREATE` y que `runtime.executionContext` sea `runtime.ContextType.USER_INTERFACE`.
5. Si ambas condiciones se cumplen, usar `scriptContext.form.addPageInitMessage(...)` con `message.Type.INFORMATION` para mostrar el aviso. Este mensaje solo guía al usuario; no guarda datos.
6. En `beforeSubmit`, volver a validar que el evento sea `CREATE` y ejecutar:

   ```javascript
   scriptContext.newRecord.setValue({
     fieldId: PENDING_REVIEW_FIELD,
     value: true,
   });
   ```

7. En `afterSubmit`, obtener el valor desde `scriptContext.newRecord` y registrarlo con `log.audit`. El mensaje final incluye el ID interno del cliente y traduce el booleano a “pendiente” o “no pendiente”.
8. Retornar únicamente los eventos que realmente se implementen. Para este ejercicio se recomienda retornar los tres para poder estudiar su orden de ejecución.

### 4. Subir el archivo y crear el Script Record

1. Subir el archivo `.js` a la carpeta correspondiente de File Cabinet o desplegarlo mediante el flujo SuiteCloud que use el proyecto.
2. Ir a **Customization > Scripting > Scripts > New**.
3. Seleccionar el archivo y confirmar que NetSuite detecte el tipo **User Event**.
4. Guardar el Script Record usando el nombre e ID definidos.
5. Crear un deployment con estado **Testing** y audiencia limitada al rol de práctica.
6. En la pestaña **Applies To**, elegir **Customer**.
7. Configurar los eventos permitidos para `Create` y `Edit`, y limitar el contexto de ejecución a **User Interface** durante esta práctica.

### 5. Ejecutar pruebas controladas

1. Con el rol configurado, crear un cliente de prueba desde la interfaz de usuario.
2. Verificar que aparezca el aviso en el formulario antes de guardar.
3. Guardar el cliente y confirmar que `Pendiente de revisión` quede marcado.
4. Abrir el cliente, desmarcar manualmente el campo para indicar que ya no está pendiente y guardar.
5. Volver a editarlo sin cambiar el checkbox; confirmar que el script no lo regrese a pendiente.
6. Revisar **Customization > Scripting > Script Execution Logs** y validar los datos de `afterSubmit`.
7. Registrar los resultados reales en la tabla de pruebas de este documento.

### 6. Criterios de aceptación

- [x] Se creó el campo `custentity_drt_ue_pending_review` y se documentó su ID real.
- [x] El archivo usa `@NApiVersion 2.1` y `@NScriptType UserEventScript`.
- [x] El deployment aplica al registro Customer y fue probado en Sandbox.
- [x] Al abrir la creación de un cliente se muestra el aviso de revisión.
- [x] Al crear un cliente, el campo queda marcado (`true`).
- [x] Al editar el cliente, el script no vuelve a forzar el valor porque `beforeSubmit` está limitado a `CREATE`.
- [x] El Execution Log registra el ID interno y el estado de revisión del cliente.
- [x] Las pruebas, incidencias y decisiones quedaron documentadas.

## Límites de esta primera versión

- No se conecta a una base de datos externa ni ejecuta consultas SQL. Los datos se leen y escriben mediante las APIs de NetSuite sobre el registro actual.
- No envía correos, no crea tareas y no actualiza registros relacionados; esas mejoras pueden ser una segunda práctica cuando el flujo básico funcione.
- No se debe habilitar en Producción hasta completar pruebas en Sandbox y recibir la autorización correspondiente.

---

# Documentación final de la implementación

Esta sección registra el resultado real del ejercicio, las pruebas efectuadas y las decisiones tomadas durante su desarrollo.

## 1. Datos finales del ticket

| Campo                     | Valor                                            |
| ------------------------- | ------------------------------------------------ |
| Estado                    | **Terminado**                                    |
| Nombre de archivo elegido | `drt_customerReviewControl_ue.js`                |
| Script ID documentado     | `customscript_drt_customer_review_control_ue`    |
| Deployment ID real        | `customdeploy_drt_ue_pending_review`             |
| Ambiente                  | Sandbox                                          |
| Tipo de registro          | Customer                                         |
| Responsable               | Juan José Deluquez Hernandez                     |
| Usuario de las pruebas    | Jacob Deluquez                                   |
| Cliente de prueba         | ID interno `1731`                                |
| Fecha de inicio           | 11/09/2026 12:20                                 |
| Fecha de finalización     | 14/09/2026 10:04                                 |

## 2. Alcance implementado

- **Problema resuelto:** identificar automáticamente los clientes nuevos que todavía requieren revisión.
- **Regla de negocio final:** cuando un cliente se crea manualmente desde la interfaz de NetSuite, el campo `custentity_drt_ue_pending_review` se establece en `true`. En ediciones posteriores el User Event no fuerza nuevamente el valor.
- **`beforeLoad`:** muestra una franja informativa al abrir el formulario de creación de Customer.
- **`beforeSubmit`:** marca el checkbox antes de guardar, únicamente cuando el evento es `CREATE` y el contexto es `USER_INTERFACE`.
- **`afterSubmit`:** consulta el valor final del checkbox y registra mediante `log.audit` el ID interno del cliente y si continúa pendiente.
- **Eventos excluidos:** el script no modifica datos durante `EDIT`, no crea registros relacionados y no se ejecuta para integraciones dentro del alcance probado.
- **Cambio frente al ticket inicial:** se corrigió la correspondencia booleana para que `true` signifique “pendiente de revisión” y `false` signifique “no pendiente”.

## 3. Configuración de NetSuite

| Elemento                | Configuración final                              | Evidencia o ruta en NetSuite                              |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Campo personalizado     | `Pendiente de revisión`                          | `custentity_drt_ue_pending_review`                        |
| Archivo en File Cabinet | `drt_customerReviewControl_ue.js`                | Carpeta `user-event-script` y archivo desplegado          |
| Script Record           | `DRT - Customer Review Control UE`               | `Customization > Scripting > Scripts`                     |
| Deployment              | `customdeploy_drt_ue_pending_review`             | Visible como `CUSTOMDEPLOY_DRT_UE_PENDING_REVIEW` en logs |
| Aplicación (Applies To) | Customer                                         | Formulario de creación y edición de clientes              |
| Eventos del deployment  | `CREATE` y `EDIT`                                | Validación funcional con cliente `1731`                   |
| Contexto                | `USER_INTERFACE`                                 | Creación manual desde la interfaz                         |
| Audiencia/roles         | Rol utilizado por Jacob Deluquez                 | Prueba manual completada                                  |
| Estado del deployment   | Desplegado y validado funcionalmente en Sandbox  | Execution Log del 14/09/2026                              |

## 4. Diseño técnico

| Elemento                                  | Decisión final                                             | Motivo                                                             |
| ----------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Versión de API                            | SuiteScript 2.1                                            | Versión indicada para el ejercicio del bootcamp                     |
| Módulos `N/*`                             | `N/log`, `N/runtime`, `N/ui/message`                        | Logs, filtro del contexto y tipo visual del aviso                   |
| Constantes e IDs de campos                | `PENDING_REVIEW_FIELD_ID` en el alcance principal          | Puede utilizarse desde `beforeSubmit` y `afterSubmit`               |
| `beforeLoad`                              | Aviso informativo sin temporizador                         | Permanece visible para que el usuario conozca la automatización     |
| `beforeSubmit`                            | Asigna `true` solamente durante `CREATE` desde la UI       | Marca automáticamente al cliente nuevo como pendiente               |
| `afterSubmit`                             | Lee el checkbox y ejecuta `log.audit`                      | Verifica el resultado ya guardado e incluye el ID interno           |
| Manejo de errores y logs                  | Mensaje ternario según el booleano del checkbox            | Traduce `true`/`false` a un texto comprensible                      |
| Consideraciones de rendimiento/gobernanza | No carga ni guarda nuevamente el registro con `N/record`   | Utiliza `context.newRecord` y evita operaciones innecesarias        |

## 5. Pruebas realizadas

| Caso                         | Datos de prueba                                  | Resultado esperado                                      | Resultado obtenido                                                     | Estado       | Evidencia                    |
| ---------------------------- | ------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- | ------------ | ---------------------------- |
| Abrir formulario de creación | Customer nuevo desde `USER_INTERFACE`            | Aviso visible antes de guardar                          | Se mostró “Revisión de cliente” sin temporizador                       | Completado   | Captura del aviso            |
| Crear cliente                | Cliente con ID interno `1731`; checkbox desmarcado | El script debe marcarlo como pendiente                  | El checkbox quedó marcado automáticamente y se generó el log pendiente | Completado   | Log de las 10:02:48 a. m.    |
| Editar cliente pendiente     | Cliente `1731` con checkbox marcado              | Mantener el estado porque `beforeSubmit` no fuerza EDIT | El log continuó indicando que el cliente estaba pendiente              | Completado   | Log de las 10:04:13 a. m.    |
| Editar cliente no pendiente  | Cliente `1731`; checkbox desmarcado manualmente   | Conservar el valor `false`                              | El log indicó que el cliente no estaba pendiente                       | Completado   | Log de las 10:04:39 a. m.    |
| Revisar Execution Log        | Tres ejecuciones `AUDIT`                          | Mostrar ID interno y estado                             | Se registraron las tres ejecuciones esperadas                          | Completado   | Captura del Execution Log    |
| Rol sin permisos suficientes | No incluido en esta práctica                     | Fuera del alcance de cierre                             | No ejecutado                                                           | No requerido | —                            |

## 6. Incidencias y decisiones

| Fecha      | Situación                                      | Diagnóstico                                                                 | Solución o decisión                                                                                  | Estado    |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------- |
| 14/09/2026 | El booleano y el comentario eran contradictorios | El código asignaba `false`, pero el ternario trataba `true` como pendiente | Se adoptó la relación coherente `true = pendiente` y `false = no pendiente`                          | Resuelto  |
| 14/09/2026 | `PENDING_REVIEW_FIELD_ID` no era visible en `afterSubmit` | La constante estaba declarada dentro de `beforeSubmit`                     | Se movió la constante al alcance principal del callback de `define`                                  | Resuelto  |
| 14/09/2026 | No se observó inicialmente el aviso            | Se esperaba verlo al guardar y además tenía una duración de 5 segundos     | Se aclaró que aparece al cargar el formulario y se eliminó `duration` para mantenerlo visible         | Resuelto  |
| 14/09/2026 | Duda sobre el operador ternario                | No estaba clara la selección entre los mensajes de `true` y `false`        | Se documentó la forma `condición ? mensaje verdadero : mensaje falso` y se comprobó mediante los logs | Resuelto  |

## 7. Cierre y siguientes pasos

- **Resultado final:** el User Event fue desplegado y sus tres puntos de entrada funcionaron sobre Customer. El cliente `1731` quedó marcado automáticamente al crearse, el aviso fue visible y `afterSubmit` registró correctamente los cambios de estado.
- **Qué aprendí sobre User Event Scripts:** `beforeLoad` modifica la experiencia del formulario, `beforeSubmit` prepara el registro antes de guardarlo y `afterSubmit` permite observar el resultado persistido. También se practicaron el alcance de constantes, los booleanos, el operador ternario y los contextos de ejecución.
- **Riesgos o consideraciones pendientes:** el mensaje de `afterSubmit` incluye el estado, pero no imprime explícitamente `context.type`; puede añadirse si posteriormente se necesita diferenciar CREATE y EDIT directamente en los detalles.
- **Mejoras propuestas para una versión 2:** agregar `eventType` al log, parametrizar el ID del campo, restringir formalmente la audiencia y probar contextos distintos de `USER_INTERFACE`.
- **Validación final:** Juan José Deluquez Hernandez — 14/09/2026.

## 8. Evidencias de finalización

### Evidencia 1 — Aviso al crear un cliente

Se comprobó que `beforeLoad` muestra la franja informativa **“Revisión de cliente”** con el texto **“Al guardar, este cliente será marcado como pendiente de revisión”**. El mensaje permanece visible porque la versión final no establece `duration`.

### Evidencia 2 — Execution Log de `afterSubmit`

La captura suministrada contiene estas ejecuciones del 14/09/2026:

| Hora        | Nivel   | Archivo                                 | Deployment                                | Título                           | Detalle                                                     |
| ----------- | ------- | --------------------------------------- | ----------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| 10:02:48 a. m. | `AUDIT` | `drt_customerReviewControl_ue.js`       | `CUSTOMDEPLOY_DRT_UE_PENDING_REVIEW`      | Estado de revisión del cliente   | El cliente con ID 1731 está pendiente de revisión.          |
| 10:04:13 a. m. | `AUDIT` | `drt_customerReviewControl_ue.js`       | `CUSTOMDEPLOY_DRT_UE_PENDING_REVIEW`      | Estado de revisión del cliente   | El cliente con ID 1731 está pendiente de revisión.          |
| 10:04:39 a. m. | `AUDIT` | `drt_customerReviewControl_ue.js`       | `CUSTOMDEPLOY_DRT_UE_PENDING_REVIEW`      | Estado de revisión del cliente   | El cliente con ID 1731 no está pendiente de revisión.       |

Estas ejecuciones prueban tanto la creación automática del estado pendiente como la conservación de los cambios realizados durante una edición posterior.
