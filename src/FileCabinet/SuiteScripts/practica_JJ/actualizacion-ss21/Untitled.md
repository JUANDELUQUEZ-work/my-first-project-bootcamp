# Actualización controlada a SuiteScript 2.1 — Viabilidad y arquitectura

Oct 14, 2026 · @Juan Deluquez

**Viable con condiciones.** El Map/Reduce puede localizar, analizar y cambiar solo la anotación de forma segura. Dos comportamientos de NetSuite no están documentados por Oracle y deben probarse en sandbox antes del código definitivo.

Oracle pide pasar los scripts 1.0, 2.0 y 2.x a 2.1 antes de la versión 2028.2. Pido tu aprobación de la arquitectura (sección 6) y de la matriz de elegibilidad (sección 5).

## 1. Veredicto de viabilidad

| Operación | Estado | Evidencia |
| --- | --- | --- |
| Buscar los .js de una carpeta y todas sus subcarpetas | Viable | Tablas SuiteQL `file` (`folder`, `filetype`) y `mediaitemfolder` (`parent`); el recorrido recursivo se hace en memoria. Columnas a confirmar en el Records Catalog de la cuenta. |
| Leer el contenido | Confirmado (Oracle) | `file.load` + `getContents()`; límite de 10 MB por archivo. |
| Detectar la anotación real sin falsos positivos | Probado (Node) | 28 pruebas y 23 scripts reales del repositorio, sin fallos. |
| Cambiar solo el valor de la anotación | Probado (Node) | `2.0`, `2.x`, `2.X` y `2.1` miden 3 caracteres: el archivo conserva su longitud y cambia 1 carácter. Se verifica antes y después de guardar. |
| Reemplazar el contenido de un archivo existente | Pendiente PoC | `File` no tiene propiedad de contenido escribible. La comunidad reporta que `file.create` con el mismo nombre y carpeta sobrescribe; Oracle no lo documenta. |
| Conservar Internal ID y referencias | Pendiente PoC | Reportado por la comunidad, no por Oracle. |
| Conservar descripción, Available Without Login, inactivo y codificación | Pendiente PoC | `create` reemplaza lo que no se le pasa: se reenvían explícitamente. Columnas como `hideinbundle` no se pueden pasar. |
| Que el Script Record y el runtime adopten 2.1 | Pendiente PoC — riesgo principal | Hay reportes de registros que siguen en 2.0 tras cambiar el archivo por SDF; editarlo en la UI lo corrige. |
| Saber a qué bundle pertenece un archivo | No disponible | `N/suiteAppInfo` resuelve scripts, no archivos. |
| Saber si un archivo está bloqueado | No disponible | No hay campo ni API; el bloqueo aplica en cuentas donde el bundle está instalado. |
| Procesar volumen con reintentos y aislamiento por archivo | Confirmado (Oracle) | Map/Reduce: 5,000 unidades por invocación de `reduce`, `retryCount`, `isRestarted`. |

Condición para escribir el código definitivo: el PoC en sandbox debe conservar el Internal ID y la sonda debe pasar a runtime 2.1. Si el runtime no cambia, se aplica el diseño B: el Map/Reduce prepara, respalda y reporta, y la publicación se hace por UI o SDF.

## 2. Hallazgos sobre el script de diagnóstico

El script existente inventaría **Script Records**, no archivos: nunca abre un .js ni lee `@NApiVersion`. Su lógica de bundles se reutiliza; la búsqueda y lectura de archivos son nuevas.

Revisé `practica_JJ/inventario-scripts/drt_inventario_scripts_bundles_ss.js` y su documentación, en la rama `main` (commit de hoy). Tu carpeta local está en `prectice/templates-cr` y no lo contiene. Es un Scheduled Script 2.1 de solo lectura que genera el Excel por bundle.

