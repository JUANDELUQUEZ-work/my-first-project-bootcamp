# Prácticas de SuiteScript

Esta carpeta reúne las prácticas de NetSuite organizadas por tipo de script. La clasificación principal es el tipo de script porque determina sus eventos, responsabilidades y forma de ejecución.

## Índice por tipo de script

### Client Scripts

- [Documentación: validación de categoría de cliente](./client-scripts/documentation.md)
- [Código: `drt_salesOrderCategory_cs.js`](./client-scripts/drt_salesOrderCategory_cs.js)

En esta categoría se documentan los módulos utilizados por cada script junto con sus eventos. Por ejemplo, `drt_salesOrderCategory_cs.js` usa `N/runtime` y `N/ui/dialog` dentro del mismo Client Script.

### Próximos tipos

Cuando se agreguen nuevas prácticas, pueden crearse secciones y carpetas documentales equivalentes:

- `scheduled/` para Scheduled Scripts.
- `map-reduce/` para Map/Reduce Scripts.
- `suitelets/` para Suitelets.

Los módulos no se separan como categoría principal: se documentan dentro del tipo de script que los consume. Así se conserva el contexto de los eventos y se evita dividir una práctica en varios lugares solo porque utiliza más de un módulo.
