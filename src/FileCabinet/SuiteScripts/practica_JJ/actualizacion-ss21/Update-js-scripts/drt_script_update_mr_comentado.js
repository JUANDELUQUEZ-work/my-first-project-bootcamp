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
 *
 * =====================================================================
 * VERSION COMENTADA LINEA POR LINEA (solo para estudio, el codigo es identico al original)
 *
 * RESUMEN DEL FLUJO COMPLETO:
 *   1. getInputData -> busca TODOS los .js dentro de la carpeta raiz (y subcarpetas) y marca
 *                      los que pertenecen a un bundle (esos no se tocan).
 *   2. (map)        -> no existe; NetSuite pasa los datos directo a reduce, agrupados por key.
 *   3. reduce       -> se ejecuta UNA vez por archivo: lo abre, lee la anotacion @NApiVersion
 *                      y, segun el caso, lo actualiza a 2.1, lo omite, o solo simula.
 *   4. summarize    -> junta los resultados de todos los archivos y genera un reporte .txt.
 *
 * MODOS: con el checkbox "aplicar" desmarcado solo SIMULA (no escribe nada); marcado, GUARDA.
 * =====================================================================
 ******************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
// Las dos anotaciones de arriba son las que NetSuite lee: version de API 2.1 y tipo Map/Reduce.
define([
    'N/file',        // Cargar, crear y guardar archivos del File Cabinet
    'N/query',       // Ejecutar consultas SuiteQL
    'N/runtime',     // Leer parametros del deployment, datos de la cuenta y del script en ejecucion
    'N/search',      // Busquedas guardadas/ad hoc (se usan para carpetas y archivos)
    'N/suiteAppInfo' // Consultar a que bundles pertenece un script
], (
    file,
    query,
    runtime,
    search,
    suiteAppInfo
) => {

    // Mapa de nombres legibles -> IDs reales de los parametros del script.
    // Asi, si un ID cambia, solo se edita aqui.
    const PARAMETROS = {
        CARPETA_RAIZ: 'custscript_drt_su_raiz',          // Carpeta desde donde empieza el recorrido
        CARPETAS_EXCLUIDAS: 'custscript_drt_su_excluir', // Carpetas a saltar (con todas sus subcarpetas)
        CARPETA_REPORTE: 'custscript_drt_su_reporte',    // Donde guardar el reporte .txt
        APLICAR_CAMBIOS: 'custscript_drt_su_aplicar',    // Checkbox: true = guarda, false = simula
    };

    // Nombre de la carpeta que se busca si no se configura una carpeta raiz.
    const NOMBRE_CARPETA_RAIZ_DEFAULT = 'SuiteScripts';
    // Version a la que se quiere dejar cada archivo.
    const VERSION_DESTINO = '2.1';
    // Versiones "viejas" que SI se consideran actualizables. Cualquier otra se omite.
    const VERSIONES_A_ACTUALIZAR = ['2.0', '2.x', '2.X'];

    // Cantidad de IDs por filtro "anyof" y por llamada a N/suiteAppInfo
    // (se divide en lotes para no exceder los limites de NetSuite).
    const TAMANO_LOTE_FILTRO = 500;
    const TAMANO_LOTE_BUNDLES = 100;

    // Posibles resultados por archivo. Se usan en el reporte final.
    const ESTADO = {
        ACTUALIZADO: 'ACTUALIZADO',               // Se cambio a 2.1 y se guardo
        SIMULADO: 'PENDIENTE (SIMULACION)',       // Se habria cambiado, pero estamos en simulacion
        YA_21: 'YA EN 2.1',                       // No requiere cambios
        OMITIDO: 'OMITIDO',                       // Se decidio no tocarlo (ver detalle)
        ERROR: 'ERROR',                           // Fallo inesperado al procesarlo
    };

    /**
     * Localiza los archivos .js de la carpeta raiz y todas sus subcarpetas.
     * Devuelve un objeto { idArchivo: datosArchivo } para que cada archivo llegue a reduce con su Internal ID como key.
     * Los archivos que pertenecen a un bundle se marcan con motivoOmision para no modificarlos.
     * @param {Object} inputContext
     * @returns {Object} Archivos a procesar
     */
    const getInputData = (inputContext) => {
        // Obtiene el script que se esta ejecutando para poder leer sus parametros.
        const script = runtime.getCurrentScript();
        // Resuelve la carpeta raiz: usa el parametro, o busca "SuiteScripts" si esta vacio.
        const carpetaRaiz = obtenerCarpetaRaiz(script.getParameter({ name: PARAMETROS.CARPETA_RAIZ }));
        // Convierte el texto "12,34,56" del parametro en un Set de IDs a excluir (Set = busqueda rapida).
        const carpetasExcluidas = new Set(convertirListaIds(script.getParameter({ name: PARAMETROS.CARPETAS_EXCLUIDAS })));

        // Lista los IDs de todas las carpetas del arbol (raiz + subcarpetas), sin las excluidas.
        const carpetas = obtenerCarpetas(carpetaRaiz.id, carpetasExcluidas);
        // Busca todos los archivos .js dentro de esas carpetas.
        const archivos = obtenerArchivosJs(carpetas);
        // Marca (sin quitar) los archivos que pertenecen a bundles, para que luego se omitan.
        marcarArchivosEnBundle(archivos);

        // Deja en el log de ejecucion un resumen de lo encontrado: modo, raiz, # carpetas, # archivos y gobernanza que queda.
        log.audit(`getInputData`, `Modo: ${aplicarCambios() ? 'ACTUALIZACION' : 'SIMULACION'} | ` +
            `Carpeta raiz: ${carpetaRaiz.nombre} (${carpetaRaiz.id}) | Carpetas: ${carpetas.length} | ` +
            `Archivos .js: ${Object.keys(archivos).length} | Gobernanza restante: ${script.getRemainingUsage()}`);
        // Al devolver un objeto, cada propiedad se vuelve un par key/value: key = ID del archivo, value = sus datos.
        return archivos;
    }

    /**
     * Abre cada archivo, identifica su version y, si es 2.0 / 2.x / 2.X, reemplaza solo el valor de la anotacion por 2.1.
     * Los errores se controlan por archivo para no detener el procesamiento de los demas.
     * @param {Object} reduceContext
     */
    const reduce = (reduceContext) => {
        // values[0] es el texto JSON con los datos del archivo que armo getInputData; se convierte a objeto.
        const datos = JSON.parse(reduceContext.values[0]);
        // Objeto donde se va acumulando el resultado de ESTE archivo (se escribe al final).
        const resultado = {
            id: String(datos.id || reduceContext.key), // ID del archivo (si faltara en datos, usa la key)
            nombre: datos.nombre,
            ruta: ``,
            versionOriginal: ``,
            estado: ``,
            detalle: ``,
        };
        // try/catch: si un archivo falla, se registra el error y se sigue con los demas.
        try {
            // Carga el archivo desde el File Cabinet.
            const archivo = file.load({ id: resultado.id });
            resultado.nombre = archivo.name;
            resultado.ruta = archivo.path;

            // Lee el texto completo del archivo.
            const contenido = archivo.getContents();
            // Busca la anotacion @NApiVersion y devuelve version + posicion exacta, o un error.
            const anotacion = buscarAnotacion(contenido);
            resultado.versionOriginal = anotacion.version;

            // Cadena de decisiones (el ORDEN importa: la primera condicion verdadera gana):
            if (anotacion.error) {
                // 1) La anotacion no existe, esta repetida o no esta en un comentario -> no se toca.
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = anotacion.error;
            } else if (anotacion.version === VERSION_DESTINO) {
                // 2) Ya esta en 2.1 -> nada que hacer.
                resultado.estado = ESTADO.YA_21;
                // executionNo > 1 significa que reduce se reintento: probablemente un intento previo ya lo guardo.
                if (reduceContext.executionNo > 1) {
                    resultado.detalle = `Reintento: el archivo pudo actualizarse en un intento anterior`;
                }
            } else if (datos.motivoOmision) {
                // 3) getInputData lo marco como perteneciente a un bundle -> no se toca.
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = datos.motivoOmision;
            } else if (/^SuiteBundles\//i.test(archivo.path)) {
                // 4) Esta dentro de la carpeta SuiteBundles (codigo de terceros) -> no se toca.
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = `Archivo ubicado en la carpeta SuiteBundles`;
            } else if (!VERSIONES_A_ACTUALIZAR.includes(anotacion.version)) {
                // 5) Version rara (ej. 1.0 o 3.0) que no esta en la lista permitida -> no se toca.
                resultado.estado = ESTADO.OMITIDO;
                resultado.detalle = `Version no contemplada para actualizacion automatica`;
            } else if (!aplicarCambios()) {
                // 6) Cumple todo, pero el checkbox esta desmarcado -> solo se informa lo que se haria.
                resultado.estado = ESTADO.SIMULADO;
                resultado.detalle = `Se actualizaria de ${anotacion.version} a ${VERSION_DESTINO}`;
            } else {
                // 7) Cumple todo y se permite aplicar -> se reescribe el archivo con la version 2.1.
                actualizarArchivo(archivo, contenido, anotacion);
                resultado.estado = ESTADO.ACTUALIZADO;
                resultado.detalle = `${anotacion.version} -> ${VERSION_DESTINO}`;
            }
        } catch (error) {
            // Cualquier excepcion (archivo no cargable, fallo al guardar, verificacion fallida...) queda como ERROR.
            resultado.estado = ESTADO.ERROR;
            resultado.detalle = `${error.name || 'ERROR'}: ${error.message || error}`;
            log.error(`reduce archivo ${resultado.id}`, resultado.detalle);
        }

        // Escribe el resultado como salida de reduce; summarize lo leera despues.
        // Las salidas siempre se serializan a texto (JSON.stringify).
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
        // Recoge todos los resultados que escribio reduce (un JSON por archivo).
        const resultados = [];
        summaryContext.output.iterator().each((key, value) => {
            resultados.push(JSON.parse(value));
            return true; // true = seguir iterando
        });

        // Aqui se juntan errores "no controlados": los que NetSuite detecto fuera del try/catch de reduce.
        const erroresEtapas = [];
        const archivosConErrorNoControlado = new Set();
        // Error ocurrido en getInputData (por ejemplo, carpeta raiz inexistente).
        if (summaryContext.inputSummary.error) {
            erroresEtapas.push(`getInputData: ${mensajeErrorSerializado(summaryContext.inputSummary.error)}`);
        }
        // Errores ocurridos en reduce que escaparon al try/catch (ej. timeout o caida del proceso).
        summaryContext.reduceSummary.errors.iterator().each((key, error, executionNo) => {
            archivosConErrorNoControlado.add(key);
            erroresEtapas.push(`reduce archivo ${key} (intento ${executionNo}): ${mensajeErrorSerializado(error)}`);
            return true;
        });
        // IDs de archivos que si dejaron un resultado normal.
        const idsConResultado = new Set(resultados.map((resultado) => resultado.id));
        // Cuantos archivos fallaron SIN llegar a escribir resultado (para no perderlos del conteo total).
        const erroresSinResultado = [...archivosConErrorNoControlado].filter((id) => !idsConResultado.has(id)).length;

        // Arma el texto completo del reporte.
        const reporte = construirReporte(resultados, erroresEtapas, erroresSinResultado, summaryContext);
        const modo = aplicarCambios() ? 'ACTUALIZACION' : 'SIMULACION';
        // Fecha/hora para el nombre. Ejemplo paso a paso:
        // "2026-10-15T12:34:56.789Z" -> quita "-" y ":" -> "20261015T123456.789Z"
        // -> cambia "T" por "_" -> "20261015_123456.789Z" -> corta a 15 caracteres -> "20261015_123456"
        const marcaTiempo = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
        const nombreReporte = `drt_script_update_${runtime.accountId}_${modo}_${marcaTiempo}.txt`;

        try {
            // Crea el .txt y lo guarda en la carpeta del reporte; save() devuelve su Internal ID.
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
            // Si no se pudo guardar el reporte, al menos se deja en el log (truncado: el log tiene limite de tamano).
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
        // Si hay parametro: busca por ID. Si no: busca por nombre "SuiteScripts".
        const filtros = idParametro
            ? [['internalid', 'anyof', String(idParametro)]]
            : [['name', 'is', NOMBRE_CARPETA_RAIZ_DEFAULT]];
        const carpetas = [];
        recorrerBusqueda(search.create({
            type: 'folder',
            filters: filtros,
            columns: ['name', 'parent'],
        }), (resultado) => {
            // Con parametro se acepta el resultado tal cual. Sin parametro, se exige que NO tenga carpeta padre
            // (para quedarse solo con la "SuiteScripts" de primer nivel y descartar otras con el mismo nombre).
            if (idParametro || !resultado.getValue('parent')) {
                carpetas.push({ id: String(resultado.id), nombre: resultado.getValue('name') });
            }
        });

        // Debe haber exactamente UNA carpeta; si hay 0 o varias, se detiene con un mensaje claro.
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
        // "visitadas" acumula todas las carpetas aceptadas (y evita procesar una dos veces).
        const visitadas = new Set([idRaiz]);
        // Recorrido por niveles (BFS): empieza en la raiz.
        let nivelActual = [idRaiz];
        while (nivelActual.length) {
            const siguienteNivel = [];
            // Busca los hijos de las carpetas del nivel actual, en lotes de 500 IDs.
            dividirEnLotes(nivelActual, TAMANO_LOTE_FILTRO).forEach((lote) => {
                recorrerBusqueda(search.create({
                    type: 'folder',
                    filters: [['parent', 'anyof', lote]], // Carpetas cuyo padre esta en el lote
                    columns: ['internalid'],
                }), (resultado) => {
                    const idCarpeta = String(resultado.id);
                    // Solo se acepta si no se visito antes y no esta excluida.
                    // Si una carpeta esta excluida, no se agrega, por lo que sus subcarpetas tampoco se exploran.
                    if (!visitadas.has(idCarpeta) && !carpetasExcluidas.has(idCarpeta)) {
                        visitadas.add(idCarpeta);
                        siguienteNivel.push(idCarpeta);
                    }
                });
            });
            // El siguiente ciclo explora los hijos recien encontrados. Termina cuando ya no hay mas niveles.
            nivelActual = siguienteNivel;
        }
        // Convierte el Set a arreglo de IDs.
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
                    ['folder', 'anyof', lote],     // Archivos dentro de estas carpetas
                    'AND',
                    ['name', 'contains', '.js'],   // Prefiltro amplio (tambien trae .json, .jsx, etc.)
                ],
                columns: ['name'],
            }), (resultado) => {
                const nombre = resultado.getValue('name');
                // Filtro estricto: el nombre debe TERMINAR en .js (descarta .json y similares).
                if (/\.js$/i.test(nombre)) {
                    // motivoOmision empieza vacio; marcarArchivosEnBundle lo llenara si aplica.
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
        // Helper: agrega un motivo; si ya habia uno, los concatena con "; ".
        const agregarMotivo = (archivo, motivo) => {
            archivo.motivoOmision = archivo.motivoOmision ? `${archivo.motivoOmision}; ${motivo}` : motivo;
        };

        // Mapa { scriptId (minusculas) -> [archivos que son su archivo principal] }
        const archivosPorScript = {};
        // SuiteQL paginado: trae TODOS los scripts de la cuenta con archivo asociado.
        // "frombundle" trae el bundle de origen si el script fue instalado desde uno.
        const paginas = query.runSuiteQLPaged({
            query: `SELECT s.scriptid, s.scriptfile, s.frombundle FROM script AS s WHERE s.scriptfile IS NOT NULL`,
            pageSize: 1000,
        }).iterator();
        paginas.each((pagina) => {
            pagina.value.data.asMappedResults().forEach((fila) => {
                // Cruza con los archivos .js encontrados; si el archivo del script no es uno de los nuestros, se ignora.
                const archivo = archivos[String(fila.scriptfile)];
                if (!archivo) return;
                const scriptId = String(fila.scriptid).toLowerCase();
                // Registra la relacion script -> archivo (crea el arreglo si no existia).
                (archivosPorScript[scriptId] = archivosPorScript[scriptId] || []).push(archivo);
                // Si el script se instalo desde un bundle, queda marcado para omitirse.
                if (fila.frombundle) {
                    agregarMotivo(archivo, `Script ${scriptId} instalado desde bundle ${fila.frombundle}`);
                }
            });
            return true; // seguir con la siguiente pagina
        });

        // Segunda comprobacion: scripts "propios" que estan INCLUIDOS en algun bundle (por ejemplo, uno que uno mismo publico).
        dividirEnLotes(Object.keys(archivosPorScript), TAMANO_LOTE_BUNDLES).forEach((lote) => {
            try {
                // Devuelve { scriptId: [bundles que lo contienen] }. El "|| {}" evita fallar si devuelve vacio.
                const bundlesPorScript = suiteAppInfo.listBundlesContainingScripts({ scriptIds: lote }) || {};
                Object.keys(bundlesPorScript).forEach((scriptId) => {
                    // [].concat(...) normaliza: acepta un valor suelto o un arreglo.
                    const bundles = [].concat(bundlesPorScript[scriptId] || []);
                    const archivosScript = archivosPorScript[scriptId.toLowerCase()] || [];
                    // Si esta en al menos un bundle, se marcan sus archivos para omitirlos.
                    if (bundles.length) {
                        archivosScript.forEach((archivo) => agregarMotivo(archivo, `Script ${scriptId} incluido en bundle(s) ${bundles.join(', ')}`));
                    }
                });
            } catch (error) {
                // Si la consulta falla, por SEGURIDAD se omiten todos los archivos del lote (mejor no tocar que tocar algo de un bundle).
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
        // Regex: "@NApiVersion", uno o mas espacios/tabs, y captura (grupo 1) la version:
        // todo lo que no sea espacio ni "*". Flags: g = global (varias coincidencias), i = ignora mayusculas.
        const patron = /@NApiVersion[ \t]+([^\s*]+)/gi;
        const coincidencias = [];
        // Con el flag "g", cada exec() continua desde donde quedo la anterior, hasta devolver null.
        let coincidencia = patron.exec(contenido);
        while (coincidencia) {
            coincidencias.push(coincidencia);
            coincidencia = patron.exec(contenido);
        }

        // Caso A: no hay ninguna anotacion.
        if (!coincidencias.length) {
            return { version: ``, error: `Sin anotacion NApiVersion` };
        }
        // Caso B: hay mas de una -> ambiguo, requiere revision humana.
        if (coincidencias.length > 1) {
            return {
                version: coincidencias.map((item) => item[1]).join(', '),
                error: `Anotacion NApiVersion repetida ${coincidencias.length} veces; requiere revision manual`,
            };
        }

        // Caso C: hay exactamente una. "[unica]" toma el primer (y unico) elemento del arreglo.
        const [unica] = coincidencias;
        const version = unica[1]; // El valor capturado, ej. "2.0"
        // Texto que hay ANTES de la anotacion.
        const textoPrevio = contenido.slice(0, unica.index);
        // Esta dentro de un comentario /* ... */ solo si el ultimo "/*" aparece DESPUES del ultimo "*/"
        // (o sea, hay un comentario abierto sin cerrar). Si no, la anotacion esta en codigo real, no en un comentario.
        if (textoPrevio.lastIndexOf('/*') <= textoPrevio.lastIndexOf('*/')) {
            return { version, error: `La anotacion NApiVersion no esta dentro de un bloque de comentario` };
        }

        // Posicion exacta (indices de caracter) del valor dentro del archivo, para reemplazar SOLO eso:
        // inicio del match + largo del match completo - largo del valor = donde empieza el valor.
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
        // Reconstruye el texto: [todo antes del valor] + "2.1" + [todo despues del valor].
        // El resto del archivo queda byte a byte igual.
        const contenidoActualizado = contenido.slice(0, anotacion.inicioValor) + VERSION_DESTINO + contenido.slice(anotacion.finValor);

        // Se copian las propiedades del archivo original para que el nuevo sea "el mismo" para NetSuite.
        const opciones = {
            name: archivo.name,
            fileType: archivo.fileType,
            contents: contenidoActualizado,
            folder: archivo.folder,
            isOnline: archivo.isOnline,
            isInactive: archivo.isInactive,
        };
        // Propiedades opcionales: solo se copian si el original las tenia.
        if (archivo.description) opciones.description = archivo.description;
        if (archivo.encoding) opciones.encoding = archivo.encoding;

        // Guardar un archivo con el mismo nombre y carpeta SOBRESCRIBE el existente. save() devuelve el Internal ID.
        const idGuardado = String(file.create(opciones).save());
        // Control de seguridad: el ID debe ser el mismo; si cambio, se creo un archivo nuevo y hay que revisarlo a mano
        // (los scripts desplegados apuntan al ID del archivo original).
        if (idGuardado !== String(archivo.id)) {
            throw new Error(`El guardado genero el Internal ID ${idGuardado} en lugar de ${archivo.id}; revisar el archivo manualmente`);
        }

        // Verificacion final: vuelve a cargar el archivo guardado y confirma que ahora dice 2.1.
        const verificacion = buscarAnotacion(file.load({ id: idGuardado }).getContents());
        if (verificacion.error || verificacion.version !== VERSION_DESTINO) {
            throw new Error(`Verificacion posterior al guardado fallida: version encontrada "${verificacion.version}"`);
        }
    }

    // Arma el texto del reporte (no escribe nada, solo devuelve el string).
    const construirReporte = (resultados, erroresEtapas, erroresSinResultado, summaryContext) => {
        // Cuenta cuantos resultados tienen un estado dado.
        const contar = (estado) => resultados.filter((resultado) => resultado.estado === estado).length;
        const modoReal = aplicarCambios();
        // Orden en que se listan los estados: el de la definicion de ESTADO (actualizado, simulado, ya 2.1, omitido, error).
        const ordenEstados = Object.values(ESTADO);
        const detalle = resultados
            .slice() // copia, para no alterar el arreglo original al ordenar
            // Ordena primero por estado y, a igualdad, alfabeticamente por ruta.
            .sort((a, b) => ordenEstados.indexOf(a.estado) - ordenEstados.indexOf(b.estado) || String(a.ruta).localeCompare(String(b.ruta)))
            // Cada archivo se vuelve una linea con 6 columnas separadas por tabulador.
            .map((resultado) => [resultado.id, resultado.nombre, resultado.ruta, resultado.versionOriginal, resultado.estado, resultado.detalle]
                .map(limpiarCampo) // quita tabs/saltos de linea que romperian las columnas
                .join('\t'));

        // Encabezado y resumen del reporte.
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
            // El total suma los archivos con resultado + los que fallaron sin dejar resultado.
            `Total de archivos analizados       : ${resultados.length + erroresSinResultado}`,
            `Actualizados correctamente         : ${contar(ESTADO.ACTUALIZADO)}`,
        ];
        // La linea de "pendientes" solo tiene sentido en simulacion.
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
            ['INTERNAL ID', 'NOMBRE', 'RUTA', 'VERSION ORIGINAL', 'RESULTADO', 'DETALLE'].join('\t'), // fila de titulos
            ...detalle // una linea por archivo
        );
        // Si hubo errores no controlados, se agrega una seccion al final con ellos.
        if (erroresEtapas.length) {
            lineas.push(``, `ERRORES NO CONTROLADOS`, `----------------------`, ...erroresEtapas);
        }
        // Une todo con saltos de linea para obtener el texto final.
        return lineas.join('\n');
    }

    // Devuelve el ID de la carpeta donde se guardara el reporte.
    const obtenerCarpetaReporte = () => {
        const script = runtime.getCurrentScript();
        const carpetaReporte = script.getParameter({ name: PARAMETROS.CARPETA_REPORTE });
        // Si el parametro esta vacio, usa la carpeta raiz (volviendola a resolver). Number() porque file.create pide numero.
        return Number(carpetaReporte || obtenerCarpetaRaiz(script.getParameter({ name: PARAMETROS.CARPETA_RAIZ })).id);
    }

    // Indica si el checkbox "aplicar cambios" esta marcado.
    const aplicarCambios = () => {
        const valor = runtime.getCurrentScript().getParameter({ name: PARAMETROS.APLICAR_CAMBIOS });
        // Segun el contexto, un checkbox puede llegar como booleano true o como el texto 'T'.
        return valor === true || valor === 'T';
    }

    // Ejecuta una busqueda paginada y aplica "procesarResultado" a cada fila.
    // Con runPaged no hay el limite de 4000 resultados de search.run().
    const recorrerBusqueda = (busqueda, procesarResultado) => {
        const paginado = busqueda.runPaged({ pageSize: 1000 }); // paginas de 1000 filas
        // pageRanges es la lista de paginas disponibles; se trae cada una por su indice.
        paginado.pageRanges.forEach((rango) => {
            paginado.fetch({ index: rango.index }).data.forEach(procesarResultado);
        });
    }

    // Parte un arreglo en trozos de tamano fijo. Ej.: ([1,2,3,4,5], 2) -> [[1,2],[3,4],[5]]
    const dividirEnLotes = (elementos, tamano) => {
        const lotes = [];
        for (let i = 0; i < elementos.length; i += tamano) lotes.push(elementos.slice(i, i + tamano));
        return lotes;
    }

    // Convierte un texto "12, 34 ,abc,56" en ['12','34','56'].
    const convertirListaIds = (valor) => String(valor || ``) // vacio/null -> ""
        .split(',')                                          // separa por comas
        .map((id) => id.trim())                              // quita espacios
        .filter((id) => /^-?\d+$/.test(id));                 // se queda solo con numeros enteros (descarta basura como "abc")

    // Deja un valor listo para una celda del reporte: null/undefined -> "", y tabs/saltos de linea -> un espacio.
    const limpiarCampo = (valor) => String(valor === undefined || valor === null ? `` : valor).replace(/[\t\r\n]+/g, ' ');

    // Los errores de MapReduce llegan como texto JSON; esto extrae "nombre: mensaje" para que se lea mejor.
    const mensajeErrorSerializado = (serializado) => {
        try {
            const error = JSON.parse(serializado);
            return `${error.name || 'ERROR'}: ${error.message || serializado}`;
        } catch (e) {
            // Si no era JSON valido, se devuelve el texto tal cual.
            return String(serializado);
        }
    }

    // Puntos de entrada que NetSuite invoca. No hay "map", por eso los datos van directo de getInputData a reduce.
    return {
        getInputData,
        reduce,
        summarize
    }

});
