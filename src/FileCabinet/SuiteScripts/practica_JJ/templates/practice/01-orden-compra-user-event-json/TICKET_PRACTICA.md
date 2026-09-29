# PRAC-PDF-001 — Tres impresiones Late de Invoice en NetSuite

**Estado:** por comenzar. **Nivel:** primera práctica real guiada. **Entorno:** cuenta propia de práctica/Sandbox. **Orden:** Late 1 → Late 2 → Late 3. **Registro principal:** factura de venta (Invoice).

> Este ticket reemplaza la práctica anterior de orden de compra. La carpeta conserva el nombre histórico `01-orden-compra-user-event-json` para no mover archivos; toda la actividad nueva se aplica a **Invoice**, no a Purchase Order. Completa una etapa y su comprobación antes de avanzar.

## 1. Encargo y alcance

Recrear **desde cero** tres diseños Advanced PDF/HTML a partir de los PDFs aportados. Al terminar, una Invoice de práctica abierta en modo **View** tendrá tres botones: **Imprimir Late 1**, **Imprimir Late 2** e **Imprimir Late 3**. Cada botón abrirá un Suitelet interno que elegirá su plantilla y generará un PDF. No se cambia el botón nativo Print ni la plantilla de correo del formulario.

| Variante | Archivo en `../plantillas originales Bluespace/` | Páginas | Composición |
|---|---|---:|---|
| Late 1 | `ES Late 1_LEG.LC1.SM.SP.20260114.rtm.pdf` | 2 | Aviso de pago nº 1; página de factura de recargo. |
| Late 2 | `ES Late 2 LEG.LC2.SM.SP.20260114.pdf` | 1 | Aviso de pago nº 2; extracto de movimientos y saldo. |
| Late 3 | `ES Late 3 LEG.LC.SM.SP.2026011.pdf` | 2 | Carta jurídica; página de factura de burofax. |

**Rasgos visuales observados:** Late 1 y Late 2 usan franja azul, marca, datos de factura y destinatario, título centrado, texto del aviso y pie corporativo. Late 1 y la segunda página de Late 3 usan tabla de conceptos e importes, desglose de IVA y total. Late 2 lleva una tabla de extracto en la misma página del aviso. La primera página de Late 3 usa imagen jurídica, carta, firma y pie distintos. La práctica buscará reproducir orden, jerarquía, saltos, tablas y legibilidad, con datos personales y bancarios **ficticios** y activos gráficos autorizados.

**Inconsistencias visibles que debes registrar, no convertir en reglas:** Late 1 anuncia 10 % con mínimo de 11 € + IVA, pero su factura muestra base **10,59 €**, IVA **2,22 €** y total **12,81 €**. Late 2 fecha el aviso **14/02/2026** y el saldo del extracto **09/04/2026**. El número de factura de Late 2 tiene formato distinto a los otros ejemplos. Late 3 menciona deuda **150,66 €** y adjunta factura de **65,34 €**; el saldo de Late 2 era **85,32 €**, que sumado a 65,34 € da 150,66 €, pero los PDFs no prueban la regla contable. No programes recargos, plazos, restricciones de acceso ni efectos jurídicos a partir de estos modelos visuales. Los importes reales deben proceder de tus registros de prueba y de reglas verificadas.

## 2. Cómo decidir de dónde sale cada dato

Los IDs estándar siguientes son **candidatos** para Invoice, no una promesa de que estén visibles en tu cuenta. Compruébalos en el selector de campos de la plantilla, la factura y una impresión mínima. Los IDs `cust...` son nombres **propuestos para crear**, no campos ya existentes.

