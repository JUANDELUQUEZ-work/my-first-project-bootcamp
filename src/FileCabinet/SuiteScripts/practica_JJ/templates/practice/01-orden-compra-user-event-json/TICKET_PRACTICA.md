# PRAC-PDF-001 — Orden de compra con datos del proveedor, User Event y JSON

**Estado:** pendiente de comenzar.  
**Nivel:** primera práctica guiada.  
**Entorno:** cuenta de capacitación o Sandbox.  
**Resultado:** un PDF de orden de compra con información obtenida de otro registro y un total adicional que suma el 10 %.

> Empieza en la etapa 1. Haz una etapa por vez y marca su comprobación antes de continuar. El código completo está incluido: no necesitas inventar nombres de campos, funciones ni la estructura del JSON.

## 1. El ticket que te asignaría tu jefe

**Solicitud del cliente:**

«Necesitamos que el PDF de la orden de compra muestre el contacto de logística, su teléfono y las instrucciones de entrega del proveedor. Esa información se captura en el proveedor, pero queremos conservar una copia en la orden de compra. También queremos una sección de práctica que muestre el total original, un incremento del 10 % y el total con ese incremento».

**Tu trabajo:**

1. Crear los campos de prueba.
2. Capturar los datos en un proveedor.
3. Desarrollar un User Event que consulte ese proveedor cuando guardes una orden de compra marcada como práctica.
4. Convertir esos datos a JSON y guardarlos en un campo de la orden.
5. Crear una plantilla XML/FreeMarker desde código fuente.
6. Leer el JSON guardado y entregarlo a la plantilla mediante un pequeño Suitelet.
7. Generar el PDF, recorrer una lista de instrucciones y calcular el 10 % en FreeMarker.
8. Probar datos vacíos, cambios de proveedor, errores y actualización de la copia.
9. Añadir, al final, un enlace desde la orden al PDF utilizando `beforeLoad`.

**Regla funcional:** los datos del proveedor se actualizan en la copia cuando guardas la orden mediante **Edit > Save**. Cambiar únicamente el proveedor no actualiza automáticamente las órdenes existentes.

**Regla del cálculo:** el 10 % se suma al **total final actual** de la orden, incluidos los impuestos que ese total ya contenga. Es una simulación impresa: no cambia precios, impuestos ni el total de la transacción.

### Qué relación tiene con tus archivos

En tu carpeta `templates` existen `template-test-CR.xml` y `transcripcion PDF-HTML.md`. El XML contiene fuentes, macros, tablas, `record.item` y totales. También referencia campos como `salesrep`, `partner` y `duedate`; por eso no se asume que sea una plantilla de compra lista para reutilizar sin ajustes.

La transcripción, en su módulo final de SuiteScript, explica el uso de Suitelets, fuentes de datos adicionales y un User Event que agrega un campo oculto con JSON al imprimir. Esta práctica aplica esas ideas con un caso y código didácticos nuevos. **No es una transcripción literal del curso ni una copia de un script completo proporcionado por el instructor.**

Aquí aprenderás primero la variante **persistente** que mencionó tu jefe: guardar JSON en un campo `custbody_`. La variante temporal `custpage_` se compara al final para que no las confundas.

### Por qué hay un Suitelet en una práctica de User Event

El User Event prepara y guarda los datos. El Suitelet es una pequeña página de NetSuite que, al abrir su enlace, lee la orden y produce el PDF. Te damos su código completo; su función es conectar el JSON con la plantilla.

Usamos `JSON.parse()` en JavaScript y `addCustomDataSource()` para entregar un objeto a FreeMarker. Esto evita enseñarte a interpretar JSON con `?eval`: esa función evalúa expresiones y no es un lector general de JSON. `?eval_json` requiere FreeMarker 2.3.31, mientras que la documentación de NetSuite consultada indica 2.3.26. [Documentación de FreeMarker](https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_eval_json) y [versiones documentadas por Oracle](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2862977.html).

## 2. Entiende el recorrido antes de programar

```text
PROVEEDOR
  Contacto, teléfono, instrucciones
          |
          | Guardas la orden de compra de práctica
          v
USER EVENT — beforeSubmit
  Lee el proveedor con N/record
  Construye un objeto JavaScript
  JSON.stringify(objeto) -> texto
          |
          v
ORDEN DE COMPRA
  custbody_drt_prac_pdf_json guarda ese texto
          |
          | Abres el enlace del PDF
          v
SUITELET
  Carga la orden
  JSON.parse(texto) -> objeto
  Entrega record y EXTRA al motor de plantillas
          |
          v
PLANTILLA XML + FREEMARKER
  record = datos de la orden
  EXTRA = datos preparados para el PDF
  #list = filas de instrucciones
  #assign = cálculo del 10 %
          |
          v
PDF PERSONALIZADO
```

| Concepto | Lo que significa aquí |
|---|---|
| Registro | Una ficha de NetSuite: un proveedor o una orden de compra. |
| Campo personalizado | Un dato que agregas a esa ficha. |
| `entity` | Campo de la orden que identifica al proveedor. |
| ID interno | Número que identifica un registro concreto. No es el número visible de la orden. |
| `custentity_...` | ID de un campo personalizado de entidad; aquí, del proveedor. |
| `custbody_...` | ID de un campo personalizado de cabecera de transacción; aquí, de la orden. |
| Objeto | Estructura JavaScript con propiedades, por ejemplo `contacto: 'Ana'`. |
| JSON | Texto que representa datos estructurados y puede guardarse en un campo. |
| Alias `EXTRA` | Nombre elegido por nosotros para entregar datos adicionales a la plantilla. No es un registro de NetSuite. |
| Deployment | Configuración que indica dónde, para quién y en qué contexto corre un script. |

**Qué evento utilizamos y por qué:** `beforeSubmit` modifica el registro que se está guardando. No necesitamos llamar a `save()` sobre esa misma orden. `beforeLoad` se usará después para agregar un enlace al formulario. `afterSubmit` no hace falta para esta solución. [Referencia de beforeSubmit](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4407992070.html).

## 3. Etapa 1 — Preparación y nombres exactos

### 3.1. Comprueba el entorno

1. Entra a tu cuenta de capacitación o Sandbox.
2. Usa un rol autorizado para crear campos y scripts y editar proveedores y órdenes de compra. Para empezar puede ser el rol administrador de esa cuenta de prueba.
3. Ve a **Setup > Company > Enable Features > SuiteCloud**. Comprueba **Advanced PDF/HTML Templates** y **Server SuiteScript**. Los nombres pueden aparecer traducidos en tu cuenta.
4. Ve a **Home > Set Preferences > General** y activa **Show Internal IDs / Mostrar ID internos** si está disponible.
5. Selecciona un proveedor y un artículo utilizables en una orden de compra de prueba. No necesitas inventar una configuración fiscal ni crear un artículo nuevo para este ejercicio.
6. Si la cuenta exige subsidiaria, ubicación, departamento u otros campos, utiliza las opciones válidas que ya usa tu entorno de capacitación.