| Componente | Qué hace | Decisión |
| --- | --- | --- |
| `listBundlesContainingScripts` y `listSuiteAppsContainingScripts` en lotes de 100 | Bundles y SuiteApps de cada Script ID, con error aislado por lote | Reutilizar |
| `listInstalledBundles` + `drt_catalogo_bundles.csv` | Separa bundle creado en la cuenta (Disruptt), instalado o no identificado | Reutilizar: es lo único que distingue “Disruptt bundle” de “Tercero bundle” |
| Reglas de clasificación | Error → Disruptt → instalado → no identificado → SuiteApp → sin bundle | Reutilizar y mapear a las categorías de la hoja |
| `loadSearch` (runPaged), `parseCsv`, `chunk`, `normId`, `safeCall` | Utilidades | Reutilizar |
| `CONFIG` con IDs fijos (`customsearch268`, `customsearch269`, archivo 11826, carpeta 2154, empleado 213) | Configuración de la cuenta | Sustituir por parámetros del deployment |
| Excel SpreadsheetML y correo | Entrega a Arturo | No aplica: el nuevo proceso entrega .txt (correo opcional después) |
| Una sola invocación de 10,000 unidades | Ejecución | Pasa a Map/Reduce |

Lo que el inventario no cubre y el nuevo proceso sí:

- Archivos sin Script Record: librerías (`define` sin `@NScriptType`), client scripts de formulario y archivos sueltos.
- La versión real del archivo. Si la columna de versión de la hoja sale del Script Record, puede no coincidir con el archivo.
- La relación archivo → Script Record, que se obtiene con la columna `scriptfile` del registro de script.

No modifico el script de inventario: funciona y está en uso. Copio sus funciones a un módulo común nuevo; que el inventario lo use después es opcional.

La hoja asigna el diagnóstico a Juan y José. Si José tiene otra versión que lea `@NApiVersion`, la reviso antes de implementar.

## 3. Bundles y autorización

SuiteScript no puede decir con certeza a qué bundle pertenece un archivo ni si está bloqueado. Por eso la autorización la da un manifiesto aprobado por una persona, y el proceso añade barreras automáticas que el manifiesto no puede saltar.

| Dato | Cómo se obtiene | Fiabilidad |
| --- | --- | --- |
| Bundle de un archivo con Script Record | `scriptfile` → Script ID → `listBundlesContainingScripts` | Alta |
| Bundle de una librería o archivo sin Script Record | No hay API | Ninguna: decide el manifiesto |
| Bundle propio o de tercero | Catálogo CSV de bundles creados en la cuenta + `listInstalledBundles` | Alta si el catálogo está al día |
| SuiteApp (SDF) | `listSuiteAppsContainingScripts` y carpeta `SuiteApps` | Alta para scripts |
| Archivo de un bundle instalado | Ruta bajo `SuiteBundles` | Alta como motivo de exclusión |
| Archivo bloqueado | No hay campo; solo se nota cuando el guardado falla | Ninguna |
| Origen Disruptt o tercero de un archivo libre | El propietario del archivo es solo una pista | Baja: decide el manifiesto |

En la cuenta de desarrollo de Disruptt los archivos de sus propios bundles **no** están bloqueados: Oracle bloquea objetos solo en las cuentas donde el bundle se instala. Un cambio ahí viaja en la siguiente versión del bundle a todos los clientes.

Manifiesto de autorización (CSV en el File Cabinet, una fila por archivo):

```csv
file_id,clasificacion,autorizado,aprobado_por,fecha,referencia
48211,TERCERO_LIBRE,SI,Arturo,2026-10-20,Lote 1
48230,DISRUPTT_LIBRE,NO,,,Pendiente de política
```

Un archivo se actualiza solo si cumple las tres condiciones:

1. Aparece en el manifiesto con `autorizado=SI`.
2. Su clasificación está permitida por el parámetro de política del deployment.
3. Ninguna evidencia automática la contradice. Si el manifiesto dice “libre” y la API dice “bundle”, queda en `PENDIENTE_VALIDACION`.

El modo DRY\_RUN genera un borrador del manifiesto con la clasificación sugerida. La persona que aprueba solo cambia `autorizado`, sin escribir IDs a mano.

## 4. Riesgos de compatibilidad 2.0 → 2.1

Cambiar la anotación no migra el código: el runtime pasa de ES5.1 a ECMAScript 2023 con otro motor. Cada archivo cambiado se reporta como “anotación actualizada, pendiente de validación funcional”, nunca como “migrado”.