| Dato impreso | Primer origen que probarás | Si no basta |
|---|---|---|
| Nº y fecha de factura | `record.tranid`, `record.trandate` | No alteres el número de la factura para imitar el PDF. |
| Cliente y dirección | `record.entity`, `record.billaddress`; probar `billaddressee`, `billaddr1`, `billcity`, `billzip` y `billcountry` | Usa la dirección guardada en Invoice como foto de la transacción. |
| NIF/CIF del cliente | `record.entitytaxregnum`, si la función fiscal aplica | `custentity_prac_late_nif` en Customer solo si falta un dato adecuado; decide si debe quedar también congelado en Invoice. |
| Centro | `record.location` si la cuenta usa Location | Registro Centro de práctica relacionado mediante Contrato y leído por script. |
| Nº de contrato | No asumir que `record.otherrefnum` es un contrato | `custbody_prac_late_contrato`, referencia a un Contrato de práctica. |
| Nº de box/cuarto | Comprobar campo existente en Invoice/línea | Campo del Contrato si hay uno por factura; `custcol_...` si varía por línea. |
| Forma de pago | Probar `record.terms` y su significado | `custbody_prac_late_forma_pago` para «Por transferencia» si Terms no representa ese dato. |
| Emisor, CIF y pie | Company/Subsidiary accesibles en selector, si la cuenta los tiene | Campos de un registro de práctica; no copiar datos bancarios reales. |
| Banco, teléfono y email del centro | Registros existentes y sus permisos | Campos del Centro de práctica preparados por script. |
| Logo, lema e imagen jurídica | Logo de Company/Subsidiary o archivos propios del File Cabinet | Activos de práctica autorizados; el PDF no revela la ruta del original. |
| Fecha de aviso y fecha de corte | No igualarlas sin prueba a `trandate`/`duedate` | `custbody_prac_late_fecha_aviso` y `custbody_prac_late_fecha_corte`. |
| Vencimiento de la factura | `record.duedate` | Verifica si la columna «Vencimiento» del ejemplo realmente corresponde a ese campo. |
| Conceptos e importes de la factura | `record.item`: `description`, `quantity`, `rate`, `amount` | Un dato por línea pertenece a `custcol_...`, no a `custbody_...`. |
| Base, impuesto, total | `record.subtotal`, `record.taxtotal`, `record.total` | Comprobar `taxdetails`/SuiteTax y los importes guardados. No calcular un cargo contable dentro del PDF. |
| Movimientos y saldo de Late 2 | No salen de `record.item` de una única Invoice | Lista preparada desde registros de prueba o búsqueda de transacciones; definir fecha de corte, signos y moneda. |
| Deuda de la carta Late 3 | No equivale necesariamente a `record.total` ni `record.balance` | Saldo de caso calculado, conciliado y entregado al renderizador. |
| Texto de avisos/carta y firma | Contenido fijo de demostración | Parametrizar solo valores variables; el texto legal no es una política de tu empresa. |
| Código `LEG.LC...` | Código visual de cada PDF | Constante de plantilla, no campo supuesto de Invoice. |

**Cuaderno de mapeo:** para cada dato anota ID real, tipo, registro donde vive, si lo viste en el selector, valor observado y ruta de obtención. Las referencias de Oracle no son exhaustivas: la disponibilidad depende de funciones y campos de tu cuenta.

## 3. Modelo mínimo para practicar campos de niveles superiores

Crea los campos cuando llegues a la etapa correspondiente. Si un ID ya existe, elige otro y actualiza todas sus referencias.

| Registro | ID propuesto | Tipo/uso |
|---|---|---|
| Invoice | `custbody_prac_late_habilitar` | Checkbox: solo facturas de práctica muestran botones. |
| Invoice | `custbody_prac_late_forma_pago` | Texto, solo si `terms` no sirve. |
| Invoice | `custbody_prac_late_fecha_aviso` | Date: fecha reproducible del aviso. |
| Invoice | `custbody_prac_late_fecha_corte` | Date: corte del extracto Late 2. |
| Customer | `custentity_prac_late_nif` | Texto, solo si falta campo fiscal utilizable. |
| Custom Record | `customrecord_prac_late_centro` | Centro de práctica. |
| Centro | `custrecord_prac_late_tel`, `custrecord_prac_late_email` | Contacto. |
| Centro | `custrecord_prac_late_banco_demo`, `custrecord_prac_late_emisor`, `custrecord_prac_late_cif` | Textos ficticios de impresión. |
| Custom Record | `customrecord_prac_late_contrato` | Contrato de práctica. |
| Contrato | `custrecord_prac_late_numero`, `custrecord_prac_late_box` | Nº de contrato y box. |
| Contrato | `custrecord_prac_late_cliente`, `custrecord_prac_late_centro` | List/Record: Customer y Centro. |
| Invoice | `custbody_prac_late_contrato` | List/Record: Contrato. |
| Invoice | `custbody_prac_late_json` | Long Text con Store Value, solo para el ejercicio de foto JSON. |

