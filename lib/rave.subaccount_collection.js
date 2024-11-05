const service_create = require("../services/subaccount-collection/rave.create");
const service_delete = require("../services/subaccount-collection/rave.delete");
const service_fetch_all = require("../services/subaccount-collection/rave.fetch.all");
const service_fetch = require("../services/subaccount-collection/rave.fetch");
const service_update = require("../services/subaccount-collection/rave.update");

function Subaccount(RaveBase) {
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
}

module.exports = Subaccount;
