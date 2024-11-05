const { flwError } = require("../utils/error");

const SubaccountCollection = require("./rave.subaccount_collection");

const SubaccountPayout = require("./rave.subaccount_payout");

const Subaccount = function (RaveBase) {
  const CollectionSub = new SubaccountCollection(RaveBase);

  const PayoutSub = new SubaccountPayout(RaveBase);

  const sortObjectKeys = (object) => {
    const sorted = {};
    Object.keys(object)
      .sort()
      .forEach((key) => {
        sorted[key] = object[key];
      });
    return sorted;
  };

  const transformMeta = (meta) => {
    if (!meta) return meta;

    const transformed = {};
    meta.forEach((item) => {
      transformed[item.meta_name] = item.meta_value;
    });
    return transformed;
  };

  const transformSubaccount = ({
    payout = {},
    collection = {},
    message = "Subaccount fetched",
  }) => {
    const { meta, ...account } = collection;
    account.account_name = payout?.account_name;
    account.bank_code = collection?.bank_code || payout?.bank_code;
    account.status = payout?.status;

    const payout_id = meta.find((m) => m.meta_name === "subaccount_payout_id");
    if (payout_id) {
      meta.push({
        meta_name: "subaccount_payout_id",
        meta_value: payout.id,
      });
    }

    const account_reference = meta.find((m) => {
      return m.meta_name === 'subaccount_account_reference';
    });
    if (account_reference) {
      meta.push({
        meta_name: "subaccount_account_reference",
        meta_value: payout.account_reference,
      });
    }

    const barter_id = meta.find((m) => m.meta_name === "subaccount_barter_id");
    if (barter_id) {
      meta.push({
        meta_name: "subaccount_barter_id",
        meta_value: payout.barter_id,
      });
    }

    Object.assign(account, transformMeta(meta));
    const data = sortObjectKeys(account);
    console.log("account", data);

    return {
      status: "success",
      message,
      data,
    };
  };

  const extendSubaccount = async (collection) => {
    const meta = transformMeta(collection.meta);

    const account_reference = meta?.payout_account_reference;
    if (!account_reference) return transformSubaccount({ collection });

    const payout_response = await PayoutSub.fetch({ account_reference });
    if (payout_response.status === "error") flwError(payout_response);

    const payout = payout_response.data;
    return transformSubaccount({
      payout,
      collection,
      message: payout_response.message,
    });
  };

  const extractId = async (data) => {
    const id = data.id;
    const sub = await CollectionSub.fetch({ id });
    if (sub.status === "error") flwError(sub);

    const collection = sub.data;
    const message = sub.message;
    const meta = transformMeta(collection.meta);

    return {
      id,
      payout_id: meta?.subaccount_payout_id,
      account_reference: meta?.subaccount_account_reference,
      barter_id: meta?.subaccount_barter_id,
      collection,
      message,
    };
  };

  // base
  this.create = async function (data) {
    try {
      // 1. Create PayoutSub subaccount
      let payout;
      try {
        const query = { email: data?.email };
        const payout_sub = await PayoutSub.fetch_all(query);
        if (payout_sub.status === "error" || !payout_sub.data.length)
          flwError(payout_sub);

        payout = payout_sub.data?.[0];
      } catch (err) {
        console.log("error", err);

        const payload = {};
        payload.account_name = data.account_name || data.name;
        payload.account_reference = data?.account_reference;
        payload.bank_code = data?.bank_code;
        payload.barter_id = data?.barter_id;
        payload.country = data.country;
        payload.email = data.email;
        payload.mobilenumber = data.mobilenumber;

        const payout_sub = await PayoutSub.create(payload);
        if (payout_sub.status === "error") flwError(payout_sub);

        payout = payout_sub.data;
      } finally {
        console.log("payout", payout);
      }

      // 2. Create CollectionSub subaccount using the details of the payout subaccount
      let collection;
      try {
        const query = { business_email: data?.email };
        const collection_sub = await CollectionSub.fetch_all(query);
        if (collection_sub.status === "error") flwError(collection_sub);

        collection = collection_sub.data?.[0];
      } catch (err) {
        console.log("error", err);

        const payload = {};
        payload.account_bank = payout.bank_code || data?.account_bank;
        payload.account_number = payout.nuban || data?.account_number;
        payload.business_contact = data.name;
        payload.business_contact_mobile = data.mobilenumber;
        payload.business_email = payout.email || data.email;
        payload.business_mobile = payout.mobilenumber || data.mobilenumber;
        payload.business_name = payout.account_name || data.account_name;
        payload.country = data.country;
        payload.split_type = data?.split_type;
        payload.split_value = data?.split_value;
        payload.meta = data?.meta || [];
        payload.meta.push(
          {
            meta_name: "subaccount_payout_id",
            meta_value: payout.id,
          },
          {
            meta_name: "subaccount_account_reference",
            meta_value: payout.account_reference,
          },
          {
            meta_name: "subaccount_barter_id",
            meta_value: payout.barter_id,
          }
        );

        const collection_sub = await CollectionSub.create(payload);
        if (collection_sub.status === "error") flwError(collection_sub);

        collection = collection_sub.data;
      } finally {
        console.log("collection", collection);
      }

      return transformSubaccount({ payout, collection });
    } catch (err) {
      flwError(err);
    }
  };

  this.delete = async function (data) {
    try {
      const { account_reference, id } = await extractId(data);

      if (account_reference) await PayoutSub.delete({ account_reference });
      if (id) await CollectionSub.delete({ id });

      return {};
    } catch (err) {
      flwError(err);
    }
  };

  this.fetch_all = async function (data) {
    try {
      const subs = await CollectionSub.fetch_all(data);
      if (subs.status === "error") flwError(subs);

      const { data: subaccounts, ...response } = subs;

      const accounts = [];
      for (const subaccount of subaccounts) {
        const extendedSub = await extendSubaccount(subaccount);
        accounts.push(extendedSub.data);
      }

      response.data = [];
      if (data?.id) {
        response.data = accounts.find((a) => a.account_name === data?.id);
      } else if (data?.email) {
        response.data = accounts.find((a) => a.email === data?.email);
      } else {
        response.data = accounts;
      }

      return response;
    } catch (err) {
      flwError(err);
    }
  };

  this.fetch = async function (data) {
    try {
      const { collection } = await extractId(data);

      const response = extendSubaccount(collection);
      if (response.status === "error") flwError(response);
      return response;
    } catch (err) {
      flwError(err);
    }
  };

  this.update = async function (data) {
    try {
      const { account_reference, id } = await extractId(data);
      // TODO: Implement update logic for Collection + Payout subaccount

      return data;
    } catch (err) {
      flwError(err);
    }
  };

  this.transactions = async function (data) {
    try {
      const { id, ...props } = data;
      const { account_reference } = await extractId({ id });

      const response = await PayoutSub.transactions({
        ...props,
        account_reference,
      });
      if (response.status === "error") flwError(response);
      return response;
    } catch (err) {
      flwError(err);
    }
  };

  this.balances = async function (data) {
    try {
      const { id, ...props } = data;
      const { account_reference } = await extractId({ id });

      const response = await PayoutSub.balances({
        ...props,
        account_reference,
      });
      if (response.status === "error") flwError(response);
      return response;
    } catch (err) {
      flwError(err);
    }
  };

  this.info = async function (data) {
    try {
      const { id, ...props } = data;
      const { account_reference } = await extractId({ id });

      const response = await PayoutSub.info({ ...props, account_reference });
      if (response.status === "error") flwError(response);
      return response;
    } catch (err) {
      flwError(err);
    }
  };
};

module.exports = Subaccount;