La cadena didáctica es **Invoice → Contrato → Centro**. Primero intenta el selector de campos y una plantilla mínima; si el motor no expone el dato del Centro, carga Contrato y Centro con `N/record` en un script. **No afirmes de antemano que todas las relaciones son inaccesibles.** Valida que el Customer del Contrato coincide con el de Invoice. Para esta primera práctica hay **un contrato y un box por factura**. Si hay varios, el diseño deberá pasar a líneas o registros hijos. El registro Contrato de práctica no representa un módulo contractual real del cliente.

## 4. Dos formas de entregar los datos adicionales

### Ruta principal: consulta al imprimir

`Invoice View → botón → Client Script → Suitelet → N/record + N/search → N/render → PDF`.

El Suitelet recibe el **ID interno** de Invoice y la variante `late1`, `late2` o `late3`. Valida ambos, carga solo una Invoice habilitada para práctica, comprueba permisos y consistencia de Customer/Contrato, y selecciona una de **tres IDs de plantilla permitidos**. Vincula Invoice como alias `record` con `renderer.addRecord`. Construye un objeto para Contrato, Centro, extracto y deuda y lo entrega como `EXTRA` mediante `renderer.addCustomDataSource` con `render.DataSource.OBJECT`. Genera el PDF con `renderAsPdf`. La vista previa del editor y Print nativo no tendrán `EXTRA`, así que la prueba integral se hace desde el Suitelet.

Para Late 2, no deduzcas un estado de cuenta histórico desde el `balance` actual de una Invoice. Define conjunto de movimientos, fecha de corte, Customer/Contrato, moneda, cargos, abonos, orden y tratamiento de pagos/aplicaciones. Concílialo con los registros de prueba antes de automatizar. Para Late 3, calcula/valida la deuda de caso fuera de la plantilla.

### Variante didáctica: foto JSON guardada en Invoice

Un User Event `beforeSubmit` en CREATE/EDIT puede leer Contrato y Centro, crear un objeto y guardar `JSON.stringify(objeto)` en `custbody_prac_late_json`. Esa **foto** cambia al guardar de nuevo Invoice, no al modificar Centro o Contrato. El Suitelet lee el texto, comprueba versión e ID, ejecuta `JSON.parse` y entrega el objeto validado como `EXTRA`. Decide por dato si debe ser histórico o actualizado al imprimir; documenta qué ruta manda.

Esquema de prueba con información ficticia:

~~~json
{
  "version": 1,
  "invoiceId": "123",
  "contrato": {"numero": "DEMO-476964", "box": "3206"},
  "centro": {"nombre": "Centro Demo", "telefono": "000 000 000", "email": "demo@example.invalid"},
  "aviso": {"fecha": "2026-02-21", "fechaCorte": "2026-02-21"},
  "movimientos": [
    {"fecha": "2026-02-20", "tipo": "Factura", "descripcion": "Servicio demo", "cargo": 85.32, "abono": 0}
  ]
}
~~~

La lista de movimientos puede seguir siendo dinámica aunque Contrato/Centro estén guardados como foto. Valida Long Text, vacíos, fechas ISO, números sin símbolo monetario, versión y caracteres XML. No guardes datos personales o bancarios reales para imitar los PDFs.