| Diferencia documentada por Oracle | Efecto en 2.1 | Detección automática | Tratamiento |
| --- | --- | --- | --- |
| Palabras reservadas como identificador (`extends`, `static`, `public`…) | SyntaxError | Heurística en declaraciones | Bloquea la actualización |
| `for each...in` | SyntaxError | Sí | Bloquea |
| `catch` condicional | SyntaxError | Sí | Bloquea |
| `toSource()` | Error | Sí | Bloquea |
| APIs 1.0 (`nlapi*`) dentro de un archivo 2.x | No se mezclan versiones | Sí | Bloquea |
| Asignar a una variable sin declarar | ReferenceError | No fiable dentro de NetSuite | ESLint fuera de NetSuite o prueba funcional |
| Reasignar una `const` | TypeError | No fiable | ESLint o prueba funcional |
| JSON con comas finales | SyntaxError al ejecutar | Solo se señala `JSON.parse` | Informativo |
| `JSON.stringify` de un `Error` | Devuelve `{}` | Heurística | Advertencia |
| `parseInt` sin base | `parseInt('08')` cambia | Sí | Advertencia |
| Fecha a texto local | Otro formato | Sí | Advertencia |
| Decimal con ceros finales (`616.00`) | Se guarda como entero | Sí | Advertencia |
| RESTlet: formato de respuesta | Cambia lo que recibe la integración | Por `@NScriptType` | Revisión manual |
| Client script con subrecords | Soporte parcial; Scriptable Cart no soportado | Por tipo y API usada | Revisión manual |
| Librería cargada por scripts 2.0 | Oracle advierte incompatibilidades al mezclar | Por ausencia de `@NScriptType` | Revisión; el PoC prueba un consumidor 2.0 |

Se automatiza: la sintaxis bloqueante, los patrones de riesgo y la verificación de que solo cambió la anotación. Requiere prueba funcional: modo estricto, fechas, JSON, RESTlets, client scripts y librerías compartidas.

Antes de tocar anotaciones conviene activar en el sandbox la preferencia *Execute SuiteScript 2.0 / 2.x Server Scripts as 2.1*. Oracle la ofrece para probar el runtime 2.1 sin cambiar archivos; solo afecta a scripts de servidor. El Script Record y su deployment no se modifican en ningún caso.

## 5. Matriz de elegibilidad

Solo se actualizan automáticamente archivos “Tercero libre” con anotación 2.0, 2.x o 2.X, autorizados en el manifiesto y sin riesgos bloqueantes. Todo lo demás se reporta y espera decisión. Marca tu decisión en la última columna.

| Clasificación | La hoja dice | Propuesta | Automático | Decisión |
| --- | --- | --- | --- | --- |
| Tercero individual / libre | Actualizar 2.1 | Actualizar si está autorizado y no hay evidencia de bundle ni riesgo bloqueante o de revisión | Sí, por lotes | Pendiente |
| Disruptt individual / libre | **Sin acción definida** | Misma regla que Tercero libre, en un lote separado, solo tras tu confirmación | No, hasta confirmar | Pendiente |
| Disruptt bundle | Analizar cada bundle | Solo reporte. Por bundle: lista aprobada, nueva versión del bundle y prueba en una cuenta cliente de prueba | No | Pendiente |
| Tercero bundle / bloqueado | Analizar cada bundle | Nunca modificar; pedir al proveedor su versión 2.1 | Nunca | Pendiente |
| SuiteApp (SDF) | No aparece | Nunca modificar | Nunca | Pendiente |
| No identificado o en conflicto | No aparece | `PENDIENTE_VALIDACION` | No | Pendiente |

Dentro de una clasificación elegible, la anotación y los riesgos deciden:

| Anotación o riesgo detectado | Acción | Estado en el reporte |
| --- | --- | --- |
| `2.0`, `2.x`, `2.X` sin riesgos o solo con advertencias | Actualizar (las advertencias pasan a la prueba funcional) | `ACTUALIZADO` / `SIMULADO` |
| `2.1` | Ninguna | `YA_2_1` |
| Sin anotación y con APIs `nlapi*` | Análisis individual | `SS1_ANALISIS_MANUAL` |
| Módulo con `define` y sin anotación | Ninguna: hereda la versión de quien lo carga | `REVISION_MANUAL` |
| Duplicada, ambigua, valor no reconocido o contenido inválido | Ninguna | `INCIDENCIA_ANOTACION` |
| Riesgo bloqueante | Ninguna | `OMITIDO_RIESGO` |
| RESTlet, client script con subrecords o librería | Ninguna en el primer lote | `REVISION_MANUAL` |

Las librerías quedan para después de sus scripts consumidores, o antes si el PoC demuestra que un script 2.0 carga sin error un módulo anotado 2.1.

## 6. Arquitectura propuesta

