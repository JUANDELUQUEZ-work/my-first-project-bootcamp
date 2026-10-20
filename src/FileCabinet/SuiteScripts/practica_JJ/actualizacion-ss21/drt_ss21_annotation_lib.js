/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 * DRT - Librería de anotación SuiteScript 2.1
 * ---------------------------------------------------------------------------
 * Funciones PURAS (sin módulos N/*) para:
 *   1. Detectar la anotación @NApiVersion real de un archivo JavaScript,
 *      sin confundirla con menciones en comentarios explicativos o cadenas.
 *   2. Construir el contenido actualizado cambiando SOLO el valor de la
 *      anotación (2.0 / 2.x / 2.X -> 2.1).
 *   3. Verificar que entre el original y el actualizado no cambió nada más.
 *   4. Señalar patrones de código con riesgo conocido al pasar al runtime 2.1
 *      (heurística: no sustituye a las pruebas funcionales).
 *
 * Al no depender de N/*, se prueba en Node (tests/drt_ss21_annotation_lib.test.cjs)
 * y se carga tal cual desde el Map/Reduce.
 * ---------------------------------------------------------------------------
 */
define([], () => {

    const TARGET_VERSION = '2.1';
    const UPDATABLE = ['2.0', '2.x', '2.X'];
    const VALID_VALUES = ['2.0', '2.x', '2.X', '2.1'];
    const TAG = '@NApiVersion';

    /** Estados de detección */
    const STATUS = {
        OK: 'OK',                                   // una única anotación válida en la cabecera
        SIN_ANOTACION: 'SIN_ANOTACION',             // no hay ninguna anotación en posición de etiqueta
        DUPLICADA: 'DUPLICADA',                     // más de una anotación en posición de etiqueta
        AMBIGUA: 'AMBIGUA',                         // anotación fuera de cabecera, fuera de JSDoc, mal escrita o con texto extra
        VALOR_NO_RECONOCIDO: 'VALOR_NO_RECONOCIDO', // anotación única pero con valor distinto de 2.0/2.x/2.X/2.1
        CONTENIDO_INVALIDO: 'CONTENIDO_INVALIDO'    // vacío, no texto o comentario de cabecera sin cerrar
    };

    /** Subtipo cuando no hay anotación */
    const SIN_ANOTACION_TIPO = {
        SS1_PROBABLE: 'SS1_PROBABLE',               // usa nlapi*/nlobj* y no llama a define/require
        MODULO_SIN_ANOTACION: 'MODULO_SIN_ANOTACION', // llama a define(): módulo 2.x sin etiqueta (hereda versión del llamador)
        DESCONOCIDO: 'DESCONOCIDO'
    };

    // =======================================================================
    // 1. ESCÁNER LÉXICO MÍNIMO
    //    Divide el texto en segmentos: code, line, block, jsdoc, string, template, regex.
    //    Suficiente para distinguir comentarios y cadenas del código real.
    // =======================================================================
    const REGEX_PREV_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new',
        'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);
    const REGEX_PREV_PUNCT = '(,=:[!&|?{};+-*%<>~^';

    const scan = src => {
        const segs = [];
        const n = src.length;
        let i = 0;
        let codeStart = 0;
        let lastSig = '';

        const flushCode = end => {
            if (end > codeStart) segs.push({ type: 'code', start: codeStart, end });
        };
        const regexAllowed = () => lastSig === '' || REGEX_PREV_WORDS.has(lastSig) ||
            (lastSig.length === 1 && REGEX_PREV_PUNCT.indexOf(lastSig) >= 0);

        while (i < n) {
            const c = src[i];
            const d = src[i + 1];

            // Comentario de línea
            if (c === '/' && d === '/') {
                flushCode(i);
                let j = src.indexOf('\n', i);
                if (j < 0) j = n;
                segs.push({ type: 'line', start: i, end: j });
                i = codeStart = j;
                continue;
            }
            // Comentario de bloque / JSDoc
            if (c === '/' && d === '*') {
                flushCode(i);
                const close = src.indexOf('*/', i + 2);
                const unterminated = close < 0;
                const end = unterminated ? n : close + 2;
                const isDoc = src[i + 2] === '*' && src[i + 3] !== '/';
                segs.push({ type: isDoc ? 'jsdoc' : 'block', start: i, end, unterminated });
                i = codeStart = end;
                continue;
            }
            // Cadenas
            if (c === '"' || c === '\'') {
                flushCode(i);
                let j = i + 1;
                while (j < n && src[j] !== c && src[j] !== '\n') {
                    if (src[j] === '\\') j++;
                    j++;
                }
                const end = Math.min(j + 1, n);
                segs.push({ type: 'string', start: i, end });
                i = codeStart = end;
                lastSig = '"';
                continue;
            }
            // Plantillas (no existen en 2.0, pero se toleran)
            if (c === '`') {
                flushCode(i);
                let j = i + 1;
                let depth = 0;
                while (j < n) {
                    const ch = src[j];
                    if (ch === '\\') { j += 2; continue; }
                    if (depth === 0 && ch === '`') break;
                    if (ch === '$' && src[j + 1] === '{') { depth++; j += 2; continue; }
                    if (depth > 0 && ch === '}') depth--;
                    j++;
                }
                const end = Math.min(j + 1, n);
                segs.push({ type: 'template', start: i, end });
                i = codeStart = end;
                lastSig = '"';
                continue;
            }
            // Literal de expresión regular (heurística por token previo)
            if (c === '/' && regexAllowed()) {
                let j = i + 1;
                let inClass = false;
                let ok = false;
                while (j < n) {
                    const ch = src[j];
                    if (ch === '\\') { j += 2; continue; }
                    if (ch === '\n') break;
                    if (ch === '[') inClass = true;
                    else if (ch === ']') inClass = false;
                    else if (ch === '/' && !inClass) { ok = true; break; }
                    j++;
                }
                if (ok) {
                    j++;
                    while (j < n && /[a-z]/i.test(src[j])) j++;
                    flushCode(i);
                    segs.push({ type: 'regex', start: i, end: j });
                    i = codeStart = j;
                    lastSig = ')';
                    continue;
                }
            }
            // Código
            if (/[A-Za-z_$0-9]/.test(c)) {
                let j = i + 1;
                while (j < n && /[A-Za-z_$0-9]/.test(src[j])) j++;
                lastSig = src.slice(i, j);
                i = j;
                continue;
            }
            if (!/\s/.test(c) && c !== '﻿') lastSig = c;
            i++;
        }
        flushCode(n);
        return segs;
    };

    const isComment = s => s.type === 'line' || s.type === 'block' || s.type === 'jsdoc';
    const isBlank = text => /^[\s﻿]*$/.test(text);
    const lineOf = (src, offset) => src.slice(0, offset).split('\n').length;

    // =======================================================================
    // 2. DETECCIÓN DE @NApiVersion
    // =======================================================================

    /**
     * Busca etiquetas en "posición de etiqueta" dentro de un comentario:
     * al inicio del comentario o de una línea (solo espacios, '*' o el delimitador antes).
     * Las apariciones dentro de una frase se consideran menciones, no etiquetas.
     */
    const findTagOccurrences = (src, seg, tagName) => {
        const text = src.slice(seg.start, seg.end);
        const re = new RegExp(tagName, 'gi');
        const out = [];
        let m;
        while ((m = re.exec(text)) !== null) {
            const lineStart = text.lastIndexOf('\n', m.index) + 1;
            const before = text.slice(lineStart, m.index);
            const tagPositioned = /^\s*(\/\*\*?|\/\/)?[\s*]*$/.test(before);
            out.push({
                absIndex: seg.start + m.index,
                matchedText: m[0],
                exactCase: m[0] === tagName,
                tagPositioned,
                segType: seg.type
            });
        }
        return out;
    };

    /** Lee el valor que sigue a la etiqueta y valida que el resto de la línea esté vacío */
    const readTagValue = (src, occ, segEnd) => {
        const afterTag = occ.absIndex + occ.matchedText.length;
        const ws = /^[ \t]+/.exec(src.slice(afterTag, segEnd));
        if (!ws) return { value: null, valueOffset: -1, trailingText: '' };
        const valueOffset = afterTag + ws[0].length;
        const rest = src.slice(valueOffset, segEnd);
        const v = /^[^\s*]+/.exec(rest);
        if (!v) return { value: null, valueOffset: -1, trailingText: '' };
        const lineEndRel = rest.search(/\r?\n/);
        const tail = rest.slice(v[0].length, lineEndRel < 0 ? rest.length : lineEndRel);
        // Se admite cierre del comentario en la misma línea:  /** @NApiVersion 2.1 */
        const trailingText = tail.replace(/\*\/\s*$/, '').trim();
        return { value: v[0], valueOffset, trailingText };
    };

    /**
     * Analiza un contenido y devuelve la anotación detectada.
     * @param {string} src contenido completo del archivo
     * @returns {{
     *   status: string, value: string|null, valueOffset: number, line: number|null,
     *   scriptType: string|null, sinAnotacionTipo: string|null,
     *   tagCount: number, mentions: number, notes: string[]
     * }}
     */
    const detectApiVersion = src => {
        const result = {
            status: null, value: null, valueOffset: -1, line: null, scriptType: null,
            sinAnotacionTipo: null, tagCount: 0, mentions: 0, notes: []
        };
        if (typeof src !== 'string' || isBlank(src)) {
            result.status = STATUS.CONTENIDO_INVALIDO;
            result.notes.push('Contenido vacío o no textual');
            return result;
        }

        const segs = scan(src);

        // Zona de cabecera: comentarios anteriores al primer token de código no vacío
        let headerEnd = segs.length;
        for (let k = 0; k < segs.length; k++) {
            const s = segs[k];
            if (s.type === 'code' && isBlank(src.slice(s.start, s.end))) continue;
            if (isComment(s)) continue;
            headerEnd = k;
            break;
        }
        const headerHasUnterminated = segs.slice(0, headerEnd).some(s => s.unterminated);
        if (headerHasUnterminated) {
            result.status = STATUS.CONTENIDO_INVALIDO;
            result.notes.push('Comentario de cabecera sin cerrar');
            return result;
        }

        // Etiquetas y menciones en todos los comentarios
        const candidates = [];      // etiqueta válida: JSDoc de cabecera, mayúsculas exactas
        const suspicious = [];      // en posición de etiqueta pero no válida
        segs.forEach((s, k) => {
            if (!isComment(s)) return;
            findTagOccurrences(src, s, TAG).forEach(o => {
                if (!o.tagPositioned) { result.mentions++; return; }
                const inHeader = k < headerEnd;
                if (inHeader && s.type === 'jsdoc' && o.exactCase) candidates.push({ occ: o, seg: s });
                else suspicious.push({ occ: o, seg: s, inHeader });
            });
        });
        // Apariciones dentro de cadenas o plantillas: se ignoran, pero se informan
        const inStrings = segs.filter(s => s.type === 'string' || s.type === 'template')
            .reduce((acc, s) => acc + (src.slice(s.start, s.end).split(TAG).length - 1), 0);
        if (inStrings) result.notes.push(`${inStrings} aparición(es) de ${TAG} dentro de cadenas (ignoradas)`);
        if (result.mentions) result.notes.push(`${result.mentions} mención(es) de ${TAG} en texto de comentarios (ignoradas)`);

        result.tagCount = candidates.length + suspicious.length;

        // Tipo de script (informativo)
        const header = segs.slice(0, headerEnd).filter(s => s.type === 'jsdoc');
        for (const s of header) {
            const st = findTagOccurrences(src, s, '@NScriptType').find(o => o.tagPositioned && o.exactCase);
            if (st) { result.scriptType = readTagValue(src, st, s.end).value; break; }
        }

        if (result.tagCount === 0) {
            result.status = STATUS.SIN_ANOTACION;
            const code = codeOnly(src, segs);
            const usesDefine = /\b(define|require)\s*\(/.test(code);
            const usesSs1 = /\bnl(api|obj)[A-Z]\w*/.test(code);
            result.sinAnotacionTipo = !usesDefine && usesSs1 ? SIN_ANOTACION_TIPO.SS1_PROBABLE
                : usesDefine ? SIN_ANOTACION_TIPO.MODULO_SIN_ANOTACION : SIN_ANOTACION_TIPO.DESCONOCIDO;
            return result;
        }
        if (result.tagCount > 1) {
            result.status = STATUS.DUPLICADA;
            result.notes.push(`${result.tagCount} etiquetas ${TAG} en posición de etiqueta`);
            return result;
        }
        if (suspicious.length === 1) {
            const s = suspicious[0];
            result.status = STATUS.AMBIGUA;
            result.line = lineOf(src, s.occ.absIndex);
            if (!s.occ.exactCase) result.notes.push(`Etiqueta con mayúsculas distintas: "${s.occ.matchedText}"`);
            if (!s.inHeader) result.notes.push('Etiqueta fuera del bloque de cabecera');
            if (s.seg.type !== 'jsdoc') result.notes.push('Etiqueta fuera de un comentario JSDoc (/** */)');
            return result;
        }

        const { occ, seg } = candidates[0];
        const tv = readTagValue(src, occ, seg.end);
        result.line = lineOf(src, occ.absIndex);
        if (!tv.value) {
            result.status = STATUS.AMBIGUA;
            result.notes.push('Etiqueta sin valor');
            return result;
        }
        if (tv.trailingText) {
            result.status = STATUS.AMBIGUA;
            result.value = tv.value;
            result.notes.push(`Texto adicional tras el valor: "${tv.trailingText}"`);
            return result;
        }
        result.value = tv.value;
        result.valueOffset = tv.valueOffset;
        result.status = VALID_VALUES.indexOf(tv.value) >= 0 ? STATUS.OK : STATUS.VALOR_NO_RECONOCIDO;
        return result;
    };

    /** Copia del texto con comentarios, cadenas y regex sustituidos por espacios (conserva posiciones y saltos de línea) */
    const codeOnly = (src, segs) => (segs || scan(src))
        .map(s => (s.type === 'code' ? src.slice(s.start, s.end) : src.slice(s.start, s.end).replace(/[^\n]/g, ' ')))
        .join('');

    // =======================================================================
    // 3. SUSTITUCIÓN Y VERIFICACIÓN
    // =======================================================================

    /**
     * Construye el contenido actualizado. No toca nada si el archivo no es elegible por su anotación.
     * @returns {{ ok: boolean, reason: string|null, detection: object, updated: string|null, from: string|null, to: string|null }}
     */
    const buildUpdatedContent = src => {
        const detection = detectApiVersion(src);
        const base = { ok: false, reason: null, detection, updated: null, from: detection.value, to: null };
        if (detection.status !== STATUS.OK) return Object.assign(base, { reason: `Anotación ${detection.status}` });
        if (detection.value === TARGET_VERSION) return Object.assign(base, { reason: 'Ya está en 2.1' });
        if (UPDATABLE.indexOf(detection.value) < 0) return Object.assign(base, { reason: `Valor ${detection.value} no actualizable` });

        const off = detection.valueOffset;
        const updated = src.slice(0, off) + TARGET_VERSION + src.slice(off + detection.value.length);
        const check = verifyUpdate(src, updated, detection);
        if (!check.ok) return Object.assign(base, { reason: `Verificación previa fallida: ${check.reason}` });
        return Object.assign(base, { ok: true, updated, to: TARGET_VERSION });
    };

    /**
     * Comprueba que "updated" difiere de "original" únicamente en el valor de la anotación.
     * Se usa antes de guardar y otra vez sobre el contenido releído después de guardar.
     */
    const verifyUpdate = (original, updated, detectionBefore) => {
        const det = detectionBefore || detectApiVersion(original);
        if (det.status !== STATUS.OK) return { ok: false, reason: 'El original no tiene anotación única válida' };
        const off = det.valueOffset;
        const oldLen = det.value.length;
        if (typeof updated !== 'string') return { ok: false, reason: 'Contenido actualizado no textual' };
        if (updated.length !== original.length - oldLen + TARGET_VERSION.length) {
            return { ok: false, reason: `Longitud inesperada (${original.length} -> ${updated.length})` };
        }
        if (updated.slice(0, off) !== original.slice(0, off)) return { ok: false, reason: 'Cambió el texto anterior a la anotación' };
        if (updated.slice(off + TARGET_VERSION.length) !== original.slice(off + oldLen)) {
            return { ok: false, reason: 'Cambió el texto posterior a la anotación' };
        }
        const after = detectApiVersion(updated);
        if (after.status !== STATUS.OK || after.value !== TARGET_VERSION) {
            return { ok: false, reason: `La relectura detecta ${after.status} ${after.value || ''}`.trim() };
        }
        if (after.valueOffset !== off) return { ok: false, reason: 'La anotación cambió de posición' };
        if (after.scriptType !== det.scriptType) return { ok: false, reason: 'Cambió @NScriptType' };
        return { ok: true, reason: null };
    };

    // =======================================================================
    // 4. RIESGOS CONOCIDOS AL PASAR A 2.1 (heurística sobre código sin comentarios ni cadenas)
    //    Fuente: Oracle - Differences Between SuiteScript 2.0 and SuiteScript 2.1
    //    BLOQUEANTE  -> error de sintaxis o de ejecución documentado: no actualizar automáticamente
    //    REVISION    -> el cambio puede alterar contratos externos o depende de quién carga el módulo
    //    ADVERTENCIA -> comportamiento distinto documentado; requiere prueba funcional
    // =======================================================================
    const RESERVED_2_1 = 'class|enum|export|extends|import|super|let|static|yield|await|implements|interface|package|private|protected|public';

    const RISK_RULES = [
        { id: 'FOR_EACH_IN', level: 'BLOQUEANTE', re: /\bfor\s+each\s*\(/g,
            msg: 'for each...in: SyntaxError en 2.1' },
        { id: 'CATCH_CONDICIONAL', level: 'BLOQUEANTE', re: /\bcatch\s*\(\s*[A-Za-z_$][\w$]*\s+if\b/g,
            msg: 'catch condicional: SyntaxError en 2.1' },
        { id: 'TO_SOURCE', level: 'BLOQUEANTE', re: /\.toSource\s*\(/g,
            msg: 'toSource() no existe en 2.1' },
        { id: 'PALABRA_RESERVADA_DECLARADA', level: 'BLOQUEANTE',
            re: new RegExp(`\\b(?:var|const|function)\\s+(?:${RESERVED_2_1})\\b`, 'g'),
            msg: 'Palabra reservada en ECMAScript 2023 usada como identificador' },
        { id: 'API_SS1', level: 'BLOQUEANTE', re: /\bnl(?:api|obj)[A-Z]\w*/g,
            msg: 'API de SuiteScript 1.0 en un archivo 2.x' },
        { id: 'PALABRA_RESERVADA_PROPIEDAD', level: 'ADVERTENCIA',
            re: new RegExp(`(?:[{,]\\s*(?:${RESERVED_2_1})\\s*:)|(?:\\.(?:${RESERVED_2_1})\\b)`, 'g'),
            msg: 'Palabra reservada como propiedad (Oracle documenta error con extends)' },
        { id: 'JSON_STRINGIFY_ERROR', level: 'ADVERTENCIA',
            re: /JSON\.stringify\s*\(\s*(?:e|err|error|ex|exc|exception)\s*\)/g,
            msg: 'JSON.stringify de un Error devuelve {} en 2.1' },
        { id: 'PARSEINT_SIN_BASE', level: 'ADVERTENCIA', re: /\bparseInt\s*\(\s*[^,()]+\)/g,
            msg: 'parseInt sin base: resultado distinto con ceros a la izquierda' },
        { id: 'FECHA_LOCAL', level: 'ADVERTENCIA', re: /\.toLocale(?:Date|Time)?String\s*\(/g,
            msg: 'Formato de fecha local distinto en 2.1' },
        { id: 'DECIMAL_CEROS_FINALES', level: 'ADVERTENCIA', re: /(?<![\w.])\d+\.0+(?![\w.])/g,
            msg: 'Literal decimal con ceros finales (ej. 616.00) se guarda como entero en 2.1' },
        { id: 'JSON_PARSE', level: 'INFO', re: /\bJSON\.parse\s*\(/g,
            msg: '2.1 rechaza JSON con comas finales' }
    ];

    /**
     * @param {string} src
     * @param {object} [detection] resultado de detectApiVersion (para tipo de script)
     * @returns {{ level: string, risks: Array<{id, level, msg, count, lines: number[]}> }}
     */
    const scanRisks = (src, detection) => {
        const det = detection || detectApiVersion(src);
        const code = codeOnly(src);
        const risks = [];
        RISK_RULES.forEach(rule => {
            rule.re.lastIndex = 0;
            const lines = [];
            let m;
            while ((m = rule.re.exec(code)) !== null) lines.push(lineOf(code, m.index));
            if (lines.length) risks.push({ id: rule.id, level: rule.level, msg: rule.msg, count: lines.length, lines: lines.slice(0, 10) });
        });
        const type = String(det.scriptType || '').toLowerCase();
        if (type === 'restlet') {
            risks.push({ id: 'RESTLET', level: 'REVISION', count: 1, lines: [],
                msg: 'RESTlet: 2.1 cambia el formato de respuesta (integraciones externas)' });
        }
        if (type === 'clientscript' && /\b(getSubrecord|getCurrentSubrecord|removeSubrecord|hasSubrecord)\s*\(/.test(code)) {
            risks.push({ id: 'CLIENT_SUBRECORD', level: 'REVISION', count: 1, lines: [],
                msg: 'Client script con subrecords: soporte parcial en 2.1' });
        }
        if (!det.scriptType) {
            risks.push({ id: 'MODULO_PERSONALIZADO', level: 'REVISION', count: 1, lines: [],
                msg: 'Módulo sin @NScriptType: revisar los scripts 2.0 que lo cargan' });
        }
        const order = ['BLOQUEANTE', 'REVISION', 'ADVERTENCIA', 'INFO'];
        const level = order.find(l => risks.some(r => r.level === l)) || 'NINGUNO';
        return { level, risks };
    };

    return {
        TARGET_VERSION,
        UPDATABLE,
        VALID_VALUES,
        STATUS,
        SIN_ANOTACION_TIPO,
        detectApiVersion,
        buildUpdatedContent,
        verifyUpdate,
        scanRisks,
        // expuestos para pruebas
        _scan: scan,
        _codeOnly: codeOnly
    };
});
