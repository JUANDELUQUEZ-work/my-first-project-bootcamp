// Pruebas de la librería de anotación (Node >= 18), desde la raíz del repositorio:
//   node --test tests/drt_ss21_annotation_lib.test.cjs
// Prueba de humo opcional sobre archivos reales:
//   SS21_SMOKE_DIR=src/FileCabinet/SuiteScripts node --test tests/drt_ss21_annotation_lib.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const LIB = process.env.SS21_LIB ||
    path.resolve(__dirname, '../src/FileCabinet/SuiteScripts/practica_JJ/actualizacion-ss21/drt_ss21_annotation_lib.js');
const load = () => {
    let exported;
    vm.runInNewContext(fs.readFileSync(LIB, 'utf8'), {
        define: (deps, factory) => { exported = factory(); }
    }, { filename: 'drt_ss21_annotation_lib.js' });
    return exported;
};
const lib = load();
const { STATUS } = lib;

const header = (version, type = 'UserEventScript', nl = '\n') =>
    ['/**', ` * @NApiVersion ${version}`, ` * @NScriptType ${type}`, ' * @NModuleScope SameAccount', ' */'].join(nl) + nl;
const body = "define(['N/log'], function (log) {\n    function beforeLoad(ctx) { log.debug('x', 1); }\n    return { beforeLoad: beforeLoad };\n});\n";

// ---------------------------------------------------------------------------
// Escenarios 1-4: versiones 2.0, 2.x, 2.X, 2.1
// ---------------------------------------------------------------------------
for (const v of ['2.0', '2.x', '2.X']) {
    test(`Versión ${v}: se detecta y se propone 2.1 cambiando solo el valor`, () => {
        const src = header(v) + body;
        const det = lib.detectApiVersion(src);
        assert.equal(det.status, STATUS.OK);
        assert.equal(det.value, v);
        assert.equal(det.line, 2);
        assert.equal(det.scriptType, 'UserEventScript');

        const r = lib.buildUpdatedContent(src);
        assert.equal(r.ok, true);
        assert.equal(r.from, v);
        assert.equal(r.updated, header('2.1') + body);
        assert.equal(r.updated.length, src.length);
        const diffs = [...src].filter((ch, i) => ch !== r.updated[i]).length;
        assert.equal(diffs, 1, 'solo debe cambiar un carácter');
    });
}

test('Versión 2.1: no se modifica', () => {
    const r = lib.buildUpdatedContent(header('2.1') + body);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'Ya está en 2.1');
    assert.equal(r.updated, null);
});

// ---------------------------------------------------------------------------
// Escenario 5: SuiteScript 1.0
// ---------------------------------------------------------------------------
test('SuiteScript 1.0: sin anotación y con APIs nlapi -> SS1_PROBABLE, no se modifica', () => {
    const src = "/**\n * Module Description\n * Version 1.00\n */\nfunction userEventBeforeLoad(type, form) {\n  var rec = nlapiGetNewRecord();\n}\n";
    const det = lib.detectApiVersion(src);
    assert.equal(det.status, STATUS.SIN_ANOTACION);
    assert.equal(det.sinAnotacionTipo, lib.SIN_ANOTACION_TIPO.SS1_PROBABLE);
    assert.equal(lib.buildUpdatedContent(src).ok, false);
});

// ---------------------------------------------------------------------------
// Escenario 6: sin anotación
// ---------------------------------------------------------------------------
test('Módulo 2.x sin anotación: SIN_ANOTACION / MODULO_SIN_ANOTACION', () => {
    const src = "/**\n * Utilidades\n */\ndefine([], function () { return { a: 1 }; });\n";
    const det = lib.detectApiVersion(src);
    assert.equal(det.status, STATUS.SIN_ANOTACION);
    assert.equal(det.sinAnotacionTipo, lib.SIN_ANOTACION_TIPO.MODULO_SIN_ANOTACION);
    assert.equal(lib.buildUpdatedContent(src).ok, false);
});

test('Archivo vacío o no textual: CONTENIDO_INVALIDO', () => {
    assert.equal(lib.detectApiVersion('').status, STATUS.CONTENIDO_INVALIDO);
    assert.equal(lib.detectApiVersion('   \n').status, STATUS.CONTENIDO_INVALIDO);
    assert.equal(lib.detectApiVersion(null).status, STATUS.CONTENIDO_INVALIDO);
});

