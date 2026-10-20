<#function getlenCtaRep cta>
    <#assign result = "00">
    <#switch cta?length>
        <#case 11>
            <#assign result = "01">
            <#break>
        <#case 16>
            <#assign result = "03">
            <#break>
        <#case 18>
            <#assign result = "40">
            <#break>
    </#switch>
    <#return result>}
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
MXP<#rt>
${setPadding(formatAmount(getAmount(payment),"dec"),"left","0",16)}<#rt>
${setLength(ebank.custrecord_2663_entity_acct_name,30)}<#rt>
${setLength(getlenCtaRep(ebank.custrecord_2663_entity_acct_no),2)}<#rt>
${setPadding(ebank.custrecord_2663_entity_bank_code,"left","0",3)}<#rt>
<#if payment.custbody_drt_motivo_de_pago?length > 0>
${setLength(payment.custbody_drt_motivo_de_pago,30)}<#rt>
<#elseif ebank.custrecord_2663_reference?length > 0>
${setLength(ebank.custrecord_2663_reference,30)}<#rt>
<#else>
${setLength(payment.tranid,30)}<#rt>
</#if>
${setLength(payment.custbody_drt_referencia_numerica,7)}<#rt>
H
</#list>
#OUTPUT END#