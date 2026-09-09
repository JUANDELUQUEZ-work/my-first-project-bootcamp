# Documentación: Client Script - Validación de Categoría de Cliente

[Haz clic aquí para ir directamente a la función fieldChanged en el código](./drt_salesOrderCategory_cs.js#L34)

## Objetivo del Ticket

Crear un Client Script que reaccione dinámicamente cuando el usuario cambie el campo "Categoría" de un cliente. Si selecciona "Corporation" (ID 1), el sistema mostrará una alerta en pantalla y escribirá automáticamente un mensaje en un campo personalizado de revisión de crédito.

---

## Preguntas y Dudas Resueltas durante el Desarrollo

Durante la creación de este script, surgieron varias dudas importantes que definieron la estructura del código:

1. **¿Por qué usamos `fieldChanged` y no `pageInit`?**
   - El profesor usó `pageInit` para mostrar un mensaje inicial, pero esa función solo se ejecuta _una vez_ al cargar la página. Nuestro ticket requería reaccionar en el momento exacto en que el usuario _cambia_ la categoría, por lo que `fieldChanged` era el evento correcto (actúa como un oído constante).
2. **¿Por qué no usamos `context.line` o `context.sublistId` en este script?**
   - En el ejemplo de la clase, se usaron porque se estaba trabajando con artículos dentro de una tabla (sublista). En nuestro caso, la Categoría es un campo de cabecera (body field). No pertenece a ninguna tabla, por lo tanto, no tiene líneas.
3. **¿Cómo descubrimos que el ID interno de "Corporation" era el número 1?**
   - Aplicamos el "truco del desarrollador". Antes de armar la condición, imprimimos la variable en la consola del navegador usando `console.log("fieldValue", fieldValue)`. Al seleccionar opciones en NetSuite y mirar la consola (F12), descubrimos los IDs reales de la base de datos.
4. **¿Por qué el parámetro `ignoreFieldChange: true` es obligatorio aquí?**
   - Al escribir un valor por código con `setValue`, NetSuite interpreta esto como un cambio de campo. Si no le indicamos que lo ignore, el script detectaría su propio cambio y se volvería a ejecutar infinitamente, congelando la pantalla.
5. **¿Por qué `dialog.alert` requiere un objeto en lugar de un texto simple?**
   - Parecía innecesario crear un objeto `const options = { ... }` para una simple alerta, pero es una excelente práctica llamada "Patrón de Objeto de Opciones". Hace el código mucho más legible, el orden de los parámetros no importa, y permite agregar funciones avanzadas de NetSuite en el futuro sin romper el script.

---

## Código Completo de la Función

```javascript
function fieldChanged(context) {
  // desarrollo de ticket - categorias de cliente...
  try {
    log.debug("fieldChanged context", context);

    // 1. Declaramos una variable para el registro actual que el usuario va a estar editando.
    var currentRecord = context.currentRecord;

    // 2. Declaramos una variable para capturar el id del campo que se está editando.
    var fieldId = context.fieldId;

    // 3. Construimos barrera condicional con el id del campo que queremos monitorear.
    if (fieldId === "custentity_lead_category") {
      // 4. Declaramos una variable para capturar el valor (ID) del campo que se está editando.
      const fieldValue = currentRecord.getValue({ fieldId: fieldId });

      /* truco de depuración: 
      console.log("fieldValue", fieldValue); */

      // 5. Condicional para saber si el valor del campo es igual a 1 (Corporation).
      if (fieldValue == 1) {
        // 6. Acción A: Actualizar campo personalizado de crédito
        currentRecord.setValue({
          fieldId: "custentity_drt_descripcion_credito_ct",
          value:
            "El cliente es de categoria A, - Pendiente revisión de crédito.",
          // El parámetro ignoreFieldChange evita que se dispare el evento nuevamente
          ignoreFieldChange: true,
        });

        // 7. Acción B: Mostrar alerta en pantalla usando N/ui/dialog
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
```
