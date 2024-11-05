const joi = require("joi");
const { validator } = require("../../utils/validator");
const { logger } = require("../../utils/logger");
const { listSchema } = require("../../services/schema/base");

const newSchema = listSchema.concat(
  joi.object({
    limit: joi.string(),
    start_date: joi.string().isoDate().default("2020-01-01T00:00:00.000Z"),
  })
);

async function service(data = {}, _rave) {
  validator(newSchema, data);
  data.method = "GET";
  if (!data.start_date) data.start_date = "2020-01-01T00:00:00.000Z";

  const { body: response } = await _rave.request(
    `/v3/payout-subaccounts?`,
    data
  );
  logger(`Fetch all payout subaccounts`, _rave);
  return response;
}

module.exports = service;