### Laboratorio corto con `?eval`

`?eval` interpreta una **expresión FreeMarker**, no es un lector seguro y completo de JSON. Para ver su efecto puedes guardar **solo un literal controlado por ti**, como `{"centro":"Centro Demo","numero":"DEMO-1"}`, y hacer una prueba aislada:

~~~ftl
<#assign dato = (record.custbody_prac_late_json!'{}')?eval>
${dato.centro!''}
~~~

Compara ese resultado con `JSON.parse` + `EXTRA`. **No** uses `?eval` con texto editable por usuarios, importaciones o fuentes externas: evalúa expresiones y algunos JSON válidos no son expresiones FTL válidas. Apache recomienda `?eval_json` para JSON, pero Oracle documenta FreeMarker **2.3.26** en NetSuite y `?eval_json` apareció en **2.3.31**. Por eso las **tres impresiones finales** leerán JSON con SuiteScript y pasarán un objeto al motor.

## 5. Botones y archivos que crearás

En `beforeLoad` de un User Event desplegado **solo en Invoice**, agrega botones solo en `VIEW`, con Invoice guardada y checkbox activado. IDs sugeridos: `custpage_prac_late1`, `custpage_prac_late2`, `custpage_prac_late3`. Con `form.clientScriptModulePath` conecta un Client Script que expone tres funciones. Cada función obtiene el ID actual, usa `N/url.resolveScript` para la URL **interna** del mismo Suitelet y abre su variante fija. El Suitelet vuelve a validar ID y variante; no confía en el botón. Añade los botones progresivamente: Late 1 cuando funcione Late 1; después 2 y 3.

Archivos previstos en una subcarpeta nueva `practice/late-invoice/` (se crean **durante** la práctica; aún no existen):

~~~text
late-invoice/
├── late1.xml
├── late2.xml
├── late3.xml
├── prac_late_buttons_ue.js
├── prac_late_buttons_cs.js
├── prac_late_pdf_sl.js
└── prac_late_snapshot_ue.js      (solo para la variante JSON)
~~~

Crea **tres registros Advanced PDF/HTML Template de tipo Invoice**, cada uno con título y Script ID propio, desde **Customization > Forms > Advanced PDF/HTML Templates > New Template**. Escribe el XML/BFO/FreeMarker desde código fuente y conserva copia local. La plantilla estándar de Invoice sirve de referencia de campos y sintaxis, no como resultado final. Subir un XML al File Cabinet no lo registra por sí solo como Advanced Template. Una sola plantilla asignada como Print Template del formulario no proporciona tres variantes al botón Print.

## 6. Etapas con comprobación obligatoria

### Etapa 0 — Cuenta, Invoice y campos reales

1. Confirma Advanced PDF/HTML Templates, Server SuiteScript, permisos, SuiteTax, OneWorld, Locations y moneda EUR si procede.
2. Crea Customer, artículo de servicio/recargo y una Invoice **ficticia**. Anota ID interno, `tranid`, fecha, vencimiento, moneda, base, IVA y total.
3. Crea `custbody_prac_late_habilitar` y actívalo solo en tus facturas de prueba.
4. En el editor de Invoice, verifica el selector de campos y completa el cuaderno de mapeo: «existe / no existe / valor observado». No inventes impuestos ni fuerces números del PDF en una cuenta con otra configuración.

**Comprobación:** tienes una Invoice de prueba y sabes qué campos estándar están realmente disponibles.

### Etapa 1 — Late 1 visual, con datos directos