// ---------------------------------------------------------------------------
// Escenario 7: duplicadas o ambiguas
// ---------------------------------------------------------------------------
test('Dos etiquetas en la cabecera: DUPLICADA', () => {
    const src = '/**\n * @NApiVersion 2.x\n * @NApiVersion 2.0\n * @NScriptType Suitelet\n */\n' + body;
    assert.equal(lib.detectApiVersion(src).status, STATUS.DUPLICADA);
    assert.equal(lib.buildUpdatedContent(src).ok, false);
});

test('Segundo bloque JSDoc más abajo con etiqueta: DUPLICADA', () => {
    const src = header('2.0') + body + '/**\n * @NApiVersion 2.1\n */\nfunction x() {}\n';
    assert.equal(lib.detectApiVersion(src).status, STATUS.DUPLICADA);
});

test('Etiqueta antigua comentada con // además de la real: DUPLICADA (revisión manual)', () => {
    const src = header('2.x') + '// @NApiVersion 2.0\n' + body;
    assert.equal(lib.detectApiVersion(src).status, STATUS.DUPLICADA);
});

test('Etiqueta solo en comentario /* */ (no JSDoc): AMBIGUA', () => {
    const src = '/*\n * @NApiVersion 2.x\n * @NScriptType Suitelet\n */\n' + body;
    const det = lib.detectApiVersion(src);
    assert.equal(det.status, STATUS.AMBIGUA);
    assert.match(det.notes.join(' '), /JSDoc/);
});

test('Etiqueta con mayúsculas distintas: AMBIGUA', () => {
    const src = '/**\n * @NApiversion 2.x\n * @NScriptType Suitelet\n */\n' + body;
    assert.equal(lib.detectApiVersion(src).status, STATUS.AMBIGUA);
});

test('Etiqueta después de código (fuera de cabecera): AMBIGUA', () => {
    const src = "var CONST_X = 1;\n/**\n * @NApiVersion 2.x\n * @NScriptType Suitelet\n */\n" + body;
    const det = lib.detectApiVersion(src);
    assert.equal(det.status, STATUS.AMBIGUA);
    assert.match(det.notes.join(' '), /fuera del bloque de cabecera/);
});

test('Etiqueta sin valor o con texto adicional: AMBIGUA', () => {
    assert.equal(lib.detectApiVersion('/**\n * @NApiVersion\n */\n' + body).status, STATUS.AMBIGUA);
    assert.equal(lib.detectApiVersion('/**\n * @NApiVersion 2.0 antes 1.0\n */\n' + body).status, STATUS.AMBIGUA);
    assert.equal(lib.detectApiVersion('/**\n * @NApiVersion2.0\n */\n' + body).status, STATUS.AMBIGUA);
});

test('Valor no reconocido (1.0, 2, 2.2): VALOR_NO_RECONOCIDO', () => {
    for (const v of ['1.0', '2', '2.2']) {
        const det = lib.detectApiVersion(header(v) + body);
        assert.equal(det.status, STATUS.VALOR_NO_RECONOCIDO, v);
        assert.equal(lib.buildUpdatedContent(header(v) + body).ok, false);
    }
});

// ---------------------------------------------------------------------------
// Falsos positivos: menciones que NO son la anotación
// ---------------------------------------------------------------------------
test('Mención en prosa dentro del JSDoc no cuenta como etiqueta', () => {
    const src = '/**\n * Migrado desde @NApiVersion 2.0 en 2024.\n * @NApiVersion 2.x\n * @NScriptType Suitelet\n */\n' + body;
    const det = lib.detectApiVersion(src);
    assert.equal(det.status, STATUS.OK);
    assert.equal(det.value, '2.x');
    assert.equal(det.mentions, 1);
    const r = lib.buildUpdatedContent(src);
    assert.ok(r.updated.includes('Migrado desde @NApiVersion 2.0 en 2024.'), 'la mención no se toca');
    assert.ok(r.updated.includes(' * @NApiVersion 2.1\n'));
});

