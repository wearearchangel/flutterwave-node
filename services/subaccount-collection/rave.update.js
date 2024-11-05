const { logger } = require('../../utils/logger');
const { validator } = require('../../utils/validator');
const { listSchema } = require('../schema/base');

async function service(data, _rave) {
  validator(listSchema, data);
  data.method = 'PUT';
  const { body: response } = await _rave.request(
    `/v3/subaccounts/${data.id}`,
    data,
  );
  logger(`Update collection subaccount details`, _rave);
  return response;
}

module.exports = service;
