const joi = require("joi");
const { logger } = require("../../utils/logger");
const { validator } = require("../../utils/validator");
const { listSchema } = require("../../services/schema/base");

const newSchema = listSchema.concat(
  joi.object({
    id: joi.forbidden(),
    account_reference: joi.string().alphanum().trim().length(20).optional(),
    country: joi.string().uppercase().length(2),
    email: joi.string().email(),
    mobilenumber: joi.string(),
  })
);

async function service(data, _rave) {
  validator(newSchema, data);
  data.method = "PUT";
  const { body: response } = await _rave.request(
    `/v3/payout-subaccounts/${data.id}`,
    data
  );
  logger(`update payout subaccount details`, _rave);
  return response;
}

module.exports = service;
