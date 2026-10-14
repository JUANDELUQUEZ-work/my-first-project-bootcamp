const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../src/FileCabinet/SuiteScripts/practica_JJ/templates/practice/late-1');
function load(name, deps = {}) {
    let exported;
    vm.runInNewContext(fs.readFileSync(path.join(root, name), 'utf8'), {
        Date, define: (names, factory) => { exported = factory(...names.map(n => deps[n])); }
    }, { filename: name });
    return exported;
}
const rec = (data, labels = {}) => ({
    id: data.id, type: 'invoice',
    getValue: ({ fieldId }) => data[fieldId] ?? '',
    getText: ({ fieldId }) => labels[fieldId] ?? '',
    getLineCount: () => 1,
    getSublistValue: () => 'A12'
});

function fixture(options = {}) {
    const settings = Object.assign(load('late1_config.js'), options.settings);
    const calls = { loads: [], logs: [] };
    const latest = rec({
        id: 222, customform: 123, amountremaining: 50, subsidiary: 7, currency: 4,
        duedate: new Date(2020, 0, 1), tranid: 'INV/222', billaddress: 'Cliente & socios\nMadrid',
        ...options.invoice
    }, { entity: 'Cliente & socios', currency: 'Euro', location: 'Madrid' });
    const deps = {
        './late1_config': settings,
        'N/record': {
            Type: { INVOICE: 'invoice', SUBSIDIARY: 'subsidiary', CURRENCY: 'currency' },
            load: args => {
                calls.loads.push(args);
                if (options.denied) throw new Error('PERMISSION_VIOLATION');
                if (args.type === 'invoice') return String(args.id) === '101' ? rec({ id: 101, customform: 123 }) : latest;
                if (args.type === 'currency') return rec({ symbol: options.currency || 'EUR' });
                return rec({ legalname: 'Café de Finca', mainaddress_text: 'Madrid', ...options.company });
            }
        },
        'N/config': { Type: { COMPANY_INFORMATION: 'company' }, load: () => rec({ companyname: 'Café de Finca' }) },
        'N/search': {
            Type: { INVOICE: 'invoice' }, Sort: { DESC: 'DESC' }, createColumn: x => x,
            create: spec => {
                calls.search = spec;
                return { run: () => ({ getRange: range => {
                    calls.range = range;
                    return options.empty ? [] : [{ id: '222' }];
                } }) };
            }
        },
        'N/file': { load: ({ id }) => {
            if (String(id).endsWith('.xml')) return { getContents: () => fs.readFileSync(path.join(root, 'late1_template.xml'), 'utf8') };
            if (options.badLogo) throw new Error('Missing logo');
            return { url: '/core/media/media.nl?id=' + id + '&c=TEST' };
        } },
        'N/format': { Type: { DATE: 'DATE' }, format: ({ value }) => value.toISOString().slice(0, 10) },
        'N/log': { error: x => calls.logs.push(x) },
        'N/render': { DataSource: { OBJECT: 'OBJECT' }, create: () => ({
            addRecord: x => { calls.record = x.record; },
            addCustomDataSource: x => { calls.data = x.data; },
            renderAsPdf: () => ({ name: '' })
        }) }
    };
    const context = {
        request: { method: options.method || 'GET', parameters: { sourceInvoiceId: options.sourceId ?? '101' } },
        response: {
            writeFile: x => { calls.pdf = x; },
            setHeader: x => { calls.header = x; },
            write: x => { calls.error = x.output; }
        }
    };
    load('late1_pdf_sl.js', deps).onRequest(context);
    return calls;
}

