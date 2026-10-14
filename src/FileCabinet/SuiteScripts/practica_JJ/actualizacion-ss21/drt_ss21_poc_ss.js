/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 *
 * DRT - PoC de viabilidad: reemplazo de contenido de archivos JS en el File Cabinet
 * ---------------------------------------------------------------------------
 * Objetivo: comprobar EN UN SANDBOX, sobre archivos de prueba que el propio PoC crea,
 * lo que Oracle no documenta explícitamente:
 *   1. Que file.create() con el mismo nombre, tipo y carpeta sobrescribe el archivo
 *      existente y CONSERVA su Internal ID.
 *   2. Qué propiedades se conservan o se pierden (description, isOnline, isInactive,
 *      encoding y todas las columnas de la tabla SuiteQL "file").
 *   3. Si el Script Record que usa el archivo refleja la nueva @NApiVersion
 *      (tabla SuiteQL "script") y, con el script de sonda, en qué runtime se ejecuta.
 *   4. Qué ocurre si NetSuite rechaza el guardado (archivo con sintaxis solo válida en 2.0).
 *   5. Que el respaldo permite restaurar el contenido original.
 *
 * Seguridad:
 *   - Solo actúa sobre archivos cuyo nombre empieza por "drt_ss21_poc_" dentro de la
 *     carpeta indicada en el parámetro. No lee ni escribe nada más.
 *   - Requiere que el parámetro de confirmación sea igual al Account ID (evita ejecutarlo
 *     por error en otra cuenta tras un refresh de sandbox).
 *
 * Parámetros del deployment:
 *   custscript_drt_ss21poc_folder   Integer  Carpeta vacía y dedicada a la prueba
 *   custscript_drt_ss21poc_step     Text     SETUP | OVERWRITE | RESTORE
 *   custscript_drt_ss21poc_confirm  Text     Debe ser igual al Account ID
 *
 * Requiere en la MISMA carpeta que este archivo: drt_ss21_annotation_lib.js
 * ---------------------------------------------------------------------------
 */
