const service_create = require("../services/subaccount-payout/rave.create");
const service_delete = require("../services/subaccount-payout/rave.delete");
const service_fetch_all = require("../services/subaccount-payout/rave.fetch.all");
const service_fetch = require("../services/subaccount-payout/rave.fetch");
const service_update = require("../services/subaccount-payout/rave.update");
const service_transactions = require("../services/subaccount-payout/rave.transactions");
const service_balances = require("../services/subaccount-payout/rave.balances");
const service_static = require("../services/subaccount-payout/rave.static");

function PayoutSubAccount(RaveBase) {
  // base
  this.create = function (data) {
    return service_create(data, RaveBase);
  };

  this.delete = function (data) {
    return service_delete(data, RaveBase);
  };

  this.fetch_all = function (data) {
    return service_fetch_all(data, RaveBase);
  };

  this.fetch = function (data) {
    return service_fetch(data, RaveBase);
  };

  this.update = function (data) {
    return service_update(data, RaveBase);
  };

  // operational
  this.transactions = function (data) {
    return service_transactions(data, RaveBase);
  };

  this.balances = function (data) {
    return service_balances(data, RaveBase);
  };

  this.info = function (data) {
    return service_static(data, RaveBase);
  };
}

module.exports = PayoutSubAccount;