test('Cadenas y regex con el texto de la etiqueta no cuentan', () => {
    const src = header('2.0') +
        "define([], function () {\n" +
        "  var tpl = '/**\\n * @NApiVersion 2.0\\n */';\n" +
        "  var re = /@NApiVersion\\s+2\\.0/;\n" +
        "  var s = \"// @NApiVersion 2.1\";\n" +
        "  return { tpl: tpl, re: re, s: s };\n});\n";
    const det = lib.detectApiVersion(src);
    assert.equal(det.status, STATUS.OK);
    assert.equal(det.value, '2.0');
    const r = lib.buildUpdatedContent(src);
    assert.equal(r.ok, true);
    assert.ok(r.updated.includes("var tpl = '/**\\n * @NApiVersion 2.0\\n */';"));
    assert.ok(r.updated.includes('var re = /@NApiVersion\\s+2\\.0/;'));
});

test('URL con // dentro de una cadena no se confunde con comentario', () => {
    const src = header('2.x') + "define([], function () { var u = 'https://x.com/a//b'; return {u: u}; });\n";
    assert.equal(lib.buildUpdatedContent(src).ok, true);
});

// ---------------------------------------------------------------------------
// Conservación del contenido: CRLF, BOM, tabulaciones, una sola línea, Unicode
// ---------------------------------------------------------------------------
test('CRLF, BOM y Unicode se conservan; solo cambia el valor', () => {
    const src = '﻿' + header('2.x', 'ScheduledScript', '\r\n') + "define([], () => { /* Ñandú – café */ });\r\n";
    const r = lib.buildUpdatedContent(src);
    assert.equal(r.ok, true);
    assert.equal(r.updated, '﻿' + header('2.1', 'ScheduledScript', '\r\n') + "define([], () => { /* Ñandú – café */ });\r\n");
});

test('Tabulación entre etiqueta y valor, y JSDoc de una línea', () => {
    const a = '/**\n *\t@NApiVersion\t2.0\n * @NScriptType Restlet\n */\n' + body;
    assert.equal(lib.buildUpdatedContent(a).updated, a.replace('\t2.0', '\t2.1'));
    const b = '/** @NApiVersion 2.x @NScriptType Suitelet */\n' + body;
    // texto adicional en la misma línea -> ambiguo: no se toca
    assert.equal(lib.detectApiVersion(b).status, STATUS.AMBIGUA);
    const c = '/** @NApiVersion 2.x */\n' + body;
    assert.equal(lib.buildUpdatedContent(c).updated, c.replace('2.x', '2.1'));
});

test('Comentarios de licencia antes del JSDoc siguen siendo cabecera', () => {
    const src = '// Copyright (c) Disruptt\n/* Licencia interna */\n' + header('2.0') + body;
    assert.equal(lib.buildUpdatedContent(src).ok, true);
});

test('Comentario de cabecera sin cerrar: CONTENIDO_INVALIDO', () => {
    assert.equal(lib.detectApiVersion('/**\n * @NApiVersion 2.0\n define([], ...').status, STATUS.CONTENIDO_INVALIDO);
});

// ---------------------------------------------------------------------------
// verifyUpdate detecta cambios no relacionados (protección del contenido)
// ---------------------------------------------------------------------------
test('verifyUpdate rechaza cualquier cambio ajeno a la anotación', () => {
    const src = header('2.0') + body;
    const good = header('2.1') + body;
    assert.equal(lib.verifyUpdate(src, good).ok, true);
    assert.equal(lib.verifyUpdate(src, good.replace("'x'", "'y'")).ok, false);
    assert.equal(lib.verifyUpdate(src, good + '\n').ok, false);
    assert.equal(lib.verifyUpdate(src, good.replace('\n', '\r\n')).ok, false);
    assert.equal(lib.verifyUpdate(src, header('2.1', 'Suitelet') + body).ok, false);
    assert.equal(lib.verifyUpdate(src, src).ok, false);
});

// ---------------------------------------------------------------------------
// Escenario 13: ejecución repetida (idempotencia)
// ---------------------------------------------------------------------------
test('Idempotencia: aplicar dos veces no produce un segundo cambio', () => {
    const first = lib.buildUpdatedContent(header('2.x') + body);
    const second = lib.buildUpdatedContent(first.updated);
    assert.equal(second.ok, false);
    assert.equal(second.reason, 'Ya está en 2.1');
});

