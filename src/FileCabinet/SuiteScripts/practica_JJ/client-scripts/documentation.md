# Documentación: Client Script - Validación de Categoría de Cliente

[Abrir el código completo del Client Script](../drt_salesOrderCategory_cs.js)

## Objetivo del ticket

Crear un Client Script que avise al usuario al abrir un registro de cliente y que reaccione dinámicamente cuando cambie el campo `custentity_lead_category`. Si selecciona `Corporation` (ID `1`), el sistema muestra una alerta y escribe automáticamente un mensaje en el campo personalizado de revisión de crédito.

## Tipo de script y módulos

- **Tipo:** Client Script (`@NScriptType ClientScript`).
- **Módulo `N/runtime`:** obtiene el nombre del usuario actual para personalizar el saludo de `pageInit`.
- **Módulo `N/ui/dialog`:** muestra las alertas de `pageInit` y `fieldChanged`.

Los módulos se documentan dentro de la práctica del tipo de script que los utiliza. Un script puede usar varios módulos y un módulo puede aparecer en varios tipos de script, por lo que separarlos como categorías principales perdería el contexto de sus eventos.

## Eventos implementados

### `pageInit`

[Ir a la función `pageInit`](../drt_salesOrderCategory_cs.js#L20)

Se ejecuta una sola vez cuando se inicializa la página del registro. En esta práctica:

1. Prepara una alerta con un mensaje de revisión del registro.
2. Obtiene el nombre del usuario mediante `runtime.getCurrentUser().name`.
3. Agrega ese nombre al título de la alerta.
4. Muestra la alerta con `dialog.alert(options)`.
5. Registra el resultado de la operación en el log.

Por eso `pageInit` es adecuado para mensajes iniciales. No reemplaza a `fieldChanged`, que se ejecuta cuando el usuario modifica un campo.

```javascript
function pageInit(context) {
  const options = {
    title: "Hola",
    message:
      "Estás editando un registro de cliente con un script asignado. Por favor, revisa la información antes de guardar los cambios.",
  };

  try {
    options.title += " " + runtime.getCurrentUser().name;
    dialog.alert(options);
    log.debug("Success", "Alert displayed successfully");
  } catch (e) {
    localStorage.error(e.name);
  }
}
```

### `fieldChanged`

[Ir a la función `fieldChanged`](../drt_salesOrderCategory_cs.js#L52)

Se ejecuta cuando cambia un campo. La función filtra el evento para reaccionar solo a `custentity_lead_category`. Cuando el valor es `1` (`Corporation`):

- escribe `El cliente es de categoria A, - Pendiente revisión de crédito.` en `custentity_drt_descripcion_credito_ct`;
- usa `ignoreFieldChange: true` para no volver a disparar el evento por el cambio realizado por código;
- muestra una alerta con `N/ui/dialog`.

Este campo es un campo de cabecera del registro, no un campo de sublista; por eso el flujo no necesita `context.line` ni `context.sublistId`.

```javascript
function fieldChanged(context) {
  try {
    const currentRecord = context.currentRecord;
    const fieldId = context.fieldId;

    if (fieldId === "custentity_lead_category") {
      const fieldValue = currentRecord.getValue({ fieldId });

      if (fieldValue == 1) {
        currentRecord.setValue({
          fieldId: "custentity_drt_descripcion_credito_ct",
          value:
            "El cliente es de categoria A, - Pendiente revisión de crédito.",
          ignoreFieldChange: true,
        });

        dialog.alert({
          title: "Alerta de credito para cliente de categoria A",
          message:
            "El cliente es de categoria A, - Pendiente revisión de crédito.",
        });
      }
    }
  } catch (error) {
    log.error("Error en fieldChange", error);
  }
}
```

## Preguntas y dudas resueltas

1. **¿Por qué usamos `fieldChanged` y no `pageInit`?**
   - `pageInit` solo se ejecuta una vez al cargar la página. El ticket requería reaccionar en el momento en que el usuario cambia la categoría, por lo que `fieldChanged` es el evento correcto.
2. **¿Por qué no usamos `context.line` o `context.sublistId`?**
   - La categoría es un campo de cabecera (`body field`), no pertenece a una sublista y no tiene líneas.
3. **¿Cómo descubrimos que `Corporation` tiene el ID `1`?**
   - Se observó el valor interno seleccionado usando `console.log("fieldValue", fieldValue)` en la consola del navegador.
4. **¿Por qué `ignoreFieldChange: true` es necesario?**
   - Evita que el `setValue` del propio script vuelva a disparar `fieldChanged`.
5. **¿Por qué `dialog.alert` recibe un objeto?**
   - NetSuite usa un objeto de opciones (`title` y `message`), lo que mantiene la llamada legible y permite ampliarla sin depender del orden de argumentos.

## Eventos disponibles aún no utilizados

El archivo conserva las funciones plantilla de `postSourcing`, `sublistChanged`, `lineInit`, `validateField`, `validateLine`, `validateInsert`, `validateDelete` y `saveRecord`, pero no las exporta ni implementa lógica para ellas. La práctica exporta actualmente `pageInit` y `fieldChanged`.