Las rutas de menú son las habituales de un rol administrador. Si una opción no aparece, primero revisa el rol y el permiso: no significa que debas cambiar el código.

### 3.2. Carpeta local de la práctica

La ubicación prevista dentro de tu proyecto para esta práctica es:

```text
C:\devJD\my-first-project-bootcamp\src\FileCabinet\SuiteScripts\practica_JJ\templates\practice templates\01-orden-compra-user-event-json\
```

El entregable inicial es este ticket. **Durante la práctica tú crearás** los tres archivos restantes junto al documento, copiando los bloques completos de las etapas correspondientes:

```text
01-orden-compra-user-event-json/
├── TICKET_PRACTICA.md
├── drt_poPdfSnapshot_ue.js       <- etapa 4
├── drt_poPdfRenderer_sl.js       <- etapa 7
└── plantilla_oc_practica.xml    <- etapa 6
```

Guardar un archivo local no lo sube automáticamente a NetSuite. Este ticket usa carga manual al File Cabinet para que sepas qué archivo ejecuta la cuenta.

### 3.3. Convención de identificadores

Cuando NetSuite muestre un prefijo fijo, escribe solamente el sufijo. Ejemplo: si el formulario ya muestra `custentity_`, escribe `drt_prac_contacto`, no el ID completo otra vez. Después de guardar verifica el ID resultante en la ficha o lista del campo.

| Elemento | ID final que debe quedar |
|---|---|
| Contacto en proveedor | `custentity_drt_prac_contacto` |
| Teléfono en proveedor | `custentity_drt_prac_telefono` |
| Instrucciones en proveedor | `custentity_drt_prac_instrucciones` |
| Checkbox de práctica en orden | `custbody_drt_prac_pdf_activa` |
| JSON en orden | `custbody_drt_prac_pdf_json` |
| User Event | `customscript_drt_prac_po_pdf_ue` |
| Deployment del User Event | `customdeploy_drt_prac_po_pdf_ue` |
| Suitelet | `customscript_drt_prac_po_pdf_sl` |
| Deployment del Suitelet | `customdeploy_drt_prac_po_pdf_sl` |
| Parámetro del Suitelet | `custscript_drt_prac_xml_id` |

Si un ID ya existe, no lo sobrescribas. Usa otro sufijo y reemplaza **todas** sus referencias en tu código. Los nombres visibles son etiquetas; el script utiliza los ID internos.

**Comprobación:**

- [ ] Estoy en el entorno de prueba correcto.
- [ ] Tengo permisos y un proveedor/artículo de prueba.
- [ ] Entiendo que los archivos JavaScript y XML los crearé durante el ejercicio.

## 4. Etapa 2 — Crear los campos

### 4.1. Tres campos en el proveedor

1. Ve a **Customization > Lists, Records, & Fields > Entity Fields > New**.
2. Crea el primer campo siguiendo esta tabla.
3. En **Applies To**, marca **Vendor / Proveedor**. No marques otros tipos de entidad para esta práctica.
4. Deja **Store Value / Almacenar valor** activado.
5. En **Display**, elige la subpestaña **Custom / Personalizado** si aparece y deja el campo visible, con tipo de visualización normal.
6. En **Access**, confirma que tu rol puede verlo y editarlo.
7. Guarda y comprueba su ID.
8. Repite para los otros dos campos.

| Label / Etiqueta | ID final | Type / Tipo |
|---|---|---|
| PRAC - Contacto de logística | `custentity_drt_prac_contacto` | Free-Form Text / Texto libre |
| PRAC - Teléfono de logística | `custentity_drt_prac_telefono` | Free-Form Text / Texto libre |
| PRAC - Instrucciones de entrega | `custentity_drt_prac_instrucciones` | Long Text / Texto largo |

Usamos texto para el teléfono porque puede contener espacios, signos o extensiones. No haremos cálculos con él.

### 4.2. Dos campos en la orden de compra

1. Ve a **Customization > Lists, Records, & Fields > Transaction Body Fields > New**. No uses Transaction Line Fields: aquí queremos datos de cabecera.
2. Crea los dos campos de la tabla.
3. En **Applies To**, marca **Purchase / Compra**, la opción que aplica a transacciones de compra. Si tu cuenta ofrece **Purchase Order** de forma específica, selecciona esa opción. La aplicación genérica a compras puede hacer visible el campo en otras transacciones; el deployment del script sí se limitará a Purchase Order.
4. Mantén **Store Value** activado en ambos.
5. Deja el checkbox desmarcado por defecto.
6. Deja el JSON visible y editable durante la práctica, para poder inspeccionarlo y hacer la prueba de error. En un caso real se revisaría quién puede modificarlo.
7. En Display, usa la subpestaña **Custom / Personalizado** si está disponible. No los hagas obligatorios.
8. Guarda y verifica los ID.

| Label / Etiqueta | ID final | Tipo |
|---|---|---|
| PRAC - Activar PDF de práctica | `custbody_drt_prac_pdf_activa` | Checkbox |
| PRAC - Datos JSON para PDF | `custbody_drt_prac_pdf_json` | Long Text / Texto largo |

Si no ves un campo al editar un registro, abre **Customize > Customize Form**. Trabaja con una copia del formulario de capacitación, localiza el campo en **Fields / Screen Fields**, activa **Show**, guarda la copia y selecciónala en **Custom Form** del registro. Revisa también Applies To y Access. No pongas esa copia como formulario preferido global.

Para esta práctica, el rol necesita permiso de edición sobre el campo JSON: `beforeSubmit` no evita las restricciones de acceso de los campos personalizados. [Campos de cabecera](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2828059.html).

**Comprobación:**

- [ ] Veo tres campos nuevos al editar el proveedor.
- [ ] Veo el checkbox y el JSON al editar una orden.
- [ ] Los cinco ID coinciden exactamente con la tabla.

## 5. Etapa 3 — Preparar el proveedor

1. Abre el proveedor de prueba mediante **Lists > Relationships > Vendors**.
2. Pulsa **Edit**.
3. Captura lo siguiente en los campos creados:

**Contacto:**

```text
Ana Pérez
```

**Teléfono:**

```text
555 010 2020 ext. 12
```

**Instrucciones:** escribe cada instrucción en una línea distinta, sin números al principio.

```text
Entregar de lunes a viernes de 9:00 a 16:00.
Llamar al contacto de logística antes de llegar.
Presentar la orden de compra en recepción.
```

4. Guarda el proveedor.
5. Anota su ID interno: al abrirlo, la URL contiene `id=123`, por ejemplo. El número de tu cuenta será distinto.

No vamos a copiar manualmente estos textos a la orden. El User Event hará esa consulta.

**Comprobación:**

- [ ] Los datos siguen ahí después de guardar y volver a abrir el proveedor.
- [ ] Anoté su ID interno en la bitácora al final del ticket.

## 6. Etapa 4 — Crear el User Event

### 6.1. Qué debe hacer

Al crear o editar una orden de compra:

