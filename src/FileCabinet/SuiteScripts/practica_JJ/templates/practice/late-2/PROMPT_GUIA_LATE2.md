# Prompt para una guía de práctica de Late 2

## Resultado de la revisión del ticket actual

Fuente revisada: `C:/devJD/my-first-project-bootcamp/src/FileCabinet/SuiteScripts/practica_JJ/templates/practice/01-orden-compra-user-event-json/TICKET_PRACTICA.md`.

- Secciones 2.1 y 5.2: crear plantillas registradas en **Customization > Forms > Advanced PDF/HTML Templates**. El XML local es una copia del código que se pega en Source Code; no es la fuente que el Suitelet carga desde File Cabinet.
- Secciones 3.3 y 3.4: campo `custbody_prac_late_json`, Long Text, Store Value activo; User Event `beforeSubmit` con `JSON.stringify`. La guía lo deja visible durante las pruebas.
- Sección 3.6: un Suitelet carga la plantilla mediante `setTemplateByScriptId`, interpreta el campo con `JSON.parse` y entrega `EXTRA` mediante `addCustomDataSource`.
- Sección 3.7: indica expresamente no interpretar el JSON con `?eval` en la ruta guiada.
- Sección 5: Late 2 continúa usando ese Suitelet y `EXTRA.movimientos`. No describe la ruta completa campo JSON → interpretación en plantilla → Print nativo.

Conclusión: el ticket ya contempla plantilla registrada y campo JSON, pero no exactamente la arquitectura solicitada. Late 1 se desarrolló con otra fuente de plantilla: XML en File Cabinet. Esta revisión no cambia el ticket original ni la implementación de Late 1.

## Prompt listo para copiar

---

Quiero que crees una **guía de práctica manual, paso a paso, únicamente para Late 2 en Oracle NetSuite**. Yo haré todas las operaciones en mi cuenta con rol Administrador. Tu entrega es la guía con ejemplos explicados, campos, rutas, scripts, comprobaciones y evidencias; no controles el navegador, no te conectes a mi cuenta ni despliegues por mí.

### Contexto y archivos que debes revisar

Empresa: **Café de Finca**. Moneda del caso: **EUR**. Ya tengo una Invoice y un formulario personalizado de práctica, y he confirmado `${record.tranid}` en una plantilla de diagnóstico.

Revisa estos archivos locales:

1. Ticket anterior: `C:/devJD/my-first-project-bootcamp/src/FileCabinet/SuiteScripts/practica_JJ/templates/practice/01-orden-compra-user-event-json/TICKET_PRACTICA.md`.
2. Modelo visual: `C:/devJD/my-first-project-bootcamp/src/FileCabinet/SuiteScripts/practica_JJ/templates/practice/plantillas originales Bluespace/ES Late 2 LEG.LC2.SM.SP.20260114.pdf`.
3. Plantilla de diagnóstico: `C:/devJD/my-first-project-bootcamp/src/FileCabinet/SuiteScripts/practica_JJ/templates/practice/preactice-jj-invoice-standart`.

El ticket anterior tiene inventario y un caso de movimientos útiles, pero su solución final interpreta JSON en un Suitelet. Necesito una guía nueva para estudiar la alternativa con campo personalizado y plantilla registrada. Late 1 queda como evidencia de la implementación previa y no se modifica. Late 3 queda fuera del alcance. No me obligues a rehacer Late 1 ni todo su inventario para empezar Late 2.

### Arquitectura que quiero practicar

La plantilla se crea en **Customization > Forms > Advanced PDF/HTML Templates**, como personalización de Standard Invoice, y se edita pegando el XML en **Source Code**. Conserva una copia local como respaldo. La plantilla activa debe ser el registro de NetSuite; no un archivo XML leído con `N/file`.

Un **User Event de Invoice** obtiene datos relacionados que no podamos leer directamente desde la plantilla, arma un objeto y lo serializa con `JSON.stringify` en un **Transaction Body Field**. Quiero aprender cómo la plantilla puede consumir ese campo para presentar Late 2.

