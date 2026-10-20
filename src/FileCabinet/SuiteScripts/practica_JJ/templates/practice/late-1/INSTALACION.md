# Late 1 en Invoice

## Resultado y estado

Al consultar una Invoice guardada aparece **Late 1**. El botón lee su **Custom Form** y busca la **última Invoice creada con ese mismo formulario**, ordenando por fecha de creación y, en caso de empate, por ID interno. El PDF contiene el aviso y el detalle de esa última factura, aunque se abra el botón desde una factura anterior. No hay un ID de factura fijo en el código.

Se conserva la estructura del original: A4, franja azul, destinatario a la derecha, título centrado, carta, firma y pie de empresa. El formulario personalizado existente se identifica desde la factura; no se encontró su ID en los README locales.

Los archivos están preparados para carga manual. Falta ejecutar y revisar visualmente el PDF en NetSuite: la comprobación local no sustituye al motor FreeMarker/BFO de la cuenta. Una factura con muchas líneas puede ocupar páginas adicionales.

El original incluye una factura de recargo. Esta versión imprime los conceptos e importes de la última Invoice del formulario. La carta muestra un recargo informativo del 10% del saldo vencido, mínimo 11 EUR, sin sumarlo a la factura. El impuesto del recargo queda sin calcular mientras no se configure una tasa. El botón no contabiliza recargos, no bloquea accesos, no guarda cambios y no envía correos.

## 1. Datos confirmados

El usuario confirmó:

- Empresa: Café de Finca; se priorizan los datos reales de empresa/subsidiaria en NetSuite y se usa este nombre si falta el nombre en el registro.
- Mantener las dos páginas y usar la última Invoice del formulario de la práctica.
- Moneda esperada: EUR. La Invoice debe estar creada en euros; el script verifica su moneda real y no convierte ni cambia sus importes.
- Subsidiaria: leer la asignada en la factura resultante. Sin subsidiaria, leer Company Information.
- Banco, cuenta y titular: dejar vacíos cuando no existan. Los Field IDs de la fuente bancaria todavía no se conocen; el lector está preparado en `late1_config.js` para los campos de la empresa/subsidiaria. No se inventa una cuenta bancaria ni se toma una cuenta contable de ingresos como cuenta de pago.
- Contrato y número de cuarto: opcionales para la primera prueba.

No se necesitan credenciales, tokens ni Account ID para esta instalación manual.

## 2. Comprobar funciones y empresa

**Setup > Company > Enable Features > SuiteCloud**:

- `Server SuiteScript`: activado.
- `Advanced PDF/HTML Templates`: activado, en SuiteBuilder.

Para una cuenta sin subsidiarias: **Setup > Company > Company Information**. Revisar Company Name / Legal Name, Address y Company Logo (Forms).

Con OneWorld: **Setup > Company > Subsidiaries > abrir la subsidiaria de la Invoice**. Revisar Legal Name / Name, dirección, teléfono, correo y Logo (Forms). El código usa esa entidad; no toma los datos fiscales de otra subsidiaria.

## 3. Subir cuatro archivos

**Documents > Files > File Cabinet > SuiteScripts**. Crear o reutilizar, nivel por nivel:

`practica_JJ / templates / practice / late-1`

Subir aquí estos cuatro archivos, conservando exactamente sus nombres:

1. `late1_config.js`
2. `late1_template.xml`
3. `late1_pdf_sl.js`
4. `late1_button_ue.js`

Ruta final de la plantilla: `/SuiteScripts/practica_JJ/templates/practice/late-1/late1_template.xml`.

No subir esta guía como script. `late1_config.js` es un módulo auxiliar: no crear un Script Record para él. El XML se carga desde File Cabinet; no hace falta crear un registro en Advanced PDF/HTML Templates ni cambiar el Print Template de Invoice.

## 4. Registrar primero el Suitelet

**Customization > Scripting > Scripts > New**:

1. Script File: `late1_pdf_sl.js`.
2. Pulsar **Create Script Record**.
3. Name: `JJ Late 1 PDF`.
4. ID: escribir `_jj_late1_sl` después del prefijo automático `customscript`. ID final: `customscript_jj_late1_sl`.
5. Guardar y pulsar **Deploy Script** (o Save and Deploy).

En el deployment:

| Campo | Valor |
|---|---|
| Title | JJ Late 1 PDF |
| ID | `_jj_late1_sl`, final `customdeploy_jj_late1_sl` |
| Deployed | Marcado |
| Status | Testing para tu primera prueba, creando tú el registro |
| Log Level | Debug durante la prueba |
| Available Without Login | Desmarcado |
| Audience > Employees | Tu usuario, si necesitas definir audiencia |

Mantener la ejecución con los permisos del usuario actual; no ampliar permisos. Guardar. Enviar los IDs finales si NetSuite cambia alguno.

