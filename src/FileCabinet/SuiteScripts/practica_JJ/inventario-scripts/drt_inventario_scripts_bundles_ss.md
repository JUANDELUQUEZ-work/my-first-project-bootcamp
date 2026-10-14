# DRT - Inventario de Scripts por Bundle

Documentación del archivo [drt_inventario_scripts_bundles_ss.js](drt_inventario_scripts_bundles_ss.js).

## 1. ¿Qué hace?

Es un **Scheduled Script** de NetSuite (SuiteScript 2.1) que:

1. Lee **todos los scripts** y **todos los deployments** de la cuenta (a partir de dos Saved Searches).
2. Averigua en qué **bundles** y **SuiteApps** está cada script (módulo `N/suiteAppInfo`).
3. Clasifica cada bundle según su origen: creado en la cuenta, instalado o no identificado.
4. Genera un **Excel multipestaña** (una pestaña por bundle, más pestañas de resumen).
5. Guarda el Excel en el **File Cabinet** y lo **envía por correo**.

> **Seguridad:** el script solo **lee** scripts, deployments y bundles. Sus únicas escrituras son crear el archivo Excel en el File Cabinet y enviar un correo. No modifica ningún registro.

## 2. Cabecera JSDoc

```js
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
```

| Etiqueta | Significado |
| --- | --- |
| `@NApiVersion 2.1` | Usa SuiteScript 2.1 (permite sintaxis ES6+: arrow functions, clases, template strings, `const`/`let`). |
| `@NScriptType ScheduledScript` | Script programado: se ejecuta en segundo plano, por calendario o manualmente desde el deployment. Tiene un límite de gobernanza de 10 000 unidades. |
| `@NModuleScope SameAccount` | El módulo solo puede ser cargado por scripts de la misma cuenta. |

## 3. Módulos utilizados

```js
define(['N/search', 'N/file', 'N/email', 'N/runtime', 'N/encode', 'N/suiteAppInfo', 'N/log'], ...)
```

| Módulo | Para qué se usa |
| --- | --- |
| `N/search` | Cargar y ejecutar las Saved Searches de scripts y deployments. |
| `N/file` | Leer el catálogo CSV de bundles, crear y volver a cargar el Excel. |
| `N/email` | Enviar el correo con el Excel adjunto. |
| `N/runtime` | Obtener el ID de la cuenta y la gobernanza restante. |
| `N/encode` | Convertir el XML del Excel (UTF-8) a Base64 para guardarlo como archivo binario. |
| `N/suiteAppInfo` | Consultar qué bundles/SuiteApps están instalados y cuáles contienen cada script. |
| `N/log` | Escribir en el Execution Log (`audit` y `error`). |

## 4. Configuración

Es el **único bloque que se debe editar** para adaptar el script a otra cuenta o a otros destinatarios.

```js
const CONFIG = {
    SEARCH_SCRIPTS: 'customsearch268',
    SEARCH_DEPLOYMENTS: 'customsearch269',
    CATALOG_FILE_ID: 11826,
    OUTPUT_FOLDER_ID: 2154,
    EMAIL_AUTHOR: 213,
    EMAIL_RECIPIENTS: ['juan.deluquez@disrupttglobal.com'],
    EMAIL_CC: [],
    BATCH_SIZE: 100,
    MAX_ATTACHMENT_BYTES: 9 * 1024 * 1024,
    TZ_OFFSET_HOURS: -6
};
```

| Clave | Descripción |
| --- | --- |
| `SEARCH_SCRIPTS` | ID de la Saved Search "DRT - Inventario de Scripts". Debe incluir la columna `scriptid` (y preferiblemente `name`). |
| `SEARCH_DEPLOYMENTS` | ID de la Saved Search "DRT - Inventario de Deployments". Debe incluir el Script ID del script padre (join `script`). |
| `CATALOG_FILE_ID` | Internal ID del archivo `drt_catalogo_bundles.csv` en el File Cabinet (bundles creados en la cuenta). |
| `OUTPUT_FOLDER_ID` | Carpeta donde se guarda el Excel (`SuiteScripts > DRT_Inventario_Scripts`). |
| `EMAIL_AUTHOR` | Internal ID del empleado que figura como remitente. |
| `EMAIL_RECIPIENTS` / `EMAIL_CC` | Destinatarios y copia del correo. Si `EMAIL_CC` está vacío se envía `null`. |
| `BATCH_SIZE` | Cuántos Script IDs se mandan en cada llamada a `N/suiteAppInfo`. |
| `MAX_ATTACHMENT_BYTES` | Si el Excel pesa más de 9 MB no se adjunta; el correo indica el ID del archivo en el File Cabinet. |
| `TZ_OFFSET_HOURS` | Desfase horario usado para mostrar fechas (UTC-6, Ciudad de México). |

