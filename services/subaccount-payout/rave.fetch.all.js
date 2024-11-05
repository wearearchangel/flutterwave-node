const joi = require("joi");
const { validator } = require("../../utils/validator");
const { logger } = require("../../utils/logger");
const { listSchema } = require("../../services/schema/base");

const newSchema = listSchema.concat(
  joi.object({
    limit: joi.string(),
  })
);

async function service(data = {}, _rave) {
  validator(newSchema, data);
  data.method = "GET";
  const { body: response } = await _rave.request(
    `/v3/payout-subaccounts?`,
    data
  );
  logger(`Fetch all payout subaccounts`, _rave);
  return response;
}

module.exports = service;