## 5. Registrar el User Event del botón

**Customization > Scripting > Scripts > New**:

1. Script File: `late1_button_ue.js`.
2. **Create Script Record**.
3. Name: `JJ Late 1 Invoice Button`.
4. ID: `_jj_late1_ue`, final `customscript_jj_late1_ue`.
5. Guardar y **Deploy Script**.

| Campo | Valor |
|---|---|
| Applies To | Invoice |
| ID | `_jj_late1_ue`, final `customdeploy_jj_late1_ue` |
| Deployed | Marcado |
| Status | Testing, creando tú el registro |
| Log Level | Debug durante la prueba |
| Event Type | View, si aparece; también puede quedar sin restringir |
| Context Filtering > Execution Context | User Interface |
| Audience > Employees | Tu usuario, si necesitas definir audiencia |

Guardar. No se necesita Client Script, workflow, botón manual en el formulario ni parámetros de script.

## 6. Probar

1. Abrir una factura con saldo pendiente en **Transactions > Sales > Create Invoices > List**, o usar su URL conocida.
2. Abrir en modo **View**, no Edit. Recargar después de desplegar.
3. Pulsar **Late 1** y permitir la nueva pestaña si el navegador la bloquea. Se busca la última Invoice con el mismo Custom Form.
4. Revisar el número de la factura elegida, empresa/subsidiaria, cliente, moneda, total, impuestos, saldo pendiente, dirección y ambas páginas.
5. Pasar el PDF o el mensaje exacto que aparezca para ajustar el diseño o corregir el error.

Una factura pagada muestra que no hay saldo pendiente y un recargo de cero. Una factura no vencida puede usarse para probar y tiene recargo cero. Si falta vencimiento o la moneda no es EUR, el recargo queda sin calcular. No se sustituye la última factura por una anterior pendiente de pago. La fecha de la carta es la fecha de generación; la segunda página muestra la fecha original de Invoice.

Si falta el botón, comprobar Applies To, Deployed, Testing/propietario, modo View y User Interface. Si aparece el aviso de configuración, revisar los IDs del Suitelet. Si falla el PDF, revisar **Customization > Scripting > Script Deployments > JJ Late 1 PDF > Execution Log**. Un error de archivo suele indicar una carpeta o nombre diferente.

## Campos y configuración

**Obligatorios nuevos: ninguno.** Se usan `tranid`, `trandate`, `duedate`, `entity`, `billaddress`, `location`, `currency`, `subtotal`, `taxtotal`, `total`, `amountremaining` y la sublista `item` de Invoice.

Valores opcionales de `late1_config.js`: banco/cuenta/titular o IDs de sus campos en empresa/subsidiaria, logo (ID de archivo), contacto y texto adicional. Los datos faltantes se dejan vacíos. Si se fijan datos bancarios o de empresa de una subsidiaria, completar también `subsidiaryId` para que no se usen en facturas de otra entidad. `lateFeeTaxPercent` queda en `null` hasta conocer la tasa aplicable; los impuestos reales de Invoice se imprimen sin recalcular.

Si realmente hacen falta campos nuevos después de la primera prueba:

| Dato | Ruta | Label / ID final | Type | Applies To |
|---|---|---|---|---|
| Contrato | Customization > Lists, Records, & Fields > Transaction Body Fields > New | Contrato Late 1 / `custbody_jj_late1_contract` | Free-Form Text | Sale, visible en el formulario de Invoice |
| Cuarto | Customization > Lists, Records, & Fields > Transaction Column Fields > New | Cuarto Late 1 / `custcol_jj_late1_room` | Free-Form Text | Sale, visible en líneas de Invoice |

Marcar Store Value y mostrar en el formulario de Invoice usado. Después informar `contractFieldId` y `roomColumnFieldId` en configuración. Estos campos se dejan para después si el objetivo inmediato es ver el botón y abrir el PDF.

## Comprobaciones locales

Ejecutar desde la raíz: `node --test tests/late1.test.cjs`.

Se comprueban con módulos NetSuite simulados: selección de última factura y formulario, subsidiaria, cálculo mínimo/porcentual, saldo pagado, vencimiento futuro, datos faltantes, moneda, fuente bancaria, logo, permisos y botón. Estas pruebas no ejecutan FreeMarker/BFO ni validan la apariencia final. La comprobación visual y de integración se hará con el PDF generado por la cuenta.

## Referencias de implementación

- [Oracle: botón que abre un Suitelet](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157169557654.html).
- [Oracle: habilitar Advanced PDF/HTML Templates](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2862977.html).
- [Oracle: crear y desplegar scripts](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1510274245.html).
- [Oracle: datos adicionales para la plantilla](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4528541027.html).
- [Oracle: renderAsPdf](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_452241760253.html).