### Constantes auxiliares

- **`ORIGEN`**: textos de los tres posibles orígenes de un bundle: `Creado en la cuenta`, `Instalado`, `No identificado`.
- **`SHEET`**: nombres fijos de las pestañas generales del Excel (`Resumen`, `Índice`, `Todos los scripts`, `Deployments`, `Sin bundle`, `SuiteApps`, `Errores de consulta`).

## 5. Flujo principal: `execute()`

`execute` es el entry point del Scheduled Script. Está dividido en 10 pasos numerados en el código.

### Paso 1 — Carga de datos de origen

```js
const scripts = loadSearch(CONFIG.SEARCH_SCRIPTS);
const deployments = loadSearch(CONFIG.SEARCH_DEPLOYMENTS);
const catalog = loadCatalog(CONFIG.CATALOG_FILE_ID);
const installedBundles = safeCall('listInstalledBundles', () => suiteAppInfo.listInstalledBundles(), []);
const installedSuiteApps = safeCall('listInstalledSuiteApps', () => suiteAppInfo.listInstalledSuiteApps(), []);
```

- `scripts` y `deployments` son objetos `{ cols, labels, rows }` (ver [`loadSearch`](#loadsearchid)).
- `catalog` es un diccionario `{ bundleId: {...datos} }` con los bundles creados en la cuenta.
- Los bundles y SuiteApps instalados se piden con `safeCall`: si la API falla se registra el error y se continúa con una lista vacía.
- Después se construyen `installedMap` y `suiteAppMap` (diccionarios por ID) para búsquedas rápidas.

### Paso 2 — Detección de columnas clave

Como las Saved Searches pueden tener columnas en cualquier orden, el script **localiza dinámicamente** el índice de las columnas que necesita con `findCol(cols, predicado, fallback)`:

| Variable | Qué busca | Fallback |
| --- | --- | --- |
| `sKey` | Columna `scriptid` (sin join) en la búsqueda de scripts. | Columna 0 |
| `sName` | Columna `name` (sin join) en la búsqueda de scripts. | Columna 1 |
| `dParent` | En deployments, `scriptid` con join `script` (el Script ID del script padre). Si no, una columna cuya etiqueta sea "Script : Script ID". | Columna 1 |
| `dId` | Una columna fórmula que contenga `scriptid` (el ID del deployment). Si no, una etiqueta "Deployment ID". | `-1` (no existe) |
| `dStatus` | Columna `status` del deployment. | `-1` |
| `dDeployed` | Columna `isdeployed`. | `-1` |

Un valor `-1` significa "esta columna no está en la búsqueda" y el script la omite al construir textos.

### Paso 3 — Bundles y SuiteApps por script

```js
chunk(scriptIds, CONFIG.BATCH_SIZE).forEach((ids, i) => {
    suiteAppInfo.listBundlesContainingScripts({ scriptIds: ids });
    suiteAppInfo.listSuiteAppsContainingScripts({ scriptIds: ids });
});
```

- Se obtienen los Script IDs únicos y normalizados (minúsculas, sin espacios).
- Se procesan en **lotes de 100** para no saturar la API.
- Resultado:
  - `bundlesByScript[scriptId] = [bundleId, ...]`
  - `suiteAppsByScript[scriptId] = [suiteAppId, ...]`
- Si falla la consulta de **bundles** de un lote, todos los scripts de ese lote se marcan en `errores` con el mensaje de error (luego aparecen en la pestaña "Errores de consulta").
- Si falla la consulta de **SuiteApps**, solo se registra en el log (no se considera error del script).

### Paso 4 — Deployments por script

- `depsByScript[scriptId]` agrupa las filas de deployments según el script padre (`dParent`).
- `scriptNameById[scriptId]` guarda el nombre de cada script, para mostrarlo en la pestaña de Deployments.

### Paso 5 — Resolución de información de bundles

La función interna `bundleInfo(id)` devuelve un objeto homogéneo con los datos de un bundle, consultando las fuentes en este orden de prioridad:

1. **Catálogo CSV** → origen `Creado en la cuenta` (nombre, versión, creado por, fecha de creación, última actualización, copiado de, descripción).
2. **Bundles instalados** (`installedMap`) → origen `Instalado` (nombre, versión, publisher, "instalado desde", fecha de última actualización, descripción).
3. **Ninguna** → origen `No identificado`, nombre genérico `Bundle <id>`.

Los resultados se guardan en `bundleCache` para no recalcularlos.

`suiteAppLabel(id)` produce un texto tipo `com.empresa.app - Nombre (v1.2.3)` o solo el ID si no se encuentra.

### Paso 6 — Enriquecimiento de cada script

A cada fila de la búsqueda de scripts se le añaden 6 columnas:

| Columna nueva | Contenido |
| --- | --- |
| `Clasificación` | Ver tabla siguiente. |
| `Nº Bundles` | Cantidad de bundles que contienen el script (o `ERROR`). |
| `Bundles (ID - Nombre)` | Lista `123 - Nombre | 456 - Otro`, o el mensaje de error. |
| `SuiteApp(s)` | Lista de SuiteApps que contienen el script. |
| `Nº Deployments` | Cantidad de deployments del script. |
| `Deployments (ID · Status · Deployed)` | Ej.: `customdeploy1 (Released, Deployed: Sí); customdeploy2 (Testing)`. |

**Reglas de clasificación** (se evalúan en orden, gana la primera que se cumpla):

| # | Condición | Clasificación |
| --- | --- | --- |
| 1 | Falló la consulta de bundles | `Error de consulta` |
| 2 | Algún bundle está en el catálogo CSV | `En bundle de Disruptt` |
| 3 | Algún bundle está entre los instalados | `En bundle instalado` |
| 4 | Tiene bundles pero ninguno se identificó | `En bundle no identificado` |
| 5 | No tiene bundles pero sí SuiteApp | `En SuiteApp` |
| 6 | Nada de lo anterior | `Sin bundle` |

Cada script enriquecido queda como `{ id, bIds, saIds, clas, cells }`, donde `cells` es la fila completa lista para el Excel.

> Los números se representan como `{ n: valor }` para que el generador de Excel los escriba como celdas numéricas y no como texto.

### Paso 7 — Agrupación por bundle y nombres de pestañas

- `byBundle[bundleId] = [scripts...]`: un script que esté en varios bundles aparece en todas sus pestañas.
- `allBundleIds` = bundles con scripts **+** todos los bundles del catálogo (aunque no tengan scripts, para que salgan en el Índice).
- Orden: primero por origen (Creado → Instalado → No identificado) y luego alfabéticamente por nombre (en español, sin distinguir mayúsculas/acentos).
- `SheetNamer` genera nombres de pestaña válidos y únicos para cada bundle con scripts (`"<id> <nombre>"`), reservando antes los nombres de las pestañas fijas.
- Se calculan los subconjuntos que alimentan el resumen: `sinBundle`, `enSuiteApps`, `conError`, `multiBundle`, `bundlesConScripts` y la función `countByOrigen`.

### Paso 8 — Construcción del Excel

Se crea un `Workbook` y se agregan las pestañas en este orden:

| Pestaña | Contenido | ¿Siempre? |
| --- | --- | --- |
| **Resumen** | Fecha de generación, cuenta, totales de scripts/deployments, conteos por clasificación y por origen de bundle, IDs de las búsquedas usadas. | Sí |
| **Índice** | Una fila por bundle: ID, nombre, origen, versión, nº de scripts, **hipervínculo a su pestaña**, creado por/el, última actualización, copiado de, publisher, descripción. | Sí |
| **Todos los scripts** | Todos los scripts enriquecidos. | Sí |
| **Deployments** | Todas las filas de la búsqueda de deployments + nombre del script + bundles del script. | Sí |
| **Sin bundle** | Scripts clasificados como `Sin bundle`. | Sí |
| **SuiteApps** | Scripts que pertenecen a alguna SuiteApp. | Solo si hay |
| **`<id> <nombre bundle>`** | Una pestaña por cada bundle con scripts. | Una por bundle |
| **Errores de consulta** | Scripts cuyo bundle no se pudo consultar. | Solo si hay |

Todas las pestañas (excepto Resumen e Índice) incluyen un enlace **"« Volver al Índice"**.

### Paso 9 — Guardado en el File Cabinet

```js
const fileName = `DRT_Inventario_Scripts_Bundles_${now.stamp}.xls`;   // p. ej. ..._20261014_0930.xls
file.create({ fileType: file.Type.EXCEL, contents: <XML en Base64>, folder: CONFIG.OUTPUT_FOLDER_ID, ... });
```

- El XML se convierte de UTF-8 a **Base64** con `N/encode`, porque `file.Type.EXCEL` es un tipo binario y NetSuite espera el contenido codificado.
- Tras guardar, se vuelve a cargar el archivo (`file.load`) para conocer su tamaño real y poder adjuntarlo.

### Paso 10 — Envío del correo

- Cuerpo HTML con los totales principales (scripts, deployments, bundles por origen, multi-bundle, SuiteApps, sin bundle y, en rojo, los errores si los hay).
- Asunto: `Inventario de scripts por bundle - DD/MM/AAAA`.
- Si el archivo supera `MAX_ATTACHMENT_BYTES` no se adjunta y el cuerpo indica el ID del archivo en el File Cabinet.
- Al final se registra en el log: destinatarios, **gobernanza restante** y **duración** en segundos.

## 6. Funciones de lectura de datos

### `loadSearch(id)`

Carga una Saved Search y devuelve **todas** sus filas (sin el límite de 4 000 de `run().each`) usando `runPaged({ pageSize: 1000 })`.

Devuelve:
- `cols`: objetos `search.Column` originales (para poder inspeccionar `name`, `join`, `formula`, `label`).
- `labels`: etiquetas de las columnas (se usan como encabezados del Excel).
- `rows`: matriz de valores ya convertidos a texto con `cellValue`.

### `cellValue(result, col)`

Normaliza el valor de una celda:
- Prefiere `getText` (texto visible, p. ej. el nombre de una lista) y si no hay, usa `getValue`.
- `true`/`'T'` → `Sí`, `false`/`'F'` → `No`.
- `null`/`undefined` → cadena vacía.
- Arrays (multiselect) → elementos unidos por coma.

### `loadCatalog(fileId)`

Lee el CSV del catálogo de bundles creados en la cuenta:
- Elimina el BOM inicial si existe.
- Busca la **fila de encabezado** como la primera que contenga la columna `Bundle ID` (así tolera filas de título antes del encabezado). Si no la encuentra lanza un error.
- Lee las columnas (sin distinguir mayúsculas): `Bundle ID`, `Name`, `Version`, `Copied From`, `Abstract`, `Created By`, `Created On`, `Last Update`.
- Ignora filas cuyo `Bundle ID` no sea numérico.

### `parseCsv(text)`

Parser de CSV escrito a mano (carácter a carácter) que soporta:
- Campos entre comillas con comas y saltos de línea en su interior.
- Comillas escapadas (`""` → `"`).
- Finales de línea `\n`, `\r` y `\r\n`.

## 7. Utilidades

| Función | Descripción |
| --- | --- |
| `normId(v)` | Convierte un ID a texto, sin espacios y en minúsculas, para comparar IDs de forma consistente. |
| `unique(arr)` | Elimina duplicados usando un `Set`. |
| `chunk(arr, n)` | Divide un array en lotes de `n` elementos. |
| `toIdArray(v)` | Normaliza lo que devuelve `N/suiteAppInfo` (valor suelto, array, objetos con `.id`) a un array de IDs en texto. |
| `findCol(cols, pred, fallback)` | Índice de la primera columna que cumple `pred`, o `fallback`. |
| `safeCall(label, fn, fallback)` | Ejecuta `fn`; si lanza error o devuelve vacío, registra el error y devuelve `fallback`. |
| `pad(n)` | Rellena con cero a la izquierda (`5` → `05`). |
| `localNow()` | Fecha/hora actual con el desfase de `TZ_OFFSET_HOURS`. Devuelve `date` (`DD/MM/AAAA`), `display` (texto legible) y `stamp` (`AAAAMMDD_HHMM`, para el nombre del archivo). |
| `fmtDate(v)` | Formatea una fecha a `DD/MM/AAAA`; si no es válida devuelve el valor original. |

### Clase `SheetNamer`

Garantiza que los nombres de pestaña cumplan las reglas de Excel:
- Máximo **31 caracteres**.
- Sin los caracteres `: \ / ? * [ ] '`.
- **Únicos** (comparando sin mayúsculas). Si hay colisión añade un sufijo ` ~2`, ` ~3`, … recortando el nombre para que siga cabiendo en 31 caracteres.

Métodos: `clean(n)` limpia el nombre, `reserve(n)` marca un nombre como usado y `make(n)` genera un nombre único.

## 8. Generador de Excel (SpreadsheetML 2003)

En lugar de una librería externa, el script genera un **XML Spreadsheet 2003** (formato que Excel abre de forma nativa y que admite varias pestañas, estilos e hipervínculos). Por eso el archivo tiene extensión `.xls`.

> Al abrirlo, Excel puede mostrar un aviso de que "el formato y la extensión no coinciden". Es normal con este formato; basta con aceptar.

### `xmlEsc(s)`

Prepara texto para insertarlo en XML:
- Elimina caracteres de control no válidos en XML.
- Trunca a **32 000 caracteres** (el límite de una celda de Excel es 32 767).
- Escapa `& < > "`.
- Convierte saltos de línea en `&#10;` para que se vean dentro de la celda.

### Clase `Workbook`

| Método | Descripción |
| --- | --- |
| `addSheet(name, headers, rows, opts)` | Registra una pestaña. `opts` admite `title`, `subtitle` y `back` (pestaña a la que apunta el enlace "Volver"). |
| `cell(c, style)` | Genera una celda. Tipos de valor soportados: texto plano, `{ n }` → número, `{ v, href }` → hipervínculo interno a la celda `A1` de otra pestaña. |
| `textOf(c)` | Texto de una celda, usado para estimar el ancho de columna. |
| `sheetXml(s)` | XML de una pestaña: filas de título/subtítulo/enlace, encabezado, datos, **anchos de columna automáticos** (calculados con una muestra de 300 filas, entre 55 y 420 puntos), **paneles inmovilizados** bajo el encabezado y **autofiltro**. |
| `toXml()` | Documento completo: declaración XML, espacios de nombres, estilos y todas las pestañas. |

**Estilos definidos:**

| ID | Uso | Aspecto |
| --- | --- | --- |
| `Default` | Celdas normales | Calibri 10, alineación superior |
| `hdr` | Encabezados | Negrita blanca sobre azul `#1F4E79`, texto ajustado |
| `title` | Título de pestaña | Calibri 13 negrita, azul |
| `sub` | Subtítulo | Cursiva gris |
| `link` | Hipervínculos | Azul subrayado |

## 9. Estructura del Excel generado

```
DRT_Inventario_Scripts_Bundles_AAAAMMDD_HHMM.xls
├── Resumen
├── Índice                    ← enlaces a cada pestaña de bundle
├── Todos los scripts
├── Deployments
├── Sin bundle
├── SuiteApps                 (si hay)
├── 123 Nombre del bundle A   ← bundles creados en la cuenta
├── 456 Nombre del bundle B   ← bundles instalados
├── 789 Bundle 789            ← bundles no identificados
└── Errores de consulta       (si hay)
```

Cada pestaña de datos tiene: título, subtítulo, enlace "« Volver al Índice", encabezado inmovilizado y autofiltro.

## 10. Requisitos para desplegarlo

1. Crear las Saved Searches de **scripts** (`customsearch268`) y **deployments** (`customsearch269`) con las columnas descritas en el [Paso 2](#paso-2--detección-de-columnas-clave).
2. Subir al File Cabinet el CSV del catálogo de bundles creados en la cuenta (con al menos la columna `Bundle ID`) y anotar su Internal ID.
3. Crear la carpeta de salida en el File Cabinet.
4. Ajustar el bloque `CONFIG`.
5. Crear el registro de Script (tipo Scheduled) y su Deployment; ejecutarlo manualmente (*Save and Execute*) o programarlo.
6. Revisar el **Execution Log**: mensajes `Inicio`, `Datos cargados`, `Excel guardado` y `Fin` (este último incluye la gobernanza restante y la duración).

## 11. Observaciones y posibles mejoras

- **Gobernanza:** todo se ejecuta en una sola invocación. En cuentas con muchísimos scripts podría acercarse al límite de 10 000 unidades; en ese caso convendría migrarlo a Map/Reduce o reprogramarse con `task.create`.
- **Autofiltro:** el rango se calcula como `R{headerRow}C1:R{lastRow - 1}C{nCols}`, donde `lastRow = headerRow + rows.length`. Eso deja la **última fila de datos fuera del autofiltro**. Para incluirla, el rango debería terminar en `R{lastRow}`.
- **Zona horaria fija:** `TZ_OFFSET_HOURS = -6` no contempla horario de verano (México ya no lo aplica, pero sí otros países).
- **`fmtDate`** usa la hora local del servidor de NetSuite, no el desfase configurado; para fechas sin hora no suele afectar.
- **Pestaña "Sin bundle"** se crea siempre, aunque esté vacía (a diferencia de "SuiteApps" y "Errores de consulta").
- Los errores de `listSuiteAppsContainingScripts` solo se registran en el log y no se reflejan en el Excel.