Un Map/Reduce SuiteScript 2.1 sin etapa map: getInputData decide qué archivos entran, reduce procesa cada uno aislado y summarize escribe el reporte.

&#91;embedded content: Map/Reduce · 3 etapas, 5 barreras antes de escribir\]

Cualquier “no” o excepción termina en el resultado del archivo, nunca en una escritura. Solo el paso resaltado modifica el File Cabinet.

- **Map/Reduce y no Scheduled.** Aísla errores por archivo, reintenta, cede el turno solo y entrega los errores de cada etapa en `summaryContext`. Un Scheduled necesitaría puntos de control y reprogramación manuales.
- **Sin map.** getInputData ya entrega una clave por archivo. reduce tiene 5,000 unidades y 15 minutos por invocación, frente a 1,000 y 5 de map; un archivo cuesta unas pocas lecturas y guardados.
- **Objeto y no búsqueda directa.** La recursión por carpetas, las exclusiones, el cruce con Script Records y bundles y el límite se resuelven una vez. Devolver la búsqueda obligaría a repetir esas consultas por archivo.
- **Reintentos e idempotencia.** `retryCount: 2`, `exitOnError: false`. Si `isRestarted` es verdadero y el archivo ya está en 2.1 con respaldo de esta ejecución, se reporta `ACTUALIZADO` sin volver a escribir.
- **Concurrencia.** Una clave por archivo: dos invocaciones nunca tocan el mismo archivo. Justo antes de guardar se relee; si cambió desde la lectura, queda `CONFLICTO_CONCURRENTE`.
- **Supuesto a confirmar.** Que cada propiedad del objeto llegue a reduce como su propia clave es el comportamiento habitual, pero la página de Oracle no lo detalla. El primer DRY\_RUN lo comprueba.

## 7. Parámetros configurables

Ningún ID de la cuenta queda en el código: todo se configura en el deployment. El modo por defecto es simulación.

| Parámetro | Tipo | Por defecto | Uso |
| --- | --- | --- | --- |
| `custscript_drt_ss21_mode` | Texto | `DRY_RUN` | `DRY_RUN`, `EXECUTE` o `RESTORE` |
| `custscript_drt_ss21_confirm` | Texto | vacío | `EXECUTE` y `RESTORE` exigen `ACTUALIZAR-<Account ID>`; si no coincide, corre como `DRY_RUN` y lo reporta |
| `custscript_drt_ss21_root_folder` | Entero | obligatorio | Carpeta raíz; se recorren todas sus subcarpetas |
| `custscript_drt_ss21_exclude_folders` | Texto (IDs) | vacío | Subárboles excluidos |
| `custscript_drt_ss21_file_ids` | Texto (IDs) | vacío | Lista explícita para pilotos; si tiene valor, solo esos archivos |
| `custscript_drt_ss21_max_files` | Entero | 25 | Límite de archivos por ejecución |
| `custscript_drt_ss21_auth_manifest` | Entero (archivo) | vacío | Manifiesto aprobado; sin él no se modifica nada |
| `custscript_drt_ss21_policy` | Texto | `TERCERO_LIBRE` | Clasificaciones que pueden actualizarse |
| `custscript_drt_ss21_bundle_catalog` | Entero (archivo) | obligatorio | `drt_catalogo_bundles.csv` del inventario |
| `custscript_drt_ss21_backup_folder` | Entero | obligatorio | Carpeta de respaldos, fuera de la raíz |
| `custscript_drt_ss21_report_folder` | Entero | obligatorio | Carpeta de reportes |
| `custscript_drt_ss21_restore_manifest` | Entero (archivo) | vacío | Para `RESTORE`: el manifiesto que generó una ejecución `EXECUTE` |

Se excluyen siempre, sin configurarlo: los archivos del propio proceso, las carpetas de respaldo y reportes, y los subárboles `SuiteBundles` y `SuiteApps`. Para `EXECUTE` recomiendo *Concurrency Limit* = 1 en el deployment.

## 8. Respaldo, restauración y reporte

Antes de cada escritura se guarda y se relee un respaldo idéntico; sin respaldo verificado no hay escritura. Todo cambio puede revertirse con el modo `RESTORE`.

**Respaldo**

- Archivo de texto `<fileId>__<ejecución>__<nombre>.bak.txt` en la carpeta de respaldos, con la misma codificación.
- Se relee y se compara con el original; su huella SHA-256 queda en el manifiesto de restauración.
- Nunca se respalda un archivo que ya está en 2.1. Así un reintento no puede sobrescribir el respaldo con contenido ya cambiado.
- El proceso no borra respaldos ni archivos originales.