define(['N/file', 'N/query', 'N/runtime', 'N/log', './drt_ss21_annotation_lib'],
    (file, query, runtime, log, annotation) => {

        const PREFIX = 'drt_ss21_poc_';
        const PARAM = {
            FOLDER: 'custscript_drt_ss21poc_folder',
            STEP: 'custscript_drt_ss21poc_step',
            CONFIRM: 'custscript_drt_ss21poc_confirm'
        };
        // Columnas que cambian legítimamente al guardar
        const VOLATILE_COLUMNS = ['lastmodifieddate', 'filesize', 'url'];

        // Archivos de prueba que crea SETUP ---------------------------------------
        const FIXTURES = [
            {
                name: `${PREFIX}probe_ss.js`,
                description: 'DRT SS21 PoC - sonda (crear Script Record Scheduled para este archivo)',
                isOnline: false,
                contents: [
                    '/**',
                    ' * @NApiVersion 2.0',
                    ' * @NScriptType ScheduledScript',
                    ' *',
                    ' * Sonda de runtime: según Oracle, JSON.stringify(new Error(\'x\')) incluye "message"',
                    ' * en el runtime 2.0 y devuelve {} en el runtime 2.1.',
                    ' */',
                    'define([\'N/log\'], function (log) {',
                    '    function execute() {',
                    '        var json = JSON.stringify(new Error(\'probe\'));',
                    '        var runtimeVersion = json === \'{}\' ? \'2.1\' : \'2.0\';',
                    '        log.audit(\'DRT SS21 PROBE\', \'runtime=\' + runtimeVersion + \' | stringify=\' + json +',
                    '            \' | parseInt("08")=\' + parseInt(\'08\'));',
                    '    }',
                    '    return { execute: execute };',
                    '});',
                    ''
                ].join('\n')
            },
            {
                name: `${PREFIX}lib.js`,
                description: 'DRT SS21 PoC - librería 2.x con descripción y Available Without Login',
                isOnline: true,
                contents: [
                    '/**',
                    ' * @NApiVersion 2.x',
                    ' * @NModuleScope SameAccount',
                    ' * Nota: este texto menciona @NApiVersion 2.0 y no debe cambiar.',
                    ' */',
                    'define([], function () {',
                    '    var texto = \'@NApiVersion 2.0 dentro de una cadena\';',
                    '    return { texto: texto, suma: function (a, b) { return a + b; } };',
                    '});',
                    ''
                ].join('\r\n')
            },
            {
                name: `${PREFIX}incompatible.js`,
                description: 'DRT SS21 PoC - sintaxis válida solo en 2.0 (for each)',
                isOnline: false,
                contents: [
                    '/**',
                    ' * @NApiVersion 2.0',
                    ' * @NScriptType ScheduledScript',
                    ' */',
                    'define([\'N/log\'], function (log) {',
                    '    function execute() {',
                    '        var total = 0;',
                    '        for each (var v in { a: 1, b: 2 }) { total += v; }',
                    '        log.audit(\'total\', total);',
                    '    }',
                    '    return { execute: execute };',
                    '});',
                    ''
                ].join('\n')
            }
        ];

        // =====================================================================
        // ENTRY POINT
        // =====================================================================
        const execute = () => {
            const script = runtime.getCurrentScript();
            const folderId = Number(script.getParameter({ name: PARAM.FOLDER }));
            const step = String(script.getParameter({ name: PARAM.STEP }) || '').trim().toUpperCase();
            const confirm = String(script.getParameter({ name: PARAM.CONFIRM }) || '').trim();

            if (confirm !== runtime.accountId) {
                throw new Error(`Confirmación inválida: el parámetro debe ser igual al Account ID (${runtime.accountId}).`);
            }
            if (!folderId) throw new Error('Falta el parámetro de carpeta de prueba.');

            const report = new Report(step, folderId);
            if (step === 'SETUP') setup(folderId, report);
            else if (step === 'OVERWRITE') overwrite(folderId, report);
            else if (step === 'RESTORE') restore(folderId, report);
            else throw new Error('Paso no válido. Use SETUP, OVERWRITE o RESTORE.');

            report.line('');
            report.line(`Gobernanza restante: ${script.getRemainingUsage()}`);
            const reportId = report.save();
            log.audit('PoC terminado', `Paso ${step} · reporte ${reportId} · ${report.summary()}`);
        };

        // =====================================================================
        // PASOS
        // =====================================================================
        const setup = (folderId, report) => {
            FIXTURES.forEach(fx => {
                const existing = findByName(folderId, fx.name);
                if (existing) { report.line(`[=] ${fx.name} ya existe (ID ${existing.id}), no se recrea`); return; }
                const id = file.create({
                    name: fx.name, fileType: file.Type.JAVASCRIPT, contents: fx.contents,
                    folder: folderId, description: fx.description, isOnline: fx.isOnline,
                    encoding: file.Encoding.UTF_8
                }).save();
                report.line(`[+] ${fx.name} creado con ID ${id}`);
            });
            report.line('');
            report.line('Siguiente paso manual: crear un Script Record (Scheduled) para drt_ss21_poc_probe_ss.js,');
            report.line('un deployment, ejecutarlo y anotar el log "DRT SS21 PROBE" y el campo API Version del registro.');
        };

        const overwrite = (folderId, report) => {
            FIXTURES.forEach(fx => {
                const meta = findByName(folderId, fx.name);
                if (!meta) { report.fail(fx.name, 'No existe: ejecute SETUP primero'); return; }
                report.section(`${fx.name} (ID ${meta.id})`);
                try {
                    overwriteOne(meta.id, folderId, report);
                } catch (e) {
                    report.fail('Excepción', `${e.name || ''} ${e.message || e}`);
                    // El archivo debe seguir intacto si el guardado fue rechazado
                    const after = file.load({ id: meta.id });
                    const det = annotation.detectApiVersion(after.getContents());
                    report.info('Estado tras el error', `@NApiVersion ${det.value} · tamaño ${after.size}`);
                }
            });
        };

        const overwriteOne = (fileId, folderId, report) => {
            // 1. Estado inicial
            const before = file.load({ id: fileId });
            const original = before.getContents();
            const snapBefore = snapshot(before);
            const rowBefore = fileRow(fileId);
            const scriptsBefore = scriptRows(fileId);
            report.info('Propiedades antes', JSON.stringify(snapBefore));
            report.info('Script Records antes', JSON.stringify(scriptsBefore));

            // 2. Contenido actualizado (librería probada en Node y aquí en runtime 2.1)
            const upd = annotation.buildUpdatedContent(original);
            report.info('Detección', `${upd.detection.status} ${upd.detection.value || ''} (línea ${upd.detection.line})`);
            if (!upd.ok) { report.info('Sin cambios', upd.reason); return; }

            // 3. Respaldo verificable
            const backupName = `${before.name}.${fileId}.bak.txt`;
            const backupId = file.create({
                name: backupName, fileType: file.Type.PLAINTEXT, contents: original,
                folder: folderId, description: `Respaldo de ${fileId} antes de @NApiVersion 2.1`,
                encoding: before.encoding
            }).save();
            const backupOk = file.load({ id: backupId }).getContents() === original;
            report.check('Respaldo legible e idéntico', backupOk, `ID ${backupId}`);
            if (!backupOk) return;

            // 4. Reemplazo: mismo nombre + misma carpeta + mismo tipo; se reenvían las propiedades conocidas
            const savedId = file.create({
                name: before.name,
                fileType: before.fileType,
                contents: upd.updated,
                folder: before.folder,
                description: before.description,
                encoding: before.encoding,
                isOnline: before.isOnline,
                isInactive: before.isInactive
            }).save();

            // 5. Verificaciones
            const after = file.load({ id: fileId });
            const snapAfter = snapshot(after);
            report.check('Internal ID conservado', Number(savedId) === Number(fileId), `save() devolvió ${savedId}`);
            report.check('Contenido = original con solo la anotación cambiada',
                annotation.verifyUpdate(original, after.getContents()).ok);
            ['name', 'folder', 'fileType', 'encoding', 'description', 'isOnline', 'isInactive'].forEach(k => {
                report.check(`Propiedad ${k} conservada`, snapBefore[k] === snapAfter[k], `${snapBefore[k]} -> ${snapAfter[k]}`);
            });
            const rowAfter = fileRow(fileId);
            diffRows(rowBefore, rowAfter).forEach(d => report.check(`Columna SuiteQL file.${d.col}`, false, `${d.a} -> ${d.b}`));
            report.check('Resto de columnas SuiteQL de file sin cambios', diffRows(rowBefore, rowAfter).length === 0);

            const scriptsAfter = scriptRows(fileId);
            report.info('Script Records después', JSON.stringify(scriptsAfter));
            if (scriptsBefore.rows && scriptsBefore.rows.length) {
                scriptsBefore.rows.forEach((r, i) => {
                    diffRows(r, (scriptsAfter.rows || [])[i] || {}, []).forEach(d =>
                        report.info(`Script Record cambió ${d.col}`, `${d.a} -> ${d.b}`));
                });
            }
            report.info('Backup', `${backupName} (ID ${backupId})`);
        };

        const restore = (folderId, report) => {
            FIXTURES.forEach(fx => {
                const meta = findByName(folderId, fx.name);
                if (!meta) { report.fail(fx.name, 'No existe'); return; }
                const backup = findByName(folderId, `${fx.name}.${meta.id}.bak.txt`);
                report.section(`${fx.name} (ID ${meta.id})`);
                if (!backup) { report.info('Sin respaldo', 'No se modificó en OVERWRITE'); return; }
                try {
                    const current = file.load({ id: meta.id });
                    const original = file.load({ id: backup.id }).getContents();
                    const savedId = file.create({
                        name: current.name, fileType: current.fileType, contents: original,
                        folder: current.folder, description: current.description, encoding: current.encoding,
                        isOnline: current.isOnline, isInactive: current.isInactive
                    }).save();
                    const restored = file.load({ id: meta.id }).getContents();
                    report.check('Internal ID conservado al restaurar', Number(savedId) === Number(meta.id));
                    report.check('Contenido restaurado idéntico al respaldo', restored === original);
                } catch (e) {
                    report.fail('Excepción al restaurar', `${e.name || ''} ${e.message || e}`);
                }
            });
        };

        // =====================================================================
        // AUXILIARES
        // =====================================================================
        const snapshot = f => ({
            id: Number(f.id), name: f.name, folder: Number(f.folder), fileType: String(f.fileType),
            encoding: String(f.encoding), description: f.description || '', isOnline: !!f.isOnline,
            isInactive: !!f.isInactive, size: f.size, path: f.path
        });

        const sql = (q, params) => query.runSuiteQL({ query: q, params }).asMappedResults();

        const findByName = (folderId, name) => {
            if (name.indexOf(PREFIX) !== 0) throw new Error(`Nombre fuera del alcance del PoC: ${name}`);
            const rows = sql('SELECT id, name FROM file WHERE folder = ? AND name = ?', [folderId, name]);
            return rows.length ? rows[0] : null;
        };

        const fileRow = fileId => {
            const rows = sql('SELECT * FROM file WHERE id = ?', [fileId]);
            return rows.length ? rows[0] : {};
        };

        const scriptRows = fileId => {
            try {
                return { rows: sql('SELECT * FROM script WHERE scriptfile = ?', [fileId]) };
            } catch (e) {
                return { error: `${e.name || ''} ${e.message || e}` };
            }
        };

        const diffRows = (a, b, ignore = VOLATILE_COLUMNS) => {
            const cols = Array.from(new Set(Object.keys(a || {}).concat(Object.keys(b || {}))));
            return cols.filter(c => ignore.indexOf(c) < 0 && String(a[c]) !== String(b[c]))
                .map(col => ({ col, a: a[col], b: b[col] }));
        };

        class Report {
            constructor(step, folderId) {
                this.lines = [];
                this.ok = 0;
                this.ko = 0;
                this.folderId = folderId;
                this.step = step;
                this.stamp = new Date().toISOString().replace(/[-:.]/g, '');
                this.line('DRT - PoC reemplazo de archivos SuiteScript 2.1');
                this.line(`Cuenta: ${runtime.accountId} · Paso: ${step} · Fecha (UTC): ${new Date().toISOString()}`);
                this.line(`Usuario: ${runtime.getCurrentUser().id} · Rol: ${runtime.getCurrentUser().role}`);
            }
            line(t) { this.lines.push(t); }
            section(t) { this.line(''); this.line(`=== ${t}`); }
            info(label, value) { this.line(`    ${label}: ${value}`); }
            check(label, pass, detail) {
                pass ? this.ok++ : this.ko++;
                this.line(`  [${pass ? 'OK' : 'FALLA'}] ${label}${detail ? ' · ' + detail : ''}`);
            }
            fail(label, detail) { this.check(label, false, detail); }
            summary() { return `${this.ok} OK · ${this.ko} FALLA`; }
            save() {
                this.line(`Resultado: ${this.summary()}`);
                return file.create({
                    name: `${PREFIX}report_${this.step}_${this.stamp}.txt`, fileType: file.Type.PLAINTEXT,
                    contents: this.lines.join('\n'), folder: this.folderId, encoding: file.Encoding.UTF_8
                }).save();
            }
        }

        return { execute };
    });
