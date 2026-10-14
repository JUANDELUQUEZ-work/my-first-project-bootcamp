# Prácticas de SuiteScript

Esta carpeta reúne las prácticas de NetSuite organizadas por tipo de script. La clasificación principal es el tipo de script porque determina sus eventos, responsabilidades y forma de ejecución.

## Índice por tipo de script

### Late 1: aviso de pago desde Invoice

- [Instalación manual, campos e IDs de scripts](./templates/practice/late-1/INSTALACION.md)
- Botón **Late 1**: busca la última Invoice creada con el formulario de la factura abierta y genera aviso + detalle en PDF.
- Empresa/subsidiaria leída de NetSuite; Café de Finca como nombre de respaldo. Datos bancarios ausentes vacíos y recargo de referencia calculado en EUR, sin contabilizarlo.
- Estado: código y pruebas locales preparados; pendiente la carga manual y comprobación del PDF en NetSuite.

### Client Scripts

- [Documentación: validación de categoría de cliente](./client-scripts/documentation.md)
- [Código: `drt_salesOrderCategory_cs.js`](./client-scripts/drt_salesOrderCategory_cs.js)

En esta categoría se documentan los módulos utilizados por cada script junto con sus eventos. Por ejemplo, `drt_salesOrderCategory_cs.js` usa `N/runtime` y `N/ui/dialog` dentro del mismo Client Script.

### User Event Script

- [Bitácora de la clase videograbaad](./user-event-sript/documentation.md)

Esta carpeta contiene una practica del tipo de script de User Event. con pruebas de finalizacion.

### Suitelets

- [Bitácora de la clase videograbada](./suitelets/bitacora.md)

Esta carpeta contiene por ahora únicamente apuntes de estudio. El ticket y los archivos de la práctica se agregarán cuando se defina el ejercicio.

### Próximos tipos

Cuando se agreguen nuevas prácticas, pueden crearse secciones y carpetas documentales equivalentes:

- `scheduled/` para Scheduled Scripts.
- `map-reduce/` para Map/Reduce Scripts.

Los módulos no se separan como categoría principal: se documentan dentro del tipo de script que los consume. Así se conserva el contexto de los eventos y se evita dividir una práctica en varios lugares solo porque utiliza más de un módulo.