**Restauración**

- Cada ejecución `EXECUTE` deja un CSV con `file_id`, `backup_id`, versión original y huellas antes y después.
- `RESTORE` lee ese CSV y repone el contenido con el mismo mecanismo de reemplazo, verificando el resultado.
- Si el archivo cambió después de la actualización (la huella no coincide), no se restaura: queda `RESTAURACION_OMITIDA_CAMBIO_POSTERIOR`.

**Reporte**

Se guarda en la carpeta de reportes. Si supera 9 MB se divide en partes. `DRY_RUN` añade el borrador del manifiesto de autorización; `EXECUTE` añade el manifiesto de restauración. Ejemplo:

```text
================================================================================
DRT - ACTUALIZACIÓN CONTROLADA A SUITESCRIPT 2.1
================================================================================
Fecha y hora    : 2026-10-21 10:42 (America/Mexico_City)
Ejecución       : SS21-20261021-1642-7F3A
Cuenta          : 1234567_SB1
Modo            : EXECUTE (confirmado)
Carpeta raíz    : SuiteScripts (ID -15), 37 subcarpetas
Manifiesto      : drt_ss21_autorizacion_lote1.csv (ID 50112) · política TERCERO_LIBRE
Uso             : 184 s · 2,310 unidades · concurrencia 1 · 0 yields

RESUMEN
  Archivos encontrados ................ 412
  Archivos analizados ................. 25   (max_files = 25)
  Ya en 2.1 ........................... 9
  Candidatos a actualizar ............. 11
  Actualizados correctamente .......... 8
  Omitidos ............................ 3
  Bloqueados o restringidos ........... 2
  Requieren análisis manual ........... 4
  Con errores ......................... 1

DETALLE
[48211] SuiteScripts/Vendors/Acme/vnd_tax_calc_ue.js
  2.x -> 2.1 · TERCERO_LIBRE · ACTUALIZAR · ACTUALIZADO
  Respaldo 50131 · SHA-256 9f2c..e1 -> 41aa..07
  Anotación actualizada, pendiente de validación funcional. Advertencia: PARSEINT_SIN_BASE (línea 88)

[48230] SuiteScripts/DRT/drt_utils_lib.js
  2.x -> - · DISRUPTT_LIBRE · NINGUNA · REVISION_MANUAL
  Clasificación no incluida en la política; librería sin @NScriptType

[48245] SuiteScripts/Vendors/Old/legacy_po_ue.js
  2.0 -> - · TERCERO_LIBRE · NINGUNA · OMITIDO_RIESGO
  FOR_EACH_IN (línea 54): SyntaxError en 2.1

[48260] SuiteScripts/Vendors/Acme/vnd_sync_rl.js
  2.x -> - · TERCERO_LIBRE · NINGUNA · REVISION_MANUAL
  RESTlet: 2.1 cambia el formato de respuesta

[48302] SuiteScripts/DRT/Facturacion/drt_cfdi_ue.js
  2.0 -> - · DISRUPTT_BUNDLE (Bundle 51234) · NINGUNA · BLOQUEADO_POLITICA
  Archivo de bundle: requiere análisis del bundle

[48377] SuiteScripts/Vendors/Beta/beta_report_sl.js
  2.x -> - · TERCERO_LIBRE · ACTUALIZAR · ERROR
  save() rechazado: <código y mensaje de NetSuite> (archivo sin cambios, verificado)

ERRORES DEL MAP/REDUCE (summaryContext)
  getInputData: ninguno
  reduce: 1 (clave 48377, ver detalle)
```

## 9. Plan de pruebas

Ocho de los 14 escenarios ya pasan en Node con la librería de detección; los demás dependen de NetSuite y se cubren con el PoC y un sandbox.

