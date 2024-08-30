const {
  verifyRequest,
  readConversationAttributes,
} = require(Runtime.getFunctions()["common/helpers/util"].path);
const SyncOperations = require(Runtime.getFunctions()[
  "common/twilio-wrappers/sync"
].path);
/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  console.log(`Incoming assistant response`, event);
  try {
    if (!verifyRequest(context, event)) {
      return callback(new Error("Invalid token"));
    }
    const SessionId = event.SessionId.replace("webhook:", "");
    const body = event.Body;

    if (!body) {
      response.setStatusCode(500);
      response.setBody({ status: "error", reason: "Missing body" });
      return callback(null, response);
    }

    const syncStreamOutboundData = {
      actor: "assistant",
      type: "transcript",
      transcriptionText: body,
    };
    const streamMessageOutboundResult =
      await SyncOperations.createStreamMessage({
        context,
        name: SessionId,
        data: syncStreamOutboundData,
        syncServiceSid: context.SYNC_SERVICE_SID,
      });
    console.log(streamMessageOutboundResult);

    return callback(null, {});
  } catch (err) {
    console.error(err);
    return callback(null, {});
  }
};
