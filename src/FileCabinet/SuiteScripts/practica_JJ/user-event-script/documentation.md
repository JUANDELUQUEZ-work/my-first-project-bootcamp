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
| Se guarda un cliente nuevo                  | `beforeSubmit` | El campo personalizado de revisión se establece en `false` (pendiente).                                |
| Se edita un cliente existente               | `beforeSubmit` | El script no modifica el estado de revisión que ya tenga el cliente.                                   |
| NetSuite termina de guardar                 | `afterSubmit`  | Se registra en el Execution Log el ID del cliente, el tipo de evento y el valor del campo de revisión. |

> Nota: en un checkbox de NetSuite, `false` significará “pendiente de revisión” y `true` significará “revisado”. El equipo podrá marcarlo manualmente como revisado después de validar los datos.

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
| Valor predeterminado  | Desmarcado (`false`)                          |
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

| Elemento            | Nombre/ID sugerido                               |
| ------------------- | ------------------------------------------------ |
| Archivo             | `drt_customerReviewControl_ue.js`                |
| Script record       | `DRT - Customer Review Control UE`               |
| Script ID           | `customscript_drt_customer_review_control_ue`    |
| Deployment title    | `DRT - Customer Review Control UE - Sandbox`     |
| Deployment ID       | `customdeploy_drt_customer_review_control_ue`    |
| Campo personalizado | `custentity_drt_ue_pending_review`               |

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
     value: false,
   });
   ```

7. En `afterSubmit`, obtener el valor desde `scriptContext.newRecord` y registrarlo con `log.audit`. Incluir el ID del registro y `scriptContext.type`.
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
3. Guardar el cliente y confirmar que `Pendiente de revisión` quede desmarcado.
4. Abrir el cliente, marcar manualmente el campo como revisado y guardar.
5. Volver a editarlo sin cambiar el checkbox; confirmar que el script no lo regrese a pendiente.
6. Revisar **Customization > Scripting > Script Execution Logs** y validar los datos de `afterSubmit`.
7. Registrar los resultados reales en la tabla de pruebas de este documento.

### 6. Criterios de aceptación

- [ ] Se creó el campo `custentity_drt_ue_pending_review` o se documentó su ID real.
- [ ] El nuevo archivo usa `@NApiVersion 2.1` y `@NScriptType UserEventScript`.
- [ ] El deployment aplica al registro Customer y se probó en Sandbox.
- [ ] Al crear un cliente se muestra el aviso de revisión.
- [ ] Al crear un cliente el campo queda en `false`.
- [ ] Al editar un cliente ya revisado, su valor no cambia por causa del script.
- [ ] El Execution Log registra el ID, el evento y el estado del campo.
- [ ] Las pruebas y cualquier ajuste se documentaron abajo.

## Límites de esta primera versión

- No se conecta a una base de datos externa ni ejecuta consultas SQL. Los datos se leen y escriben mediante las APIs de NetSuite sobre el registro actual.
- No envía correos, no crea tareas y no actualiza registros relacionados; esas mejoras pueden ser una segunda práctica cuando el flujo básico funcione.
- No se debe habilitar en Producción hasta completar pruebas en Sandbox y recibir la autorización correspondiente.

---

# Estructura de documentación durante y después de la implementación

Usa esta sección como bitácora. Complétala mientras avances; al finalizar, debe permitir a otra persona entender qué se construyó, cómo se configuró y cómo se validó.

## 1. Datos finales del ticket

| Campo                     | Valor                               |
| ------------------------- | ----------------------------------- |
| Estado                    | Pendiente / En progreso / Terminado |
| Nombre de archivo elegido | `drt_customerReviewControl_ue.js`   |
| Script ID real            |                                     |
| Deployment ID real        |                                     |
| Ambiente                  | Sandbox / Producción                |
| Tipo de registro          | Customer                            |
| Responsable               |                                     |
| Fecha de inicio           |                                     |
| Fecha de finalización     |                                     |

## 2. Alcance implementado

- Problema o necesidad que resuelve:
- Regla de negocio final:
- Eventos implementados y por qué:
- Eventos deliberadamente excluidos y por qué:
- Cambios respecto a este ticket inicial:

## 3. Configuración de NetSuite

| Elemento                | Configuración final | Evidencia o ruta en NetSuite |
| ----------------------- | ------------------- | ---------------------------- |
| Campo personalizado     |                     |                              |
| Archivo en File Cabinet |                     |                              |
| Script Record           |                     |                              |
| Deployment              |                     |                              |
| Aplicación (Applies To) |                     |                              |
| Eventos del deployment  |                     |                              |
| Audiencia/roles         |                     |                              |
| Estado del deployment   |                     |                              |

## 4. Diseño técnico

| Elemento                                  | Decisión final | Motivo |
| ----------------------------------------- | -------------- | ------ |
| Versión de API                            |                |        |
| Módulos `N/*`                             |                |        |
| Constantes e IDs de campos                |                |        |
| `beforeLoad`                              |                |        |
| `beforeSubmit`                            |                |        |
| `afterSubmit`                             |                |        |
| Manejo de errores y logs                  |                |        |
| Consideraciones de rendimiento/gobernanza |                |        |

Incluye aquí fragmentos breves de código solo cuando aclaren una decisión. El código completo debe permanecer en el archivo `.js`.

## 5. Pruebas realizadas

| Caso                         | Datos de prueba | Resultado esperado                                   | Resultado obtenido | Estado    | Evidencia |
| ---------------------------- | --------------- | ---------------------------------------------------- | ------------------ | --------- | --------- |
| Crear cliente                |                 | Checkbox en pendiente y aviso visible                |                    | Pendiente |           |
| Editar cliente pendiente     |                 | No reiniciar ni alterar inesperadamente              |                    | Pendiente |           |
| Editar cliente revisado      |                 | Mantener checkbox en revisado                        |                    | Pendiente |           |
| Revisar Execution Log        |                 | ID, evento y valor registrados                       |                    | Pendiente |           |
| Rol sin permisos suficientes |                 | Comportamiento controlado o acceso denegado esperado |                    | Pendiente |           |

## 6. Incidencias y decisiones

| Fecha | Situación | Diagnóstico | Solución o decisión | Estado |
| ----- | --------- | ----------- | ------------------- | ------ |
|       |           |             |                     |        |

## 7. Cierre y siguientes pasos

- Resultado final:
- Qué aprendí sobre User Event Scripts:
- Riesgos o consideraciones pendientes:
- Mejoras propuestas para una versión 2:
- Validación final (persona/fecha):
