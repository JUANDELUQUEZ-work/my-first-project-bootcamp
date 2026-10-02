/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/url', 'N/log', 'N/ui/message', './late1_config'],
    (runtime, url, log, message, settings) => {
        const beforeLoad = (context) => {
            if (context.type !== context.UserEventType.VIEW ||
                runtime.executionContext !== runtime.ContextType.USER_INTERFACE ||
                context.newRecord.type !== 'invoice' || !context.newRecord.id) return;

            if (settings.subsidiaryId && String(context.newRecord.getValue({
                fieldId: 'subsidiary'
            })) !== String(settings.subsidiaryId)) return;

            try {
                const target = url.resolveScript({
                    scriptId: settings.suiteletScriptId,
                    deploymentId: settings.suiteletDeploymentId,
                    returnExternalUrl: false,
                    params: { sourceInvoiceId: String(context.newRecord.id) }
                });
                // Patrón documentado por Oracle: abre el Suitelet sin reemplazar
                // el Client Script que pueda tener ya el formulario.
                context.form.addButton({
                    id: 'custpage_jj_late1',
                    label: 'Late 1',
                    functionName: 'window.open(' + JSON.stringify(target) + ', "_blank", "noopener")'
                });
            } catch (error) {
                log.error({ title: 'Late 1: botón', details: error });
                context.form.addPageInitMessage({
                    type: message.Type.WARNING,
                    title: 'Configuración de Late 1',
                    message: 'Revisa que el Suitelet Late 1 esté desplegado y que sus IDs coincidan con late1_config.js.'
                });
            }
        };
        return { beforeLoad };
    });