Usa como campo propuesto `custbody_jj_late2_json`, **Long Text**, con una política explícita de Store Value y Display Type. Distingue:

- Un campo real `custbody_...`, que existe en la factura aunque esté oculto y que el User Event llena.
- Un campo temporal `custpage_...`, creado al cargar un formulario, cuya disponibilidad en impresión no se debe asumir.

Para la primera ruta reproducible, prioriza el campo real persistido y `beforeSubmit` en CREATE/EDIT. Durante el diagnóstico puede mostrarse en modo de solo lectura; después explica cómo ocultarlo y volver a comprobar la impresión. No prometas que `beforeLoad` guarda cambios sobre una factura existente ni llames `save()` sobre la misma Invoice en `beforeSubmit`. Si estudias una variante temporal en PRINT, sepárala como experimento y verifica que el renderizador realmente reciba su valor.

La salida deseada es **Print nativo de la Invoice abierta**, mediante su formulario de práctica y Print Template. Explica que este flujo imprime la factura actual; la búsqueda de la última Invoice usada en Late 1 era una decisión diferente. No introduzcas botones, Client Script o Suitelet salvo que una limitación demostrada los haga necesarios y expliques el cambio de arquitectura.

### Primero: prueba mínima de compatibilidad

Antes de diseñar la carta completa, prepara una prueba que demuestre:

1. Creación/configuración correcta del campo y exposición al PDF de una Invoice real.
2. Escritura de un JSON pequeño con objeto y lista desde el User Event.
3. Lectura de ese campo, comprobación de su tipo y conversión a una estructura que FreeMarker pueda recorrer.
4. Impresión con el campo visible durante diagnóstico y luego oculto.

Consulta documentación primaria vigente y distingue lo documentado de lo pendiente de probar en la cuenta. Oracle documenta FreeMarker 2.3.26; Apache incorporó `?eval_json` en 2.3.31. No des por disponible `?eval_json`. Una condición alrededor de un built-in desconocido no garantiza que la plantilla compile.

Tampoco presentes `?eval` como equivalente general a `JSON.parse`: evalúa expresiones FreeMarker y no admite todo JSON. Si explicas un laboratorio con `?eval`, limítalo a un ejemplo didáctico controlado y documenta restricciones, manejo de nulos, comillas, barras, saltos de línea e interpolaciones. Que un ejemplo funcione no demuestra que admita los datos reales de cliente y movimientos. No lo uses silenciosamente como parser universal ni lo declares validado sin pruebas.

Si la cuenta no permite una interpretación adecuada del JSON dentro de la plantilla, explica exactamente qué parte no se puede cumplir. Presenta una alternativa concreta que conserve la plantilla registrada y el campo personalizado, distinguiendo la alternativa de la arquitectura pedida. No vuelvas por defecto a XML en File Cabinet ni presentes una ruta con Suitelet como si fuera Print nativo. Completa el resto de la guía que sea independiente de esa comprobación y marca claramente el punto de decisión.

### Contenido obligatorio de la guía

