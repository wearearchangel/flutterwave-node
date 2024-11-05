const { logger } = require('../../utils/logger');
const { validator } = require('../../utils/validator');
const { collectionSubaccountSchema } = require('../schema/create');

async function service(data, _rave) {
  validator(collectionSubaccountSchema, data);
  const { body: response } = await _rave.request(`v3/subaccounts`, data);
  logger(`Create a collection subaccount`, _rave);
  return response;
}

module.exports = service;
