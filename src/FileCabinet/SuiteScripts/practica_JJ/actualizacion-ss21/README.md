# DRT - Actualización controlada a SuiteScript 2.1 (fase de viabilidad)

Esta carpeta contiene lo necesario para **validar en un sandbox** el mecanismo de actualización
antes de construir el Map/Reduce definitivo. Nada de aquí modifica archivos fuera de la carpeta de prueba.

| Archivo | Qué es |
| --- | --- |
| `drt_ss21_annotation_lib.js` | Librería pura (sin `N/*`): detecta `@NApiVersion`, construye el contenido actualizado, verifica que solo cambió la anotación y señala riesgos 2.0 → 2.1. Se reutilizará tal cual en el Map/Reduce. |
| `drt_ss21_poc_ss.js` | Scheduled Script de prueba de concepto. Crea 3 archivos de prueba y comprueba el reemplazo real en el File Cabinet. |
| `../../../../tests/drt_ss21_annotation_lib.test.cjs` | 28 pruebas en Node de la librería (escenarios 1–7, 12 y 13 del plan de pruebas). |

## Pruebas locales

```bash
node --test tests/drt_ss21_annotation_lib.test.cjs
# humo sobre los scripts reales del repositorio
SS21_SMOKE_DIR=src/FileCabinet/SuiteScripts node --test tests/drt_ss21_annotation_lib.test.cjs
```

## PoC en sandbox (no ejecutar en la cuenta de desarrollo de bundles)

1. En el File Cabinet del **sandbox**, crear una carpeta vacía, p. ej. `SuiteScripts/DRT_SS21_POC`, y anotar su Internal ID.
2. Subir a esa carpeta `drt_ss21_annotation_lib.js` y `drt_ss21_poc_ss.js` (deben quedar juntos).
3. Crear el Script Record (Scheduled) de `drt_ss21_poc_ss.js` con tres parámetros:
   - `custscript_drt_ss21poc_folder` (Integer): ID de la carpeta.
   - `custscript_drt_ss21poc_step` (Free-Form Text): `SETUP`, `OVERWRITE` o `RESTORE`.
   - `custscript_drt_ss21poc_confirm` (Free-Form Text): el Account ID del sandbox (por ejemplo `1234567_SB1`).
4. **SETUP** → *Save and Execute*. Crea `drt_ss21_poc_probe_ss.js`, `drt_ss21_poc_lib.js` y `drt_ss21_poc_incompatible.js`.
5. Crear un Script Record (Scheduled) para `drt_ss21_poc_probe_ss.js`, desplegarlo y ejecutarlo.
   Anotar el log `DRT SS21 PROBE` (debe decir `runtime=2.0`) y el campo **API Version** del registro.
6. **OVERWRITE** → ejecutar. Revisar el reporte `drt_ss21_poc_report_OVERWRITE_*.txt` en la carpeta.
7. Volver a ejecutar la sonda: anotar el log y el campo **API Version**. Repetir tras 10 minutos (caché).
8. **OVERWRITE** otra vez: no debe cambiar nada (idempotencia).
9. **RESTORE** → ejecutar. Revisar `drt_ss21_poc_report_RESTORE_*.txt`.

## Qué decide el PoC

| Resultado | Decisión |
| --- | --- |
| ID conservado, propiedades conservadas, sonda pasa a `runtime=2.1` | El Map/Reduce puede escribir directamente (diseño A). |
| ID conservado pero la sonda sigue en `runtime=2.0` o API Version no cambia | La escritura por SuiteScript no basta: el Map/Reduce prepara y respalda, y la publicación se hace por UI o SDF (diseño B). |
| Cambia el ID o se pierden propiedades no recuperables | No se usa `file.create` para reemplazar; solo diagnóstico. |
