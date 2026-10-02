/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * Configuración opcional. Los datos vacíos se leen de NetSuite o se omiten.
 */
define([], () => ({
    suiteletScriptId: 'customscript_jj_late1_sl',
    suiteletDeploymentId: 'customdeploy_jj_late1_sl',
    templatePath: '/SuiteScripts/practica_JJ/templates/practice/late-1/late1_template.xml',
    // Si se informa, limita el PDF a esta subsidiaria (ID interno).
    subsidiaryId: '',
    companyName: '',
    fallbackCompanyName: 'Café de Finca',
    companyAddress: '',
    companyTaxId: '',
    logoFileId: '',
    phone: '',
    email: '',
    website: '',
    tagline: '',
    // Si no están informados, intentar los campos de empresa/subsidiaria mapeados abajo.
    bankName: '',
    bankAccount: '',
    bankHolder: '',
    bankNameFieldId: '',
    bankAccountFieldId: '',
    bankHolderFieldId: '',
    // Cálculo informativo del modelo Bluespace; no se suma al total de Invoice.
    lateFeePercent: 10,
    minimumLateFeeEur: 11,
    lateFeeTaxPercent: null,
    // IDs de campos existentes; no hace falta crearlos para generar el PDF.
    contractFieldId: '',
    customerTaxFieldId: '',
    roomColumnFieldId: '',
    paymentMethodText: '',
    // Solo texto aprobado por la empresa. No calcula ni registra cargos.
    additionalNotice: ''
}));
