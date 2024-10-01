const { isString, isObject, isNumber } = require("lodash");

const retryHandler = require(Runtime.getFunctions()[
  "common/helpers/retry-handler"
].path).retryHandler;

/**
 * @param {object} parameters the parameters for the function
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.name the unique name of the Sync List item
 * @param {number} parameters.ttl how long (in seconds) before the Sync item expires and is deleted (optional)
 * @returns {object} A new Sync List
 * @description the following method is used to create a Sync List
 */
exports.createList = async function createList(parameters) {
  const { context, name, ttl, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(name) && !isString(name))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain name string value"
    );
  if (Boolean(ttl) && !isNumber(ttl))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain ttl number value"
    );
  if (Boolean(syncServiceSid) && !isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();
    const additionalProperties = {};
    if (ttl) additionalProperties.ttl = ttl;
    const listResponse = await client.sync.v1
      .services(syncServiceSid)
      .syncLists.create({ uniqueName: name, ...additionalProperties })
      .then((syncList) => syncList);
    return { success: true, status: 200, listResponse };
  } catch (error) {
    return retryHandler(error, parameters, exports.createList);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.listSid the SID of the Sync List
 * @param {string} parameters.key the key of the Sync List item
 * @param {number} parameters.ttl how long (in seconds) before the Sync item expires and is deleted (optional)
 * @param {object} parameters.data schema-less object that the Sync Map item stores - 16 KiB max (optional)
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} A new Sync List Item
 * @description the following method is used to create a Sync List Item
 */
exports.createListItem = async function createListItem(parameters) {
  const { context, listSid, key, ttl, data, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(listSid) && !isString(listSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain listSid string value"
    );
  if (Boolean(key) && !isString(key))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain uniqueName string value"
    );
  if (Boolean(ttl) && !isNumber(ttl))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain ttl number value"
    );
  if (Boolean(data) && !isObject(data))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain data object"
    );
  if (Boolean(syncServiceSid) && !isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();
    const listItemParameters = {
      key,
      ttl,
      data,
    };

    const listItem = await client.sync.v1
      .services(syncServiceSid)
      .syncLists(listSid)
      .syncListItems.create(listItemParameters);

    return { success: true, status: 200, listItem };
  } catch (error) {
    return retryHandler(error, parameters, exports.createListItem);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.uniqueName the unique name of the Sync Map item
 * @param {number} parameters.ttl how long (in seconds) before the Sync item expires and is deleted (optional)
 * @returns {object} A new Sync Map
 * @description the following method is used to create a Sync Map
 */
exports.createMap = async function createMap(parameters) {
  const { context, uniqueName, ttl, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(uniqueName) && !isString(uniqueName))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain uniqueName string value"
    );
  if (Boolean(ttl) && !isNumber(ttl))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain ttl number value"
    );
  if (Boolean(syncServiceSid) && !isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();
    const additionalProperties = {};
    if (ttl) additionalProperties.ttl = ttl;
    const mapResponse = await client.sync.v1
      .services(syncServiceSid)
      .syncMaps.create({ uniqueName, ...additionalProperties })
      .then((syncMap) => syncMap);

    return { success: true, status: 200, mapResponse };
  } catch (error) {
    return retryHandler(error, parameters, exports.createMap);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.mapSid the SID of the Sync Map
 * @param {string} parameters.key the key of the Sync Map item
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} success
 * @description the following method is used to remove a Sync Map Item
 */
