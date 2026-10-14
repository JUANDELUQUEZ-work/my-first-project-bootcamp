/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/render', 'N/file', 'N/config', 'N/format', 'N/log', 'N/search', './late1_config'],
    (record, render, file, config, format, log, search, settings) => {
        const value = (rec, id) => {
            if (!id) return '';
            try {
                const result = rec.getValue({ fieldId: id });
                return result === null || result === undefined ? '' : result;
            } catch (error) { return ''; }
        };
        const text = (rec, id) => {
            try { return String(rec.getText({ fieldId: id }) || ''); }
            catch (error) { return ''; }
        };
        const first = (rec, ids) => {
            for (const id of ids) {
                const result = value(rec, id);
                if (result !== '') return String(result);
            }
            return '';
        };
        const dateText = (date) => date ? format.format({ value: date, type: format.Type.DATE }) : '';
        const lines = (input) => String(input || '').split(/\r?\n/).filter(Boolean);
        const reject = (message) => { throw new Error(message); };

        const latestInvoice = (sourceId) => {
            const source = record.load({ type: record.Type.INVOICE, id: sourceId, isDynamic: false });
            const formId = value(source, 'customform');
            if (!formId) reject('No se pudo identificar Custom Form en la Invoice abierta.');
            // El ID recibido identifica el formulario, no fija la factura a imprimir.
            // Fecha de creación (no fecha contable) y desempate por ID interno.
            const result = search.create({
                type: search.Type.INVOICE,
                filters: [['mainline', 'is', 'T'], 'AND', ['customform', 'anyof', String(formId)]],
                columns: [
                    search.createColumn({ name: 'datecreated', sort: search.Sort.DESC }),
                    search.createColumn({ name: 'internalid', sort: search.Sort.DESC })
                ]
            }).run().getRange({ start: 0, end: 1 });
            if (!result.length) reject('No hay Invoices accesibles para el formulario de la práctica.');
            return record.load({ type: record.Type.INVOICE, id: result[0].id, isDynamic: false });
        };

        const companyData = (invoice) => {
            const subsidiaryId = value(invoice, 'subsidiary');
            if (settings.subsidiaryId && String(subsidiaryId) !== String(settings.subsidiaryId)) {
                reject('Esta configuración de Late 1 corresponde a otra subsidiaria.');
            }
            const company = subsidiaryId
                ? record.load({ type: record.Type.SUBSIDIARY, id: subsidiaryId })
                : config.load({ type: config.Type.COMPANY_INFORMATION });
            let logoUrl = '';
            const logoId = settings.logoFileId || first(company, subsidiaryId ? ['logo'] : ['formlogo']);
            if (logoId) {
                try { logoUrl = file.load({ id: logoId }).url; }
                catch (error) { log.error({ title: 'Late 1: logo no disponible', details: error }); }
            }
            const name = settings.companyName || first(company, ['legalname', 'companyname', 'name']) || settings.fallbackCompanyName;
            return {
                name,
                addressLines: lines(settings.companyAddress || first(company, ['mainaddress_text', 'addresstext'])),
                taxId: settings.companyTaxId || first(company, ['federalidnumber', 'employerid', 'taxid']),
                logoUrl,
                phone: settings.phone || first(company, ['phone']),
                email: settings.email || first(company, ['email']),
                website: settings.website || first(company, ['url']),
                tagline: settings.tagline,
                bankName: settings.bankName || String(value(company, settings.bankNameFieldId)),
                bankAccount: settings.bankAccount || String(value(company, settings.bankAccountFieldId)),
                bankHolder: settings.bankHolder || String(value(company, settings.bankHolderFieldId))
            };
        };

        const onRequest = (context) => {
            try {
                if (context.request.method !== 'GET') reject('Abre Late 1 con el botón de una Invoice guardada.');
                const sourceInvoiceId = String(context.request.parameters.sourceInvoiceId || '');
                if (!/^[1-9]\d*$/.test(sourceInvoiceId)) reject('Abre Late 1 desde una Invoice guardada para identificar su formulario.');
                // Lectura del registro con los permisos del usuario que abre el Suitelet.
                const invoice = latestInvoice(sourceInvoiceId);
                const remaining = value(invoice, 'amountremaining');
                if (remaining === '' || !Number.isFinite(Number(remaining))) {
                    reject('No se pudo leer Amount Remaining de esta Invoice. Revisa el campo antes de imprimir.');
                }
                const due = value(invoice, 'duedate');
                const today = new Date();
                const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const dueOnly = due instanceof Date ? new Date(due.getFullYear(), due.getMonth(), due.getDate()) : null;
                const overdue = Boolean(dueOnly && dueOnly < todayOnly);
                const company = companyData(invoice);
                const currencyId = value(invoice, 'currency');
                const currencyRecord = currencyId ? record.load({ type: record.Type.CURRENCY, id: currencyId }) : null;
                const currencyCode = currencyRecord ? first(currencyRecord, ['symbol']) : '';
                // El mínimo de 11 procede de una plantilla en EUR; no convertir otras monedas a ciegas.
                const canCalculate = currencyCode === 'EUR' && dueOnly !== null;
                const feeBase = canCalculate ? (overdue && Number(remaining) > 0
                    ? Math.round(Math.max(Number(remaining) * settings.lateFeePercent / 100, settings.minimumLateFeeEur) * 100) / 100 : 0) : null;
                const feeTax = feeBase !== null && settings.lateFeeTaxPercent !== null
                    ? Math.round(feeBase * settings.lateFeeTaxPercent) / 100 : null;
                const rooms = [];
                for (let line = 0; line < invoice.getLineCount({ sublistId: 'item' }); line++) {
                    rooms.push({ value: settings.roomColumnFieldId ? String(invoice.getSublistValue({
                        sublistId: 'item', fieldId: settings.roomColumnFieldId, line
                    }) || '') : '' });
                }
                const data = {
                    company,
                    noticeDate: dateText(today),
                    dueDate: dateText(due),
                    overdue,
                    hasBalance: Number(remaining) > 0,
                    customerName: text(invoice, 'entity'),
                    addressLines: lines(value(invoice, 'billaddress')),
                    customerTaxId: String(value(invoice, settings.customerTaxFieldId) || text(invoice, 'entitytaxregnum') || value(invoice, 'vatregnum') || ''),
                    center: text(invoice, 'location') || company.name,
                    contract: String(value(invoice, settings.contractFieldId) || ''),
                    paymentMethod: settings.paymentMethodText || text(invoice, 'paymentmethod'),
                    terms: text(invoice, 'terms'),
                    currency: currencyCode || text(invoice, 'currency'),
                    bankName: company.bankName,
                    bankAccount: company.bankAccount,
                    bankHolder: company.bankHolder,
                    lateFeePercent: String(settings.lateFeePercent),
                    minimumLateFee: String(settings.minimumLateFeeEur),
                    feeBase: feeBase === null ? '' : feeBase.toFixed(2),
                    feeTax: feeTax === null ? '' : feeTax.toFixed(2),
                    additionalNotice: settings.additionalNotice,
                    rooms
                };
                const renderer = render.create();
                renderer.templateContent = file.load({ id: settings.templatePath }).getContents();
                renderer.addRecord({ templateName: 'record', record: invoice });
                renderer.addCustomDataSource({ format: render.DataSource.OBJECT, alias: 'late', data });
                const pdf = renderer.renderAsPdf();
                pdf.name = 'Late_1_' + String(value(invoice, 'tranid') || invoice.id).replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
                context.response.writeFile({ file: pdf, isInline: true });
            } catch (error) {
                log.error({ title: 'Late 1: generación PDF', details: error });
                context.response.setHeader({ name: 'Content-Type', value: 'text/plain; charset=UTF-8' });
                context.response.write({ output: 'No se pudo generar Late 1.\n\n' + error.message +
                    '\n\nRevisa Customization > Scripting > Script Deployments > JJ Late 1 PDF > Execution Log.' });
            }
        };
        return { onRequest };
    });