test('selecciona la última Invoice del mismo formulario por fecha de creación e ID', () => {
    const c = fixture();
    assert.equal(c.error, undefined);
    assert.equal(c.record.id, 222);
    assert.deepEqual(JSON.parse(JSON.stringify(c.search.filters)), [['mainline', 'is', 'T'], 'AND', ['customform', 'anyof', '123']]);
    assert.deepEqual(JSON.parse(JSON.stringify(c.search.columns)), [{ name: 'datecreated', sort: 'DESC' }, { name: 'internalid', sort: 'DESC' }]);
    assert.equal(c.range.end, 1);
    assert.equal(c.pdf.file.name, 'Late_1_INV_222.pdf');
    assert.equal(c.pdf.isInline, true);
    assert.equal(c.data.company.name, 'Café de Finca');
    assert.ok(c.loads.some(x => x.type === 'subsidiary' && x.id === 7));
});
test('mínimo de recargo EUR y tasa fiscal desconocida', () => {
    const c = fixture();
    assert.equal(c.data.feeBase, '11.00');
    assert.equal(c.data.feeTax, '');
    assert.equal(c.data.bankAccount, '');
});
test('10% e impuesto configurado calculados sin cambiar la Invoice', () => {
    const c = fixture({ invoice: { amountremaining: 500 }, settings: { lateFeeTaxPercent: 21 } });
    assert.equal(c.data.feeBase, '50.00');
    assert.equal(c.data.feeTax, '10.50');
    assert.equal(c.record.getValue({ fieldId: 'amountremaining' }), 500);
});
test('factura pagada no genera recargo ni se sustituye por otra factura antigua', () => {
    const c = fixture({ invoice: { amountremaining: 0 } });
    assert.equal(c.data.hasBalance, false);
    assert.equal(c.data.feeBase, '0.00');
    assert.ok(c.pdf);
});
test('factura futura no aparece vencida ni tiene recargo', () => {
    const c = fixture({ invoice: { duedate: new Date(2099, 0, 1) } });
    assert.equal(c.data.overdue, false);
    assert.equal(c.data.feeBase, '0.00');
});
test('sin vencimiento o en otra moneda deja el recargo sin calcular', () => {
    assert.equal(fixture({ invoice: { duedate: '' } }).data.feeBase, '');
    const c = fixture({ currency: 'MXN' });
    assert.equal(c.data.feeBase, '');
    assert.equal(c.data.currency, 'MXN');
});
test('fuente bancaria mapeada y campos faltantes vacíos', () => {
    const c = fixture({ settings: { bankNameFieldId: 'custrecord_bank' }, company: { custrecord_bank: 'Banco local' } });
    assert.equal(c.data.bankName, 'Banco local');
    assert.equal(c.data.bankAccount, '');
    assert.ok(c.pdf);
});
test('cuenta sin subsidiarias usa Company Information', () => {
    const c = fixture({ invoice: { subsidiary: '' } });
    assert.equal(c.data.company.name, 'Café de Finca');
    assert.equal(c.loads.some(x => x.type === 'subsidiary'), false);
});
test('logo inexistente conserva la generación y registra el diagnóstico', () => {
    const c = fixture({ settings: { logoFileId: '17' }, badLogo: true });
    assert.equal(c.data.company.logoUrl, '');
    assert.ok(c.pdf);
    assert.equal(c.logs.length, 1);
});
test('rechaza ID inválido, falta de permisos, búsqueda vacía y saldo desconocido', () => {
    const invalid = fixture({ sourceId: '../1' });
    assert.equal(invalid.loads.length, 0);
    for (const c of [invalid, fixture({ denied: true }), fixture({ empty: true }), fixture({ invoice: { amountremaining: '' } })]) {
        assert.ok(c.error);
        assert.equal(c.pdf, undefined);
    }
});
test('datos configurados de una subsidiaria no se aplican a otra', () => {
    const c = fixture({ settings: { subsidiaryId: '99' } });
    assert.match(c.error, /otra subsidiaria/);
    assert.equal(c.pdf, undefined);
});
test('el botón se limita a View de Invoice y transmite el contexto sin fijar la factura destino', () => {
    let button;
    let urlArgs;
    const mod = load('late1_button_ue.js', {
        './late1_config': load('late1_config.js'),
        'N/runtime': { executionContext: 'UI', ContextType: { USER_INTERFACE: 'UI' } },
        'N/url': { resolveScript: x => { urlArgs = x; return '/app/site/hosting/scriptlet.nl?script=1&deploy=1'; } },
        'N/log': { error: () => {} }, 'N/ui/message': { Type: { WARNING: 'WARNING' } }
    });
    const context = { type: 'edit', UserEventType: { VIEW: 'view' }, newRecord: rec({ id: 101 }), form: { addButton: x => { button = x; } } };
    mod.beforeLoad(context);
    assert.equal(button, undefined);
    context.type = 'view';
    mod.beforeLoad(context);
    assert.equal(button.label, 'Late 1');
    assert.equal(urlArgs.params.sourceInvoiceId, '101');
    assert.equal(urlArgs.returnExternalUrl, false);
    assert.match(button.functionName, /window.open/);
});
