const joi = require("joi");
const { validator } = require("../../utils/validator");
const { logger } = require("../../utils/logger");
const { listSchema } = require("../schema/base");

const newSchema = listSchema.concat(
  joi.object({
    start_date: joi.string().isoDate().default("2016-01-01T00:00:00.000Z"),
    subaccount_id: joi.string().trim().max(100),
  })
);

async function service(data = {}, _rave) {
  validator(newSchema, data);
  data.method = "GET";
  if (!data.start_date) data.start_date = "2016-01-01T00:00:00.000Z";

  const { body: response } = await _rave.request(`/v3/subaccounts?`, data);
  logger(`Fetch all collection subaccounts`, _rave);

  if (data?.subaccount_id) {
    response.data = response.data.filter((r) => {
      return r.subaccount_id === data.subaccount_id;
    });

    response.meta.page_info.total = response.data.length;
    response.meta.page_info.current_page = 1;
    response.meta.page_info.total_pages = 1;
  }

  return response;
}

module.exports = service;
