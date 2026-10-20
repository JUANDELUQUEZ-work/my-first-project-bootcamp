# DRT - Actualización de SuiteScript a 2.1 (Map/Reduce)

Documentación del archivo [drt_script_update_mr.js](drt_script_update_mr.js), correspondiente a la **etapa 2** del plan: actualización de archivos `2.0`, `2.x` y `2.X` de la carpeta de scripts a la versión `2.1`.

| Dato | Valor |
| --- | --- |
| Tipo de script | Map/Reduce (SuiteScript 2.1) |
| Script ID | `customscript_drt_script_update_mr` |
| Deployment ID | `customdeploy_drt_script_update_mr` |
| Modo por defecto | **Simulación** (no modifica archivos) |
| Estado | Probado localmente simulando los módulos de NetSuite (36 casos). **Pendiente de prueba en la cuenta de desarrollo.** |

> **Importante para quien lo pruebe:** mientras el checkbox **Aplicar cambios** esté desmarcado, el script solo genera el reporte y no modifica ningún archivo. Las primeras ejecuciones reales deben hacerse sobre una **carpeta de prueba** (ver [Plan de pruebas](#5-plan-de-pruebas)).

---

## 1. Qué hace cada etapa

### `getInputData`: localizar archivos

1. Toma la carpeta raíz del parámetro `custscript_drt_su_raiz`. Si está vacío, busca por nombre la carpeta de primer nivel `SuiteScripts`, sin depender de un ID fijo.
2. Recorre **todas las subcarpetas**, a cualquier profundidad, y omite las carpetas del parámetro `custscript_drt_su_excluir` junto con sus subcarpetas.
3. Busca los archivos cuyo nombre termina en `.js`. Excluye `.json`, `.js.bak` y similares.
4. Identifica los archivos que pertenecen a un **bundle**. Reutiliza lógica de los scripts de diagnóstico:
   - Consulta SuiteQL a `script` (`scriptfile`, `frombundle`): marca los archivos de scripts **instalados desde un bundle**.
   - `N/suiteAppInfo.listBundlesContainingScripts`: marca los archivos de scripts **incluidos en bundles de la cuenta**.
   - Si la consulta de bundles falla, el archivo también se marca para omitirse, porque no se pudo confirmar que sea seguro modificarlo.
5. Envía cada archivo a `reduce` usando su **Internal ID** como clave.

> No existe etapa `map`. Oracle permite omitirla cuando existe `reduce`.

### `reduce`: analizar y actualizar cada archivo

1. Abre el archivo con `N/file` y lee su contenido.
2. Busca la anotación `@NApiVersion`. Solo la considera válida si aparece **exactamente una vez** y **dentro de un bloque de comentario** (`/** ... */`).
3. Aplica las reglas en este orden:

| Situación | Resultado |
| --- | --- |
| Sin anotación, anotación repetida o fuera de comentario | `OMITIDO` (requiere revisión manual) |
| Versión `2.1` | `YA EN 2.1` (no se toca) |
| Archivo de bundle o no verificable | `OMITIDO` |
| Archivo dentro de `SuiteBundles/` | `OMITIDO` |
| Versión distinta de `2.0`, `2.x` o `2.X` (por ejemplo `1.0`) | `OMITIDO` |
| `2.0`, `2.x` o `2.X` en **simulación** | `PENDIENTE (SIMULACION)` |
| `2.0`, `2.x` o `2.X` con **Aplicar cambios** | Se actualiza → `ACTUALIZADO` |

4. Al actualizar, reemplaza **únicamente los caracteres del valor** de la versión (por ejemplo `2.x` → `2.1`). El resto del archivo queda igual: código, comentarios, saltos de línea y acentos.
5. Si ocurre un error de lectura, de permisos o de escritura, se registra como `ERROR` y el proceso continúa con los demás archivos.

### `summarize`: reporte

Genera un archivo `.txt` en la carpeta del parámetro `custscript_drt_su_reporte` (o en la carpeta raíz si está vacío), con este nombre:

```
drt_script_update_<cuenta>_<SIMULACION|ACTUALIZACION>_<AAAAMMDD_HHMMSS>.txt
```

El reporte incluye:

- Fecha, cuenta, ambiente, modo, duración y unidades de gobernanza usadas.
- Totales: analizados, actualizados, pendientes (solo en simulación), ya en 2.1, omitidos y con errores.
- Detalle por archivo: Internal ID, nombre, ruta, versión original, resultado y motivo.
- Errores no controlados de cualquier etapa, si los hubo.

El detalle está **separado por tabuladores**, así que se puede copiar y pegar directamente en Excel.

---

## 2. Cómo se guardan los cambios (punto clave a validar)

Según la documentación oficial de Oracle, el módulo `N/file` **no permite cambiar el contenido de un archivo ya cargado**: solo existe `getContents()` para leerlo.

Por eso el script hace lo siguiente:

1. Crea un archivo con el **mismo nombre, tipo y carpeta** que el original, con el contenido ya actualizado.
2. Copia la descripción, "Disponible sin iniciar sesión", el estado inactivo y la codificación del original.
3. Lo guarda con `save()`. NetSuite **sobrescribe** el archivo existente porque coincide el nombre y la carpeta.
4. **Verifica** que el Internal ID devuelto sea el mismo que el original y vuelve a leer el archivo para confirmar que dice `2.1`. Si algo no coincide, lo reporta como `ERROR`.

> ⚠️ Que este mecanismo conserve el Internal ID **no está escrito de forma explícita** en la referencia de `N/file`. Es el comportamiento que reporta la comunidad y el que Oracle describe para la sobrescritura desde la interfaz del File Cabinet. Por eso **lo primero que hay que confirmar en la prueba es que los Internal IDs no cambien** (paso 4 del plan de pruebas).

Se descartó `file.copy` con `NameConflictResolution.OVERWRITE`: requiere crear un archivo temporal y borrarlo después, y su documentación tampoco garantiza que se conserve el ID.

---

## 3. Parámetros del script

Los parámetros se crean en el **Script Record**, pestaña **Parameters**. Sus valores se asignan en el **Deployment**.

Al crear cada parámetro, en el campo **ID** se escribe la parte que va después de `custscript` (por ejemplo `_drt_su_raiz`); NetSuite agrega el prefijo automáticamente.

| ID final | ID a escribir | Etiqueta sugerida | Tipo | Obligatorio | Si se deja vacío |
| --- | --- | --- | --- | --- | --- |
| `custscript_drt_su_raiz` | `_drt_su_raiz` | Carpeta raíz (ID) | Integer Number | No | Usa la carpeta `SuiteScripts` |
| `custscript_drt_su_excluir` | `_drt_su_excluir` | Carpetas excluidas (IDs separados por coma) | Free-Form Text | No | No excluye ninguna |
| `custscript_drt_su_reporte` | `_drt_su_reporte` | Carpeta del reporte (ID) | Integer Number | No | Guarda el reporte en la carpeta raíz |
| `custscript_drt_su_aplicar` | `_drt_su_aplicar` | Aplicar cambios | Check Box | No | **Simulación** (no modifica nada) |

**Uso de cada parámetro:**

- **Carpeta raíz:** durante las pruebas se debe apuntar a una **carpeta de prueba**. Para la ejecución final se deja vacía (todo `SuiteScripts`) o se indica la carpeta deseada.
- **Carpetas excluidas:** sirve para proteger carpetas que contienen librerías de bundles propios (ver [Limitaciones](#7-limitaciones-y-riesgos)). Ejemplo: `1234, 5678`.
- **Carpeta del reporte:** se recomienda una carpeta dedicada, por ejemplo `SuiteScripts/drt_script_update/reportes`.
- **Aplicar cambios:** **solo se marca** cuando la simulación ya fue revisada.

---

## 4. Despliegue y ejecución

1. **Subir el archivo** `drt_script_update_mr.js` a `SuiteScripts/drt_script_update/`:
   - Con SDF: `suitecloud project:deploy` desde la raíz del proyecto, **o**
   - Manualmente desde *Documentos > Archivos > File Cabinet*.
2. **Crear el Script Record:** *Personalización > Scripting > Scripts > Nuevo*.
   - Archivo: `drt_script_update_mr.js`.
   - Nombre: `DRT - SCRIPT UPDATE MR`.
   - ID: `_drt_script_update_mr`.
   - Crear los 4 parámetros de la [sección 3](#3-parámetros-del-script).
3. **Crear el Deployment** (pestaña *Deployments* del script):
   - ID: `_drt_script_update_mr`.
   - Status: **Not Scheduled**.
   - Log Level: **Audit** (o **Debug** durante las pruebas).
   - Completar los valores de los parámetros. **Aplicar cambios desmarcado.**
4. **Ejecutar:** en el Deployment, **Save and Execute**.
5. **Seguimiento:** *Personalización > Scripting > Map/Reduce Script Status* para ver el avance, y el **Execution Log** del deployment:
   - `getInputData`: modo, carpeta raíz, número de carpetas y de archivos `.js` encontrados.
   - `summarize`: nombre e Internal ID del reporte generado, archivos procesados, unidades y segundos.
6. **Revisar el reporte** `.txt` en la carpeta configurada.

> Consumo aproximado: unas **40 unidades por archivo actualizado** (leer, guardar y volver a leer). Cada ejecución de `reduce` procesa un solo archivo, muy por debajo del límite de 5,000 unidades.

---

## 5. Plan de pruebas

### Preparación

- [ ] **Respaldo:** descargar la carpeta `SuiteScripts` antes de cualquier ejecución real (con `suitecloud file:import` o descargando la carpeta desde el File Cabinet).
- [ ] Crear una carpeta de prueba, por ejemplo `SuiteScripts/drt_prueba_update`, con una subcarpeta `sub`.
- [ ] Crear dentro los archivos de la tabla siguiente y **anotar el Internal ID de cada uno**.

| Archivo | Contenido de la cabecera | Resultado esperado (simulación) | Resultado esperado (real) |
| --- | --- | --- | --- |
| `prueba_20.js` | `@NApiVersion 2.0` | PENDIENTE (SIMULACION) | ACTUALIZADO |
| `prueba_2x.js` | `@NApiVersion 2.x` | PENDIENTE (SIMULACION) | ACTUALIZADO |
| `prueba_2X.js` | `@NApiVersion 2.X` | PENDIENTE (SIMULACION) | ACTUALIZADO |
| `prueba_21.js` | `@NApiVersion 2.1` | YA EN 2.1 | YA EN 2.1 |
| `prueba_sin_anotacion.js` | Sin `@NApiVersion` | OMITIDO | OMITIDO |
| `prueba_duplicada.js` | `@NApiVersion` dos veces | OMITIDO | OMITIDO |
| `sub/prueba_sub.js` | `@NApiVersion 2.x` | PENDIENTE (SIMULACION) | ACTUALIZADO |
| `prueba.json` | Cualquiera | No aparece en el reporte | No aparece en el reporte |

Cabecera de ejemplo para los archivos de prueba:

```js
/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/log'], function (log) {
    function execute() {
        log.audit('Prueba', 'Ejecución correcta: áéíóú ñ');
    }
    return { execute: execute };
});
```

- [ ] En `prueba_20.js`, poner una **descripción** y marcar **Disponible sin iniciar sesión** para comprobar que se conservan.

### Pruebas

| # | Prueba | Cómo | Resultado esperado | OK |
| --- | --- | --- | --- | --- |
| 1 | Simulación en carpeta de prueba | Carpeta raíz = carpeta de prueba, Aplicar cambios **desmarcado** | El reporte coincide con la columna "simulación". **Ningún archivo cambia** (revisar la fecha de modificación). | [ ] |
| 2 | Actualización real en carpeta de prueba | Igual que la prueba 1 pero con Aplicar cambios **marcado** | El reporte coincide con la columna "real" | [ ] |
| 3 | Solo cambia la versión | Descargar los archivos actualizados y compararlos con los originales | La única diferencia es el valor de `@NApiVersion` | [ ] |
| 4 | **Internal ID conservado** | Comparar los Internal IDs con los anotados | **Son los mismos**, sin archivos duplicados en la carpeta | [ ] |
| 5 | Atributos conservados | Revisar `prueba_20.js` | Mantiene la descripción y "Disponible sin iniciar sesión". Revisar también el propietario. | [ ] |
| 6 | Script Record asociado | Crear un Scheduled Script de prueba con `prueba_2x.js` **antes** de la prueba 2. Después de actualizar, abrir el Script Record y ejecutarlo. | El registro muestra API Version 2.1 y el script se ejecuta sin errores | [ ] |
| 7 | Idempotencia | Volver a ejecutar la prueba 2 | Todos aparecen como `YA EN 2.1` u `OMITIDO`; no se modifica ningún archivo | [ ] |
| 8 | Error de guardado | Opcional: ejecutar con un rol sin permiso de edición sobre la carpeta | El archivo aparece como `ERROR` y el resto se procesa | [ ] |
| 9 | Simulación sobre todo `SuiteScripts` | Carpeta raíz vacía, Aplicar cambios **desmarcado** | Revisar el reporte completo. Los scripts que el diagnóstico identificó en bundles deben aparecer como `OMITIDO`. | [ ] |
| 10 | Exclusión de carpetas | Agregar en Carpetas excluidas las carpetas de librerías de bundles propios y repetir la prueba 9 | Esos archivos ya no aparecen en el reporte | [ ] |

> Si la **prueba 4 falla** (cambia el Internal ID o aparece un duplicado), **no se debe ejecutar** la actualización sobre `SuiteScripts` y hay que avisar al desarrollador.

### Ejecución final

- [ ] Pruebas 1 a 10 aprobadas.
- [ ] Respaldo de `SuiteScripts` tomado ese mismo día.
- [ ] Ejecución con carpeta raíz vacía (o la carpeta acordada), carpetas excluidas configuradas y **Aplicar cambios marcado**.
- [ ] Revisar el reporte: los archivos con `ERROR` u `OMITIDO` quedan para revisión manual.
- [ ] Probar funcionalmente los scripts actualizados (ver [Limitaciones](#7-limitaciones-y-riesgos)).

---

## 6. Cómo leer el reporte

Ejemplo obtenido en la prueba local (datos ficticios):

```
DRT - ACTUALIZACION DE SUITESCRIPT A 2.1
==================================================
Fecha de ejecucion : Wed Oct 14 2026 06:00:00 GMT-0600
Cuenta             : TSTDRV123 (SANDBOX)
Modo               : ACTUALIZACION (los cambios se guardaron en el File Cabinet)
Duracion           : 12 s | Uso: 345 unidades

RESUMEN
-------
Total de archivos analizados       : 18
Actualizados correctamente         : 8
Ya utilizaban la version 2.1       : 2
Omitidos                           : 7
Con errores                        : 1

DETALLE POR ARCHIVO (columnas separadas por tabulador)
-----------------------------------------------------
INTERNAL ID  NOMBRE            RUTA                                   VERSION ORIGINAL  RESULTADO   DETALLE
2            a2x.js            SuiteScripts/proyecto/a2x.js           2.x               ACTUALIZADO 2.x -> 2.1
4            a21.js            SuiteScripts/proyecto/a21.js           2.1               YA EN 2.1
9            bundle_creado.js  SuiteScripts/proyecto/bundle_creado.js 2.x               OMITIDO     Script customscript_bundle_creado incluido en bundle(s) 555
6            duplicada.js      SuiteScripts/proyecto/duplicada.js     2.x, 2.0          OMITIDO     Anotacion NApiVersion repetida 2 veces; requiere revision manual
16           bloqueado.js      SuiteScripts/proyecto/bloqueado.js     2.0               ERROR       INSUFFICIENT_PERMISSION: You do not have privileges to edit this file
```

| Resultado | Significado | Acción |
| --- | --- | --- |
| `ACTUALIZADO` | Se cambió la versión a 2.1 y se verificó el guardado | Probar funcionalmente el script |
| `PENDIENTE (SIMULACION)` | Se actualizaría al ejecutar con Aplicar cambios | Ninguna; es solo informativo |
| `YA EN 2.1` | El archivo ya estaba en 2.1 | Ninguna |
| `OMITIDO` | No se modificó; el motivo está en DETALLE | Revisar manualmente o dejarlo para otra etapa (bundles, 1.0) |
| `ERROR` | Falló la lectura o el guardado | Revisar el mensaje y los permisos |

---

## 7. Limitaciones y riesgos

- **Conservación del Internal ID:** el mecanismo de guardado no está documentado explícitamente por Oracle (ver [sección 2](#2-cómo-se-guardan-los-cambios-punto-clave-a-validar)). El script lo verifica en cada archivo, pero debe confirmarse en la prueba 4.
- **Librerías dentro de bundles propios:** ninguna API oficial indica si un archivo que **no** es el archivo principal de un script (por ejemplo, un módulo compartido) forma parte de un bundle. Esas carpetas deben excluirse con `custscript_drt_su_excluir`, usando la información de los scripts de diagnóstico.
- **Compatibilidad funcional:** cambiar la anotación **no garantiza** que el código funcione igual en el runtime de 2.1. Los scripts actualizados deben probarse funcionalmente.
- **Script Record:** confirmar en la prueba 6 que el registro del script refleja la nueva versión después de actualizar el archivo.
- **Reintentos de NetSuite:** si NetSuite reinicia un `reduce` después de haber guardado, el archivo aparece como `YA EN 2.1` con la nota "Reintento".
- **Archivos mayores a 10 MB:** aparecen como `ERROR` por el límite de la API.
- **Archivos bloqueados de bundles instalados:** NetSuite no permite sobrescribirlos. Además están en `SuiteBundles`, fuera de `SuiteScripts`.
- **Ediciones simultáneas:** si alguien modifica un archivo mientras corre el proceso, prevalece el último guardado. Se recomienda ejecutarlo cuando nadie esté desplegando cambios.

---

## 8. Cómo revertir un cambio

1. El reporte indica, por cada archivo actualizado, su **Internal ID**, su **ruta** y su **versión original**.
2. Para revertir un archivo, basta con cambiar `2.1` por la versión original en la anotación, o restaurarlo desde el respaldo de la preparación.
3. Como solo cambia el valor de la versión, revertir no afecta ninguna otra parte del archivo.

---

## 9. Preguntas frecuentes

### ¿Cómo pruebo el script sin modificar archivos?

Dejando **Aplicar cambios** desmarcado. En ese modo `reduce` **nunca llama** a `actualizarArchivo`, así que no se ejecuta ningún `file.create` ni `save`. El reporte muestra los candidatos como `PENDIENTE (SIMULACION)`.

**No hace falta comentar código.** Si se comenta el guardado o se cambia por `const idGuardado = "";`, la validación del Internal ID que viene justo después falla y todos los candidatos salen como `ERROR`.

### ¿Por qué no se usa `archivo.save()`?

El objeto que devuelve `file.load` **no permite cambiar su contenido**: no existe propiedad ni método para asignarlo, solo `getContents()` para leerlo. `archivo.save()` volvería a guardar el contenido original, sin el cambio de versión. La verificación posterior detectaría que el archivo sigue en `2.x` y lo reportaría como `ERROR`.

Por eso se usa `file.create` con el **mismo nombre, tipo y carpeta**. Al guardarlo, NetSuite sobrescribe el archivo existente, y el script comprueba que el Internal ID sea el mismo y que el contenido guardado diga `2.1` (ver [sección 2](#2-cómo-se-guardan-los-cambios-punto-clave-a-validar)).

### Ejecuté con "Aplicar cambios" y el archivo no cambió

Revisar el reporte `.txt` de esa ejecución:

| Qué dice el reporte | Causa probable | Qué hacer |
| --- | --- | --- |
| `Modo: SIMULACION` | El checkbox no está marcado en el Deployment, o el ID del parámetro no es exactamente `custscript_drt_su_aplicar` | Revisar la pestaña *Parameters* del Script Record (que no haya quedado con doble prefijo, por ejemplo `custscriptcustscript_...`) y marcar el checkbox en el Deployment |
| El archivo no aparece | Está fuera de la carpeta raíz, en una carpeta excluida o su nombre no termina en `.js` | Revisar los parámetros de carpetas |
| `OMITIDO` | El motivo está en la columna DETALLE | Según el motivo |
| `ERROR` | Falló la lectura o el guardado | Revisar el mensaje (por ejemplo, permisos) |
| `ACTUALIZADO` | El archivo **sí** se guardó y se volvió a leer con `2.1` | Ver la nota siguiente |

Si el reporte dice `ACTUALIZADO` pero el archivo "se ve" igual:

- **Caché del navegador:** recargar la vista del archivo o descargarlo de nuevo desde el File Cabinet.
- **Copia local:** el script modifica el archivo **en el File Cabinet de NetSuite**, no la copia del proyecto SDF en el equipo ni el repositorio.
- **Otro archivo con el mismo nombre en otra carpeta:** comparar el Internal ID con el del reporte.

### Cuidado al desplegar con SDF después de actualizar

Las copias de los archivos en el repositorio siguen con la versión anterior. Si se ejecuta `suitecloud project:deploy` con esas copias, **se sobrescriben los archivos del File Cabinet y vuelven a `2.x`**. Antes de volver a desplegar esos archivos hay que actualizar el repositorio (etapa 7 del plan).

---

## 10. Fuera de alcance de esta etapa

- Diagnóstico general de la cuenta (etapa 1, ya desarrollada).
- Análisis y migración de SuiteScript 1.0.
- Análisis y actualización de bundles propios o de terceros.
- Actualizaciones mediante Git.
- Refactorización del código de los archivos procesados.

---

## Referencias (documentación oficial de Oracle NetSuite)

- [N/file Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4205693274.html)
- [File.save()](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4229271179.html)
- [file.create(options)](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4223861820.html)
- [file.copy(options)](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_161167269293.html)
- [file.NameConflictResolution](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_161167377495.html)
- [Uploading Files to the File Cabinet](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N542268.html)
- [N/suiteAppInfo Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_160236086332.html)
