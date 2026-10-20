/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 10/2026
 * Script name: DRT - SCRIPT UPDATE MR
 * Script id: customscript_drt_script_update_mr
 * Deployment id: customdeploy_drt_script_update_mr
 * Applied to: File Cabinet (carpeta de scripts y subcarpetas)
 * File: drt_script_update_mr.js
 *
 * Etapa 2: actualiza la anotacion NApiVersion de los archivos .js
 * de 2.0 / 2.x / 2.X a 2.1. No modifica ninguna otra parte del archivo.
 *
 * Parametros del deployment:
 *   custscript_drt_su_raiz     (Entero)   Carpeta raiz. Vacio = carpeta "SuiteScripts".
 *   custscript_drt_su_excluir  (Texto)    IDs de carpetas a excluir (con sus subcarpetas), separados por coma.
 *   custscript_drt_su_reporte  (Entero)   Carpeta del reporte .txt. Vacio = carpeta raiz.
 *   custscript_drt_su_aplicar  (Checkbox) Marcado = guarda los cambios. Desmarcado = simulacion.
 ******************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/file',
    'N/query',
    'N/runtime',
    'N/search',
    'N/suiteAppInfo'
], (
    file,
    query,
    runtime,
    search,
    suiteAppInfo
) => {

    const PARAMETROS = {
        CARPETA_RAIZ: 'custscript_drt_su_raiz',
        CARPETAS_EXCLUIDAS: 'custscript_drt_su_excluir',
        CARPETA_REPORTE: 'custscript_drt_su_reporte',
        APLICAR_CAMBIOS: 'custscript_drt_su_aplicar',
    };

    const NOMBRE_CARPETA_RAIZ_DEFAULT = 'SuiteScripts';
    const VERSION_DESTINO = '2.1';
    const VERSIONES_A_ACTUALIZAR = ['2.0', '2.x', '2.X'];

    // Cantidad de IDs por filtro "anyof" y por llamada a N/suiteAppInfo
    const TAMANO_LOTE_FILTRO = 500;
    const TAMANO_LOTE_BUNDLES = 100;

    const ESTADO = {
        ACTUALIZADO: 'ACTUALIZADO',
        SIMULADO: 'PENDIENTE (SIMULACION)',
        YA_21: 'YA EN 2.1',
        OMITIDO: 'OMITIDO',
        ERROR: 'ERROR',
    };

    /**
     * Localiza los archivos .js de la carpeta raiz y todas sus subcarpetas.
     * Devuelve un objeto { idArchivo: datosArchivo } para que cada archivo llegue a reduce con su Internal ID como key.
     * Los archivos que pertenecen a un bundle se marcan con motivoOmision para no modificarlos.
     * @param {Object} inputContext
     * @returns {Object} Archivos a procesar
     */
    const getInputData = (inputContext) => {
        const script = runtime.getCurrentScript();
        const carpetaRaiz = obtenerCarpetaRaiz(script.getParameter({ name: PARAMETROS.CARPETA_RAIZ }));
        const carpetasExcluidas = new Set(convertirListaIds(script.getParameter({ name: PARAMETROS.CARPETAS_EXCLUIDAS })));

        const carpetas = obtenerCarpetas(carpetaRaiz.id, carpetasExcluidas);
        const archivos = obtenerArchivosJs(carpetas);
        marcarArchivosEnBundle(archivos);

        log.audit(`getInputData`, `Modo: ${aplicarCambios() ? 'ACTUALIZACION' : 'SIMULACION'} | ` +
            `Carpeta raiz: ${carpetaRaiz.nombre} (${carpetaRaiz.id}) | Carpetas: ${carpetas.length} | ` +
            `Archivos .js: ${Object.keys(archivos).length} | Gobernanza restante: ${script.getRemainingUsage()}`);
        return archivos;
    }

    /**
     * Abre cada archivo, identifica su version y, si es 2.0 / 2.x / 2.X, reemplaza solo el valor de la anotacion por 2.1.
     * Los errores se controlan por archivo para no detener el procesamiento de los demas.
     * @param {Object} reduceContext
     */
    const reduce = (reduceContext) => {
        const datos = JSON.parse(reduceContext.values[0]);
        const resultado = {
            id: String(datos.id || reduceContext.key),
            nombre: datos.nombre,
            ruta: ``,
            versionOriginal: ``,
            estado: ``,
            detalle: ``,
        };
        try {
            const archivo = file.load({ id: resultado.id });
            resultado.nombre = archivo.name;
            resultado.ruta = archivo.path;

            const contenido = archivo.getContents();
            const anotacion = buscarAnotacion(contenido);
            resultado.versionOriginal = anotacion.version;

            if (anotacion.error) {
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = anotacion.error;
            } else if (anotacion.version === VERSION_DESTINO) {
                resultado.estado = ESTADO.YA_21;
                if (reduceContext.executionNo > 1) {
                    resultado.detalle = `Reintento: el archivo pudo actualizarse en un intento anterior`;
                }
            } else if (datos.motivoOmision) {
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = datos.motivoOmision;
            } else if (/^SuiteBundles\//i.test(archivo.path)) {
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = `Archivo ubicado en la carpeta SuiteBundles`;
            } else if (!VERSIONES_A_ACTUALIZAR.includes(anotacion.version)) {
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = `Version no contemplada para actualizacion automatica`;
            } else if (!aplicarCambios()) {
                resultado.estado = ESTADO.SIMULADO;
                resultado.detalle = `Se actualizaria de ${anotacion.version} a ${VERSION_DESTINO}`;
            } else {
                actualizarArchivo(archivo, contenido, anotacion);
                resultado.estado = ESTADO.ACTUALIZADO;
                resultado.detalle = `${anotacion.version} -> ${VERSION_DESTINO}`;
            }
        } catch (error) {
            resultado.estado = ESTADO.ERROR;
            resultado.detalle = `${error.name || 'ERROR'}: ${error.message || error}`;
            log.error(`reduce archivo ${resultado.id}`, resultado.detalle);
        }

        reduceContext.write({
            key: resultado.id,
            value: JSON.stringify(resultado),
        });
    }

    /**
     * Genera el reporte .txt con los totales y el detalle por archivo, incluyendo los errores no controlados de cada etapa.
     * @param {Object} summaryContext
     */
    const summarize = (summaryContext) => {
        const resultados = [];
        summaryContext.output.iterator().each((key, value) => {
            resultados.push(JSON.parse(value));
            return true;
        });

        const erroresEtapas = [];
        const archivosConErrorNoControlado = new Set();
        if (summaryContext.inputSummary.error) {
            erroresEtapas.push(`getInputData: ${mensajeErrorSerializado(summaryContext.inputSummary.error)}`);
        }
        summaryContext.reduceSummary.errors.iterator().each((key, error, executionNo) => {
            archivosConErrorNoControlado.add(key);
            erroresEtapas.push(`reduce archivo ${key} (intento ${executionNo}): ${mensajeErrorSerializado(error)}`);
            return true;
        });
        const idsConResultado = new Set(resultados.map((resultado) => resultado.id));
        const erroresSinResultado = [...archivosConErrorNoControlado].filter((id) => !idsConResultado.has(id)).length;

        const reporte = construirReporte(resultados, erroresEtapas, erroresSinResultado, summaryContext);
        const modo = aplicarCambios() ? 'ACTUALIZACION' : 'SIMULACION';
        const marcaTiempo = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
        const nombreReporte = `drt_script_update_${runtime.accountId}_${modo}_${marcaTiempo}.txt`;

        try {
            const idReporte = file.create({
                name: nombreReporte,
                fileType: file.Type.PLAINTEXT,
                contents: reporte,
                encoding: file.Encoding.UTF8,
                folder: obtenerCarpetaReporte(),
            }).save();
            log.audit(`summarize`, `Reporte ${nombreReporte} guardado con ID ${idReporte} | Archivos: ${resultados.length} | ` +
                `Uso: ${summaryContext.usage} unidades | ${summaryContext.seconds} s`);
        } catch (error) {
            log.error(`summarize: no se pudo guardar el reporte`, `${error.name || 'ERROR'}: ${error.message || error}`);
            log.audit(`summarize: contenido del reporte (truncado)`, reporte.slice(0, 3900));
        }
    }

    /**
     * Resuelve la carpeta raiz desde el parametro; si esta vacio, busca la carpeta de primer nivel "SuiteScripts".
     * @param {string|number} idParametro
     * @returns {{id: string, nombre: string}}
     */
    const obtenerCarpetaRaiz = (idParametro) => {
        const filtros = idParametro
            ? [['internalid', 'anyof', String(idParametro)]]
            : [['name', 'is', NOMBRE_CARPETA_RAIZ_DEFAULT]];
        const carpetas = [];
        recorrerBusqueda(search.create({
            type: 'folder',
            filters: filtros,
            columns: ['name', 'parent'],
        }), (resultado) => {
            if (idParametro || !resultado.getValue('parent')) {
                carpetas.push({ id: String(resultado.id), nombre: resultado.getValue('name') });
            }
        });

        if (carpetas.length !== 1) {
            throw new Error(idParametro
                ? `La carpeta raiz ${idParametro} no existe o no es accesible`
                : `No se encontro una unica carpeta "${NOMBRE_CARPETA_RAIZ_DEFAULT}" de primer nivel; configure ${PARAMETROS.CARPETA_RAIZ}`);
        }
        return carpetas[0];
    }

    /**
     * Recorre por niveles el arbol de carpetas a partir de la raiz y devuelve sus IDs, omitiendo las carpetas excluidas.
     * @param {string} idRaiz
     * @param {Set<string>} carpetasExcluidas
     * @returns {string[]}
     */
    const obtenerCarpetas = (idRaiz, carpetasExcluidas) => {
        const visitadas = new Set([idRaiz]);
        let nivelActual = [idRaiz];
        while (nivelActual.length) {
            const siguienteNivel = [];
            dividirEnLotes(nivelActual, TAMANO_LOTE_FILTRO).forEach((lote) => {
                recorrerBusqueda(search.create({
                    type: 'folder',
                    filters: [['parent', 'anyof', lote]],
                    columns: ['internalid'],
                }), (resultado) => {
                    const idCarpeta = String(resultado.id);
                    if (!visitadas.has(idCarpeta) && !carpetasExcluidas.has(idCarpeta)) {
                        visitadas.add(idCarpeta);
                        siguienteNivel.push(idCarpeta);
                    }
                });
            });
            nivelActual = siguienteNivel;
        }
        return [...visitadas];
    }

    /**
     * Busca los archivos cuyo nombre termina en .js dentro de las carpetas indicadas.
     * @param {string[]} carpetas
     * @returns {Object} { idArchivo: { id, nombre, motivoOmision } }
     */
    const obtenerArchivosJs = (carpetas) => {
        const archivos = {};
        dividirEnLotes(carpetas, TAMANO_LOTE_FILTRO).forEach((lote) => {
            recorrerBusqueda(search.create({
                type: 'file',
                filters: [
                    ['folder', 'anyof', lote],
                    'AND',
                    ['name', 'contains', '.js'],
                ],
                columns: ['name'],
            }), (resultado) => {
                const nombre = resultado.getValue('name');
                if (/\.js$/i.test(nombre)) {
                    archivos[resultado.id] = { id: String(resultado.id), nombre, motivoOmision: `` };
                }
            });
        });
        return archivos;
    }

    /**
     * Marca con motivoOmision los archivos que son el archivo principal de un script instalado desde un bundle
     * o incluido en algun bundle de la cuenta. Si la consulta de bundles falla, el archivo tambien se omite.
     * @param {Object} archivos
     */
    const marcarArchivosEnBundle = (archivos) => {
        const agregarMotivo = (archivo, motivo) => {
            archivo.motivoOmision = archivo.motivoOmision ? `${archivo.motivoOmision}; ${motivo}` : motivo;
        };

        const archivosPorScript = {};
        const paginas = query.runSuiteQLPaged({
            query: `SELECT s.scriptid, s.scriptfile, s.frombundle FROM script AS s WHERE s.scriptfile IS NOT NULL`,
            pageSize: 1000,
        }).iterator();
        paginas.each((pagina) => {
            pagina.value.data.asMappedResults().forEach((fila) => {
                const archivo = archivos[String(fila.scriptfile)];
                if (!archivo) return;
                const scriptId = String(fila.scriptid).toLowerCase();
                (archivosPorScript[scriptId] = archivosPorScript[scriptId] || []).push(archivo);
                if (fila.frombundle) {
                    agregarMotivo(archivo, `Script ${scriptId} instalado desde bundle ${fila.frombundle}`);
                }
            });
            return true;
        });

        dividirEnLotes(Object.keys(archivosPorScript), TAMANO_LOTE_BUNDLES).forEach((lote) => {
            try {
                const bundlesPorScript = suiteAppInfo.listBundlesContainingScripts({ scriptIds: lote }) || {};
                Object.keys(bundlesPorScript).forEach((scriptId) => {
                    const bundles = [].concat(bundlesPorScript[scriptId] || []);
                    const archivosScript = archivosPorScript[scriptId.toLowerCase()] || [];
                    if (bundles.length) {
                        archivosScript.forEach((archivo) => agregarMotivo(archivo, `Script ${scriptId} incluido en bundle(s) ${bundles.join(', ')}`));
                    }
                });
            } catch (error) {
                log.error(`marcarArchivosEnBundle`, `${error.name || 'ERROR'}: ${error.message || error}`);
                lote.forEach((scriptId) => archivosPorScript[scriptId].forEach((archivo) =>
                    agregarMotivo(archivo, `No se pudo verificar si el script ${scriptId} pertenece a un bundle`)));
            }
        });
    }

    /**
     * Identifica la anotacion de version. Solo se considera valida si aparece exactamente una vez
     * y dentro de un bloque de comentario; en cualquier otro caso se devuelve error para omitir el archivo.
     * @param {string} contenido
     * @returns {{version: string, inicioValor?: number, finValor?: number, error?: string}}
     */
    const buscarAnotacion = (contenido) => {
        const patron = /@NApiVersion[ \t]+([^\s*]+)/gi;
        const coincidencias = [];
        let coincidencia = patron.exec(contenido);
        while (coincidencia) {
            coincidencias.push(coincidencia);
            coincidencia = patron.exec(contenido);
        }

        if (!coincidencias.length) {
            return { version: ``, error: `Sin anotacion NApiVersion` };
        }
        if (coincidencias.length > 1) {
            return {
                version: coincidencias.map((item) => item[1]).join(', '),
                error: `Anotacion NApiVersion repetida ${coincidencias.length} veces; requiere revision manual`,
            };
        }

        const [unica] = coincidencias;
        const version = unica[1];
        const textoPrevio = contenido.slice(0, unica.index);
        if (textoPrevio.lastIndexOf('/*') <= textoPrevio.lastIndexOf('*/')) {
            return { version, error: `La anotacion NApiVersion no esta dentro de un bloque de comentario` };
        }

        const inicioValor = unica.index + unica[0].length - version.length;
        return { version, inicioValor, finValor: inicioValor + version.length };
    }

    /**
     * Reemplaza unicamente el valor de la anotacion y guarda el archivo.
     * N/file no permite asignar contenido a un archivo cargado, por eso se crea un archivo con el mismo nombre,
     * tipo y carpeta: al guardarlo NetSuite sobrescribe el existente. Se valida que el Internal ID no cambie
     * y que la version guardada sea la esperada.
     * @param {file.File} archivo
     * @param {string} contenido
     * @param {{version: string, inicioValor: number, finValor: number}} anotacion
     */
    const actualizarArchivo = (archivo, contenido, anotacion) => {
        const contenidoActualizado = contenido.slice(0, anotacion.inicioValor) + VERSION_DESTINO + contenido.slice(anotacion.finValor);

        const opciones = {
            name: archivo.name,
            fileType: archivo.fileType,
            contents: contenidoActualizado,
            folder: archivo.folder,
            isOnline: archivo.isOnline,
            isInactive: archivo.isInactive,
        };
        if (archivo.description) opciones.description = archivo.description;
        if (archivo.encoding) opciones.encoding = archivo.encoding;

        const idGuardado = String(file.create(opciones).save());
        if (idGuardado !== String(archivo.id)) {
            throw new Error(`El guardado genero el Internal ID ${idGuardado} en lugar de ${archivo.id}; revisar el archivo manualmente`);
        }

        const verificacion = buscarAnotacion(file.load({ id: idGuardado }).getContents());
        if (verificacion.error || verificacion.version !== VERSION_DESTINO) {
            throw new Error(`Verificacion posterior al guardado fallida: version encontrada "${verificacion.version}"`);
        }
    }

    const construirReporte = (resultados, erroresEtapas, erroresSinResultado, summaryContext) => {
        const contar = (estado) => resultados.filter((resultado) => resultado.estado === estado).length;
        const modoReal = aplicarCambios();
        const ordenEstados = Object.values(ESTADO);
        const detalle = resultados
            .slice()
            .sort((a, b) => ordenEstados.indexOf(a.estado) - ordenEstados.indexOf(b.estado) || String(a.ruta).localeCompare(String(b.ruta)))
            .map((resultado) => [resultado.id, resultado.nombre, resultado.ruta, resultado.versionOriginal, resultado.estado, resultado.detalle]
                .map(limpiarCampo)
                .join('\t'));

        const lineas = [
            `DRT - ACTUALIZACION DE SUITESCRIPT A ${VERSION_DESTINO}`,
            `==================================================`,
            `Fecha de ejecucion : ${summaryContext.dateCreated}`,
            `Cuenta             : ${runtime.accountId} (${runtime.envType})`,
            `Modo               : ${modoReal ? 'ACTUALIZACION (los cambios se guardaron en el File Cabinet)' : 'SIMULACION (no se modifico ningun archivo)'}`,
            `Duracion           : ${summaryContext.seconds} s | Uso: ${summaryContext.usage} unidades`,
            ``,
            `RESUMEN`,
            `-------`,
            `Total de archivos analizados       : ${resultados.length + erroresSinResultado}`,
            `Actualizados correctamente         : ${contar(ESTADO.ACTUALIZADO)}`,
        ];
        if (!modoReal) {
            lineas.push(`Pendientes de actualizar (simul.)  : ${contar(ESTADO.SIMULADO)}`);
        }
        lineas.push(
            `Ya utilizaban la version ${VERSION_DESTINO}       : ${contar(ESTADO.YA_21)}`,
            `Omitidos                           : ${contar(ESTADO.OMITIDO)}`,
            `Con errores                        : ${contar(ESTADO.ERROR) + erroresSinResultado}`,
            ``,
            `DETALLE POR ARCHIVO (columnas separadas por tabulador)`,
            `-----------------------------------------------------`,
            ['INTERNAL ID', 'NOMBRE', 'RUTA', 'VERSION ORIGINAL', 'RESULTADO', 'DETALLE'].join('\t'),
            ...detalle
        );
        if (erroresEtapas.length) {
            lineas.push(``, `ERRORES NO CONTROLADOS`, `----------------------`, ...erroresEtapas);
        }
        return lineas.join('\n');
    }

    const obtenerCarpetaReporte = () => {
        const script = runtime.getCurrentScript();
        const carpetaReporte = script.getParameter({ name: PARAMETROS.CARPETA_REPORTE });
        return Number(carpetaReporte || obtenerCarpetaRaiz(script.getParameter({ name: PARAMETROS.CARPETA_RAIZ })).id);
    }

    const aplicarCambios = () => {
        const valor = runtime.getCurrentScript().getParameter({ name: PARAMETROS.APLICAR_CAMBIOS });
        return valor === true || valor === 'T';
    }

    const recorrerBusqueda = (busqueda, procesarResultado) => {
        const paginado = busqueda.runPaged({ pageSize: 1000 });
        paginado.pageRanges.forEach((rango) => {
            paginado.fetch({ index: rango.index }).data.forEach(procesarResultado);
        });
    }

    const dividirEnLotes = (elementos, tamano) => {
        const lotes = [];
        for (let i = 0; i < elementos.length; i += tamano) lotes.push(elementos.slice(i, i + tamano));
        return lotes;
    }

    const convertirListaIds = (valor) => String(valor || ``)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => /^-?\d+$/.test(id));

    const limpiarCampo = (valor) => String(valor === undefined || valor === null ? `` : valor).replace(/[\t\r\n]+/g, ' ');

    const mensajeErrorSerializado = (serializado) => {
        try {
            const error = JSON.parse(serializado);
            return `${error.name || 'ERROR'}: ${error.message || serializado}`;
        } catch (e) {
            return String(serializado);
        }
    }

    return {
        getInputData,
        reduce,
        summarize
    }

});
