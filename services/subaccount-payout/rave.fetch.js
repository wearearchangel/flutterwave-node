const joi = require("joi");
const { logger } = require("../../utils/logger");
const { validator } = require("../../utils/validator");
const { fetchSchema } = require("../../services/schema/base");

const newSchema = fetchSchema.concat(
  joi.object({
    id: joi.forbidden(),
    account_reference: joi.string().alphanum().trim().length(20).required(),
    include_limit: joi.string().default("1"),
  })
);

async function service(data, _rave) {
  validator(newSchema, data);
  data.method = "GET";
  const { body: response } = await _rave.request(
    `/v3/payout-subaccounts/${data.account_reference}?include_limit=${data.include_limit}`,
    data
  );
  logger(`Fetch a payout subaccount`, _rave);
  return response;
}

module.exports = service;
