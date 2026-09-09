/**
 * @NApiVersion 2.1
 */
define(["N/search"], (search) => {
  const getDataEntity = (param_id) => {
    let resultado = [];
    try {
      let filters = [["isinactive", "is", "F"]];

      if (!!param_id) {
        filters.push("AND");
        filters.push(["internalid", "anyof", param_id]);
      }
      const entitySearchObj = search.create({
        type: "entity",
        filters: filters,
        columns: [
          search.createColumn({ name: "entityid", label: "ID" }),
          search.createColumn({ name: "altname", label: "Name" }),
          search.createColumn({ name: "email", label: "Email" }),
          search.createColumn({ name: "phone", label: "Phone" }),
          search.createColumn({ name: "altphone", label: "Office Phone" }),
          search.createColumn({ name: "fax", label: "Fax" }),
          search.createColumn({
            name: "custentity_drt_anio_nacimiento",
            label: "drt_anio_nacimiento",
          }),
          search.createColumn({
            name: "custentity_drt_fecha_nacimiento",
            label: "drt_fecha_nacimiento",
          }),
          search.createColumn({
            name: "custentity_drt_json",
            label: "drt_json",
          }),
          search.createColumn({
            name: "custentity_drt_mes_nacimiento",
            label: "drt_mes_nacimiento",
          }),
        ],
      });
      const searchResultCount = entitySearchObj.runPaged().count;
      log.debug("entitySearchObj result count", searchResultCount);
      entitySearchObj.run().each(function (result) {
        resultado.push({
          entityid: result.getValue({ name: "entityid", label: "ID" }),
          altname: result.getValue({ name: "altname", label: "Name" }),
          email: result.getValue({ name: "email", label: "Email" }),
          phone: result.getValue({ name: "phone", label: "Phone" }),
          altphone: result.getValue({
            name: "altphone",
            label: "Office Phone",
          }),
          fax: result.getValue({ name: "fax", label: "Fax" }),
          custentity_drt_anio_nacimiento: result.getValue({
            name: "custentity_drt_anio_nacimiento",
            label: "drt_anio_nacimiento",
          }),
          custentity_drt_fecha_nacimiento: result.getValue({
            name: "custentity_drt_fecha_nacimiento",
            label: "drt_fecha_nacimiento",
          }),
          custentity_drt_json: result.getValue({
            name: "custentity_drt_json",
            label: "drt_json",
          }),
          custentity_drt_mes_nacimiento: result.getValue({
            name: "custentity_drt_mes_nacimiento",
            label: "drt_mes_nacimiento",
          }),
        });
        return true;
      });
    } catch (error) {
      log.error(`getDataEntity error`, error);
    } finally {
      log.debug(`getDataEntity resultado`, resultado);
      return resultado;
    }
  };
  return {
    getDataEntity,
  };
});
