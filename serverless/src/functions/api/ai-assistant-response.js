const {
    verifyRequest,
    readConversationAttributes,
} = require(Runtime.getFunctions()["common/helpers/util"].path);

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
    try {
        if (!verifyRequest(context, event)) {
            return callback(new Error("Invalid token"));
        }

        const body = event.Body;
        console.log(body)

        const syncStreamOutboundData = {
            actor: event.actor,
            type: "transcript",
            body,
        };
        const streamMessageOutboundResult =
            await SyncOperations.createStreamMessage({
                context,
                name: event.SessionId,
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