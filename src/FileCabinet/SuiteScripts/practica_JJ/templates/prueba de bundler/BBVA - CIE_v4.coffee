#OUTPUT START#
<#assign value = 0>
<#list payments as payment>
<#assign ebank = ebanks[payment_index]>
<#assign entity = entities[payment_index]>
<#assign totalLines = totalLines + 1 >
<#assign value = value + getAmount(payment)>
${setPadding(ebank.custrecord_2663_entity_acct_no,"left","0",30)}<#rt>
${setPadding(ebank.custrecord_2663_entity_swift,"left","0",7)}<#rt>
${setPadding(cbank.custrecord_drt_numero_de_cuenta,"left","0",18)}<#rt>
${setPadding(formatAmount(getAmount(payment),"dec"),"left","0",16)}<#rt>
${setLength(payment.custbody_drt_motivo_de_pago,30)}<#rt>
${setLength(payment.custbody_drt_referencia_numerica,20)}
</#list>
#OUTPUT END#