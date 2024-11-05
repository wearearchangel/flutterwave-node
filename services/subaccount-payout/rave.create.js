const { logger } = require("../../utils/logger");
const { validator } = require("../../utils/validator");

const { payoutSubaccountSchema } = require("../schema/create");

async function service(data, _rave) {
  validator(payoutSubaccountSchema, data);
  const { body: response } = await _rave.request(`v3/payout-subaccounts`, data);
  logger(`Create a payout subaccount`, _rave);
  return response;
}

module.exports = service;