| # | Escenario | Dónde se prueba | Estado |
| --- | --- | --- | --- |
| 1 | Versión 2.0 | Node + PoC (sonda) | Probado en Node |
| 2 | Versión 2.x | Node + PoC (librería) | Probado en Node |
| 3 | Versión 2.X | Node | Probado en Node |
| 4 | Ya en 2.1 | Node | Probado en Node |
| 5 | SuiteScript 1.0 | Node | Probado en Node |
| 6 | Sin anotación | Node | Probado en Node |
| 7 | Anotaciones duplicadas o ambiguas (8 variantes) | Node | Probado en Node |
| 8 | Archivo bloqueado | Sandbox con un bundle instalado y bloqueado, forzado con `file_ids` | Pendiente |
| 9 | Archivo de un bundle | Sandbox: script de un bundle Disruptt debe quedar `BLOQUEADO_POLITICA` | Pendiente |
| 10 | Sin permisos de edición | Deployment ejecutado con un rol sin edición de Documents and Files | Pendiente |
| 11 | Error de lectura o guardado | PoC (`drt_ss21_poc_incompatible.js`) | Pendiente PoC |
| 12 | Dependencias potencialmente incompatibles | Node (riesgos) + PoC con un consumidor 2.0 | Parcial |
| 13 | Ejecución repetida | Node + PoC (`OVERWRITE` dos veces) | Probado en Node |
| 14 | Interrupción o reinicio | Sandbox con *Yield After Minutes* = 3 y un lote grande | Pendiente |

En todos los casos se comprueba que el contenido ajeno a la anotación queda intacto: en Node, carácter por carácter; en NetSuite, además, comparando todas las columnas SuiteQL del archivo antes y después.

Las pruebas locales se ejecutan desde la raíz del repositorio con `node --test tests/drt_ss21_annotation_lib.test.cjs`.

## 10. Riesgos pendientes

El riesgo mayor es un falso éxito: el archivo dice 2.1 pero el script sigue ejecutándose como 2.0. El PoC existe sobre todo para descartarlo.

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| El Script Record o el runtime no adoptan 2.1 tras reemplazar el archivo por SuiteScript | El reporte diría “actualizado” y el script seguiría en 2.0 | Sonda del PoC; si falla, diseño B (publicación por UI o SDF) |
| `file.create` pierde metadatos que no se pueden reenviar (`hideinbundle`, permisos, propietario) | Cambios silenciosos | El PoC compara todas las columnas SuiteQL; si alguna cambia, se descarta o documenta |
| Ejecutar en la cuenta de desarrollo de bundles | El cambio viaja a los clientes con la siguiente versión del bundle | Sandbox primero; confirmación con Account ID; bundles fuera de la política |
| Catálogo de bundles desactualizado | Un archivo de bundle tratado como libre | Bundle no identificado = `PENDIENTE_VALIDACION`; manifiesto revisado por una persona |
| Librerías compartidas | Un script 2.0 deja de cargar la librería | Librerías al final; prueba de consumidor 2.0 en el PoC |
| Fallos de runtime que no se ven en el código | Errores en producción | Preferencia de cuenta 2.1 en sandbox, pruebas funcionales por lote y ESLint opcional |
| Caché tras sobrescribir (reportado por la comunidad) | Algunos usuarios ven la versión anterior un tiempo | Avisar la ventana de cambio y validar pasados 10 minutos |
| Archivos de más de 10 MB | `getContents()` no los lee | Se reportan como error de lectura y no se tocan |
| Modificar código de terceros | Soporte o licencia del proveedor | Decisión de negocio (sección 11) |

## 11. Decisiones que necesito

Estas seis decisiones no se pueden resolver con código. Las dos primeras bloquean el desarrollo.

- [ ] **Disruptt individual / libre.** La hoja no define acción. ¿Se actualiza automáticamente con la misma regla que Tercero libre? Recomiendo sí, en un lote separado.
- [ ] **Cuenta de ejecución.** El inventario corre en la cuenta de desarrollo de bundles, que hace de producción. ¿Hay un sandbox de esa cuenta para el PoC y el primer `EXECUTE`?
- [ ] **Bundles de Disruptt.** ¿Quién aprueba cada bundle y cómo se publica la nueva versión a los clientes?
- [ ] **Código de terceros libre.** ¿Hay restricciones de contrato o soporte para modificar código de proveedores?
- [ ] **Firma del manifiesto.** ¿Quién autoriza cada lote (por ejemplo, Arturo)?
- [ ] **Diseño B.** Si el PoC muestra que el runtime no cambia al reemplazar por SuiteScript, ¿aceptas que la publicación final sea por UI o SDF con el paquete que prepara el Map/Reduce?

## 12. Plan de implementación

La fase 0 está hecha; cada fase siguiente empieza solo si pasa la puerta de la anterior. Ningún paso escribe en la cuenta de desarrollo de bundles hasta la fase 6.

