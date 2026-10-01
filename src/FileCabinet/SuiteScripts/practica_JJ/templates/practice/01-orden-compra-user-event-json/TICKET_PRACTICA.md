# PRAC-PDF-001 - Réplica guiada de Late 1, Late 2 y Late 3 en NetSuite

**Modalidad:** práctica manual, paso a paso. **Registro:** Invoice (factura de venta). **Orden:** inventario común → Late 1 completa → Late 2 completa → Late 3 completa → pruebas y README.

**Actualizado:** 1 de octubre de 2026. La carpeta conserva el nombre histórico `01-orden-compra-user-event-json`; esta actividad trabaja con Invoice.

## Empieza aquí: tu avance y la siguiente acción

- [x] Tienes una Invoice de prueba y has trabajado en un formulario personalizado, según lo reportado en el chat.
- [x] Abriste la plantilla `PRAC JJ - Diagnóstico Invoice` y encontraste `Invoice # / tranid` en Fields.
- [x] Encontraste `${record.tranid}` en el XML y confirmaste que el PDF imprime el número de tu factura. Evidencia reportada por ti; falta anotar el número e ID concretos.
- [ ] Completar el inventario de Late 1 en el paso 1. Usa la plantilla de diagnóstico que ya tienes; no necesitas volver a insertar `tranid`.
- [ ] Construir el XML de Late 1, resolver sus faltantes y comprobar sus dos páginas antes de abrir el desarrollo de Late 2.

**Siguiente acción exacta:** abre tu Invoice guardada y la plantilla de diagnóstico. Revisa `trandate`, que ya encontraste en el XML; anota fecha en factura y fecha impresa. Continúa con las filas C03 a C20 y F01 a F08 del inventario. Para cada una registra «encontrado», «vacío», «no encontrado» o «pendiente de acceso» siguiendo 1.3. Un faltante documentado permite avanzar al paso 2; se resuelve en el paso 3.

**Alcance de esta guía:** los PDFs y tu XML local fueron revisados; la cuenta NetSuite no se ha inspeccionado directamente. Solo `tranid` está confirmado por tu prueba. Los demás IDs estándar son candidatos y los IDs `cust...` son propuestas, salvo que tú confirmes lo contrario en la bitácora.

## Ruta de trabajo y entregables

Usa la guía por etapas: lee y completa solo el paso activo. Las tablas de los pasos posteriores sirven para consultar lo que sigue, sin adelantar su implementación.