1. **Objetivo y flujo de datos:** explica qué hace Invoice, qué hace el campo, qué hace el User Event y qué hace FreeMarker/BFO. Diferencia XML de plantilla, datos del registro y texto JSON.
2. **Reutilizar el avance:** localizar mi formulario de práctica y plantilla de diagnóstico. Anotar el Print Template actual antes de asignar Late 2; no marcar otro formulario como Preferred ni cambiar Email Template.
3. **Crear campos:** rutas completas, Label, ID que se escribe, ID final con prefijo, Type, Applies To, Store Value, Display, Access y comprobación en el formulario. Separa obligatorios de opcionales. Evita duplicar campos estándar o registros relacionados existentes.
4. **Crear la plantilla:** nombre `JJ - Late 2 Café de Finca`, ID propuesto `custtmpl_jj_late2`; pasos para Customize Standard Invoice, Template Setup, Source Code, Save, asignación al formulario y Print. Explica que Preview no equivale a imprimir la Invoice elegida.
5. **User Event:** código comentado por bloques, módulos, eventos, lectura de referencias por ID, obtención de subsidiaria/empresa y datos adicionales, JSON.stringify, vaciado de datos obsoletos y manejo de errores. Indica creación de Script Record, deployment sobre Invoice, Testing, audiencia y Execution Log. No dependas de que una Invoice nueva ya tenga ID o número definitivo en beforeSubmit. No busques la factura recién creada en una búsqueda antes de que exista en base de datos.
6. **Contrato JSON:** versión, cliente, subsidiaria, moneda, fecha de aviso, fecha de corte, centro/contrato si existen, banco, movimientos y resumen. IDs ilustrativos claramente identificados. Datos bancarios faltantes vacíos; no inventes una fuente bancaria universal. Dinero numérico o en centavos, fechas de formato definido y política explícita para valores nulos.
7. **Extracto de Late 2:** revisar el PDF completo. El modelo base tiene una página con aviso y extracto, no la segunda página de factura de Late 1. No confundas `record.item` con movimientos de cuenta. Define fuente persistente, cliente/contrato si aplica, subsidiaria, moneda, corte, signos y prevención de duplicados. Puedes empezar con movimientos ficticios claramente identificados: cargos 72,01 y 13,31, abonos cero, total 85,32. Explica su sustitución por fuentes reales comprobadas. No confundas saldo actual de una factura con saldo histórico al corte.
8. **Actualización:** explica que una foto JSON guardada no se actualiza automáticamente cuando se registra un pago o cambia otro registro. Define cómo y cuándo regenerarla. No muestres información antigua como saldo actual sin advertir la fecha de corte/generación. Diferencia filas inexistentes de una consulta fallida.
9. **Diseño:** franja azul, logo de la empresa cuando exista, destinatario, fecha/número, centro/contrato, título de aviso nº 2, párrafos, banco/contacto, extracto y pie similares al modelo. Textos o importes propios de Late 2 deben salir de su referencia; no copies por inercia la regla de recargo de Late 1. No afirmes que se han contabilizado cargos o aplicado restricciones por imprimir una carta.
10. **Pruebas y evidencia:** campo vacío, JSON inválido, datos válidos, nulos, acentos, comillas, `&`, `<`, saltos, textos con sintaxis FreeMarker, campo oculto, cambio de cliente/subsidiaria, monedas distintas, un abono, movimiento posterior al corte y más filas de las que caben en una página. Verificar que la impresión no modifique la factura. Separar prueba propuesta de resultado observado.

### Forma de entrega

Guarda `GUIA_PRACTICA_LATE2.md` dentro de `src/FileCabinet/SuiteScripts/practica_JJ/templates/practice/late-2/` en el workspace activo y entrega su enlace. El ticket original es una referencia de lectura. Si el workspace activo es un worktree, indica la ruta real; no escribas en otra copia del proyecto sin necesidad.

Escribe en español claro con los nombres de menús en inglés. Organiza cada etapa como **qué hacer → dónde hacerlo → valores concretos → resultado esperado → qué revisar si falla**. Incluye ejemplos de código en la guía para que yo los implemente; no despliegues ni presentes la práctica como ya ejecutada. Termina con la primera acción concreta que debo realizar y una tabla breve para documentar evidencias.

Usa las fuentes oficiales de Oracle y Apache para resolver dudas técnicas y enlázalas junto a las decisiones correspondientes. No conviertas la guía en otra práctica de tres plantillas: solo Late 2.

---

## Referencias verificadas al preparar este prompt

- [Oracle: beforeLoad y límites de actualización](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4407991781.html).
- [Oracle: Display Type y campos ocultos](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2830238.html).
- [Oracle: motor y versión de FreeMarker](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2862977.html).
- [Apache: eval y eval_json](https://freemarker.apache.org/docs/ref_builtins_expert.html).
- [Oracle: plantillas avanzadas](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/bridgehead_N2853189.html).

La revisión fue documental y local; no se accedió a la cuenta ni se validó allí la interpretación de JSON.