exports.deleteMapItem = async function deleteMapItem(parameters) {
  const { context, mapSid, key, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(mapSid) && !isString(mapSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain mapSid string value"
    );
  if (Boolean(key) && !isString(key))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain key string value"
    );
  if (Boolean(syncServiceSid) && !isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();

    await client.sync.v1
      .services(syncServiceSid)
      .syncMaps(mapSid)
      .syncMapItems(key)
      .remove();

    return { success: true, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, exports.deleteMapItem);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.mapSid the SID of the Sync Map
 * @param {string} parameters.key the key of the Sync Map item
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} An existing Sync Map Item
 * @description the following method is used to fetch a Sync Map Item
 */
exports.fetchMapItem = async function fetchMapItem(parameters) {
  const { context, mapSid, key, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(mapSid) && !isString(mapSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(key) && !isString(key))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain uniqueName string value"
    );
  if (Boolean(syncServiceSid) && !isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();

    const mapItem = await client.sync.v1
      .services(syncServiceSid)
      .syncMaps(mapSid)
      .syncMapItems(key)
      .fetch();

    return { success: true, status: 200, mapItem };
  } catch (error) {
    return retryHandler(error, parameters, exports.fetchMapItem);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.mapSid the SID of the Sync Map
 * @param {string} parameters.key the key of the Sync Map item
 * @param {number} parameters.ttl how long (in seconds) before the Sync item expires and is deleted (optional)
 * @param {object} parameters.data schema-less object that the Sync Map item stores - 16 KiB max (optional)
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} A new Sync Map Item
 * @description the following method is used to create a Sync Map Item
 */
exports.createMapItem = async function createMapItem(parameters) {
  const { context, mapSid, key, ttl, data, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(mapSid) && !isString(mapSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(key) && !isString(key))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain uniqueName string value"
    );
  if (Boolean(ttl) && !isNumber(ttl))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain ttl number value"
    );
  if (Boolean(data) && !isObject(data))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain data object"
    );
  if (Boolean(syncServiceSid) && !isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();
    const mapItemParameters = {
      key,
      ttl,
      data,
    };

    const mapItem = await client.sync.v1
      .services(syncServiceSid)
      .syncMaps(mapSid)
      .syncMapItems.create(mapItemParameters);

    return { success: true, status: 200, mapItem };
  } catch (error) {
    return retryHandler(error, parameters, exports.createMapItem);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.uniqueName the unique name of the Sync document (optional)
 * @param {number} parameters.ttl how long (in seconds) before the Sync Document expires and is deleted (optional)
 * @param {object} parameters.data schema-less object that the Sync Document stores - 16 KiB max (optional)
 * @returns {object} A new Sync document
 * @description the following method is used to create a sync document
 */
exports.createDocument = async function createDocument(parameters) {
  const { context, uniqueName, ttl, data } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (Boolean(uniqueName) && !isString(uniqueName))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain uniqueName string value"
    );
  if (Boolean(ttl) && !isString(ttl))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain ttl integer value"
    );
  if (Boolean(data) && !isObject(data))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain data object"
    );

  try {
    const client = context.getTwilioClient();
    const documentParameters = {
      uniqueName,
      ttl,
      data,
    };

    const document = await client.sync.v1
      .services(context.TWILIO_FLEX_SYNC_SID)
      .documents.create(documentParameters);

    return { success: true, status: 200, document };
  } catch (error) {
    return retryHandler(error, parameters, exports.createDocument);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.documentSid the sid of the Sync document
 * @returns {object} A Sync document
 * @description the following method is used to fetch a sync document
 */
exports.fetchDocument = async function fetchDocument(parameters) {
  const { context, documentSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (!isString(documentSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain documentSid string value"
    );

  try {
    const client = context.getTwilioClient();

    const document = await client.sync.v1
      .services(context.TWILIO_FLEX_SYNC_SID)
      .documents(documentSid)
      .fetch();

    return { success: true, status: 200, document };
  } catch (error) {
    return retryHandler(error, parameters, exports.fetchDocument);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.documentSid the sid of the Sync document
 * @param {object} parameters.updateData the data object to update on the Sync document
 * @returns {object} A Sync document
 * @description the following method is used to fetch a sync document
 */
exports.updateDocumentData = async function updateDocumentData(parameters) {
  const { context, documentSid, updateData } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (!isString(documentSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain documentSid string value"
    );
  if (!isObject(updateData))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain updateData object"
    );

  try {
    const client = context.getTwilioClient();

    const documentUpdate = await client.sync.v1
      .services(context.TWILIO_FLEX_SYNC_SID)
      .documents(documentSid)
      .update({ data: updateData });

    return { success: true, status: 200, document: documentUpdate };
  } catch (error) {
    return retryHandler(error, parameters, exports.updateDocumentData);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.name the sid of the Sync stream
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} A Sync document
 * @description the following method is used to fetch a sync document
 */
exports.createStream = async function createStream(parameters) {
  const { context, name, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (!isString(name))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain name of stream string value"
    );
  if (!isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();

    const stream = await client.sync.v1
      .services(syncServiceSid)
      .syncStreams.create({ uniqueName: name, ttl: 86400 });

    return { success: true, status: 200, stream };
  } catch (error) {
    return retryHandler(error, parameters, exports.createStream);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.name the sid of the Sync stream
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} A Sync document
 * @description the following method is used to fetch a sync document
 */
exports.deleteStream = async function deleteStream(parameters) {
  const { context, name, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (!isString(name))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain name of stream string value"
    );
  if (!isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();

    const stream = await client.sync.v1
      .services(syncServiceSid)
      .syncStreams(name)
      .remove();

    return { success: true, status: 200, stream };
  } catch (error) {
    return retryHandler(error, parameters, exports.deleteStream);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.name the sid of the Sync stream name
 * @param {object} parameters.data A Sync stream message data
 * @param {string} parameters.syncServiceSid the sid of the Sync service
 * @returns {object} A Sync stream
 * @description the following method is used to fetch a sync document
 */
exports.createStreamMessage = async function createStreamMessage(parameters) {
  const { context, name, data, syncServiceSid } = parameters;

  if (!isObject(context))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain context object"
    );
  if (!isString(name))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain name of stream string value"
    );
  if (!isObject(data))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain data object"
    );
  if (!isString(syncServiceSid))
    throw new Error(
      "Invalid parameters object passed. Parameters must contain sync stream string value"
    );

  try {
    const client = context.getTwilioClient();

    const stream = await client.sync.v1
      .services(syncServiceSid)
      .syncStreams(name)
      .streamMessages.create({ data });

    return { success: true, status: 200, stream };
  } catch (error) {
    return retryHandler(error, parameters, exports.createStreamMessage);
  }
};