- Si no tiene marcado el checkbox de práctica, no hace nada.
- Si está marcado, obtiene el ID del proveedor desde `entity`.
- Carga el registro Vendor, lee nuestros tres campos y convierte las líneas de instrucciones en una lista.
- Construye un objeto y lo convierte a texto con `JSON.stringify()`.
- Lo escribe en `custbody_drt_prac_pdf_json` antes de que NetSuite termine de guardar.

Usamos `record.load()` para leer también el texto largo completo del proveedor. No es necesario cargar la orden otra vez: ya está en `context.newRecord`.

### 6.2. Código completo inicial

En VS Code crea `drt_poPdfSnapshot_ue.js` en esta carpeta. Copia todo este bloque:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/error'], (record, log, error) => {
    const ACTIVE_FIELD = 'custbody_drt_prac_pdf_activa';
    const JSON_FIELD = 'custbody_drt_prac_pdf_json';

    function beforeSubmit(context) {
        const allowed = [
            context.UserEventType.CREATE,
            context.UserEventType.EDIT
        ];
        if (!allowed.includes(context.type)) return;

        const po = context.newRecord;
        if (po.getValue({ fieldId: ACTIVE_FIELD }) !== true) return;

        try {
            const vendorId = po.getValue({ fieldId: 'entity' });
            if (!vendorId) {
                throw new Error('Selecciona un proveedor antes de guardar.');
            }

            const vendor = record.load({
                type: record.Type.VENDOR,
                id: vendorId,
                isDynamic: false
            });

            const contact = String(vendor.getValue({
                fieldId: 'custentity_drt_prac_contacto'
            }) || '').trim();
            const phone = String(vendor.getValue({
                fieldId: 'custentity_drt_prac_telefono'
            }) || '').trim();
            const rawInstructions = String(vendor.getValue({
                fieldId: 'custentity_drt_prac_instrucciones'
            }) || '');

            // Cada línea no vacía se transforma en una fila para el PDF.
            const instructions = rawInstructions
                .split(/\r?\n/)
                .map(text => text.trim())
                .filter(text => text.length > 0)
                .map((text, index) => ({
                    numero: index + 1,
                    texto: text
                }));

            const snapshot = {
                version: 1,
                proveedorId: String(vendorId),
                actualizadoEn: new Date().toISOString(),
                contacto: contact,
                telefono: phone,
                instrucciones: instructions
            };

            const jsonText = JSON.stringify(snapshot);
            // Límite voluntario del ejercicio, inferior al del campo.
            if (jsonText.length > 20000) {
                throw new Error('Reduce las instrucciones: el JSON supera 20000 caracteres.');
            }

            po.setValue({ fieldId: JSON_FIELD, value: jsonText });

            // Registrar metadatos; no necesitamos imprimir los datos personales.
            log.audit({
                title: 'PRAC_PDF_JSON_PREPARADO',
                details: {
                    event: context.type,
                    vendorId: String(vendorId),
                    instructionCount: instructions.length,
                    jsonLength: jsonText.length
                }
            });
        } catch (e) {
            log.error({ title: 'PRAC_PDF_ERROR_UE', details: e });
            throw error.create({
                name: 'PRAC_PDF_PREPARACION',
                message: 'No se pudo preparar el JSON de práctica. ' + e.message,
                notifyOff: true
            });
        }
    }

    return { beforeSubmit };
});
```

### 6.3. Lee el código en este orden

1. `@NScriptType UserEventScript`: declara el tipo de script.
2. `define(...)`: recibe los módulos de NetSuite que usaremos.
3. `allowed`: limita el ejercicio a creación y edición completa. No atiende borrado, aprobación ni `XEDIT`/edición en línea.
4. `context.newRecord`: es la orden que estás guardando.
5. `getValue('entity')`: obtiene el ID del proveedor relacionado, no su nombre.
6. `record.load(VENDOR)`: abre ese otro registro para leerlo.
7. `split`, `filter` y `map`: separan líneas, quitan vacías y crean filas numeradas.
8. `snapshot`: reúne los datos. Es un objeto, todavía no es texto JSON.
9. `JSON.stringify`: produce el texto que sí se puede guardar en Long Text.
10. `setValue`: coloca ese texto en la orden actual. No hay un segundo guardado.
11. `throw`: si falla una orden marcada como práctica, detiene su guardado con un mensaje. Así no aparenta haber generado datos correctos.
12. `return { beforeSubmit }`: expone la función que NetSuite ejecutará.

`PRAC_PDF_JSON_PREPARADO` significa que el script preparó el valor; otro script o validación aún podría impedir el guardado. La prueba definitiva es reabrir la orden y comprobar su campo.

### 6.4. Subir y desplegar

1. Guarda el archivo local.
2. En NetSuite abre **Documents > Files > File Cabinet**.
3. Dentro de **SuiteScripts**, crea una carpeta identificable, por ejemplo **DRT Practica OC PDF JSON**. Guarda allí todos los archivos de esta práctica.
4. Pulsa **Add File** y sube `drt_poPdfSnapshot_ue.js`. No actives **Available Without Login**.
5. Ve a **Customization > Scripting > Scripts > New**.
6. Selecciona ese archivo y pulsa **Create Script Record**.
7. Nombre: **DRT - PRAC OC PDF - User Event**.
8. ID final: `customscript_drt_prac_po_pdf_ue`.
9. Guarda y pulsa **Deploy Script**.
10. En **Applies To**, selecciona **Purchase Order / Orden de compra**.
11. ID final del deployment: `customdeploy_drt_prac_po_pdf_ue`.
12. Marca **Deployed**. Usa **Status: Testing** y **Log Level: Debug**.
13. Confirma que tú eres el **Owner** del script. Testing restringe la ejecución al propietario; agregar otra persona a Audience no basta para convertirlo en una prueba multiusuario.
14. Si existe **Event Type**, déjalo sin limitar a un único evento: el código ya selecciona CREATE y EDIT.
15. En **Context Filtering**, incluye **User Interface** para esta práctica.
16. Guarda. Si muestra Audience, incluye tu usuario y no habilites todas las audiencias innecesariamente.

Si aparece una opción **Execute As Role**, conserva la ejecución con los permisos del usuario/rol de prueba; no necesitas elevar los permisos del script para resolver fallos de configuración.

**Comprobación:**

- [ ] Archivo cargado, Script record creado y deployment marcado como Deployed.
- [ ] Applies To dice Purchase Order.
- [ ] Estoy probando con el propietario del script.

## 7. Etapa 5 — Primera prueba: obtener el JSON, todavía sin PDF

1. Abre **Transactions > Purchases > Enter Purchase Orders**.
2. Selecciona el proveedor de la etapa 3.
3. Completa los campos obligatorios de tu cuenta.
4. Agrega un artículo válido. Si puedes usar cantidad **2** y tarifa **500**, tendrás un subtotal de **1000**. El total final puede cambiar por impuestos u otros cargos: no los alteres para forzar el ejemplo.
5. En Memo escribe **PRAC-PDF-001 - prueba de JSON**.
6. Marca **PRAC - Activar PDF de práctica**.
7. Deja **PRAC - Datos JSON para PDF** vacío.
8. Comprueba que no estás solicitando envío automático al proveedor; guarda sin enviar por correo ni fax.
9. Guarda la orden.
10. Vuelve a abrirla y revisa el campo JSON.

Debe contener una estructura equivalente a esta. El ID y la fecha serán los reales de tu prueba. El campo normalmente la mostrará en una sola línea; aquí se separa para facilitar la lectura:

```json
{
  "version": 1,
  "proveedorId": "123",
  "actualizadoEn": "2026-09-22T15:00:00.000Z",
  "contacto": "Ana Pérez",
  "telefono": "555 010 2020 ext. 12",
  "instrucciones": [
    { "numero": 1, "texto": "Entregar de lunes a viernes de 9:00 a 16:00." },
    { "numero": 2, "texto": "Llamar al contacto de logística antes de llegar." },
    { "numero": 3, "texto": "Presentar la orden de compra en recepción." }
  ]
}
```

El texto `actualizadoEn` usa UTC, indicado por `Z`. No esperes que coincida literalmente con la hora local que ves en la interfaz.

### Si quedó vacío

1. Confirma que el checkbox quedó marcado.
2. Comprueba que hiciste **Edit > Save**, no edición en línea.
3. Abre el Script record o deployment y su pestaña **Execution Log**.
4. Busca `PRAC_PDF_JSON_PREPARADO` o `PRAC_PDF_ERROR_UE`.
5. Si no hay entradas, revisa Deployed, Owner, Testing, Applies To y Context Filtering.
6. Si hay un error de campo o permiso, corrige el ID o acceso indicado y vuelve a guardar la orden.
7. Si existe el log de preparación pero la orden no guardó, revisa el error que muestra el formulario y otras validaciones de tu cuenta.

**No continúes al PDF hasta que esto funcione.** Ya habrás completado la parte principal de lo que describió tu jefe: consultar otro registro y conservar datos en JSON dentro de la transacción.

**Comprobación:**

- [ ] El JSON contiene el contacto y tres instrucciones.
- [ ] El proveedorId coincide con mi proveedor.
- [ ] Anoté el ID interno y el total final de la orden.

## 8. Etapa 6 — Crear la plantilla desde código fuente

### 8.1. Qué archivos editar

Crea `plantilla_oc_practica.xml` junto al User Event. Trabajarás directamente en VS Code y cargarás el XML al File Cabinet. No necesitas cambiar entre editor visual y código fuente de NetSuite.

Esta primera plantilla es pequeña para que puedas localizar cada dato. El diseño de `template-test-CR.xml` se puede adaptar después de que el circuito de datos funcione; ese archivo original permanece como referencia.

### 8.2. Código completo de la plantilla

```xml
<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <link name="NotoSans" type="font" subtype="truetype"
          src="${nsfont.NotoSans_Regular}"
          src-bold="${nsfont.NotoSans_Bold}" bytes="2" />
    <style>
        * { font-family: NotoSans, sans-serif; }
        body { font-size: 10pt; }
        h1 { font-size: 20pt; color: #17365d; }
        h2 { font-size: 12pt; color: #17365d; }
        table { width: 100%; table-layout: fixed; margin-top: 8px; }
        th { background-color: #e9eff7; font-weight: bold; padding: 6px; }
        td { padding: 6px; }
        .note { color: #666666; font-size: 8pt; }
        .total { background-color: #edf5ed; }
    </style>
</head>
<body padding="0.5in" size="Letter">
    <h1>Orden de compra — práctica</h1>
    <p><b>Número:</b> ${(record.tranid)!"Sin número"}</p>
    <p><b>Fecha:</b> ${(record.trandate)!""}</p>
    <p><b>Proveedor:</b> ${(record.entity)!""}</p>
    <p class="note">Documento de capacitación PRAC-PDF-001.</p>

    <h2>Artículos</h2>
    <#if (record.item)?has_content>
        <table>
            <thead>
                <tr>
                    <th width="45%">Artículo</th>
                    <th width="15%">Cantidad</th>
                    <th width="20%">Tarifa</th>
                    <th width="20%">Importe</th>
                </tr>
            </thead>
            <#list record.item as linea>
                <tr>
                    <td>${linea.item}</td>
                    <td>${linea.quantity}</td>
                    <td align="right">${linea.rate}</td>
                    <td align="right">${linea.amount}</td>
                </tr>
            </#list>
        </table>
    <#else>
        <p>Esta orden no contiene líneas de artículos.</p>
    </#if>

    <#if EXTRA??>
        <#-- Autoescape XML solo para los textos que vienen de nuestra fuente. -->
        <#outputformat "XML">
        <#autoesc>
            <h2>Datos de logística guardados en la orden</h2>
            <p><b>Contacto:</b>
                <#if EXTRA.contacto?has_content>${EXTRA.contacto}<#else>Sin capturar</#if>
            </p>
            <p><b>Teléfono:</b>
                <#if EXTRA.telefono?has_content>${EXTRA.telefono}<#else>Sin capturar</#if>
            </p>
            <p class="note">Copia actualizada en UTC: ${EXTRA.actualizadoEn}</p>

            <h2>Instrucciones de entrega</h2>
            <#if EXTRA.instrucciones?has_content>
                <table>
                    <thead>
                        <tr><th width="12%">N.º</th><th width="88%">Instrucción</th></tr>
                    </thead>
                    <#list EXTRA.instrucciones as instruccion>
                        <tr>
                            <td>${instruccion.numero}</td>
                            <td>${instruccion.texto}</td>
                        </tr>
                    </#list>
                </table>
            <#else>
                <p>El proveedor no tiene instrucciones de entrega capturadas.</p>
            </#if>
        </#autoesc>
        </#outputformat>

        <#-- El Suitelet entrega un número, sin símbolos de moneda ni separadores. -->
        <#assign totalBase = EXTRA.totalActual>
        <#assign incremento = totalBase * 0.10>
        <#assign totalPractica = totalBase + incremento>

        <h2>Totales</h2>
        <p>Moneda de la orden: ${(record.currency)!"Consultar la orden"}</p>
        <table>
            <tr>
                <td width="70%">Total original de la orden</td>
                <td width="30%" align="right">${nsformat_number(totalBase)}</td>
            </tr>
            <tr>
                <td>Incremento de práctica (10 %)</td>
                <td align="right">${nsformat_number(incremento)}</td>
            </tr>
            <tr class="total">
                <td><b>Total de práctica con incremento</b></td>
                <td align="right"><b>${nsformat_number(totalPractica)}</b></td>
            </tr>
        </table>
        <p class="note">Cálculo informativo de práctica. No modifica la orden.</p>
    <#else>
        <p>Falta la fuente EXTRA. Genera este PDF desde el Suitelet de la práctica.</p>
    </#if>
</body>
</pdf>
```

### 8.3. Qué hace cada parte

- `<pdf>`, `<head>` y `<body>`: estructura del documento para el motor BFO de NetSuite.
- `nsfont`: fuente suministrada por NetSuite para soportar caracteres como las tildes.
- `${record.tranid}`: imprime el número visible de la orden.
- `(record.item)?has_content`: comprueba si hay artículos antes de recorrerlos.
- `<#list ... as ...>`: repite una fila para cada elemento.
- `EXTRA??`: comprueba que el Suitelet haya entregado los datos adicionales.
- `#outputformat "XML"` y `#autoesc`: protegen los textos propios al escribirlos como XML. Por ejemplo, `Compras & Logística` no debe romper el PDF por su `&`. Este bloque se aplica a los textos de EXTRA; los campos nativos se conservan en el estilo habitual de las plantillas de NetSuite.
- `#assign`: crea variables dentro de FreeMarker. No guarda valores en NetSuite.
- `nsformat_number`: presenta los importes según el formato numérico de NetSuite. Mostramos la moneda aparte para no inventar un símbolo. El ejercicio base usa una moneda de dos decimales; un formato monetario de producción requiere revisar moneda y reglas de redondeo.

**No aplicamos `?number` al texto de `${record.total}`:** evitamos depender de separadores, comas o símbolos. El Suitelet entregará el total numérico real de la orden ya guardada en `EXTRA.totalActual`.

La plantilla de esta práctica lista artículos. No incluye una tabla para la sublista Expenses: crea tu orden de prueba con artículos. Tampoco pretende sustituir un formato fiscal o comercial completo.

### 8.4. Subir el XML

1. Guarda `plantilla_oc_practica.xml` en UTF-8.
2. Sube el archivo a la misma carpeta del File Cabinet que el User Event.
3. Abre la ficha del archivo y anota el **ID interno numérico**. Usa la columna Internal ID del File Cabinet o el `id=` de la URL de la ficha de ese archivo.
4. No copies el ID de la carpeta, una URL de descarga ni el nombre del archivo.
5. No actives Available Without Login.

Aquí el XML se carga directamente con `N/file`. **No necesitas crear un registro de Advanced PDF/HTML Template ni asignarlo al Print Template del formulario para esta ruta.** El botón nativo Print seguirá su configuración habitual; nuestro Suitelet imprimirá este XML.

**Comprobación:**

- [ ] Creé el XML desde código fuente.
- [ ] Lo subí al File Cabinet y anoté su ID numérico.
- [ ] Entiendo que todavía falta el Suitelet que le entrega `record` y `EXTRA`.

## 9. Etapa 7 — Conectar el JSON con el PDF

### 9.1. Crear el Suitelet

Crea `drt_poPdfRenderer_sl.js` en esta carpeta y pega el bloque completo:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', 'N/file', 'N/runtime', 'N/log'],
    (record, render, file, runtime, log) => {
        function onRequest(context) {
            try {
                if (context.request.method !== 'GET') {
                    throw new Error('Abre el enlace del PDF mediante el navegador.');
                }

                const poId = String(context.request.parameters.poid || '');
                if (!/^[1-9]\d*$/.test(poId)) {
                    throw new Error('Falta un poid válido en la URL. Ejemplo: &poid=123.');
                }

                const templateId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_drt_prac_xml_id'
                });
                if (!templateId || !/^[1-9]\d*$/.test(String(templateId))) {
                    throw new Error('Configura el ID numérico del XML en el deployment.');
                }

                const po = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId,
                    isDynamic: false
                });
                if (po.getValue({ fieldId: 'custbody_drt_prac_pdf_activa' }) !== true) {
                    throw new Error('Esta orden no tiene activada la práctica.');
                }

                const jsonText = String(po.getValue({
                    fieldId: 'custbody_drt_prac_pdf_json'
                }) || '');
                if (!jsonText) {
                    throw new Error('La orden no tiene JSON. Ábrela en Edit y pulsa Save.');
                }

                let extra;
                try {
                    extra = JSON.parse(jsonText);
                } catch (parseError) {
                    throw new Error('El JSON está dañado. Regenera la copia con Edit > Save.');
                }

                const validShape = extra && extra.version === 1 &&
                    typeof extra.proveedorId === 'string' &&
                    typeof extra.actualizadoEn === 'string' &&
                    typeof extra.contacto === 'string' &&
                    typeof extra.telefono === 'string' &&
                    Array.isArray(extra.instrucciones) &&
                    extra.instrucciones.every(row => row &&
                        Number.isInteger(row.numero) && row.numero > 0 &&
                        typeof row.texto === 'string');
                if (!validShape) {
                    throw new Error('El JSON no tiene la estructura de esta práctica. Regénéralo.');
                }
                if (extra.proveedorId !== String(po.getValue({ fieldId: 'entity' }))) {
                    throw new Error('El JSON pertenece a otro proveedor. Regénéralo con Edit > Save.');
                }

                const storedTotal = po.getValue({ fieldId: 'total' });
                if (storedTotal === '' || storedTotal === null || storedTotal === undefined) {
                    throw new Error('La orden no tiene un total disponible.');
                }
                const total = Number(storedTotal);
                if (!Number.isFinite(total)) {
                    throw new Error('No fue posible obtener el total numérico de la orden.');
                }

                // Solo en memoria: este dato no se vuelve a guardar en el campo JSON.
                extra.totalActual = total;

                const renderer = render.create();
                renderer.templateContent = file.load({
                    id: Number(templateId)
                }).getContents();
                renderer.addRecord({ templateName: 'record', record: po });
                renderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'EXTRA',
                    data: extra
                });

                const pdf = renderer.renderAsPdf();
                pdf.name = 'PRAC_OC_' + poId + '.pdf';
                context.response.writeFile({ file: pdf, isInline: true });
            } catch (e) {
                log.error({ title: 'PRAC_PDF_ERROR_SL', details: e });
                context.response.setHeader({
                    name: 'Content-Type',
                    value: 'text/plain; charset=UTF-8'
                });
                context.response.write({
                    output: 'No se pudo generar el PDF de práctica.\n' + e.message
                });
            }
        }

        return { onRequest };
    });