1. Crea `late1.xml` desde el XML/PDF mínimo: declaración, DOCTYPE BFO, `<pdf>`, `<head>` y `<body>` con etiquetas cerradas. Imprime «Hola Invoice» y `record.tranid`.
2. Construye página 1: cabecera azul, cliente, título «AVISO DE PAGO Nº 1», texto de demostración, banco ficticio, contacto y pie. Antes de diseñarla, comprueba con este primer documento mínimo (ajusta la ruta según el editor de tu cuenta):

    ~~~xml
    <?xml version="1.0"?>
    <!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
    <pdf>
    <head>
        <style type="text/css">body { font-family: sans-serif; font-size: 10pt; }</style>
    </head>
    <body size="A4" padding="16mm">
        <p>Hola Invoice: ${record.tranid!''}</p>
    </body>
    </pdf>
    ~~~

    Cuando imprima, sustituye el párrafo por bloques pequeños y valida después de cada bloque. Para las filas usa `<#list record.item as linea>` y muestra primero `${linea.description!''}` y `${linea.amount!''}`; luego añade columnas y estilos. Escapa los textos variables y prueba `&`, `<` y comillas.
3. Fuerza un salto a página 2: factura con `record.item`, base, impuestos y total. Crea una Invoice real **de prueba** de recargo para que los importes impresos existan en NetSuite.
4. Comprueba dos páginas exactas, acentos, €, texto largo, dirección/NIF vacíos y que imprimir no cambia la Invoice.

**Comprobación:** Late 1 tiene aviso y factura con valores directos correctos; lo que falta por mapear está señalado.

### Etapa 2 — Late 1 con relación profunda y primer botón

1. Crea Centro, Contrato y vínculo a Invoice; usa contacto, emisor y banco ficticios.
2. Prueba cada valor en selector y plantilla mínima. Documenta qué ruta directa funciona y dónde necesitas `N/record`.
3. Implementa Suitelet con `record` y `EXTRA`; pasa Contrato/Centro. Maneja relación faltante y Customer discordante.
4. Implementa User Event y Client Script; agrega **Imprimir Late 1**. Prueba en View y compara con Print nativo.
5. Laboratorio obligatorio de JSON: crea la foto con `beforeSubmit`, prueba el literal controlado con `?eval`, después imprime mediante `JSON.parse` + `EXTRA`. Demuestra que cambiar Centro no actualiza la foto hasta guardar Invoice.

**Comprobación:** Late 1 usa un valor de Centro a través de Contrato, abre desde su botón y puedes explicar la diferencia entre `?eval` experimental y el parseo en SuiteScript.

### Etapa 3 — Late 2 con extracto

1. Crea `late2.xml` desde cero, en **una página**: aviso nº 2, contacto, tabla de movimientos y saldo.
2. Primero pasa a `EXTRA.movimientos` una lista fija de prueba con **72,01 €** y **13,31 €**, saldo **85,32 €**. Esto valida la presentación.
3. Luego sustituye esa lista por búsqueda/registro de movimientos de prueba. Define fecha de corte, signos, moneda y alcance. Concilia cada fila y el saldo; `record.item` de la Invoice no es un extracto de cuenta.
4. Agrega **Imprimir Late 2**. Si hay más filas de las que caben, define continuación legible.

**Comprobación:** el botón genera una tabla de varias filas y saldo conciliado con tu fuente de prueba.

### Etapa 4 — Late 3 con carta y factura

1. Crea `late3.xml` desde cero. Página 1: imagen jurídica autorizada, destinatario, fecha/lugar, carta de demostración, deuda, contrato, banco ficticio, firma y pie. Página 2: factura de burofax.
2. Prepara una Invoice de coste de envío. El ejemplo visual muestra base **54,00 €**, IVA **11,34 €**, total **65,34 €**; si la cuenta calcula distinto, usa y documenta el valor contable real.
3. Entrega la deuda del caso desde el Suitelet, separada del total de Invoice. Puedes simular **85,32 + 65,34 = 150,66 €**, pero valida la composición antes de automatizarla.
4. Agrega **Imprimir Late 3**. Comprueba salto a dos páginas, imagen, firma, pie y tabla.

**Comprobación:** Late 3 genera carta y factura y distingue deuda del caso de total de factura.

### Etapa 5 — Integración y cierre

