/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 *
 * DRT - Inventario de Scripts por Bundle
 * ---------------------------------------------------------------------------
 * Genera un Excel con TODOS los scripts de la cuenta, agrupados por bundle
 * (una pestaña por bundle) y lo envía por correo.
 *
 * Fuentes:
 *   - Saved Search de scripts      (CONFIG.SEARCH_SCRIPTS)
 *   - Saved Search de deployments  (CONFIG.SEARCH_DEPLOYMENTS)
 *   - Catálogo CSV de bundles creados en la cuenta (CONFIG.CATALOG_FILE_ID)
 *   - N/suiteAppInfo: bundles y SuiteApps que contienen cada script
 *
 * Seguridad: el script SOLO LEE scripts, deployments y bundles.
 * Sus únicas escrituras son: guardar el Excel en el File Cabinet y enviar un correo.
 * ---------------------------------------------------------------------------
 */
define(['N/search', 'N/file', 'N/email', 'N/runtime', 'N/encode', 'N/suiteAppInfo', 'N/log'],
    (search, file, email, runtime, encode, suiteAppInfo, log) => {

        // ===================================================================
        // CONFIGURACIÓN (único bloque que se edita)
        // ===================================================================
        const CONFIG = {
            SEARCH_SCRIPTS: 'customsearch268',      // DRT - Inventario de Scripts
            SEARCH_DEPLOYMENTS: 'customsearch269',  // DRT - Inventario de Deployments
            CATALOG_FILE_ID: 11826,                 // drt_catalogo_bundles.csv
            OUTPUT_FOLDER_ID: 2154,                 // SuiteScripts > DRT_Inventario_Scripts
            EMAIL_AUTHOR: 213,                      // Empleado remitente
            EMAIL_RECIPIENTS: ['juan.deluquez@disrupttglobal.com'],
            EMAIL_CC: [],
            BATCH_SIZE: 100,                        // Script IDs por llamada a N/suiteAppInfo
            MAX_ATTACHMENT_BYTES: 9 * 1024 * 1024,  // Si el Excel pesa más, se envía sin adjunto
            TZ_OFFSET_HOURS: -6                     // Hora de Ciudad de México (UTC-6)
        };

        const ORIGEN = {
            CREADO: 'Creado en la cuenta',
            INSTALADO: 'Instalado',
            NO_IDENTIFICADO: 'No identificado'
        };

        const SHEET = {
            RESUMEN: 'Resumen',
            INDICE: 'Índice',
            TODOS: 'Todos los scripts',
            DEPLOYMENTS: 'Deployments',
            SIN_BUNDLE: 'Sin bundle',
            SUITEAPPS: 'SuiteApps',
            ERRORES: 'Errores de consulta'
        };

        // ===================================================================
        // ENTRY POINT
        // ===================================================================
        const execute = () => {
            const started = Date.now();
            log.audit('Inicio', 'Inventario de scripts por bundle');

            // 1. Datos de origen ------------------------------------------------
            const scripts = loadSearch(CONFIG.SEARCH_SCRIPTS);
            const deployments = loadSearch(CONFIG.SEARCH_DEPLOYMENTS);
            const catalog = loadCatalog(CONFIG.CATALOG_FILE_ID);
            const installedBundles = safeCall('listInstalledBundles', () => suiteAppInfo.listInstalledBundles(), []);
            const installedSuiteApps = safeCall('listInstalledSuiteApps', () => suiteAppInfo.listInstalledSuiteApps(), []);
            log.audit('Datos cargados', `Scripts: ${scripts.rows.length} | Deployments: ${deployments.rows.length} | ` +
                `Bundles en catálogo: ${Object.keys(catalog).length} | Bundles instalados: ${installedBundles.length}`);

            const installedMap = {};
            installedBundles.forEach(b => { installedMap[String(b.id)] = b; });
            const suiteAppMap = {};
            installedSuiteApps.forEach(a => { suiteAppMap[String(a.id)] = a; });

            // 2. Columnas clave -------------------------------------------------
            const sKey = findCol(scripts.cols, c => c.name === 'scriptid' && !c.join, 0);
            const sName = findCol(scripts.cols, c => c.name === 'name' && !c.join, 1);
            const dParent = findCol(deployments.cols,
                c => c.name === 'scriptid' && c.join && c.join.toLowerCase() === 'script',
                findCol(deployments.cols, c => /script\s*:\s*script id/i.test(c.label || ''), 1));
            const dId = findCol(deployments.cols,
                c => /^formula/i.test(c.name) && /scriptid/i.test(c.formula || ''),
                findCol(deployments.cols, c => /deployment id/i.test(c.label || ''), -1));
            const dStatus = findCol(deployments.cols, c => c.name === 'status', -1);
            const dDeployed = findCol(deployments.cols, c => c.name === 'isdeployed', -1);

            // 3. Bundles y SuiteApps por script ---------------------------------
            const scriptIds = unique(scripts.rows.map(r => normId(r[sKey])).filter(Boolean));
            const bundlesByScript = {};
            const suiteAppsByScript = {};
            const errores = {};

            chunk(scriptIds, CONFIG.BATCH_SIZE).forEach((ids, i) => {
                try {
                    const res = suiteAppInfo.listBundlesContainingScripts({ scriptIds: ids }) || {};
                    Object.keys(res).forEach(k => { bundlesByScript[normId(k)] = toIdArray(res[k]); });
                } catch (e) {
                    log.error(`listBundlesContainingScripts lote ${i + 1}`, e.message || e);
                    ids.forEach(id => { errores[id] = e.message || String(e); });
                }
                try {
                    const res2 = suiteAppInfo.listSuiteAppsContainingScripts({ scriptIds: ids }) || {};
                    Object.keys(res2).forEach(k => { suiteAppsByScript[normId(k)] = toIdArray(res2[k]); });
                } catch (e) {
                    log.audit(`listSuiteAppsContainingScripts lote ${i + 1}`, e.message || e);
                }
            });

            // 4. Deployments por script -----------------------------------------
            const depsByScript = {};
            deployments.rows.forEach(r => {
                const k = normId(r[dParent]);
                (depsByScript[k] = depsByScript[k] || []).push(r);
            });

            const scriptNameById = {};
            scripts.rows.forEach(r => { scriptNameById[normId(r[sKey])] = r[sName]; });

            // 5. Resolución de bundles ------------------------------------------
            const bundleCache = {};
            const bundleInfo = id => {
                if (bundleCache[id]) return bundleCache[id];
                let info;
                if (catalog[id]) {
                    const c = catalog[id];
                    info = {
                        id, name: c.name || `Bundle ${id}`, origen: ORIGEN.CREADO, version: c.version,
                        createdBy: c.createdBy, createdOn: c.createdOn, lastUpdate: c.lastUpdate,
                        copiedFrom: c.copiedFrom, publisher: '', description: c.abstract
                    };
                } else if (installedMap[id]) {
                    const b = installedMap[id];
                    const pub = b.publisher && b.publisher.name ? b.publisher.name : '';
                    info = {
                        id, name: b.name || `Bundle ${id}`, origen: ORIGEN.INSTALADO, version: b.version || '',
                        createdBy: '', createdOn: '', lastUpdate: fmtDate(b.dateLastUpdated),
                        copiedFrom: '', publisher: [pub, b.installedFrom ? `Instalado desde: ${b.installedFrom}` : '']
                            .filter(Boolean).join(' · '),
                        description: b.description || ''
                    };
                } else {
                    info = {
                        id, name: `Bundle ${id}`, origen: ORIGEN.NO_IDENTIFICADO, version: '', createdBy: '',
                        createdOn: '', lastUpdate: '', copiedFrom: '', publisher: '', description: ''
                    };
                }
                bundleCache[id] = info;
                return info;
            };
            const suiteAppLabel = id => {
                const a = suiteAppMap[id];
                return a ? `${id} - ${a.name || ''}${a.version ? ' (v' + a.version + ')' : ''}` : id;
            };

            // 6. Filas enriquecidas de scripts -----------------------------------
            const extraHeaders = ['Clasificación', 'Nº Bundles', 'Bundles (ID - Nombre)', 'SuiteApp(s)',
                'Nº Deployments', 'Deployments (ID · Status · Deployed)'];
            const scriptHeaders = scripts.labels.concat(extraHeaders);

            const enriched = scripts.rows.map(r => {
                const id = normId(r[sKey]);
                const bIds = bundlesByScript[id] || [];
                const saIds = suiteAppsByScript[id] || [];
                const deps = depsByScript[id] || [];
                let clas;
                if (errores[id]) clas = 'Error de consulta';
                else if (bIds.some(b => catalog[b])) clas = 'En bundle de Disruptt';
                else if (bIds.some(b => installedMap[b])) clas = 'En bundle instalado';
                else if (bIds.length) clas = 'En bundle no identificado';
                else if (saIds.length) clas = 'En SuiteApp';
                else clas = 'Sin bundle';

                const depText = deps.map(d => {
                    const parts = [];
                    if (dStatus >= 0 && d[dStatus]) parts.push(d[dStatus]);
                    if (dDeployed >= 0 && d[dDeployed]) parts.push(`Deployed: ${d[dDeployed]}`);
                    const name = dId >= 0 ? d[dId] : '(sin ID)';
                    return parts.length ? `${name} (${parts.join(', ')})` : name;
                }).join('; ');

                return {
                    id, bIds, saIds, clas,
                    cells: r.concat([
                        clas,
                        errores[id] ? 'ERROR' : { n: bIds.length },
                        errores[id] ? `ERROR: ${errores[id]}` : bIds.map(b => `${b} - ${bundleInfo(b).name}`).join(' | '),
                        saIds.map(suiteAppLabel).join(' | '),
                        { n: deps.length },
                        depText
                    ])
                };
            });

            // 7. Agrupación por bundle -----------------------------------------
            const byBundle = {};
            enriched.forEach(s => s.bIds.forEach(b => { (byBundle[b] = byBundle[b] || []).push(s); }));

            const allBundleIds = unique(Object.keys(byBundle).concat(Object.keys(catalog)));
            const origenOrder = { [ORIGEN.CREADO]: 0, [ORIGEN.INSTALADO]: 1, [ORIGEN.NO_IDENTIFICADO]: 2 };
            allBundleIds.sort((a, b) => {
                const A = bundleInfo(a), B = bundleInfo(b);
                return (origenOrder[A.origen] - origenOrder[B.origen]) ||
                    A.name.localeCompare(B.name, 'es', { sensitivity: 'base' });
            });

            const sheetNames = new SheetNamer();
            [SHEET.RESUMEN, SHEET.INDICE, SHEET.TODOS, SHEET.DEPLOYMENTS, SHEET.SIN_BUNDLE, SHEET.SUITEAPPS, SHEET.ERRORES]
                .forEach(n => sheetNames.reserve(n));
            const tabByBundle = {};
            allBundleIds.filter(b => byBundle[b]).forEach(b => {
                tabByBundle[b] = sheetNames.make(`${b} ${bundleInfo(b).name}`);
            });

            const sinBundle = enriched.filter(s => s.clas === 'Sin bundle');
            const enSuiteApps = enriched.filter(s => s.saIds.length);
            const conError = enriched.filter(s => errores[s.id]);
            const multiBundle = enriched.filter(s => s.bIds.length > 1);
            const bundlesConScripts = allBundleIds.filter(b => byBundle[b]);
            const countByOrigen = o => bundlesConScripts.filter(b => bundleInfo(b).origen === o).length;

            // 8. Construcción del Excel ----------------------------------------
            const now = localNow();
            const wb = new Workbook();

            // Resumen
            wb.addSheet(SHEET.RESUMEN, ['Concepto', 'Valor'], [
                ['Generado', now.display],
                ['Cuenta', runtime.accountId],
                ['Total de scripts', { n: enriched.length }],
                ['Total de deployments', { n: deployments.rows.length }],
                ['Scripts en al menos un bundle', { n: enriched.filter(s => s.bIds.length).length }],
                ['Scripts en bundles de Disruptt', { n: enriched.filter(s => s.clas === 'En bundle de Disruptt').length }],
                ['Scripts en más de un bundle', { n: multiBundle.length }],
                ['Scripts en SuiteApps', { n: enSuiteApps.length }],
                ['Scripts sin bundle', { n: sinBundle.length }],
                ['Scripts con error de consulta', { n: conError.length }],
                ['Bundles en catálogo (creados en la cuenta)', { n: Object.keys(catalog).length }],
                ['Bundles creados con scripts', { n: countByOrigen(ORIGEN.CREADO) }],
                ['Bundles instalados con scripts', { n: countByOrigen(ORIGEN.INSTALADO) }],
                ['Bundles no identificados con scripts', { n: countByOrigen(ORIGEN.NO_IDENTIFICADO) }],
                ['Búsqueda de scripts', CONFIG.SEARCH_SCRIPTS],
                ['Búsqueda de deployments', CONFIG.SEARCH_DEPLOYMENTS]
            ], { title: 'DRT - Inventario de Scripts por Bundle', subtitle: `Generado: ${now.display}` });

            // Índice
            const indexRows = allBundleIds.map(b => {
                const info = bundleInfo(b);
                const tab = tabByBundle[b];
                return [
                    b, info.name, info.origen, info.version, { n: (byBundle[b] || []).length },
                    tab ? { v: tab, href: tab } : '— (sin scripts)',
                    info.createdBy, info.createdOn, info.lastUpdate, info.copiedFrom, info.publisher, info.description
                ];
            });
            wb.addSheet(SHEET.INDICE, ['Bundle ID', 'Nombre', 'Origen', 'Versión', 'Nº Scripts', 'Pestaña',
                'Creado por', 'Creado el', 'Última actualización', 'Copiado de', 'Publisher / Instalado desde',
                'Descripción'], indexRows, {
                title: 'Índice de bundles',
                subtitle: `${bundlesConScripts.length} bundles con scripts · ${allBundleIds.length} bundles listados`
            });

            // Todos los scripts
            wb.addSheet(SHEET.TODOS, scriptHeaders, enriched.map(s => s.cells), {
                title: 'Todos los scripts de la cuenta', subtitle: `${enriched.length} scripts`, back: SHEET.INDICE
            });

            // Deployments
            const depHeaders = deployments.labels.concat(['Nombre del script', 'Bundles (ID - Nombre)']);
            const depRows = deployments.rows.map(r => {
                const k = normId(r[dParent]);
                const bIds = bundlesByScript[k] || [];
                return r.concat([scriptNameById[k] || '', bIds.map(b => `${b} - ${bundleInfo(b).name}`).join(' | ')]);
            });
            wb.addSheet(SHEET.DEPLOYMENTS, depHeaders, depRows, {
                title: 'Deployments de la cuenta', subtitle: `${depRows.length} deployments`, back: SHEET.INDICE
            });

            // Sin bundle
            wb.addSheet(SHEET.SIN_BUNDLE, scriptHeaders, sinBundle.map(s => s.cells), {
                title: 'Scripts sin bundle',
                subtitle: `${sinBundle.length} scripts que no pertenecen a ningún bundle ni SuiteApp`,
                back: SHEET.INDICE
            });

            // SuiteApps
            if (enSuiteApps.length) {
                wb.addSheet(SHEET.SUITEAPPS, scriptHeaders, enSuiteApps.map(s => s.cells), {
                    title: 'Scripts en SuiteApps (SDF)', subtitle: `${enSuiteApps.length} scripts`, back: SHEET.INDICE
                });
            }

            // Una pestaña por bundle
            bundlesConScripts.forEach(b => {
                const info = bundleInfo(b);
                const list = byBundle[b];
                wb.addSheet(tabByBundle[b], scriptHeaders, list.map(s => s.cells), {
                    title: `Bundle ${b} — ${info.name}`,
                    subtitle: `Origen: ${info.origen}${info.version ? ' · Versión: ' + info.version : ''} · ` +
                        `Scripts: ${list.length}`,
                    back: SHEET.INDICE
                });
            });

            // Errores
            if (conError.length) {
                wb.addSheet(SHEET.ERRORES, scriptHeaders, conError.map(s => s.cells), {
                    title: 'Scripts cuyo bundle no se pudo consultar', subtitle: `${conError.length} scripts`,
                    back: SHEET.INDICE
                });
            }

            // 9. Guardar en File Cabinet ---------------------------------------
            const fileName = `DRT_Inventario_Scripts_Bundles_${now.stamp}.xls`;
            const xml = wb.toXml();
            const excel = file.create({
                name: fileName,
                fileType: file.Type.EXCEL,
                contents: encode.convert({
                    string: xml,
                    inputEncoding: encode.Encoding.UTF_8,
                    outputEncoding: encode.Encoding.BASE_64
                }),
                folder: CONFIG.OUTPUT_FOLDER_ID,
                description: 'Inventario de scripts por bundle generado automáticamente'
            });
            const fileId = excel.save();
            const saved = file.load({ id: fileId });
            log.audit('Excel guardado', `ID ${fileId} · ${fileName} · ${saved.size} bytes · ${wb.sheets.length} pestañas`);

            // 10. Correo -------------------------------------------------------
            const attach = saved.size <= CONFIG.MAX_ATTACHMENT_BYTES;
            const body = [
                '<p>Hola,</p>',
                '<p>Se adjunta el inventario de scripts de la cuenta agrupados por bundle.</p>',
                '<ul>',
                `<li>Total de scripts: <b>${enriched.length}</b></li>`,
                `<li>Total de deployments: <b>${deployments.rows.length}</b></li>`,
                `<li>Bundles con scripts: <b>${bundlesConScripts.length}</b> ` +
                `(creados en la cuenta: ${countByOrigen(ORIGEN.CREADO)}, instalados: ${countByOrigen(ORIGEN.INSTALADO)}, ` +
                `no identificados: ${countByOrigen(ORIGEN.NO_IDENTIFICADO)})</li>`,
                `<li>Scripts en más de un bundle: <b>${multiBundle.length}</b></li>`,
                `<li>Scripts en SuiteApps: <b>${enSuiteApps.length}</b></li>`,
                `<li>Scripts sin bundle: <b>${sinBundle.length}</b></li>`,
                conError.length ? `<li style="color:#b00">Scripts con error de consulta: <b>${conError.length}</b></li>` : '',
                '</ul>',
                attach ? '' : `<p>El archivo supera el tamaño permitido para adjuntos. Está en el File Cabinet con ID ${fileId}.</p>`,
                `<p>Archivo: ${fileName}<br>Generado: ${now.display}</p>`
            ].join('');

            email.send({
                author: CONFIG.EMAIL_AUTHOR,
                recipients: CONFIG.EMAIL_RECIPIENTS,
                cc: CONFIG.EMAIL_CC.length ? CONFIG.EMAIL_CC : null,
                subject: `Inventario de scripts por bundle - ${now.date}`,
                body,
                attachments: attach ? [saved] : null
            });

            log.audit('Fin', `Correo enviado a ${CONFIG.EMAIL_RECIPIENTS.join(', ')} · ` +
                `Gobernanza restante: ${runtime.getCurrentScript().getRemainingUsage()} · ` +
                `Duración: ${Math.round((Date.now() - started) / 1000)} s`);
        };

        // ===================================================================
        // LECTURA DE DATOS
        // ===================================================================
        const loadSearch = id => {
            const s = search.load({ id });
            const cols = s.columns;
            const labels = cols.map(c => String(c.label || c.name || '').trim());
            const rows = [];
            const paged = s.runPaged({ pageSize: 1000 });
            paged.pageRanges.forEach(pr => {
                paged.fetch({ index: pr.index }).data.forEach(r => {
                    rows.push(cols.map(c => cellValue(r, c)));
                });
            });
            return { cols, labels, rows };
        };

        const cellValue = (result, col) => {
            const v = result.getValue(col);
            let t = null;
            try { t = result.getText(col); } catch (e) { t = null; }
            const out = (t !== null && t !== undefined && t !== '') ? t : v;
            if (out === true || out === 'T') return 'Sí';
            if (out === false || out === 'F') return 'No';
            if (out === null || out === undefined) return '';
            if (Array.isArray(out)) return out.map(x => (x && x.text) || x).join(', ');
            return String(out);
        };

        const loadCatalog = fileId => {
            const text = file.load({ id: fileId }).getContents().replace(/^﻿/, '');
            const rows = parseCsv(text);
            const hIdx = rows.findIndex(r => r.some(x => x.trim().toLowerCase() === 'bundle id'));
            if (hIdx < 0) throw new Error('El catálogo CSV no tiene la columna "Bundle ID"');
            const h = {};
            rows[hIdx].forEach((x, i) => { h[x.trim().toLowerCase()] = i; });
            const get = (r, name) => (h[name] !== undefined && r[h[name]] !== undefined) ? r[h[name]].trim() : '';
            const catalog = {};
            rows.slice(hIdx + 1).forEach(r => {
                const id = get(r, 'bundle id');
                if (!/^\d+$/.test(id)) return;
                catalog[id] = {
                    name: get(r, 'name'), version: get(r, 'version'), copiedFrom: get(r, 'copied from'),
                    abstract: get(r, 'abstract'), createdBy: get(r, 'created by'),
                    createdOn: get(r, 'created on'), lastUpdate: get(r, 'last update')
                };
            });
            return catalog;
        };

        const parseCsv = text => {
            const rows = [];
            let row = [], field = '', inQ = false;
            for (let i = 0; i < text.length; i++) {
                const c = text[i];
                if (inQ) {
                    if (c === '"') {
                        if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false;
                    } else field += c;
                } else if (c === '"') inQ = true;
                else if (c === ',') { row.push(field); field = ''; }
                else if (c === '\n' || c === '\r') {
                    if (c === '\r' && text[i + 1] === '\n') i++;
                    row.push(field); rows.push(row); row = []; field = '';
                } else field += c;
            }
            if (field !== '' || row.length) { row.push(field); rows.push(row); }
            return rows;
        };

        // ===================================================================
        // UTILIDADES
        // ===================================================================
        const normId = v => String(v || '').trim().toLowerCase();
        const unique = arr => Array.from(new Set(arr));
        const chunk = (arr, n) => {
            const out = [];
            for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
            return out;
        };
        const toIdArray = v => (v === null || v === undefined ? [] : (Array.isArray(v) ? v : [v]))
            .filter(x => x !== null && x !== undefined && x !== '')
            .map(x => String(typeof x === 'object' && x.id !== undefined ? x.id : x));
        const findCol = (cols, pred, fallback) => {
            const i = cols.findIndex(pred);
            return i >= 0 ? i : fallback;
        };
        const safeCall = (label, fn, fallback) => {
            try { return fn() || fallback; } catch (e) { log.error(label, e.message || e); return fallback; }
        };
        const pad = n => String(n).padStart(2, '0');
        const localNow = () => {
            const d = new Date(Date.now() + CONFIG.TZ_OFFSET_HOURS * 3600000);
            const date = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
            const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
            return {
                date,
                display: `${date} ${time} (hora de Ciudad de México)`,
                stamp: `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}_` +
                    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`
            };
        };
        const fmtDate = v => {
            if (!v) return '';
            const d = v instanceof Date ? v : new Date(v);
            return isNaN(d.getTime()) ? String(v) : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        };

        // Nombres de pestaña válidos para Excel: máx. 31 caracteres, sin : \ / ? * [ ] ' y únicos.
        class SheetNamer {
            constructor() { this.used = new Set(); }
            clean(n) {
                return String(n).replace(/[:\\/?*[\]']/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 31).trim() || 'Hoja';
            }
            reserve(n) { this.used.add(this.clean(n).toLowerCase()); }
            make(n) {
                const base = this.clean(n);
                let name = base, i = 2;
                while (this.used.has(name.toLowerCase())) {
                    const suffix = ` ~${i++}`;
                    name = base.substring(0, 31 - suffix.length).trim() + suffix;
                }
                this.used.add(name.toLowerCase());
                return name;
            }
        }

        // ===================================================================
        // GENERADOR DE EXCEL (SpreadsheetML / XML Spreadsheet 2003, multipestaña)
        // ===================================================================
        const xmlEsc = s => String(s)
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
            .substring(0, 32000)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/\r\n|\r|\n/g, '&#10;');

        class Workbook {
            constructor() { this.sheets = []; }

            addSheet(name, headers, rows, opts = {}) {
                this.sheets.push({ name, headers, rows, opts });
            }

            cell(c, style) {
                if (c && typeof c === 'object') {
                    if (c.n !== undefined) return `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="Number">${Number(c.n) || 0}</Data></Cell>`;
                    if (c.href) return `<Cell ss:StyleID="link" ss:HRef="#'${xmlEsc(c.href)}'!A1"><Data ss:Type="String">${xmlEsc(c.v)}</Data></Cell>`;
                    c = c.v;
                }
                return `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="String">${xmlEsc(c === null || c === undefined ? '' : c)}</Data></Cell>`;
            }

            textOf(c) {
                if (c && typeof c === 'object') return String(c.n !== undefined ? c.n : c.v || '');
                return String(c === null || c === undefined ? '' : c);
            }

            sheetXml(s) {
                const out = [];
                const nCols = s.headers.length;
                const pre = [];
                if (s.opts.title) pre.push(`<Row ss:Height="20">${this.cell(s.opts.title, 'title')}</Row>`);
                if (s.opts.subtitle) pre.push(`<Row>${this.cell(s.opts.subtitle, 'sub')}</Row>`);
                if (s.opts.back) pre.push(`<Row>${this.cell({ v: '« Volver al Índice', href: s.opts.back })}</Row>`);
                const headerRow = pre.length + 1;
                const lastRow = headerRow + Math.max(s.rows.length, 1);

                // Anchos de columna según contenido (muestra de 300 filas)
                const sample = s.rows.slice(0, 300);
                const widths = s.headers.map((h, i) => {
                    let max = String(h).length;
                    sample.forEach(r => { max = Math.max(max, Math.min(this.textOf(r[i]).length, 70)); });
                    return Math.min(Math.max(max * 6.2 + 14, 55), 420);
                });

                out.push(`<Worksheet ss:Name="${xmlEsc(s.name)}"><Table>`);
                widths.forEach(w => out.push(`<Column ss:Width="${w.toFixed(0)}"/>`));
                out.push(pre.join(''));
                out.push(`<Row>${s.headers.map(h => this.cell(h, 'hdr')).join('')}</Row>`);
                s.rows.forEach(r => {
                    const cells = [];
                    for (let i = 0; i < nCols; i++) cells.push(this.cell(r[i]));
                    out.push(`<Row>${cells.join('')}</Row>`);
                });
                out.push('</Table>');
                out.push('<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">' +
                    `<FreezePanes/><FrozenNoSplit/><SplitHorizontal>${headerRow}</SplitHorizontal>` +
                    `<TopRowBottomPane>${headerRow}</TopRowBottomPane><ActivePane>2</ActivePane>` +
                    '</WorksheetOptions>');
                if (s.rows.length) {
                    out.push(`<AutoFilter x:Range="R${headerRow}C1:R${lastRow - 1}C${nCols}" ` +
                        'xmlns="urn:schemas-microsoft-com:office:excel"/>');
                }
                out.push('</Worksheet>');
                return out.join('');
            }

            toXml() {
                return [
                    '<?xml version="1.0" encoding="UTF-8"?>',
                    '<?mso-application progid="Excel.Sheet"?>',
                    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ',
                    'xmlns:o="urn:schemas-microsoft-com:office:office" ',
                    'xmlns:x="urn:schemas-microsoft-com:office:excel" ',
                    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ',
                    'xmlns:html="http://www.w3.org/TR/REC-html40">',
                    '<Styles>',
                    '<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top"/>',
                    '<Font ss:FontName="Calibri" ss:Size="10"/></Style>',
                    '<Style ss:ID="hdr"><Alignment ss:Vertical="Center" ss:WrapText="1"/>',
                    '<Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>',
                    '<Interior ss:Color="#1F4E79" ss:Pattern="Solid"/></Style>',
                    '<Style ss:ID="title"><Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#1F4E79"/></Style>',
                    '<Style ss:ID="sub"><Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#595959"/></Style>',
                    '<Style ss:ID="link"><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0563C1" ss:Underline="Single"/></Style>',
                    '</Styles>',
                    this.sheets.map(s => this.sheetXml(s)).join(''),
                    '</Workbook>'
                ].join('');
            }
        }

        return { execute };
    });