// ---------------------------------------------------------------------------
// Escenario 12: dependencias o código potencialmente incompatible
// ---------------------------------------------------------------------------
test('Riesgos bloqueantes: for each, catch condicional, toSource, reservadas, nlapi', () => {
    const src = header('2.0') +
        "define([], function () {\n" +
        "  for each (var x in obj) {}\n" +
        "  try {} catch (e if e instanceof TypeError) {}\n" +
        "  var s = obj.toSource();\n" +
        "  var extends = 1;\n" +
        "  nlapiLogExecution('DEBUG', 'a', 'b');\n" +
        "});\n";
    const r = lib.scanRisks(src);
    assert.equal(r.level, 'BLOQUEANTE');
    const ids = r.risks.map(x => x.id);
    for (const id of ['FOR_EACH_IN', 'CATCH_CONDICIONAL', 'TO_SOURCE', 'PALABRA_RESERVADA_DECLARADA', 'API_SS1']) {
        assert.ok(ids.includes(id), id);
    }
    assert.deepEqual([...r.risks.find(x => x.id === 'FOR_EACH_IN').lines], [7]); // arreglo de otro contexto vm
});

test('Advertencias: JSON.stringify(e), parseInt sin base, fechas locales, 616.00, JSON.parse', () => {
    const src = header('2.x') +
        "define([], function () {\n" +
        "  try { JSON.parse(s); } catch (e) { log.error('x', JSON.stringify(e)); }\n" +
        "  var n = parseInt(v);\n" +
        "  var ok = parseInt(v, 10);\n" +
        "  var d = new Date().toLocaleDateString();\n" +
        "  rec.setValue({ fieldId: 'rate', value: 616.00 });\n" +
        "});\n";
    const r = lib.scanRisks(src);
    assert.equal(r.level, 'ADVERTENCIA');
    const by = Object.fromEntries(r.risks.map(x => [x.id, x]));
    assert.equal(by.PARSEINT_SIN_BASE.count, 1);
    assert.ok(by.JSON_STRINGIFY_ERROR && by.FECHA_LOCAL && by.DECIMAL_CEROS_FINALES && by.JSON_PARSE);
});

test('Los patrones dentro de comentarios o cadenas no generan riesgos', () => {
    const src = header('2.x') +
        "define([], function () {\n" +
        "  // for each (var x in obj) era 1.0\n" +
        "  var t = 'nlapiGetRecord';\n" +
        "  return {};\n});\n";
    assert.equal(lib.scanRisks(src).level, 'NINGUNO');
});

test('Revisión: RESTlet, librería sin @NScriptType y client script con subrecords', () => {
    assert.ok(lib.scanRisks(header('2.x', 'Restlet') + body).risks.some(r => r.id === 'RESTLET'));
    const libSrc = '/**\n * @NApiVersion 2.x\n */\ndefine([], function () { return {}; });\n';
    assert.ok(lib.scanRisks(libSrc).risks.some(r => r.id === 'MODULO_PERSONALIZADO'));
    const cs = header('2.0', 'ClientScript') + "define([], function () { function f(c){ c.currentRecord.getCurrentSubrecord({}); } return {fieldChanged: f}; });\n";
    assert.ok(lib.scanRisks(cs).risks.some(r => r.id === 'CLIENT_SUBRECORD'));
});

// ---------------------------------------------------------------------------
// Prueba de humo opcional sobre archivos reales: SS21_SMOKE_DIR=/ruta node --test tests/
// ---------------------------------------------------------------------------
test('Humo: archivos reales del repositorio (si se indica SS21_SMOKE_DIR)', { skip: !process.env.SS21_SMOKE_DIR }, () => {
    const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return e.name === 'node_modules' || e.name.startsWith('.') ? [] : walk(p);
        return e.name.endsWith('.js') ? [p] : [];
    });
    const rows = walk(process.env.SS21_SMOKE_DIR).map(p => {
        const src = fs.readFileSync(p, 'utf8');
        const det = lib.detectApiVersion(src);
        const upd = lib.buildUpdatedContent(src);
        if (upd.ok) assert.equal(lib.verifyUpdate(src, upd.updated).ok, true, p);
        return `${det.status.padEnd(20)} ${String(det.value || '-').padEnd(5)} ${String(det.scriptType || '-').padEnd(16)} ` +
            `${(upd.ok ? 'ACTUALIZABLE' : upd.reason).padEnd(28)} ${lib.scanRisks(src, det).level.padEnd(11)} ${path.relative(process.env.SS21_SMOKE_DIR, p)}`;
    });
    console.log('\n' + rows.join('\n'));
});