```

El Suitelet no guarda nada y no envía correos. Carga la orden a la que tu rol tenga acceso, valida la copia, agrega el total actual en memoria y devuelve el PDF al navegador. `addRecord` crea el alias `record`; `addCustomDataSource` crea el alias `EXTRA`. [Fuente de datos personalizada](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4528541027.html).

El control de errores muestra detalles para ayudarte durante el aprendizaje. Antes de reutilizarlo con un cliente se revisan mensajes, permisos, tamaño de datos y criterios de actualización.

### 9.2. Crear el script y su parámetro

1. Sube el JavaScript al File Cabinet.
2. Ve a **Customization > Scripting > Scripts > New**.
3. Elige `drt_poPdfRenderer_sl.js` y crea el Script record.
4. Nombre: **DRT - PRAC OC PDF - Suitelet**.
5. ID final: `customscript_drt_prac_po_pdf_sl`.
6. Guarda. Vuelve a **Edit** si hace falta para abrir la subpestaña **Parameters**.
7. Pulsa **New Parameter** y configura:

| Propiedad | Valor |
|---|---|
| Label | PRAC - ID del archivo XML |
| ID final | `custscript_drt_prac_xml_id` |
| Type | Integer Number / Número entero |
| Preference | Sin preferencia global; valor por deployment |

8. Guarda el parámetro y el script.
9. Pulsa **Deploy Script**.
10. ID final: `customdeploy_drt_prac_po_pdf_sl`.
11. Marca **Deployed** y **Status: Testing**. Confirma que tú eres el propietario del script.
12. **Available Without Login debe estar desmarcado.** Utilizaremos la URL interna con tu sesión de NetSuite.
13. En **Audience**, incluye tu usuario si la pantalla lo requiere. No actives una audiencia pública.
14. En **Parameters** del deployment, escribe el ID numérico del XML de la etapa 6.
15. Guarda y abre de nuevo el deployment para confirmar que ese valor se conservó.
16. Copia la dirección del campo **URL**, no External URL.

El ID del XML se configura en el deployment; no debes ponerlo en el ID del parámetro ni reemplazar el nombre `custscript_drt_prac_xml_id` dentro del JavaScript.

### 9.3. Abrir tu PDF

1. Abre la orden de la etapa 5 y copia su **ID interno numérico** de la URL: el valor de `id=`. No copies el número visible de orden, como `PO1007`.
2. Abre la URL interna del Suitelet en una pestaña con sesión iniciada.
3. Esa URL ya tiene parámetros como `?script=...&deploy=...`. Agrega al final `&poid=` seguido del ID interno de tu orden.
4. Ejemplo de forma, **no una dirección para copiar literalmente**:

```text
https://TU-CUENTA.app.netsuite.com/app/site/hosting/scriptlet.nl?script=123&deploy=1&poid=456
```

5. Pulsa Enter. Debe abrirse o descargarse el PDF, según las preferencias de tu navegador.
6. Debes ver número de orden, proveedor, artículos, Ana Pérez, teléfono, tres instrucciones y los tres importes.

Si el total real de la orden es **1000**, el incremento será **100** y el total de práctica **1100**. Si el total real es **1160**, verás **116**, y **1276**. Ambos resultados son correctos para sus bases.

**Comprobación:**

- [ ] El PDF abre desde la URL del Suitelet.
- [ ] El nombre/número de la orden corresponde a mi registro.
- [ ] Aparecen las tres instrucciones y los importes correctos.
- [ ] El total real de la orden no cambió después de generar el PDF.

## 10. Etapa 8 — Agregar el enlace con beforeLoad

Esta etapa se hace **después** de que funcione la URL del Suitelet. Así no mezclas un error de impresión con uno del enlace.

### 10.1. Cambiar las dependencias del User Event

En `drt_poPdfSnapshot_ue.js`, reemplaza solamente la línea inicial de `define`:

```javascript
define(['N/record', 'N/log', 'N/error'], (record, log, error) => {
```

por estas dos líneas:

```javascript
define(['N/record', 'N/log', 'N/error', 'N/url', 'N/ui/serverWidget'],
    (record, log, error, url, serverWidget) => {
```

### 10.2. Agregar la función

Pega esta función **dentro de define**, después de `beforeSubmit` y antes de `return { beforeSubmit };`:

```javascript
    function beforeLoad(context) {
        if (context.type !== context.UserEventType.VIEW) return;
        const po = context.newRecord;
        if (!po.id || po.getValue({ fieldId: ACTIVE_FIELD }) !== true) return;

        try {
            const pdfUrl = url.resolveScript({
                scriptId: 'customscript_drt_prac_po_pdf_sl',
                deploymentId: 'customdeploy_drt_prac_po_pdf_sl',
                returnExternalUrl: false,
                params: { poid: String(po.id) }
            });
            context.form.addPageLink({
                type: serverWidget.FormPageLinkType.CROSSLINK,
                title: 'PDF de práctica +10%',
                url: pdfUrl
            });
        } catch (e) {
            // Un fallo del enlace no debe impedir abrir la orden.
            log.error({ title: 'PRAC_PDF_ERROR_ENLACE', details: e });
        }
    }
```

### 10.3. Exponer los dos eventos

Reemplaza:

```javascript
    return { beforeSubmit };
```

por:

```javascript
    return { beforeLoad, beforeSubmit };
```

No pegues la función después de `});`: quedaría fuera del módulo y perdería acceso a las variables.

### 10.4. Actualizar y probar

1. Guarda el archivo local.
2. En el File Cabinet abre el **archivo existente** del User Event y usa la opción de editar/reemplazar su contenido. No crees otro Script record ni otro deployment.
3. Confirma que el Script record sigue apuntando al archivo actualizado.
4. Abre de nuevo la orden marcada como práctica en modo **View / Ver**.
5. Busca el enlace **PDF de práctica +10%** en la zona de enlaces superiores del formulario.
6. Ábrelo. Debe generar el mismo PDF que la URL manual.

Si no aparece, confirma que estás en View, el checkbox está marcado, el deployment no está limitado a otro evento y el archivo realmente se actualizó. Revisa `PRAC_PDF_ERROR_ENLACE` en Execution Log. El enlace se agrega al mostrar el formulario; no necesita guardar la orden.

**Lo que acabas de aprender:** un mismo User Event puede preparar datos en `beforeSubmit` y cambiar la interfaz en `beforeLoad`. No está obligado a implementar los tres eventos.

**Comprobación:**

- [ ] El enlace aparece en View para mi orden de práctica.
- [ ] Genera el mismo PDF que la URL manual.
- [ ] No confundí ese enlace con el botón nativo Print.

## 11. Etapa 9 — Pruebas funcionales guiadas

No basta con que el primer PDF abra. Ejecuta estas pruebas en orden y guarda evidencia de las que completes.

### P01 — Caso normal

1. Usa los datos iniciales de Ana Pérez y las tres instrucciones.
2. Guarda la orden y abre el PDF.
3. Compara sus datos con el proveedor y el JSON.

**Esperado:** tres filas, contacto y teléfono correctos, incremento igual al 10 % del total real.

### P02 — El PDF no modifica el importe

1. Anota el total de la orden.
2. Genera el PDF dos veces.
3. Recarga la orden.

**Esperado:** el total sigue siendo el mismo. El incremento solo aparece en el PDF.

### P03 — Entender la copia guardada

1. Cambia en el proveedor el contacto a **Luis Gómez** y guarda únicamente el proveedor.
2. Vuelve a generar el PDF sin editar la orden.
3. Debe seguir mostrando **Ana Pérez**, porque imprime la copia guardada.
4. Ahora haz **Edit > Save** en la orden.
5. Genera otra vez el PDF.

**Esperado:** ahora aparece Luis Gómez y cambia `actualizadoEn`. Este comportamiento está definido en el ticket; no es un fallo de actualización.

### P04 — Sin instrucciones y sin teléfono

1. Deja vacíos el teléfono y las instrucciones del proveedor. Guarda.
2. Haz Edit > Save en la orden.
3. Genera el PDF.

**Esperado:** el teléfono muestra **Sin capturar** y aparece el mensaje de que no hay instrucciones. El JSON contiene `"instrucciones": []`. El PDF no se rompe.

### P05 — Caracteres especiales y texto literal

1. En instrucciones del proveedor escribe estas dos líneas exactamente:

```text
Contactar a Compras & Logística y presentar "OC" en recepción.
Prueba literal: ${1+1} y <pendiente>.
```

2. Guarda el proveedor y después la orden.
3. Genera el PDF.

**Esperado:** ves `&`, las comillas, `${1+1}` y `<pendiente>` como texto. `${1+1}` no debe convertirse en `2`. Aquí puedes comprobar por qué no usamos `?eval` para leer el JSON.

### P06 — Checkbox desactivado

1. Desmarca **PRAC - Activar PDF de práctica** en la orden y guarda.
2. Abre la URL del Suitelet con su ID.

**Esperado:** mensaje de práctica desactivada, sin generar PDF. El enlace del User Event no aparece al volver a View. El JSON previo puede seguir guardado: desactivar el checkbox no lo borra.

3. Marca otra vez el checkbox y guarda para continuar.

### P07 — Cambio de proveedor

1. Prepara otro proveedor de prueba con contacto **María Torres** y una instrucción.
2. Si tu cuenta permite cambiar el proveedor de la orden de prueba, hazlo y revisa los campos dependientes que NetSuite pueda solicitar.
3. Si ese cambio está restringido por el estado de la orden, crea otra orden con el segundo proveedor.
4. Marca la práctica y guarda.

**Esperado:** JSON y PDF usan los datos del segundo proveedor. No se mezclan con los de Ana/Luis.

### P08 — URL sin ID

1. Abre la URL interna del Suitelet sin `&poid=...`.
2. Repite con `&poid=abc`.

**Esperado:** mensaje de ID inválido; no intenta generar un PDF de otra transacción.

### P09 — JSON dañado, de forma controlada

Esta prueba enseña el error de lectura. Hazla solo en esta práctica de Sandbox.

1. Anota el estado actual del deployment del User Event.
2. Desmarca temporalmente **Deployed** en ese deployment y guarda. El Suitelet sigue desplegado.
3. Edita la orden de práctica y reemplaza el campo JSON por el texto `esto no es json`.
4. Guarda la orden. Como el User Event está detenido, no reconstruirá el texto.
5. Abre la URL manual del Suitelet.
6. Comprueba el mensaje **El JSON está dañado**.
7. **Vuelve a marcar Deployed en el User Event.**
8. Haz Edit > Save en la orden y vuelve a imprimir.

**Esperado:** el User Event reconstruye un JSON válido y el PDF vuelve a funcionar. Nunca dejes desactivado el deployment al terminar la prueba.

### P10 — Cambiar el diseño desde el archivo

1. En el XML local cambia el título a **Mi primera orden de compra personalizada**.
2. Cambia el color `#17365d` por `#245c3a`.
3. Reemplaza el contenido del **mismo archivo XML** en File Cabinet.
4. Si tu método de carga creó otro archivo con otro ID, actualiza el parámetro del Suitelet con ese nuevo ID.
5. Genera de nuevo el PDF.

**Esperado:** título y color nuevos. No necesitas modificar ni volver a guardar la orden para un cambio de diseño.

### P11 — Práctica de cálculo

1. Verifica el caso del 10 %.
2. Cambia temporalmente `totalBase * 0.10` por `totalBase * 0.15` y actualiza también los textos que dicen 10 % en la plantilla.
3. Reemplaza el XML y genera el PDF.
4. Comprueba que el incremento es el 15 % del mismo total base.
5. Regresa fórmula y textos al 10 % para cerrar el ticket.

**Esperado:** cambia el total de práctica y el original permanece igual. Si necesitas redondeos especiales de negocio, no los deduzcas del formato visual; se especifican como una regla adicional.

### P12 — Comprobar aislamiento

1. Abre otra orden de prueba que no tenga marcado el checkbox.
2. Haz Edit > Save.

**Esperado:** el script no genera JSON en esa orden y no agrega el enlace. No es necesario probar sobre órdenes reales de clientes.

## 12. Cómo resolver los fallos más comunes

| Lo que ves | Qué revisar primero | Qué hacer |
|---|---|---|
| No encuentro mis campos | Applies To, formulario y permisos | Mostrar los campos en tu copia del formulario y comprobar sus ID. |
| El JSON queda vacío | Checkbox, propietario, deployment, evento | Probar Edit > Save con práctica activa y revisar Execution Log. |
| Error al cargar el proveedor | ID de entity y permiso de Vendor | Verificar el proveedor seleccionado y que tu rol pueda abrirlo. |
| Campo inválido | Nombre interno mal escrito | Copiar el ID real de la ficha del campo; revisar el prefijo duplicado. |
| No se permite guardar la orden | El UE u otra validación lanzó error | Leer el mensaje y el log antes de cambiar más cosas. |
| Falta ID del XML | Parámetro del deployment vacío | Introducir el ID numérico del archivo, guardar y reabrir deployment. |
| Archivo no encontrado | ID incorrecto o permisos de carpeta | Abrir la ficha del XML y confirmar ID y acceso del rol. |
| Suitelet no disponible | Deployed, Testing, Owner o Audience | Probar con propietario y URL interna de ese deployment. |
| Falta `poid` | URL sin ID de la orden | Agregar `&poid=NUMERO_INTERNO_REAL`. |
| Falta `EXTRA` | Se imprimió por otra ruta | Usar el enlace/URL del Suitelet; Print nativo no agrega nuestro alias. |
| Error XML con línea y columna | Etiquetas sin cerrar o texto especial | Comparar el bloque original; revisar cierres y autoescape de textos propios. |
| Cambié XML pero el PDF sigue igual | Archivo o ID distinto | Verificar qué archivo carga el parámetro del deployment. |
| Cambié el proveedor pero veo datos anteriores | La copia aún no se regeneró | Edit > Save en la orden. |
| No aparece el enlace | Modo Edit, checkbox, versión del UE | Abrir View y revisar return, dependencias y archivo actualizado. |
| Total de práctica inesperado | Base real de cálculo | Comparar con el total final, no solo subtotal o suma sin impuestos. |

Si se presenta un fallo de permisos, no lo soluciones publicando el Suitelet sin inicio de sesión. Su acceso debe permanecer interno.

## 13. Lo que debes poder explicarle a tu jefe

Cuando termines, deberías poder explicar esto con tus propias palabras:

> La orden tiene un proveedor relacionado. Mi User Event toma ese ID al guardar, carga el proveedor y lee sus campos personalizados. Construye un objeto con los datos y una lista de instrucciones, lo convierte en JSON y lo almacena en un campo de cabecera de la orden. Al imprimir, un Suitelet lee ese JSON, lo convierte otra vez en objeto y lo entrega a FreeMarker con el alias EXTRA. La plantilla decide la presentación y calcula un total adicional sin alterar la transacción.

### Diferencias que debes conservar claras

| Variante | Cuándo existe el dato | Para qué sirve |
|---|---|---|
| `custbody_` + beforeSubmit, usada aquí | Queda guardado en la orden | Conservar una copia que se actualiza al guardar. |
| `custpage_` + beforeLoad PRINT, descrita en el curso | Campo temporal del formulario/renderizado | Preparar datos al imprimir sin almacenarlos en la transacción; hay que verificar su exposición en la ruta de impresión usada. |
| Alias `EXTRA` de N/render, usado aquí | Solo durante la generación del PDF | Entregar al motor una estructura ya interpretada, con objetos y listas. |

Un campo oculto no significa automáticamente «guardado», y un campo guardado no significa automáticamente «actualizado en cada impresión».

La alternativa del curso no se reproduce aquí cambiando simplemente `custbody` por `custpage`: cambia el momento de ejecución y cómo llegan los datos al renderizador. En particular, no uses `beforeLoad` para intentar guardar cambios en una orden existente. [Referencia de beforeLoad](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4407991781.html).

Este ejercicio usa un único registro relacionado, el proveedor. Si un cliente pide muchas filas que viven en registros hijos, se consulta esa colección —habitualmente mediante una búsqueda— y se construye una lista de objetos semejante a `instrucciones`. No afirmamos que la lista de esta práctica proceda de registros hijos: aquí se forma a partir de líneas de texto para que el primer ejercicio sea manejable.

Antes de programar para un cliente, también se revisa si el campo ya está disponible directamente en la plantilla, mediante una relación compatible o mediante configuración/sourcing. El objetivo de esta práctica es aprender el circuito de script y JSON, no asumir que todos los campos adicionales requieren un User Event.

### Límites deliberados del ejercicio

- No atiende edición en línea, importaciones masivas ni todas las rutas de aprobación. Se prueba con CREATE/EDIT desde la interfaz.
- No actualiza todas las órdenes cuando cambia un proveedor.
- No guarda un historial inmutable: cada guardado de la orden reemplaza su copia anterior.
- El total se lee de la orden guardada al imprimir; no se conserva dentro de la copia del proveedor.
- No cambia la impresión nativa ni configura envío por correo.
- Una solución de cliente puede requerir registros hijos, consultas paginadas, permisos distintos y reglas de actualización adicionales.

## 14. Criterios para dar el ticket por terminado

- [ ] Creé los cinco campos con ID y tipos correctos.
- [ ] Puedo señalar qué datos nacen en el proveedor y cuáles pertenecen a la orden.
- [ ] El User Event se ejecuta solo para el caso de práctica previsto.
- [ ] El JSON se guarda y puedo reconocer objeto, propiedades y lista.
- [ ] Entiendo la diferencia entre `JSON.stringify()` y `JSON.parse()`.
- [ ] El XML está editado desde código fuente y cargado en File Cabinet.
- [ ] El Suitelet produce el PDF con `record` y `EXTRA`.
- [ ] Veo instrucciones mediante `#list` y valores vacíos manejados con `#if`.
- [ ] El cálculo del 10 % se realiza en FreeMarker y no modifica la orden.
- [ ] El enlace de beforeLoad funciona.
- [ ] Ejecuté las pruebas P01–P12 y anoté cualquier excepción de mi cuenta.
- [ ] Restauré la fórmula al 10 % y reactivé el deployment después de P09.
- [ ] Puedo explicar por qué cambiar el proveedor no actualiza la copia hasta guardar la orden.

**Evidencias que puedes guardar para revisar con tu jefe:** captura de los campos del proveedor, captura del JSON en la orden, captura del deployment y un PDF de resultado. Usa datos de prueba.

## 15. Bitácora para completar durante la práctica

| Dato | Tu valor |
|---|---|
| Cuenta / entorno de prueba | Pendiente |
| Rol usado | Pendiente |
| Propietario de los scripts | Pendiente |
| ID interno del proveedor | Pendiente |
| ID interno de la orden | Pendiente |
| Número visible de la orden | Pendiente |
| Total original y moneda | Pendiente |
| ID interno del XML en File Cabinet | Pendiente |
| URL interna del Suitelet | Pendiente |
| IDs que cambiaron respecto al ticket | Ninguno / anotar |
| Última etapa completada | Pendiente |
| Error encontrado y solución | Pendiente |

| Prueba | Resultado real | ¿Pasó? |
|---|---|---|
| P01 Caso normal | | |
| P02 No modifica importe | | |
| P03 Actualizar la copia | | |
| P04 Datos vacíos | | |
| P05 Caracteres y texto literal | | |
| P06 Práctica desactivada | | |
| P07 Otro proveedor | | |
| P08 URL inválida | | |
| P09 JSON dañado y recuperación | | |
| P10 Cambiar diseño | | |
| P11 Cambiar cálculo y restaurar | | |
| P12 Aislamiento | | |

## 16. Fuentes y estado de validación

El enunciado, los datos de prueba y los programas son material didáctico preparado para esta práctica. La transcripción aportada sirve de referencia conceptual; los identificadores y el flujo de este ticket son nuevos.

Documentación de apoyo consultada el 22 de septiembre de 2026:

- [Oracle: beforeSubmit](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4407992070.html): cambios antes del guardado y restricciones de permisos.
- [Oracle: beforeLoad](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4407991781.html): eventos de carga y límites sobre la modificación del registro existente.
- [Oracle: campos personalizados de cabecera](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2828059.html).
- [Oracle: tipos de campo y Long Text](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2842731.html).
- [Oracle: N/render](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4412042824.html).
- [Oracle: addRecord](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_456543212890.html).
- [Oracle: addCustomDataSource](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4528541027.html).
- [Oracle: enlaces de formulario](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4332671075.html).
- [Oracle: formato de valores con nsformat](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_156624108232.html).
- [Apache FreeMarker: interpretación de JSON](https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_eval_json).
- [Apache FreeMarker: autoescape y formato de salida](https://freemarker.apache.org/docs/dgui_misc_autoescaping.html).

**Validación local realizada:** sintaxis de los dos scripts y de la ampliación con beforeLoad; generación y lectura del JSON con módulos simulados; exclusión de órdenes desactivadas y XEDIT; datos vacíos; conservación del texto especial; errores por JSON, proveedor, URL o total inválidos; y ausencia de cambios al total o al JSON guardado al imprimir. Estas comprobaciones no ejecutan las API reales ni el motor PDF. No se ha desplegado ni ejecutado en tu cuenta de NetSuite. Las pruebas anteriores son el procedimiento para validarlo allí; los campos obligatorios, permisos y configuración del formulario dependen de tu cuenta.

**Tu primer paso ahora:** completa únicamente la etapa 1. Después crea los campos de la etapa 2. No necesitas resolver toda la práctica de una sola vez.
