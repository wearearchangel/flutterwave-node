const joi = require("joi");
const { logger } = require("../../utils/logger");
const { validator } = require("../../utils/validator");
const { fetchSchema } = require("../../services/schema/base");

const newSchema = fetchSchema.concat(
  joi.object({
    id: joi.forbidden(),
    account_reference: joi.string().alphanum().trim().length(20).required(),
  })
);

// TODO: Does not work
async function service(data, _rave) {
  validator(newSchema, data);
  data.method = "DELETE";
  const { body: response } = await _rave.request(
    `/v3/payout-subaccounts/${data.account_reference}`,
    data
  );
  logger(`Delete a payout subaccount`, _rave);
  return response;
}

module.exports = service;
