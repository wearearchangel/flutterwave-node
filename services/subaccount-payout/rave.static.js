const joi = require("joi");
const { logger } = require("../../utils/logger");
const { validator } = require("../../utils/validator");
const { listSchema } = require("../../services/schema/base");

const newSchema = listSchema.concat(
  joi.object({
    id: joi.forbidden(),
    account_reference: joi.string().alphanum().trim().length(20).required(),
  })
);

async function service(data, _rave) {
  validator(newSchema, data);
  data.method = "GET";
  const { body: response } = await _rave.request(
    `v3/payout-subaccounts/${data.account_reference}/static?`,
    data
  );
  logger(`Fetch card transactions`, _rave);
  return response;
}

module.exports = service;
