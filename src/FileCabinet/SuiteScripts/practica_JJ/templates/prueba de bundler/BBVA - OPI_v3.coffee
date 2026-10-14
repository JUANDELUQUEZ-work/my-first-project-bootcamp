<#function getCurrency currency>
    <#assign result = "">
    <#switch currency>
        <#case "MXN">
            <#assign result = "MXP">
            <#break>
        <#case "USD">
            <#assign result = "USD">
            <#break>
        <#case "EUR">
            <#assign result = "EUR">
            <#break>
        <#default>
            <#assign result = currency>
            <#break>
    </#switch>
    <#return result>
</#function>

#OUTPUT START#
<#assign value = 0>
<#list payments as payment>
<#assign ebank = ebanks[payment_index]>
<#assign entity = entities[payment_index]>
<#assign totalLines = totalLines + 1 >
<#assign value = value + getAmount(payment)>
${setPadding(cbank.custpage_eft_custrecord_2663_acct_num,"left","0",18)}<#rt>
${setPadding(ebank.custrecord_2663_entity_acct_no,"right"," ",35)}<#rt>
${setPadding(formatAmount(getAmount(payment),"dec"),"left","0",16)}<#rt>
${setPadding(getCurrency(payment.currency),"right"," ",3)}<#rt>
${setPadding(payment.custbody_drt_detalle_de_pago,"right"," ",50)}<#rt>
${setPadding(ebank.custrecord_2663_entity_swift,"right"," ",15)}<#rt>
${setPadding(ebank.custrecord_2663_entity_bank_name,"right"," ",30)}<#rt>
${setPadding(ebank.custrecord_2663_entity_country_code,"right"," ",30)}<#rt>
${setPadding(ebank.custrecord_2663_entity_address1,"right"," ",40)}<#rt>
${setPadding(ebank.custrecord_2663_entity_acct_name,"right"," ",30)}<#rt>
${setPadding(ebank.custrecord_2663_entity_country_check,"right"," ",30)}<#rt>
${setPadding(ebank.custrecord_2663_entity_address2,"right"," ", 40)}<#rt>
${setPadding(ebank.custrecord_drt_telefono_beneficiario,"left","0", 12)}
</#list>
#OUTPUT END#