**Ir a:** [1. Inventario](#paso-1) · [2. XML Late 1](#paso-2) · [3. Campos y scripts](#paso-3) · [4. Validar Late 1](#paso-4) · [5. Late 2](#paso-5) · [6. Late 3](#paso-6) · [7. Pruebas y README](#paso-7).

| Paso | Trabajo | Resultado para avanzar |
|---|---|---|
| 1 | Identificar datos visibles de los tres modelos; comprobar primero los comunes y los de Late 1. | Inventario de Late 1 completo, con faltantes y acciones. Los exclusivos de Late 2/3 quedan identificados y aplazados. |
| 2 | Editar únicamente `late1.xml`. | Dos páginas iniciales; campos disponibles conectados y mensajes visibles para faltantes. |
| 3 | Resolver los faltantes de Late 1 con campos y, donde haga falta, User Event/Suitelet. | Origen y ruta de cada dato definidos y probados. |
| 4 | Verificar datos y semejanza visual de Late 1. | Late 1 aceptada y su primer botón funcionando. |
| 5 | Repetir inventario específico, XML, resolución y pruebas para Late 2. | Aviso con extracto conciliado y segundo botón. |
| 6 | Repetir el ciclo para Late 3. | Carta y factura, deuda diferenciada del total, tercer botón. |
| 7 | Pruebas conjuntas y documentación. | Tres PDFs reproducibles, evidencias, mapa final y README. |

**Durante la práctica:** usa datos ficticios y activos gráficos autorizados. Replica distribución, textos de demostración, tipografías, colores y saltos; los valores personales y bancarios no tienen que coincidir con el original. Los textos de cobro se estudian como contenido del diseño y no se convierten en reglas que creen cargos, restrinjan acceso o envíen comunicaciones.

### Documentos que debes tener abiertos

| Diseño | Referencia local | Páginas y contenido |
|---|---|---|
| Late 1 | [PDF Late 1](../plantillas%20originales%20Bluespace/ES%20Late%201_LEG.LC1.SM.SP.20260114.rtm.pdf) | P1: aviso nº 1. P2: factura de recargo. |
| Late 2 | [PDF Late 2](../plantillas%20originales%20Bluespace/ES%20Late%202%20LEG.LC2.SM.SP.20260114.pdf) | P1: aviso nº 2 y extracto de cuenta. |
| Late 3 | [PDF Late 3](../plantillas%20originales%20Bluespace/ES%20Late%203%20LEG.LC.SM.SP.2026011.pdf) | P1: carta jurídica. P2: factura de burofax. |
| Diagnóstico actual | [XML de referencia guardado por ti](../preactice-jj-invoice-standart) | Plantilla estándar con `tranid`, fechas, dirección, líneas y totales. Consérvala como referencia. |

### Dónde hacer cada cosa en NetSuite

Rutas en inglés, como tu interfaz. Los menús varían según rol, idioma y funciones. Si falta una opción, busca el nombre de la página en la búsqueda global y comprueba el rol/permisos. Que una opción no aparezca no demuestra que un campo no exista.

| Código | Ruta / pantalla | Para qué la usarás |
|---|---|---|
| R01 | **Home > Set Preferences > General > Defaults > Show Internal IDs** | Ver IDs en ayuda de campos. Guardar con Save. |
| R02 | **Transactions > Sales > Create Invoices > List**; para nueva, **Create Invoices** | Abrir/crear la factura. Puedes buscar también su número en la búsqueda global. |
| R03 | **Lists > Relationships > Customers** | Abrir al cliente de la Invoice; revisar dirección y datos fiscales. |
| R04 | **Customization > Forms > Transaction Forms** | Editar tu formulario; Screen Fields, Sublist Fields y Print Template. |
| R05 | **Customization > Forms > Advanced PDF/HTML Templates** | Abrir la plantilla, Fields, Source Code, Template Setup, Preview y Save. |
| R06 | **Customization > Lists, Records, & Fields > Transaction Body Fields** | Buscar/crear campos `custbody_...` de cabecera. |
| R07 | **Customization > Lists, Records, & Fields > Entity Fields** | Buscar/crear campos `custentity_...` de Customer. |
| R08 | **Customization > Lists, Records, & Fields > Transaction Line Fields** | Buscar/crear columnas `custcol_...`. |
| R09 | **Customization > Lists, Records, & Fields > Record Types** | Revisar tipos de registro, sus Fields y sus registros mediante List / New Record. |
| R10 | **Setup > Company > Company Information** | Revisar datos corporativos. |
| R11 | **Setup > Company > Subsidiaries** / **Setup > Company > Locations** | Revisar subsidiaria o centro, si existen estas funciones. |
| R12 | **Documents > Files > File Cabinet > SuiteScripts** | Subir scripts y activos propios a la carpeta de práctica. |
| R13 | **Customization > Scripting > Scripts > New** | Registrar archivos User Event y Suitelet. |
| R14 | **Customization > Scripting > Script Deployments** | Revisar deployments y Execution Log. |
| R15 | **Lists > Search > Saved Searches > New > Transaction** | Ampliación: buscar movimientos para Late 2. |
| R16 | **Setup > Company > Enable Features** | Comprobar Advanced PDF/HTML Templates y Client/Server SuiteScript en SuiteCloud; anotar SuiteTax, OneWorld y Locations cuando apliquen. |
| R17 | **Lists > Accounting > Items > New** | Crear un artículo Service for Sale de práctica si aún falta. |

**Tres pantallas diferentes:** R04 configura la pantalla de captura; R05 configura el PDF; R02 contiene los valores de una factura concreta. En R04, **Tabs > Show** muestra pestañas; **Screen Fields > Show** muestra campos; **Sublist Fields > Show** muestra columnas. Mostrar un campo ayuda a revisarlo, pero su acceso desde el PDF se comprueba imprimiendo. [Oracle: campos en pantalla](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2856992.html).

<a id="paso-1"></a>

## 1. Identificar campos y registrar los faltantes

**Objetivo:** terminar con una lista de datos, su significado, ubicación e ID real. En esta etapa investigas; aún no construyes las tres plantillas ni implementas scripts.

### 1.1. Preparar la factura y conservar el avance

1. En R02, abre la Invoice con la que ya imprimiste. Anota su número y el ID interno: el parámetro `id=` de la URL de la factura guardada permite identificarlo. El ID interno no es `tranid`.
2. Anota el nombre del formulario que aparece en **Custom Form**. Si necesitas verlo, entra en Edit y revisa ese campo; registra cualquier cambio deliberado antes de guardar.
3. En R04, localiza ese mismo formulario. Conserva **Advanced** y registra el valor actual de **Print Template** para poder restaurarlo. Mantén tu formulario de práctica sin **Form Is Preferred**.
4. Usa la copia `PRAC JJ - Diagnóstico Invoice` para investigar. Tu archivo `preactice-jj-invoice-standart` ya contiene referencias útiles; no lo sustituyas por Late 1.
5. En R16 verifica las funciones disponibles; anota moneda e impuestos que realmente usa tu factura. No actives SuiteTax ni cambies la configuración fiscal solo para obtener los números del PDF.
6. Si faltan registros de prueba: crea Customer en R03, artículo de servicio en R17 e Invoice en R02. Usa el formulario de práctica, una descripción ficticia y los campos obligatorios de tu cuenta. Guarda y registra subtotal, impuesto y total calculados por NetSuite.

### 1.2. Cómo buscar un campo, con el ejemplo que ya completaste

**En el registro:**

1. Activa Show Internal IDs en R01 y guarda.
2. En R02 localiza la etiqueta del dato, por ejemplo **Date**. Haz clic en la etiqueta para abrir la ayuda y anota su Field ID cuando se muestre.
3. Si está oculto, revisa R04 > tu formulario > Screen Fields. Busca la etiqueta en las distintas secciones y habilita Show para la práctica. Para artículos revisa Sublist Fields.
4. En Customer, Centro o Contrato realiza la misma comprobación en el registro correspondiente. Distingue el ID del campo del ID interno del registro que estás abriendo.

**En la plantilla:**

1. Ve a R05 y abre Edit de `PRAC JJ - Diagnóstico Invoice`.
2. Con Source Code desactivado, abre **New Element > Fields**. Busca primero por etiqueta (`Invoice #`, `Date`, `Bill To`) y, si lo admite el buscador, por ID (`tranid`).
3. Anota el grupo y el ID exacto. En tu captura: **Record (`record`) > Invoice # > `tranid`**.
4. Cierra Fields y activa **Source Code**, arriba a la derecha. Busca `tranid` en el código. Puedes copiar el XML a tu editor local para buscar con Ctrl+F.
5. Ya encontraste `<span class="number">#${record.tranid}</span>`: `record` es la Invoice y `tranid` su número. `#` es texto fijo. `${record.tranid@label}` sería la etiqueta, no el valor.
6. Solo si falta la referencia en el diseño: vuelve al modo visual, coloca el cursor en un bloque de texto, abre Fields, deja Include Label desmarcado, selecciona el campo y cierra Fields. Vuelve a Source Code y localiza lo insertado. Si estás trabajando en XML propio, añade la expresión directamente en ese XML; evita alternar repetidamente editores durante el diseño final.
7. Guarda. En R04 asigna temporalmente la plantilla de diagnóstico al **Print Template de tu formulario de práctica**, si aún no está asignada. No cambies Email Template.
8. Abre esa Invoice guardada en View y pulsa **Print**. Compara el valor con el registro y anota el resultado.

**No repitas estos ocho pasos para `tranid`: ya lo comprobaste.** Reutiliza lo aprendido con los demás datos. Si el campo ya está en la plantilla, basta localizarlo y comprobar su valor. El código de barras que usa `value="${record.tranid}"` reutiliza el mismo campo.

El selector informa de campos imprimibles; algunas relaciones pueden probarse manualmente aunque no aparezcan. La vista Preview puede usar datos de muestra: no prueba que una Invoice específica esté bien mapeada. [Oracle: Fields](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_163732036124.html), [IDs y acceso manual](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_163585848784.html), [Preview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4351543215.html).

### 1.3. Estados del inventario y qué hacer con cada resultado

Registra **existencia** y **acceso al PDF** por separado. Encontrar un campo no significa que esté lleno ni que la plantilla pueda acceder a él.

| Estado | Cuándo anotarlo | Acción siguiente |
|---|---|---|
| CONFIRMADO | ID localizado, significado correcto y valor impreso igual al guardado. | Usarlo en el XML de esa Late. |
| ENCONTRADO, FALTA IMPRIMIR | Existe y tiene valor; todavía no probaste la expresión. | Probar en diagnóstico o en el paso 2. |
| VACÍO | Existe, pero la Invoice o registro relacionado no tiene valor. | Completar el registro ficticio y repetir. No crear duplicado. |
| NO ENCONTRADO | Revisaste los registros y listas indicados, sin hallar un campo adecuado. | Escribir dónde buscaste y el campo propuesto; crear en el paso 3 de esa Late. |
| PENDIENTE DE ACCESO | Existe en otro registro o faltan permisos; no está comprobada la ruta de impresión. | Registrar relación/permisos; probar acceso o script en el paso 3. |
| FIJO / ACTIVO | Texto del diseño, código de documento o imagen. | Registrar constante o archivo; no buscar un campo de Invoice para cada frase. |
| APLAZADO L2 / L3 | Dato exclusivo de una Late posterior. | Investigar cuando llegues a su paso, sin frenar Late 1. |

**Si un campo no sale en Fields:** revisa etiqueta/ID, Invoice/Customer, listas R06-R09, funciones y permisos. Anota el recorrido. No declares que no existe solo por no verlo en Fields. Tampoco inventes relaciones como `record.contrato.centro.telefono`: cada tramo necesita un campo de relación real y una prueba.

### 1.4. Inventario común extraído de las cinco páginas

**Uso:** empieza con estas filas para Late 1. La columna «Si falta» es una propuesta para el paso 3, no un campo ya creado. `P1/P2` significa página. En Late 3 P1 se reutilizan destinatario, empresa, contrato y banco, pero su cabecera y pie son distintos.

| Clave | Dato visible / dónde aparece | Dónde buscar y palabras útiles | Primer origen / decisión si falta |
|---|---|---|---|
| C01 | Nº factura: L1 P1/P2, L2 P1, L3 P2 | R02 / R05: Invoice # | `record.tranid`. CONFIRMADO por tu prueba. No reemplazarlo por el número del PDF original. |
| C02 | Fecha de cabecera: L1 P1/P2, L2 P1, L3 P2 | R02 / R05: Date | `record.trandate`. Para la práctica la cabecera usa fecha de Invoice; la fecha propia del aviso se registra separada cuando corresponda. |
| C03 | Destinatario: todos | R02: Billing; R03: nombre; R05: Billing Addressee / Customer | Probar `record.billaddressee` y `record.entity`. Usar el destinatario de facturación; evitar imprimir nombre/código del Customer y luego repetir el nombre dentro de billaddress. |
| C04 | Calle, número y complemento: todos | R02: Billing; R05: Bill To / Billing Address | `record.billaddress` como bloque, o `billaddr1`, `billaddr2`, `billaddr3` para reproducir líneas. Usar la dirección guardada en Invoice. |
| C05 | Ciudad, código postal, provincia y país: todos | R05: City / Zip / State / Country | Probar `billcity`, `billzip`, `billstate`, `billcountry`, o conservarlos en `billaddress`. Anotar formato y saltos. |
| C06 | CIF/NIF del cliente: L1 P1/P2, L2 P1, L3 P2 | R02/R03: Tax / Tax Reg. Number; R07: NIF, CIF, VAT, RFC | Probar `record.entitytaxregnum` si aplica. Si no hay dato fiscal adecuado, proponer `custentity_prac_late_nif`; documentar si debe copiarse históricamente a Invoice. |
| C07 | Centro: L1 P1/P2, L2 P1, L3 P2 | R02/R11: Location; R06/R09: Centro / Center / Site | `record.location` solo si significa centro. Si no, Centro relacionado con Contrato. No asumir que una subsidiaria es el centro. |
| C08 | Nº contrato: L1 P1, L2 P1, L3 P1 | R06/R09: Contrato / Contract / Agreement | Localizar vínculo y número real. `otherrefnum` en el diagnóstico es PO #, no contrato por defecto. Alternativa: Contrato de práctica, 3.2. |
| C09 | Forma de pago: L1 P1/P2, L2 P1, L3 P2 | R02/R05: Payment Method / Terms; R06: forma / método | Revisar significado. `terms` puede decir «30 días», que no equivale a «Por transferencia». Alternativa: `custbody_prac_late_forma_pago`. |
| C10 | Nombre del banco: L1 P1, L2 P1, L3 P1 | Centro/empresa existentes; R09 Fields | Si falta, `custrecord_prac_late_banco` en Centro. |
| C11 | Número de cuenta: L1 P1, L2 P1, L3 P1 | Centro/empresa existentes; R09 Fields | Si falta, `custrecord_prac_late_cuenta` (texto ficticio; conserva ceros y guiones). No reutilizar `record.account` como cuenta bancaria de pago. |
| C12 | Titular bancario: L1 P1, L2 P1, L3 P1 | Centro/empresa existentes | Si falta, `custrecord_prac_late_titular`. Confirmar si coincide con el emisor; no darlo por supuesto. |
| C13 | Teléfono del centro: L1 P1, L2 P1 | R11 / Centro de R09: Phone / Teléfono | Si falta, `custrecord_prac_late_tel`. Es distinto al teléfono corporativo del pie. |
| C14 | Email del centro: L1 P1, L2 P1 | R11 / Centro de R09: Email | Si falta, `custrecord_prac_late_email`. Es distinto al email jurídico de L3. |
| C15 | Razón social emisora: pies L1/L2/L3 P2 y texto L3 P1 | R10/R11; R05 grupos Company Information / Subsidiary | Copiar la expresión real del selector; tu XML usa `companyInformation.companyName`. Alternativa de práctica: `custrecord_prac_late_emisor` en Centro. |
| C16 | CIF de empresa: mismos pies | R10/R11: Tax ID / Tax Registration | Expresión comprobada de empresa/subsidiaria; si falta, `custrecord_prac_late_cif` en Centro. No usar el NIF del cliente. |
| C17 | Registro mercantil: tomo, folio, hoja e inscripción | R10/R11; campos propios | Para la práctica puede ser un texto compuesto: `custrecord_prac_late_registro` en Centro. No derivarlo de otro ID fiscal. |
| C18 | Domicilio social: pies corporativos | R10/R11: Address | Comprobar dirección corporativa; alternativa `custrecord_prac_late_domicilio`. No usar billaddress del cliente. |
| C19 | Sitio web y teléfono corporativo: pies | R10/R11: Web Site / Phone | Dos valores: `custrecord_prac_late_web` y `custrecord_prac_late_tel_corp` si faltan. |
| C20 | Logo, lema superior y lema del pie: L1/L2/L3 P2 | R10/R11: Logo; R12: archivo | Tu XML usa `companyInformation.logoUrl`; verificar activo. Lemas pueden ser textos fijos de demostración. Registrar cada archivo, origen y dimensiones. |

**Consulta de candidatos:** [Oracle: referencia de Invoice con SuiteTax](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/SBADVTemplates_85934086.html). Es una referencia dependiente de funciones; no confirma tu cuenta. Mantén las mayúsculas exactas de los alias que funcionan: no cambies `companyInformation` a otro nombre por copiar una tabla de documentación.

### 1.5. Inventario de la página de factura: Late 1 P2 y Late 3 P2

| Clave | Dato / observación del PDF | Buscar en | Candidato y decisión |
|---|---|---|---|
| F01 | Vencimiento de la fila | R02/R05: Due Date; revisar columnas | Probar `record.duedate`. Solo repetirlo por línea si todas vencen ese día; si existe vencimiento por línea, mapear su ID real. |
| F02 | Nº cuarto: 428 en L1, 3206 en L3 | R06/R08/R09: Box / Room / Cuarto | Para esta práctica hay un box por Invoice: guardarlo en Contrato. Si varía por línea, usar `custcol_prac_late_box` en vez de repetir un valor de cabecera. |
| F03 | Descripción de servicios | R02: Items; R05: Item > Description | `record.item`, dentro del bucle `linea.description`. L1 es recargo; L3 es coste de envío. |
| F04 | Cantidad: columna visible, celda vacía en los dos ejemplos | R02: Items > Quantity | `linea.quantity`. Usar la cantidad real de la factura de práctica; registrar la diferencia visual, sin deducir cantidad cero del original. |
| F05 | Precio unitario | R02: Items > Rate | `linea.rate`. El ejemplo usa 10,59 en L1 y 54,00 en L3. Son referencias visuales. |
| F06 | Total por línea | R02: Items > Amount | `linea.amount`. No confundirlo con el total de factura con impuestos. |
| F07 | Base imponible e importe de IVA | R02: totales y Tax Details si aplica | Probar `record.subtotal`, `record.taxtotal`; confirmar descuentos/cargos y base real. No llamar base imponible a subtotal sin revisar la factura. |
| F08 | Porcentaje/etiqueta de IVA y total factura | R02: impuestos; R05: Tax / Tax Details / Total | `record.total`; tasa según campos reales de líneas o `taxdetails`. El `record.taxrate` del XML estándar es candidato, no garantía. Con varias tasas, mostrar desglose; no fijar «21 %» para cualquier Invoice. |

### 1.6. Elementos exclusivos de cada diseño

Identifícalos ahora; desarrolla solo los de Late 1. Las cifras de ejemplo sirven para reconocer un bloque, no para acreditar que ese valor vive en NetSuite.

| Clave | Diseño y dato | Cómo tratarlo |
|---|---|---|
| L1-01 | Título «AVISO DE PAGO Nº 1» | Texto fijo en L1 P1. |
| L1-02 | Párrafo de recargo, mínimo, plazo y restricción de acceso | Texto de demostración con la misma jerarquía. No generar cargos ni reglas operativas desde el XML. |
| L1-03 | Texto de contacto | Insertar C13/C14 dentro del párrafo; banco C10-C12 en su bloque centrado. |
| L1-04 | Saludo, despedida y «Gracias por su confianza» | Textos fijos; el último va en P2. |
| L1-05 | Código inferior | P1: `LEG.LC1.SM.SP.20260114`; P2: `LEG.LC.SM.SP.20260114`. Constantes distintas por página. |
| L2-01 | Fecha del aviso | Candidato `custbody_prac_late_fecha_aviso`; decidir si C02 en L2 representa esta fecha o fecha de Invoice y documentarlo. |
| L2-02 | Título nº 2 y párrafos propios | Texto fijo de demostración; incluye referencias a 18 días y un posible coste de 65,34 €. Ese coste anunciado no es el total actual ni un cargo creado por imprimir. |
| L2-03 | Fecha de cada movimiento | Registro Movimiento de práctica o fuente real verificada; no es siempre trandate de la Invoice abierta. |
| L2-04 | Tipo: Factura / Recargo | Tipo del movimiento; no usar el tipo de artículo como sustituto. |
| L2-05 | Descripción, incluido periodo de servicio | Texto del movimiento; si se divide en fechas de periodo, registrar los campos de inicio/fin reales. |
| L2-06 | Dos columnas tituladas «€» | Para la práctica se definen como Cargo y Abono; el original no confirma esa semántica. Documentar esta decisión. |
| L2-07 | Saldo por fila | El original muestra 72,01 y 13,31, no 72,01 y 85,32: no es acumulado entre esas dos filas. En la práctica usar saldo individual = cargo - abono de cada movimiento. |
| L2-08 | Fecha de corte del saldo final | `custbody_prac_late_fecha_corte`, separada de fecha del aviso y vencimiento. |
| L2-09 | Saldo pendiente/(a favor) final | Suma conciliada de los saldos individuales de la fuente elegida. No tomar automáticamente `record.balance` de una sola factura. |
| L2-10 | Código inferior | Constante `LEG.LC2.SM.SP.20260114`. |
| L3-01 | Imagen jurídica y título | Archivo propio/autorizado y texto fijo; no reutilizar cabecera azul en P1. |
| L3-02 | Ciudad y fecha larga de la carta | `custbody_prac_late_lugar_aviso` + `custbody_prac_late_fecha_aviso`; formatear en español. No usar la fecha actual en cada impresión. |
| L3-03 | Empresa representada y nº contrato | Reutilizar C15/C08, con sus valores confirmados. |
| L3-04 | Deuda reclamada | Saldo del caso preparado fuera del XML; es distinto del total de la factura de burofax. Ver paso 6. |
| L3-05 | Banco, cuenta y titular en carta | Reutilizar C10-C12; comprobar formato de cuenta. |
| L3-06 | Firma manuscrita y cargo del firmante | Imagen de firma ficticia/autorizada y texto fijo «Responsable de Asesoría Jurídica». |
| L3-07 | Dirección y email jurídicos | Textos de demostración identificados o campos separados si deben variar. No usar el email del centro sin verificar. |
| L3-08 | Plazos, cláusula y párrafos de carta | Contenido fijo de demostración; no inferir efectos reales de esos textos. |
| L3-09 | Página de factura de burofax | C01-C07/C09 y F01-F08 con la Invoice de burofax; no reutilizar los importes del recargo L1. |
| L3-10 | Códigos inferiores | P1: `LEG.LC3.SM.SP.20260114`; P2: `LEG.LC.SM.SP.20260114`. |

**Diferencias de las referencias que deben quedar documentadas:** L1 anuncia mínimo 11 € + IVA, pero su factura tiene base 10,59 €, IVA 2,22 € y total 12,81 €. L2 muestra aviso 14/02/2026 y corte 09/04/2026. L3 reclama 150,66 € y adjunta factura de 65,34 €; 85,32 + 65,34 coincide con la deuda, pero esa suma no prueba una regla contable. Los bancos de L2/L3 también presentan guiones distintos. Conserva la estructura visual y usa datos coherentes de tu caso de prueba.

### 1.7. Cuaderno que debes rellenar

En tu futura carpeta `../late-invoice/`, crea manualmente `MAPEO_CAMPOS.md` y copia una ficha por cada clave aplicable. Para C04/C05, F07/F08 y otras filas con varios valores, separa una ficha por campo real. Los elementos fijos también necesitan una decisión, aunque no tengan ID.

```text
Clave / Late / página:
Dato y significado:
Etiqueta en NetSuite:
Registro donde vive:
ID real del campo y tipo:
Registro de prueba (ID interno):
Ruta de pantalla donde lo encontré:
¿En Fields?: sí / no / no aplica
Expresión XML o ruta prevista de script:
Valor guardado:
Valor impreso / PDF de evidencia:
Estado:
Si falta: dónde busqué, qué crearé o qué relación resolveré:
¿Dato histórico al guardar o actualizado al imprimir?:
```

**Comprobación para avanzar al paso 2:**

- [ ] C01-C20, F01-F08 y L1-01 a L1-05 tienen una decisión; no hay filas ignoradas.
- [ ] Número, fecha, destinatario/dirección, línea e importes están encontrados o tienen una incidencia concreta registrada.
- [ ] Los faltantes tienen nombre, ubicación prevista y mensaje que se mostrará; todavía no es obligatorio crearlos.
- [ ] L2/L3 tienen identificados sus datos exclusivos, marcados APLAZADO cuando corresponda.

<a id="paso-2"></a>

## 2. Construir únicamente el XML de Late 1

**Entrada:** inventario de Late 1. **Salida:** dos páginas iniciales con datos directos y avisos visibles donde falten datos. Aquí comienzas el diseño propio.

### 2.1. Crear la plantilla y su copia local

1. Crea manualmente `practice/late-invoice/late1.xml` en tu proyecto. Mantén intacto el XML de diagnóstico.
2. En R05 usa **New Template**, si tu cuenta ofrece elección de tipo **Invoice**. Si no aparece esa opción, usa **Customize** sobre Standard Invoice: guardarás una plantilla propia de ese tipo.
3. En **Template Setup** asigna título `PRAC JJ - Late 1`. Asigna también un Script ID propio, por ejemplo `custtmpl_prac_jj_late1`; si no se puede editar en ese diálogo, guarda primero la copia y usa **Change ID** en su página de configuración. Si la interfaz añade el prefijo, escribe solo el sufijo; copia el ID completo guardado, respetando mayúsculas/minúsculas, a tu bitácora. No la marques Preferred. [Oracle: cambiar ID de plantilla](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1515580300.html).
4. Activa Source Code. Sustituye el contenido de esta nueva plantilla por el XML mínimo de abajo y guarda el mismo contenido en `late1.xml`.
5. En R04 asigna temporalmente `PRAC JJ - Late 1` a Print Template de tu formulario de práctica. Abre la Invoice elegida y pulsa Print. Debe salir el título y su número. La plantilla de diagnóstico deja de ser la seleccionada para esta prueba.
6. Conserva el valor anterior de Print Template. Al pasar a los botones propios en 3.6/4, restáuralo; los tres botones no requieren cambiar Print Template cada vez.

Una plantilla registrada en R05 y un archivo XML son cosas distintas. Subir `late1.xml` al File Cabinet no lo registra como Advanced Template. [Oracle: formulario y plantilla](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2863334.html).

### 2.2. XML inicial y mensajes de faltantes

Este ejemplo inicia Late 1; no es su réplica terminada. Las frases `[PENDIENTE ...]` deben verse durante el desarrollo para que no confundas ausencia de datos con un diseño correcto.

```xml
<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <link name="NotoSans" type="font" subtype="truetype"
          src="${nsfont.NotoSans_Regular}"
          src-bold="${nsfont.NotoSans_Bold}" bytes="2" />
    <style type="text/css">
        body { font-family: NotoSans, sans-serif; font-size: 10pt; }
        .pendiente { color: #b42318; }
    </style>
</head>
<body size="A4" padding="15mm">
    <h1>AVISO DE PAGO Nº 1</h1>
    <p>Nº factura:
        <#if (record.tranid)?has_content>
            ${record.tranid}
        <#else>
            <span class="pendiente">[VACÍO O NO DISPONIBLE: C01 tranid]</span>
        </#if>
    </p>
    <p>Fecha:
        <#if (record.trandate)?has_content>
            ${record.trandate}
        <#else>
            <span class="pendiente">[VACÍO O NO DISPONIBLE: C02 fecha]</span>
        </#if>
    </p>
    <p class="pendiente">[PENDIENTE C08: número de contrato]</p>
    <p class="pendiente">[PENDIENTE C10-C12: banco, cuenta y titular]</p>
    <p class="pendiente">[PENDIENTE C13-C14: contacto del centro]</p>
    <p>Contenido del aviso de demostración por desarrollar.</p>
    <pbr />
    <h1>Factura</h1>
    <p class="pendiente">[PENDIENTE: cabecera, líneas y totales de página 2]</p>
</body>
</pdf>
```

Los paréntesis en `(record.campo)?has_content` ayudan a comprobar una ruta que puede faltar. La plantilla no distingue por sí sola «campo inexistente» de «campo vacío»; tu cuaderno sí debe distinguirlos. Evita usar únicamente `!''` para esconder todos los faltantes durante esta fase.

Para un campo aún no creado escribe primero un marcador literal. Cuando lo crees, reemplázalo por su expresión y una condición. Si la prueba necesita acceder a `EXTRA`, utiliza el patrón de 3.7 para que Preview y Print nativo no fallen.

### 2.3. Construir los bloques en este orden

Después de cada bloque: copia XML local a Source Code, guarda, imprime la Invoice real de práctica y anota el resultado. Un bloque terminado no exige que estén resueltos todos los marcadores del siguiente.

| Orden | Bloque | Datos / comprobación |
|---|---|---|
| 1 | Franja azul, logo y lema P1 | C20. Ancho, márgenes y proporciones como referencia. Archivo propio si no tienes el logo utilizable. |
| 2 | Fecha/número a la izquierda; destinatario a la derecha | C01-C06. Dirección larga sin solapar; evitar duplicar el destinatario. |
| 3 | Centro, contrato y forma de pago | C07-C09. Marcadores donde el inventario indique faltantes. |
| 4 | Título y cuerpo del aviso | L1-01/L1-02; C10-C14 dentro de banco y contacto. Conservar saltos, negritas y espacio de despedida. |
| 5 | Pie de P1 | C15-C20 y código L1-05 de P1. Separar teléfono corporativo del teléfono del centro. |
| 6 | Salto explícito y cabecera P2 | `<pbr />`; reutilizar C01-C07/C09. El modelo P2 no muestra Nº contrato en ese bloque. |
| 7 | Tabla de factura | F01-F06; columnas Vencimiento, Nº cuarto, Descripción, Cantidad, Precio unitario, Total. |
| 8 | Resumen, agradecimiento y pie de P2 | F07/F08, L1-04 y código de P2. Base/IVA/total deben coincidir con la Invoice usada. |

Usa tablas y estilos sencillos compatibles con BFO. Para el pie puedes definir macros y reservar espacio suficiente; el código de documento de P1 y P2 debe poder cambiar. No copies el código de barras del diagnóstico: no aparece en estos PDFs. [Oracle: estructura XML/BFO](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4454208098.html).

### 2.4. Probar las líneas sin confundir cabecera y sublista

Dentro de `<body>`, en el lugar de la tabla, inicia con este bloque; después agrega las columnas restantes de F01-F06:

```xml
<#if (record.item)?has_content>
    <table style="width: 100%;">
        <thead><tr><th>Descripción</th><th>Importe</th></tr></thead>
        <#list record.item as linea>
            <tr>
                <td>
                    <#if (linea.description)?has_content>
                        ${linea.description}
                    <#else>
                        [VACÍO: descripción de línea]
                    </#if>
                </td>
                <td>${linea.amount!'[NO DISPONIBLE: importe]'}</td>
            </tr>
        </#list>
    </table>
<#else>
    <p class="pendiente">[PENDIENTE: líneas de factura]</p>
</#if>
```

`record.item` es la lista; `linea` representa cada fila. `linea.amount` no equivale a `record.total`. Para texto nuevo entregado por scripts establece una única estrategia de escape XML (por ejemplo `?xml` sobre texto plano cuando no haya autoescape); no escapes dos veces ni conviertas sin revisar el formato de `billaddress`. Prueba `&`, `<`, comillas y acentos en el paso 4.

**Comprobación del paso 2:** obtienes dos páginas reconocibles de Late 1; los campos encontrados muestran valores y cada dato pendiente tiene un marcador identificable. Aún no elimines marcadores sin resolverlos.

<a id="paso-3"></a>

## 3. Resolver los campos faltantes y las relaciones de Late 1

**Entrada:** marcadores del paso 2 y fichas del inventario. **Salida:** cada marcador tiene un origen válido o una ausencia aceptada y explicada. Trabaja solo con los faltantes de Late 1.

### 3.1. Elegir una solución por dato

| Situación encontrada | Solución que aplicarás |
|---|---|
| El campo existe en Invoice y está vacío | Completarlo en la Invoice ficticia; no crear otro campo. |
| Existe y se imprime directamente | Conservar la expresión comprobada. |
| Falta un valor propio de toda la factura | Crear un Transaction Body Field y usar `record.custbody_...`. |
| Falta un dato del Customer | Crear Entity Field solo si no hay uno adecuado. Probar relación directa; decidir si necesita una copia histórica. |
| El dato pertenece a cada línea | Crear Transaction Line Field y usar `linea.custcol_...` dentro del bucle. |
| Existe en Contrato/Centro y la relación funciona en FreeMarker | Registrar la expresión comprobada y usarla. No introducir un script solo por asumir que la relación es profunda. |
| Existe en Contrato/Centro pero la relación no funciona, o necesitas congelarlo al guardar | User Event que lee los registros y guarda una foto JSON; Suitelet que la convierte en `EXTRA`. Sigue 3.4-3.7. |
| Falta el registro donde debería vivir | Crear Centro/Contrato de práctica según 3.2 y relacionarlos. |

**Ruta guiada para relaciones que necesiten script:** guardar foto de Contrato/Centro con User Event y leerla al imprimir. Esto evita alternar entre varias arquitecturas mientras aprendes. La consulta dinámica al imprimir queda como ampliación posterior, no como una segunda implementación obligatoria.

### 3.2. Crear Centro y Contrato, únicamente si faltan

Cadena de práctica: **Invoice → Contrato → Centro**. Un contrato y un box por Invoice. Los registros existentes de tu cuenta tienen prioridad si cumplen ese significado y tienes permisos.

**A. Crear el tipo Centro**

1. Ve a **Customization > Lists, Records, & Fields > Record Types > New** (R09).
2. Name: `PRAC JJ - Centro`. ID final propuesto: `customrecord_prac_late_centro`. Conserva **Include Name Field**: Name será el nombre del centro.
3. Configura acceso para tu rol de práctica en los permisos del tipo; guarda. No es necesario un acceso público.
4. Reabre el tipo y usa **Fields > New Field** para cada campo de la tabla que realmente falte. En cada campo anota Label, ID y Type; activa Store Value para estos datos capturados.
5. Guarda cada campo. Regresa a la lista de tipos y usa **List > New** o **New Record** para crear una instancia, por ejemplo `Centro Demo JJ`.
6. Rellena sus valores ficticios. Crear la definición del campo no llena automáticamente los registros.

| Label propuesto | ID final en Centro | Tipo | Clave de salida si usas JSON/EXTRA |
|---|---|---|---|
| Nombre del centro | `name` (campo del tipo) | Texto | `centro.nombre` |
| Teléfono del centro | `custrecord_prac_late_tel` | Free-Form Text | `centro.telefono` |
| Email del centro | `custrecord_prac_late_email` | Email Address | `centro.email` |
| Banco de demostración | `custrecord_prac_late_banco` | Free-Form Text | `centro.banco` |
| Cuenta de demostración | `custrecord_prac_late_cuenta` | Free-Form Text | `centro.cuenta` |
| Titular de la cuenta | `custrecord_prac_late_titular` | Free-Form Text | `centro.titular` |
| Razón social emisora | `custrecord_prac_late_emisor` | Free-Form Text | `centro.emisor` |
| CIF del emisor | `custrecord_prac_late_cif` | Free-Form Text | `centro.cif` |
| Registro mercantil | `custrecord_prac_late_registro` | Text Area | `centro.registroMercantil` |
| Domicilio social | `custrecord_prac_late_domicilio` | Text Area | `centro.domicilio` |
| Sitio web corporativo | `custrecord_prac_late_web` | Hyperlink | `centro.web` |
| Teléfono corporativo | `custrecord_prac_late_tel_corp` | Free-Form Text | `centro.telefonoEmpresa` |

Los campos corporativos en Centro son una simplificación didáctica si tu cuenta no ofrece una fuente utilizable. Si usas Company/Subsidiary, documenta ese origen y no crees duplicados para los mismos valores. Logo, lema e imágenes se documentan como activos/constantes; no exigen nuevos campos por sí mismos.

**B. Crear el tipo Contrato**

1. Repite R09 > New. Name: `PRAC JJ - Contrato`. ID final propuesto: `customrecord_prac_late_contrato`. Conserva Name para una etiqueta legible.
2. Guarda y crea estos campos en Fields > New Field:

| Label | ID final | Tipo / List-Record | Salida |
|---|---|---|---|
| Número de contrato | `custrecord_prac_late_numero` | Free-Form Text | `contrato.numero` |
| Box / cuarto | `custrecord_prac_late_box` | Free-Form Text | `contrato.box` |
| Cliente | `custrecord_prac_late_cliente` | List/Record → Customer | `customerId` para validación |
| Centro | `custrecord_prac_late_centro` | List/Record → PRAC JJ - Centro | `centroId` para lectura |

3. En la lista del tipo, usa New Record. Name: `Contrato Demo JJ`; número: `DEMO-JJ-001`; box: `DEMO-428`. Selecciona tu Customer real de prueba y el Centro creado. Guarda y anota sus IDs internos.
4. La etiqueta Name del Contrato y su número pueden ser distintos: imprimir el texto de una referencia List/Record no garantiza obtener el número comercial. Por eso se comprueba `custrecord_prac_late_numero`.

Si no puedes ver el tipo o una instancia, revisa sus permisos y tu rol antes de crear otro. [Oracle: crear tipo](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1501860307.html), [añadir campos a un tipo](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1033645.html).

### 3.3. Crear campos de Invoice, Customer o línea

**Procedimiento para un campo de cabecera:**

1. En **Customization > Lists, Records, & Fields > Transaction Body Fields** busca primero por Label/ID. Si existe, revisa tipo, aplicación y permisos.
2. Si falta, pulsa New y completa Label, ID, Type y List/Record cuando corresponda.
3. En **Applies To**, selecciona la opción que aplica a ventas/Invoice en tu cuenta; habitualmente **Sale** agrupa varios documentos de venta. No supongas que eso restringe el campo exclusivamente a Invoice.
4. Activa **Store Value** para los campos de esta tabla. En Display elige una subpestaña visible, por ejemplo Custom; deja Display Type normal durante las pruebas y no lo hagas obligatorio globalmente.
5. Guarda. Si aparece **Apply to Forms** o **Save & Apply to Forms**, úsalo para revisar tu formulario. En R04 > tu formulario > Screen Fields > Custom (o la sección elegida) comprueba Show.
6. Regresa a tu Invoice, entra en Edit, llena el campo y guarda. Vuelve a Fields de la plantilla y prueba la expresión.

NetSuite añade prefijos a los IDs de personalizaciones. Introduce el sufijo si el prefijo ya aparece en la pantalla y verifica el **ID final guardado**; no crees accidentalmente `custbody_custbody_...`. Si el ID propuesto está ocupado por un campo distinto, elige otro y actualiza todas sus referencias.

| Cuándo | Label | ID final propuesto | Tipo / dato de prueba |
|---|---|---|---|
| Ahora, para scripts y botones | Habilitar práctica Late | `custbody_prac_late_habilitar` | Check Box, desmarcado por defecto; marcar solo Invoice de práctica. |
| Ahora, si creaste/usas Contrato | Contrato de práctica | `custbody_prac_late_contrato` | List/Record → tipo Contrato; seleccionar `Contrato Demo JJ`. |
| Ahora, si falta C09 | Forma de pago de práctica | `custbody_prac_late_forma_pago` | Free-Form Text; `Por transferencia`. |
| Ahora, si usarás 3.4 | Foto de datos Late | `custbody_prac_late_json` | Long Text; lo llena el User Event. |
| Al llegar a L2/L3 | Fecha de aviso | `custbody_prac_late_fecha_aviso` | Date; fecha elegida para ese aviso. |
| Al llegar a L2 | Fecha de corte | `custbody_prac_late_fecha_corte` | Date; límite de movimientos incluidos. |
| Al llegar a L3 | Lugar del aviso | `custbody_prac_late_lugar_aviso` | Free-Form Text; `Ciudad Demo`. |

**NIF del cliente, solo si falta C06:** R07 > New; Label `NIF de práctica`, ID final `custentity_prac_late_nif`, Type Free-Form Text, Applies To **Customer**, Store Value activado. Guarda; abre tu Customer en R03, captura un identificador ficticio y guarda. Prueba la relación `record.entity.custentity_prac_late_nif` sin asumir que funciona. Si necesitas conservar el valor histórico o falla el acceso, inclúyelo como `cliente.nif` en la foto de 3.4.

**Box por línea, solo si tu escenario realmente tiene varios:** R08 > New; ID final `custcol_prac_late_box`, Type Free-Form Text, aplicación a líneas de ventas que corresponda; guarda y revisa R04 > Sublist Fields. Llena cada línea y prueba `linea.custcol_prac_late_box`. Para un solo box por Invoice mantén el del Contrato.

[Oracle: campos de cabecera](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2828059.html), [campos de entidad](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2827562.html), [campos de línea](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2828307.html).

**Prueba antes de escribir un script:** llena Contrato/Centro, selecciona el Contrato en Invoice, guarda y prueba las relaciones que tu cuenta exponga. Documenta las que funcionan. Para el tramo que no puedas leer, sigue 3.4. No hace falta crear copia de cada dato en Invoice si ya tienes una ruta válida.

### 3.4. User Event: obtener datos de niveles superiores y guardar una foto

Implementa manualmente `prac_late_snapshot_ue.js`, SuiteScript 2.1 de tipo UserEventScript. No contiene lógica de presentación. Para esta ruta la foto se actualiza al guardar Invoice; cambiar Centro por separado no cambia PDFs hasta guardar de nuevo la Invoice.

**Lista de implementación, en orden:**

1. Expón `beforeSubmit`. Procesa CREATE y EDIT de Invoice con `custbody_prac_late_habilitar` activo; no implementes XEDIT en esta primera versión, porque puede entregar un registro parcial.
2. Lee Customer e ID del Contrato con `context.newRecord.getValue`. Una referencia List/Record devuelve un ID; `getText` devuelve su etiqueta. Usa el ID para cargar el registro.
3. Si falta el Contrato requerido, muestra un error claro y no conserves silenciosamente una foto anterior.
4. Carga Contrato con `N/record.load`, usando el tipo y los IDs reales del cuaderno.
5. Compara su Customer con el de Invoice, normalizando ambos IDs a texto. Si difieren, detén el guardado de esa Invoice de práctica con un mensaje que identifique el problema.
6. Lee el ID del Centro desde Contrato y cárgalo. Obtén solo los campos necesarios de las tablas anteriores. Agrega NIF del Customer si elegiste una copia histórica.
7. Construye un objeto con versión, IDs de relación y textos. Serializa con `JSON.stringify`; guarda el resultado con `newRecord.setValue` en `custbody_prac_late_json`. No llames `save()` a la misma Invoice desde beforeSubmit.
8. Maneja registros faltantes/permisos con un mensaje claro; revisa Execution Log en R14. No registres todo el JSON en logs si luego usas datos sensibles.

**Contrato de datos de ejemplo, con IDs ilustrativos que debes sustituir:**

```json
{
  "version": 1,
  "customerId": "123",
  "contratoId": "456",
  "centroId": "789",
  "cliente": { "nif": "DEMO-NIF" },
  "contrato": { "numero": "DEMO-JJ-001", "box": "DEMO-428" },
  "centro": {
    "nombre": "Centro Demo JJ",
    "telefono": "000 000 000",
    "email": "centro@example.invalid",
    "banco": "Banco Demo",
    "cuenta": "CUENTA-DEMO-0001",
    "titular": "Empresa Demo S.L.",
    "emisor": "Empresa Demo S.L.",
    "cif": "CIF-DEMO",
    "registroMercantil": "Registro mercantil de demostración",
    "domicilio": "Calle Demo 1, Ciudad Demo",
    "web": "https://example.invalid",
    "telefonoEmpresa": "000 111 000"
  }
}
```

Incluye únicamente los valores que hayas decidido obtener por esta ruta. En CREATE, la Invoice puede no tener ID interno aún: **no exijas `invoiceId` dentro de esta foto**. El Suitelet recibe el ID de la Invoice ya guardada y valida sus relaciones. En cada guardado reemplaza la foto completa para que un campo vaciado no conserve su valor anterior.

**Prueba de actualización (ejecutar después de completar 3.7):** guarda Invoice y copia el teléfono impreso; cambia el teléfono del Centro; vuelve a imprimir sin guardar Invoice y comprueba que sigue el anterior; edita/guarda Invoice y vuelve a imprimir: ahora debe aparecer el nuevo. Anota que esta conducta es deliberada.

### 3.5. Subir y registrar el User Event

1. En R12 crea/abre tu carpeta `SuiteScripts/practica_JJ/templates/practice/late-invoice` y sube `prac_late_snapshot_ue.js` con Add File.
2. Ve a R13, selecciona ese archivo y pulsa Create Script Record cuando aparezca. Asigna nombre `PRAC JJ - Foto Late` e ID propio; guarda.
3. Usa **Deploy Script** desde el registro o crea su deployment en R14. **Applies To: Invoice**, Deployed activo y Status **Testing**. Revisa audiencia/rol de prueba según lo disponible en el deployment.
4. Prueba con el propietario del script durante Testing. No despliegues también el Client Script de botones como un script global de transacción: se conectará por ruta en 3.6.
5. Abre la Invoice ficticia, activa el checkbox, selecciona Contrato y guarda. Abre el campo JSON para comprobar que contiene una foto válida.
6. Si no se llena: comprueba archivo seleccionado, anotaciones `@NApiVersion 2.1` y `@NScriptType UserEventScript`, exportación de `beforeSubmit`, deployment, checkbox y Execution Log. No continúes con el renderizador hasta que la foto exista.

### 3.6. Suitelet y primer botón: imprimir Late 1 con datos adicionales

Un User Event obtiene/guarda datos; el **Suitelet** responde a la solicitud de impresión. El **Client Script** abre su URL al pulsar el botón. El objeto `EXTRA` lo entrega el Suitelet al renderizador; no aparece automáticamente por existir un campo JSON.

```text
Guardar Invoice → User Event beforeSubmit → foto JSON de Contrato/Centro
Invoice en View → Imprimir Late 1 → Client Script → Suitelet
Suitelet → Invoice como record + JSON.parse(foto) como EXTRA → PDF
```

Implementa estos archivos uno por uno; prueba el Suitelet antes de agregar el botón:

**A. `prac_late_pdf_sl.js` - Suitelet**

1. Recibe `invoiceId` y `variant`. En esta etapa acepta solo `late1`. Valida ID entero positivo y variante; no aceptes una ruta de archivo o plantilla arbitraria de la URL.
2. Carga la Invoice con `N/record`. Comprueba permisos del usuario y el checkbox de práctica. Para los ensayos iniciales puedes restringir también a los IDs ficticios anotados en tu configuración.
3. Si el mapa usa foto, lee `custbody_prac_late_json`, ejecuta `JSON.parse` dentro de manejo de errores y valida versión, estructura, Customer y Contrato contra la Invoice. Si falta foto, pide guardar de nuevo la factura; no construyas un PDF aparentemente completo con datos antiguos o de otro cliente.
4. Crea el renderizador con `N/render.create()` y selecciona el ID real de `PRAC JJ - Late 1` mediante `setTemplateByScriptId`. Mantén una tabla permitida de variante → plantilla en el código/configuración.
5. Usa `addRecord({ templateName: 'record', record: invoiceRecord })` para vincular Invoice. Si usas foto, añade el objeto con `addCustomDataSource({ format: render.DataSource.OBJECT, alias: 'EXTRA', data: foto })`.
6. Si los campos corporativos funcionaban en Print nativo mediante modelos como `companyInformation`, comprueba de nuevo su disponibilidad: un renderizador manual no debe asumir que recibe todos los modelos de la impresión nativa. Carga la fuente real con script y pásala por `EXTRA` o añade el modelo requerido. Registra el cambio de expresión en el mapa.
7. Genera con `renderAsPdf()` y escribe el archivo en la respuesta con `response.writeFile`, en línea. La impresión no debe modificar la Invoice.
8. Súbelo a R12, regístralo en R13 y crea deployment de tipo Suitelet en Testing, disponible solo internamente y sin Available Without Login. Usa la URL interna del deployment para probar, agregando `invoiceId=<ID_REAL>&variant=late1` con `&` si la URL ya tiene parámetros.

**B. `prac_late_buttons_cs.js` - Client Script**

1. Expón una función `imprimirLate1` y el punto de entrada necesario del Client Script (por ejemplo `pageInit` vacío).
2. Obtén el ID de Invoice guardada mediante `N/currentRecord`.
3. Construye la URL interna con `N/url.resolveScript`, scriptId y deploymentId reales del Suitelet, y parámetros `invoiceId`/`variant: 'late1'`. Abre una pestaña con esa URL; si el navegador bloquea ventanas, permite la apertura para la cuenta de práctica.
4. Sube el archivo junto al User Event de botones. El nombre de la función exportada debe coincidir exactamente con el que llama el botón.

**C. `prac_late_buttons_ue.js` - User Event de botones**

1. Expón `beforeLoad` y agrega el botón únicamente en VIEW, en Invoice guardada y con checkbox activo. No agregar en CREATE, EDIT ni PRINT.
2. Asigna `form.clientScriptModulePath = './prac_late_buttons_cs.js'` si ambos archivos están en la misma carpeta.
3. Agrega ID `custpage_prac_late1`, label `Imprimir Late 1`, functionName `imprimirLate1`.
4. Sube/registra/despliega en Invoice como en 3.5. Este deployment es distinto al de la foto; ambos tienen responsabilidades separadas.
5. Abre View de tu Invoice, pulsa el botón y compara con la URL interna probada. Luego restaura el Print Template original de tu formulario de práctica, según 1.1: el botón selecciona su propia plantilla.

[Oracle: datos adicionales y alias](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4508822143.html), [N/render](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4412042824.html), [botón y Client Script](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0417121954.html).

### 3.7. Cambiar marcadores por los datos resueltos

Si creaste Forma de pago en Invoice, sustituye su marcador por una condición sobre `(record.custbody_prac_late_forma_pago)?has_content` y muestra `${record.custbody_prac_late_forma_pago}` cuando tenga valor.

Si el dato llega en la foto, usa su alias explícito. Ejemplo para el teléfono del Centro, suponiendo texto plano y sin autoescape configurado:

```xml
<#if (EXTRA.centro.telefono)?has_content>
    <p>Teléfono del centro: ${EXTRA.centro.telefono?xml}</p>
<#else>
    <p class="pendiente">[PENDIENTE C13: teléfono del centro / datos EXTRA]</p>
</#if>
```

Aplica el mismo patrón a contrato, box, banco, cuenta, titular y pie. Si tu plantilla usa autoescape XML, conserva una sola estrategia y evita `?xml` duplicado. Preview y Print nativo pueden mostrar el marcador porque no reciben `EXTRA`; **la prueba integral ahora se hace con Imprimir Late 1**.

No interpretes JSON en el XML con `?eval`. La ruta guiada es `JSON.parse` en SuiteScript + objeto `EXTRA`. El laboratorio de `?eval` de la versión anterior queda como ampliación aislada y no bloquea las siete etapas de esta guía.

**Comprobación del paso 3:**

- [ ] Campos nuevos guardados, llenados y probados; IDs reales en el mapa.
- [ ] Existe una ruta comprobada para Contrato/Centro cuando esos datos aplican.
- [ ] Foto y su actualización probadas si elegiste esa ruta.
- [ ] Primer botón abre el PDF con Invoice correcta y datos adicionales.
- [ ] Marcadores de Late 1 resueltos o ausencias explícitas justificadas; sin campos vacíos ocultos para aparentar completitud.

<a id="paso-4"></a>

## 4. Verificar y cerrar Late 1 antes de empezar Late 2

### 4.1. Comparar datos

1. Abre tu Invoice de recargo en R02 y su PDF mediante **Imprimir Late 1**.
2. Abre Customer, Contrato y Centro en otras pestañas cuando sean las fuentes usadas.
3. Recorre cada ficha C/F/L1: compara registro origen, valor de la foto si aplica y valor impreso. Anota archivo de evidencia y resultado.
4. Verifica que la página 2 muestra las líneas de esa Invoice de recargo. Si tu primera Invoice era solo un ensayo genérico, crea ahora una de recargo ficticio, habilítala y úsala como evidencia final de L1.
5. Revisa base, tasa/etiqueta de impuesto, impuesto y total. Si la cuenta produce valores diferentes a 10,59 / 2,22 / 12,81, documenta la diferencia y conserva los valores del registro.

### 4.2. Comparar diseño

Pon original y réplica al mismo porcentaje de zoom. Revisa una página a la vez:

- [ ] Exactamente dos páginas en el caso de referencia.
- [ ] Cabecera azul, logo y lema con proporciones semejantes.
- [ ] Fecha/número a la izquierda; destinatario/NIF a la derecha.
- [ ] Centro/contrato/pago y título ubicados como en P1 del original.
- [ ] Párrafos, negritas, bloque bancario y despedida conservan su jerarquía.
- [ ] P2 tiene las seis columnas de factura; totales alineados a la derecha.
- [ ] Pie corporativo en ambas páginas, código correcto por página y sin código de barras heredado.
- [ ] No hay cortes, solapamientos, fuentes diminutas para forzar espacio ni una tercera página vacía.
- [ ] No quedan `[PENDIENTE ...]` en los datos obligatorios del caso completo. Una ausencia aceptada dice qué falta y queda documentada.

### 4.3. Pruebas de variación

1. Crea una segunda Invoice ficticia o cambia un dato de prueba de forma controlada: el número y los importes del PDF deben cambiar; eso detecta valores escritos a mano.
2. Prueba dirección larga, NIF vacío, descripción con `&`, `<`, comillas, acentos y moneda de tu cuenta. El XML debe seguir siendo válido.
3. Prueba dos líneas y una descripción larga. El caso base debe seguir en dos páginas; para más contenido documenta una continuación legible en vez de recortarlo.
4. Si usas foto, realiza el ensayo de actualización de 3.4. Si usas relación directa, documenta que puede reflejar cambios actuales del registro relacionado.
5. Guarda el PDF aceptado en `late-invoice/evidencias/late1-validado.pdf` y copia el XML definitivo desde Source Code a `late1.xml`.

**Cierre:** marca Late 1 aceptada en la bitácora. Hasta entonces no copies el diseño para desarrollar Late 2.

<a id="paso-5"></a>

## 5. Desarrollar y verificar Late 2

**Entrada:** Late 1 aceptada. Reutiliza sus fuentes y bloques comunes; desarrolla ahora L2-01 a L2-10. Late 2 tiene una sola página con aviso y extracto; no agregues la página de factura de Late 1.

### 5.1. Completar el mapeo propio de Late 2

1. En `MAPEO_CAMPOS.md`, cambia APLAZADO L2 por el estado real de cada fila L2.
2. Revisa en la Invoice de prueba fecha de aviso y fecha de corte. Crea los campos de 3.3 en R06 si faltan, muéstralos en tu formulario y captura fechas coherentes.
3. Para este caso guiado, la fecha de cabecera de L2 será la **fecha de aviso**; registra que su expresión difiere de la fecha de factura C02 usada en L1. La fecha del saldo final será **fecha de corte**.
4. Define Customer, Contrato, moneda y fecha de corte del extracto. La Invoice abierta sirve de contexto, pero sus `record.item` no representan la lista de facturas/abonos del cliente.
5. Elige la fuente de movimientos indicada en 5.3. Anota su significado y las columnas de salida antes de editar la tabla.

### 5.2. Crear `late2.xml` y validar primero la presentación

1. Crea una segunda plantilla de tipo Invoice en R05 como en 2.1: título `PRAC JJ - Late 2`, ID propuesto `custtmpl_prac_jj_late2`; guarda una copia local `late2.xml`.
2. Reutiliza de L1 la franja azul, destinatario, centro, contrato, pago y pie. Sustituye el título, párrafos y código inferior por los de L2.
3. Reserva espacio al final de la misma página para **Extracto de cuenta**: Fecha, Tipo, Descripción, Cargo, Abono y Saldo. Si mantienes los encabezados «€» del original, explica su significado Cargo/Abono en el README.
4. En el Suitelet añade variante permitida `late2` con el ID real de su plantilla. Para una prueba de presentación, entrega dos movimientos ficticios fijos desde script y marca esa salida como «datos de demostración».
5. En esta prueba usa cargos 72,01 y 13,31, abonos 0 y saldo final 85,32. Son datos de ensayo; no los declares extraídos de transacciones hasta conectar y comprobar una fuente.
6. En XML recorre `<#list EXTRA.movimientos as movimiento>` dentro de una condición que controle lista ausente/vacía. Presenta fechas e importes con un formato uniforme.
7. Si no hay `EXTRA` muestra `[PENDIENTE L2: datos del extracto]`. Si la consulta funciona pero devuelve cero filas, muestra `Sin movimientos para el alcance y corte seleccionados`, diferenciándolo de un error de búsqueda.

**Contrato de salida del Suitelet:**

```text
EXTRA.movimientos[]:
  idOrigen, fechaTexto, tipo, descripcion, cargo, abono, saldo
EXTRA.extracto:
  fechaCorteTexto, moneda, saldoFinal
```

`cargo`, `abono`, `saldo` y `saldoFinal` son números; el formato monetario se aplica después. Para evitar errores de redondeo al sumar en JavaScript, trabaja en centavos para las monedas de dos decimales usadas en este ensayo. No sumes cadenas como "72,01 €". La lista se agrega al objeto EXTRA conservando Contrato/Centro; no se reemplaza toda la foto por los movimientos.

### 5.3. Crear una fuente persistente de movimientos de práctica

Para esta primera réplica manual usa **registros de movimientos ficticios**. Esto permite comprobar fuente → búsqueda → PDF sin añadir todavía la complejidad de aplicaciones históricas de pagos. No presentes estos registros como el estado de cuenta contable real de NetSuite.

1. En R09 > New crea `PRAC JJ - Movimiento Late`, ID final `customrecord_prac_late_mov`, con Name y acceso a tu rol.
2. Guarda y agrega los campos siguientes mediante Fields > New Field, como en 3.2:

| Campo | ID final propuesto | Tipo / uso |
|---|---|---|
| Cliente | `custrecord_plm_cliente` | List/Record → Customer. |
| Contrato | `custrecord_plm_contrato` | List/Record → tu tipo Contrato. |
| Moneda | `custrecord_plm_moneda` | List/Record → Currency, según disponibilidad de tu cuenta; si no está disponible, usa texto ISO controlado y valida contra la moneda de Invoice. Documenta la opción elegida. |
| Fecha | `custrecord_plm_fecha` | Date, fecha del movimiento. |
| Tipo | `custrecord_plm_tipo` | Free-Form Text: Factura, Recargo o Abono en este ensayo. |
| Descripción | `custrecord_plm_descripcion` | Text Area. Incluye el periodo del servicio si aplica. |
| Cargo | `custrecord_plm_cargo` | Currency, valor no negativo. |
| Abono | `custrecord_plm_abono` | Currency, valor no negativo. |
| Factura de origen | `custrecord_plm_factura` | List/Record → Transaction; seleccionar Invoice cuando el movimiento procede de una y validar su tipo/cliente en script. Vacío para un movimiento puramente simulado. |

3. En List > New crea dos registros del mismo Customer/Contrato/moneda: un cargo 72,01 y otro 13,31, con fechas anteriores o iguales al corte. Pon Name único para poder identificarlos.
4. Si quieres simular un pago, crea **otro movimiento** Abono con su fecha y cargo cero. No edites retroactivamente una fila antigua para introducir un pago posterior al corte.
5. En el Suitelet consulta `customrecord_prac_late_mov` con `N/search`: filtra registros activos, Customer, Contrato, moneda y fecha hasta el corte inclusive. Para filtros de fecha usa el formato admitido por la cuenta/API; no supongas que una cadena ISO se acepta en todos los filtros.
6. Ordena por fecha y, como segundo criterio, ID interno. Conserva el ID de origen de cada fila para rastrearla. Recorre todos los resultados necesarios; evita un límite silencioso que omita movimientos.
7. Por fila calcula `saldo = cargo - abono`; calcula `saldoFinal = suma de saldos`. En esta fuente cada fila es un movimiento elemental y no hay saldo acumulado por fila. El corte incluye el conjunto completo de movimientos ficticios del caso; si agregas un periodo inicial, define también su saldo de apertura.
8. Sustituye la lista fija de 5.2 por los resultados. Cambia un importe en un registro de prueba y confirma que el PDF refleja el cambio. El extracto se consulta al imprimir; la foto de Contrato/Centro sigue su regla al guardar.
9. Comprueba manualmente las dos filas y 85,32 en el caso base. Agrega un abono de 10,00 y comprueba 75,32. Agrega otro abono posterior al corte y comprueba que no entra hasta cambiar la fecha de corte.

**Ampliación posterior, si eliges transacciones reales de prueba:** en R15 crea una búsqueda Transaction, filtra Customer/moneda/fechas/tipos y define Main Line para evitar duplicar importes por líneas. Define expresamente si usarás cargos/pagos como movimientos o saldos pendientes por documento, cómo se aplican créditos y qué ocurre al corte. El saldo pendiente actual no demuestra el saldo histórico. No sumes pagos por separado y a la vez los saldos ya reducidos por esos mismos pagos. Esta ampliación requiere su propia conciliación y no bloquea la réplica con registros ficticios.

### 5.4. Agregar el segundo botón y comprobar

1. En el Client Script agrega `imprimirLate2`, que envía `variant: 'late2'` al mismo Suitelet.
2. En el User Event de botones agrega `custpage_prac_late2`, label `Imprimir Late 2`, functionName `imprimirLate2`, bajo las mismas condiciones VIEW/Invoice/checkbox.
3. Actualiza los archivos en R12. Revisa que los registros de script siguen apuntando a esos archivos y recarga la Invoice.
4. Imprime L2; comprueba cabecera, fecha de aviso, banco, contacto, texto, tabla, corte y pie. Concílialo con los registros de movimiento de 5.3.
5. El caso base de dos filas debe caber en **una página**, sin reducir el texto hasta hacerlo ilegible. Prueba más filas y define una continuación con encabezados repetidos; documenta que ese caso excede la página del modelo.
6. Cambia de Customer/Contrato en una segunda Invoice ficticia y confirma que no se mezclan movimientos. Rechaza o separa monedas distintas; no sumes EUR y otra moneda en el mismo saldo.
7. Vuelve a imprimir Late 1 para comprobar que ampliar el Suitelet no la rompió.

**Cierre:** guarda `late2.xml` y `evidencias/late2-validado.pdf`. Marca el mapa L2 completo, su fuente declarada y su saldo conciliado antes de empezar Late 3.

<a id="paso-6"></a>

## 6. Desarrollar y verificar Late 3

**Entrada:** Late 1 y Late 2 aceptadas. **Salida:** carta jurídica de demostración y factura de burofax, dos páginas.

### 6.1. Completar el mapeo y preparar el caso

1. Revisa L3-01 a L3-10. Reutiliza los campos comunes confirmados; registra qué dato aparece en la carta y cuál pertenece a la factura adjunta.
2. Crea, si faltan, fecha y lugar del aviso de 3.3. La carta usará esos valores; su fecha no se obtiene del reloj del servidor.
3. En R17 crea un artículo de servicio de prueba para coste de envío si hace falta. En R02 crea una **Invoice ficticia de burofax**, con el mismo Customer/Contrato del caso que vas a comparar.
4. Su página de factura imprimirá esa Invoice. El ejemplo tiene base 54,00, impuesto 11,34 y total 65,34; usa la configuración y el total real de tu cuenta, y documenta cualquier diferencia.
5. Sube imagen jurídica y firma de demostración a R12. Anota ID/ruta/URL de cada activo y comprueba que el motor PDF puede leerlo con el contexto de impresión; no supongas que una URL visible en el navegador es accesible al renderizador.
6. Define nombre/cargo del firmante, dirección y email jurídicos como constantes de demostración en esta primera versión. Si deben variar, crea campos separados en el registro apropiado y agrega su origen al mapa; no reutilices el contacto del centro por comodidad.

### 6.2. Definir la deuda de la carta sin duplicar la factura

En la ruta con movimientos ficticios de 5.3, usa esta regla explícita para el caso de aprendizaje:

```text
Deuda de la carta = saldo previo del caso al corte + total de Invoice de burofax
```

1. Calcula el saldo previo para el Customer/Contrato/moneda del caso, con el corte registrado. Para esta versión la fecha de corte no debe ser posterior a la fecha del aviso.
2. **Excluye del saldo previo los movimientos cuyo campo Factura de origen sea la Invoice de burofax actual.** Si decides que esa factura ya está incluida en la fuente, no la sumes otra vez: cambia y documenta la regla.
3. Valida también los movimientos simulados sin referencia a factura: ninguno debe representar otra vez el cargo de burofax que vas a sumar.
4. Lee `total` de la Invoice actual; conserva la misma moneda del saldo previo. Si no coincide, muestra error de moneda en vez de sumar.
5. Entrega `EXTRA.caso.saldoPrevio`, `EXTRA.caso.totalBurofax` y `EXTRA.caso.deuda`. Registra IDs de movimientos incluidos y excluidos en la evidencia del caso.
6. El ejemplo 85,32 + 65,34 = 150,66 solo debe resultar si tus fuentes de prueba contienen esos valores. Con otros importes, el PDF debe cambiar.

Esta es una regla definida para el ensayo; el PDF original por sí solo no acredita cómo se calculó su deuda. No sustituyas la deuda por `record.total` ni por `record.balance` sin demostrar que representan el mismo conjunto de cargos y abonos.

### 6.3. Construir `late3.xml`

1. En R05 crea una tercera plantilla Invoice como en 2.1: título `PRAC JJ - Late 3`, ID propuesto `custtmpl_prac_jj_late3`. Guarda copia local `late3.xml`.
2. P1: imagen jurídica a la izquierda y título; destinatario; lugar/fecha en español; cuerpo de carta; empresa, deuda y contrato; banco y titular; despedida, firma, cargo y pie jurídico. Usa marcadores en los datos que aún falten.
3. Usa `custbody_prac_late_fecha_aviso` para obtener la fecha y formatearla de manera explícita para el texto largo. Si el script prepara `EXTRA.aviso.fechaTexto`, documenta que deriva de ese campo; no parsees a ciegas una fecha presentada según otro idioma.
4. P1 usa el código `LEG.LC3.SM.SP.20260114` y pie jurídico. P2 usa el pie corporativo y código `LEG.LC.SM.SP.20260114`; evita que una macro global duplique el mismo pie en ambas páginas.
5. Inserta `<pbr />`. Reutiliza de L1 la estructura de factura de P2, conectada a **la Invoice actual de burofax**, con su descripción, box, vencimiento, cantidades e importes.
6. En Suitelet agrega variante `late3`, su plantilla y los datos de 6.2. Conserva los datos necesarios de `EXTRA` para banco/contrato/pie y usa condiciones para campos ausentes.
7. En el Client Script agrega `imprimirLate3`. En el User Event agrega `custpage_prac_late3`, label `Imprimir Late 3`, con las mismas condiciones de los otros botones. Sube los archivos actualizados a R12.

### 6.4. Comprobar Late 3

- [ ] Dos páginas en el caso base; carta completa en P1 y factura completa en P2.
- [ ] Imagen, firma, destinatario, negritas, párrafos y pie jurídico semejantes al modelo.
- [ ] Fecha de carta proviene del campo acordado y se reproduce igual al volver a imprimir.
- [ ] Empresa/contrato/banco pertenecen al mismo caso y no a una foto de otro cliente.
- [ ] Deuda de P1 coincide con la conciliación de 6.2; total de P2 coincide con Invoice.
- [ ] No se cuenta dos veces el burofax; se prueba tanto con movimiento vinculado presente como ausente.
- [ ] Un cambio de importe o un abono modifica la deuda según la fuente/corte elegidos.
- [ ] No quedan marcadores de datos obligatorios en el caso completo ni texto recortado.
- [ ] L1 y L2 siguen imprimiendo después de ampliar los scripts.

**Cierre:** guarda `late3.xml` y `evidencias/late3-validado.pdf`; completa las fichas L3.

<a id="paso-7"></a>

## 7. Prueba conjunta y README de lo desarrollado

### 7.1. Archivos finales que crearás durante la práctica

Esta guía no genera los scripts ni las réplicas por ti. Debes escribirlos y configurarlos manualmente para aprender. Guarda el trabajo en la carpeta hermana `practice/late-invoice/`:

```text
late-invoice/
├── README.md
├── MAPEO_CAMPOS.md
├── late1.xml
├── late2.xml
├── late3.xml
├── prac_late_snapshot_ue.js     (si utilizas foto de relaciones)
├── prac_late_buttons_ue.js
├── prac_late_buttons_cs.js
├── prac_late_pdf_sl.js
└── evidencias/
    ├── late1-validado.pdf
    ├── late2-validado.pdf
    ├── late3-validado.pdf
    └── pruebas.md
```

### 7.2. Matriz de aceptación

Rellena Resultado y Evidencia en `evidencias/pruebas.md`. «Pendiente» no equivale a aprobado. Para las pruebas de error conserva captura o mensaje exacto; para las visuales conserva el PDF.

| ID | Prueba | Resultado esperado |
|---|---|---|
| A01 | L1 con Invoice de recargo | Dos páginas y datos coincidentes con sus fuentes. |
| A02 | L2 con dos movimientos base | Una página, filas rastreables y saldo 85,32 si las fuentes son 72,01 + 13,31. |
| A03 | L2 con abono y corte | Suma correcta; movimiento posterior al corte excluido. |
| A04 | L3 con Invoice de burofax | Carta y factura; deuda del caso separada del total de Invoice. |
| A05 | L3 con burofax ya referenciado en movimientos | No se duplica al calcular la deuda. |
| A06 | Tres botones en una Invoice habilitada y guardada | Cada botón selecciona su plantilla correcta. Esta prueba valida la selección; para validar el contenido de recargo/burofax usa las Invoices de sus respectivos casos. |
| A07 | Invoice sin checkbox, en Edit o Create | No aparecen los botones de práctica. |
| A08 | URL con ID inválido, registro no permitido o variante desconocida | Suitelet rechaza con mensaje claro; no permite seleccionar una plantilla arbitraria. |
| A09 | Customer de Contrato distinto de Customer de Invoice | Error claro; no mezcla destinatario y datos ajenos. |
| A10 | Falta Contrato/Centro requerido | Mensaje de configuración faltante; no PDF engañosamente completo. |
| A11 | Foto JSON vacía, malformada o versión incompatible | Si se usa foto, error comprensible y procedimiento de regeneración; no `?eval` en la ruta final. |
| A12 | Cambiar Centro sin guardar Invoice; después guardar | Si se usa foto, conserva valor anterior hasta regenerar; si acceso directo, documenta comportamiento observado. |
| A13 | NIF/dirección vacíos; textos largos; caracteres especiales | Ausencias controladas; XML válido y texto legible. |
| A14 | Monedas diferentes | No se suman como una sola deuda. |
| A15 | Extracto vacío | Mensaje explícito y saldo conforme a la regla; no se confunde con fallo de búsqueda. |
| A16 | Más líneas de las del ejemplo | Continuación legible; ninguna fila desaparece por ajuste de página. |
| A17 | Impresión repetida sin cambios de fuentes | Valores reproducibles y ninguna modificación de la Invoice por imprimir. |
| A18 | Tres PDFs frente a los originales | Cabeceras, pies, columnas, códigos y saltos revisados página por página. Diferencias justificadas. |
| A19 | Configuración final | Print Template restaurado tras diagnóstico; Email Template conservado; deployments de práctica en Testing y URLs internas. |

### 7.3. Contenido obligatorio del README final

No copies el ticket como si fuera un informe de trabajo terminado. El README debe explicar lo que **realmente hiciste** y enlazar las evidencias. Puedes comenzar con esta estructura:

```markdown
# Réplica Late 1, Late 2 y Late 3

## Objetivo y alcance
Qué replica cada plantilla, cuántas páginas tiene y qué usa datos ficticios.

## Entorno de prueba
Cuenta de práctica sin credenciales, rol, idioma, moneda y funciones relevantes.

## Registros y configuración
IDs de Customer, Invoices, formulario, Contrato/Centro y movimientos usados.
Tabla de títulos/IDs de plantillas, scripts y deployments.

## Mapeo de campos
Enlace a MAPEO_CAMPOS.md; origen, ID, tipo, expresión y evidencia por dato.
Campos encontrados, creados, descartados y ausencias aceptadas.

## Cómo llegan los datos al PDF
Directos de Invoice, relaciones, foto JSON y datos consultados al imprimir.
Qué cambia al guardar y qué cambia al imprimir; alias record y EXTRA.

## Implementación por plantilla
Late 1: aviso y factura de recargo.
Late 2: fuente de movimientos, signos, corte, moneda y conciliación.
Late 3: carta, deuda de caso y factura de burofax; prevención de duplicados.

## Cómo reproducir las impresiones
Qué Invoice abrir, qué campos llenar, cuándo guardar y qué botón pulsar.

## Pruebas y resultados
Enlace a evidencias/pruebas.md y a los tres PDFs validados.

## Diferencias respecto a los originales
Datos ficticios, impuestos, cantidad vacía del modelo, fechas, activos y diseño.

## Limitaciones y pendientes
Solo las que permanezcan; distinguir limitación aceptada de prueba fallida.
```

En el mapa final agrega una tabla resumida por campo:

| Clave | Late/página | Registro e ID real | Tipo | Expresión final | Valor de prueba | Evidencia | Histórico/actual |
|---|---|---|---|---|---|---|---|
| C01 | L1 P1/P2, L2 P1, L3 P2 | Invoice / tranid | Texto | `${record.tranid}` | Completar con valor propio | PDF correspondiente | Invoice guardada |

### 7.4. Bitácora de avance

| Punto | Estado actual / resultado propio |
|---|---|
| Invoice y formulario de práctica | Existen según el usuario; anotar IDs y nombre final del formulario. |
| Diagnóstico: `tranid` en Fields/XML/PDF | Confirmado por el usuario. Falta registrar número/ID concreto y archivo de evidencia. |
| Otras filas del inventario | Pendientes de verificación en la cuenta. |
| Nombre/ID de plantilla de diagnóstico | Nombre observado: PRAC JJ - Diagnóstico Invoice. ID pendiente. |
| Formulario y Print Template antes del ensayo | Pendiente de anotar. |
| Late 1 - pasos 2, 3 y 4 | Pendientes. |
| Late 2 - paso 5 | Pendiente; no iniciar desarrollo antes de aceptar Late 1. |
| Late 3 - paso 6 | Pendiente; no iniciar desarrollo antes de aceptar Late 2. |
| Pruebas, mapa final y README | Pendientes. |

**La práctica termina cuando:** los tres PDFs reproducen sus diseños con datos rastreables; los tres botones funcionan; las pruebas aplicables están aprobadas; y otra persona puede repetir el resultado leyendo el README y el mapa sin depender de este chat.

## Ayuda rápida: qué revisar si te atoras

| Síntoma | Revisión concreta |
|---|---|
| No veo un campo en la factura | Confirma Custom Form y Screen Fields/Show; si es custom, revisa Applies To, Display y Access en su definición. |
| Veo un campo en pantalla pero no en Fields | Anota su ID, verifica registro y relación; prueba expresión admitida. No crees duplicado todavía. |
| Se imprime la etiqueta en vez del valor | Revisa si usaste `@label`. |
| Sale otro diseño al pulsar Print | Revisa el Custom Form de esa Invoice y su Print Template. |
| Preview muestra números o textos de ejemplo | Imprime la Invoice guardada para comprobar valores reales. |
| Print nativo no muestra EXTRA | Usa el botón/Suitelet; EXTRA solo existe cuando el script lo agrega. |
| El botón no aparece | View + Invoice guardada + checkbox + deployment Testing/propietario + beforeLoad exportado. |
| El botón aparece pero no abre | Nombre de función exportada, clientScriptModulePath, IDs del Suitelet/deployment y ventanas emergentes. |
| JSON vacío | Guardar Invoice después de desplegar el User Event; revisar checkbox, relaciones y Execution Log. |
| JSON conserva un valor viejo | Verifica si guardaste Invoice después de cambiar Centro; esta ruta es una foto al guardar. |
| L2 tiene importes duplicados | Revisa filas de origen, filtros y si mezclaste saldos netos con pagos contados otra vez. |
| L3 tiene deuda demasiado alta | Revisa si el burofax ya estaba incluido antes de sumarlo. |
| Error XML al imprimir | Revisar primera línea/DOCTYPE, etiquetas cerradas, atributos entre comillas y escape de texto/URLs con `&`. |
| Campo checkbox falla tras ocultarlo | Comprueba el tipo entregado a FreeMarker; algunos campos de sublista cambian su representación al ocultarlos. |
| PDF tiene página extra | Revisar alturas de cabecera/pie, tablas demasiado altas, padding y saltos. Corregir el bloque que desborda. |

## Referencias y límites de la verificación

Fuentes usadas para las instrucciones de NetSuite (consulta: 1 de octubre de 2026):

- [Campos del selector](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_163732036124.html) y [referencias manuales](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_163585848784.html).
- [Campos candidatos de Invoice con SuiteTax](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/SBADVTemplates_85934086.html) y [sintaxis de campos y relaciones](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2864199.html).
- [Configuración de campos de pantalla](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2856992.html), [plantillas asignadas a formularios](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2863334.html) y [campos ocultos en FreeMarker](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156752233995.html).
- [Edición XML/BFO](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4454208098.html) y [datos de Preview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4351543215.html).
- [Campos de cabecera](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2828059.html), [entidad](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2827562.html) y [línea](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2828307.html).
- [Crear tipos de registro](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1501860307.html), [añadir campos](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1033645.html) y [crear instancias](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_0923092841.html).
- [N/render](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4412042824.html), [fuentes adicionales](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4508822143.html) y [User Event con botón y Client Script](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0417121954.html).
- [Ejemplo de registro de script en la interfaz](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_1112112278.html).

**Revisión realizada al reescribir el ticket:** lectura del ticket anterior, inspección del XML de diagnóstico y revisión textual/visual de las cinco páginas de los tres PDFs originales. El inventario describe los datos observados y propone fuentes para comprobar. No se crearon campos, registros, plantillas ni scripts en tu cuenta, ni se ejecutaron pruebas de NetSuite. Esas son las actividades manuales de esta guía.