1. **Fase 0 — Hecho.** Revisión del inventario, investigación, librería de detección con 28 pruebas y PoC escrito. Están en `practica_JJ/actualizacion-ss21/` y `tests/` de tu repositorio.
2. **Fase 1 — PoC en sandbox** (SETUP, OVERWRITE dos veces y RESTORE, más la sonda y el consumidor 2.0). Puerta: ID conservado, propiedades conservadas y sonda en runtime 2.1. Decide diseño A o B.
3. **Fase 2 — Construcción.** Módulo común (bundles, catálogo, CSV), Map/Reduce con los tres modos, manifiestos y reporte. Puerta: tu aprobación de este documento.
4. **Fase 3 — DRY\_RUN en sandbox** sobre toda la carpeta. Entrega el reporte y el borrador del manifiesto para revisión.
5. **Fase 4 — Piloto EXECUTE** con 5 archivos Tercero libre sin advertencias, más `RESTORE` de uno. Puerta: pruebas funcionales y escenarios 8–14 superados.
6. **Fase 5 — Lotes en sandbox** de hasta 25 archivos, con la preferencia de cuenta 2.1 activa para validar el resto.
7. **Fase 6 — Cuenta real**, lote por lote, con manifiesto firmado y ventana de cambio comunicada.

## 13. Fuentes

**Documentación de Oracle**

- [N/file Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4205693274.html) y [Copy a File Using Conflict Resolution](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_161547803169.html)
- [Differences Between SuiteScript 2.0 and SuiteScript 2.1](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158755248128.html): [palabras reservadas](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_158755288674.html), [objetos Error](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_158755291553.html), [JSON inválido](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_158755281853.html), [modo estricto](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_159526433919.html), [decimales](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_159526585508.html), [respuesta de RESTlet](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_159709238413.html)
- [Executing Scripts Using SuiteScript 2.1](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156632003699.html) y [Enabling SuiteScript 2.1 at the Account Level](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157960966997.html)
- [SuiteScript 2.1 JSDoc Tags](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/bridgehead_4387808822.html) y [Version Compatibility Rules](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/bridgehead_4417233130.html)
- [SuiteScript 2.1](https://oracle.hydrogen.sagittarius.connect.product.adaptavist.com/en/cloud/saas/netsuite/ns-online-help/chapter_156042690639.html) (copia de la ayuda de Oracle)
- [N/suiteAppInfo Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_160236086332.html) y [Locking Objects in Customization Bundles](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N3376982.html)
- Map/Reduce: [entry points](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4685231336.html), [configuración de interrupciones](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1517279521.html), [respuesta tras interrupción](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1517279626.html), [governance](https://oracle.hydrogen.sagittarius.connect.product.adaptavist.com/en/cloud/saas/netsuite/ns-online-help/section_4480364878.html), [getInputData](https://oracle.hydrogen.sagittarius.connect.product.adaptavist.com/en/cloud/saas/netsuite/ns-online-help/section_4412447940.html)

**Comunidad (sin confirmación de Oracle)**

- NetSuite Professionals: [file.create sobrescribe y conserva el ID](https://archive.netsuiteprofessionals.com/t/22790154/so-sanity-checking-something-i-discovered-with-the-n-file-mo), [sobrescritura con el mismo nombre](https://archive.netsuiteprofessionals.com/t/81271/hi-anyone-tried-to-overwrite-a-file-with-same-file-name-file), [registro que sigue en 2.0 tras SDF](https://archive.netsuiteprofessionals.com/t/389834/hello-we-had-some-existing-ss2-0-scripts-that-defined-napive), [actualizar registros a 2.1](https://archive.netsuiteprofessionals.com/t/22320274/hello-everyone-please-advise-on-the-best-practices-for-updat), [no hay campo de bloqueo](https://archive.netsuiteprofessionals.com/t/23052383/hi-everyone-is-there-a-field-which-tells-if-the-file-is-lock)
- Tim Dietrich: [SuiteQL y File Cabinet](https://timdietrich.me/blog/netsuite-suiteql-file-cabinet/) y [Script.ScriptFile](https://timdietrich.me/blog/netsuite-suiteql-recently-updated-scripts/)
- BrokenRubik: [migración a SuiteScript 2.1](https://www.brokenrubik.com/blog/suitescript-2-1-migration)