1. En la **misma** Invoice habilitada comprueba los tres botones y que cada uno elige su plantilla correcta.
2. Prueba Invoice normal sin checkbox, ID/variante inválidos, JSON malformado, relación faltante, movimientos vacíos, caracteres `&`/`<`/comillas, fecha de corte incoherente y moneda diferente.
3. Compara cada página con el PDF de referencia: estructura, alineación, márgenes, tablas, saltos y pie. Los datos ficticios no necesitan coincidir con datos personales del modelo.
4. Deja los deployments en Testing y las URLs internas. No envíes correos ni toques facturas de clientes.

**Comprobación:** tres PDFs reproducibles, tres botones y un mapa de campos respaldado por pruebas en tu cuenta.

## 7. Pruebas mínimas de aceptación

| Prueba | Resultado esperado |
|---|---|
| A01 Late 1 | Dos páginas, aviso y factura; número/total coherentes con Invoice. |
| A02 Late 2 | Una página, extracto de varias filas y saldo conciliado con fecha de corte. |
| A03 Late 3 | Dos páginas, carta y factura; deuda de caso separada del total Invoice. |
| A04 Relación | Centro llega a través de Contrato; consta si fue campo directo o `EXTRA`. |
| A05 Botones | Tres opciones en View de Invoice de práctica; ninguna en Invoice normal. |
| A06 Aislamiento | Suitelet rechaza Invoice no habilitada, ID ajeno y variante desconocida. |
| A07 JSON | Vacío, malformado o versión distinta dan error claro; la foto sigue su regla de actualización. |
| A08 Diseño | Sin texto cortado, páginas extras, importes inventados ni tabla solapada. |
| A09 Datos | Solo datos ficticios, recursos autorizados y acceso interno. |

## 8. Bitácora para completar

| Evidencia | Resultado propio |
|---|---|
| Cuenta, rol, SuiteTax/OneWorld/Locations y moneda | Pendiente |
| Customer e Invoice(s) de prueba: ID y número | Pendiente |
| IDs de las tres Advanced Templates | Pendiente |
| IDs de User Event, Client Script y Suitelet | Pendiente |
| Campos estándar comprobados en selector y valores | Pendiente |
| Campos nuevos creados o sustituidos por existentes | Pendiente |
| Ruta Invoice → Contrato → Centro y permisos | Pendiente |
| Fuente y fecha de corte del extracto Late 2 | Pendiente |
| Conciliación de deuda Late 3 | Pendiente |
| Regla de actualización de JSON | Pendiente |
| Comparación visual y errores por variante | Pendiente |

## 9. Fuentes y estado de validación

- [Oracle: sintaxis de campos, relaciones y límites de sublistas](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2864199.html).
- [Oracle: selector de campos](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_163732036124.html).
- [Oracle: referencia de campos Invoice, dependiente de funciones activas](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/SBADVTemplates_85934086.html).
- [Oracle: edición de código XML/BFO](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4454208098.html).
- [Oracle: N/render y selección de plantillas](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4412042824.html).
- [Oracle: `addCustomDataSource`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4508822143.html).
- [Oracle: botón User Event + Client Script](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0417121954.html).
- [Oracle: plantilla del formulario frente a impresión propia](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2863334.html).
- [Oracle: FreeMarker 2.3.26 en Advanced Printing](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2862977.html).
- [Apache FreeMarker: `?eval` y `?eval_json`](https://freemarker.apache.org/docs/ref_builtins_expert.html).

**Validación realizada:** se revisaron las cinco páginas de los tres PDFs y la documentación anterior. **Pendiente:** comprobar los campos, funciones, permisos y reglas fiscales/contables en tu cuenta; crear y probar plantillas y scripts allí. Los IDs personalizados y la relación Contrato/Centro son un diseño propuesto para la práctica, no un mapeo confirmado de tu base.

**Tu primer paso:** completa únicamente la etapa 0 y registra los campos reales de Invoice. Después comienza el XML mínimo de Late 1.
