const joi = require("joi");
const { validator } = require("../../utils/validator");
const { logger } = require("../../utils/logger");
const { listSchema } = require("../schema/base");

const newSchema = listSchema.concat(
  joi.object({
    start_date: joi.string().isoDate().default("2016-01-01T00:00:00.000Z"),
  })
);

async function service(data = {}, _rave) {
  validator(newSchema, data);
  data.method = "GET";
  if (!data.start_date) data.start_date = "2016-01-01T00:00:00.000Z";

  const { body: response } = await _rave.request(`/v3/subaccounts?`, data);
  logger(`Fetch all collection subaccounts`, _rave);
  return response;
}

module.exports = service;
