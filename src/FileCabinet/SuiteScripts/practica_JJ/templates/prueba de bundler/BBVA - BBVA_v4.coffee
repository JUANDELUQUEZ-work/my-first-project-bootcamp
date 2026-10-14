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
${setPadding(ebank.custrecord_2663_entity_acct_no,"left","0",18)}<#rt>
${setPadding(cbank.custrecord_drt_numero_de_cuenta,"left","0",18)}<#rt>
${setPadding(getCurrency(payment.currency),"right"," ",3)}<#rt>
${setPadding(formatAmount(getAmount(payment),"dec"),"left","0",16)}<#rt>
<#if payment.custbody_drt_motivo_de_pago?length > 0>
${setLength(payment.custbody_drt_motivo_de_pago,30)}<#rt>
<#elseif ebank.custrecord_2663_reference?length > 0>
${setLength(ebank.custrecord_2663_reference,30)}<#rt>
<#else>
${setLength(payment.tranid,30)}<#rt>
</#if>
</#list>
#OUTPUT END#