const SyncOperations = require(Runtime.getFunctions()[
  "common/twilio-wrappers/sync"
].path);
const { signRequest, sendMessageToAssistant } = require(Runtime.getFunctions()[
  "common/helpers/util"
].path);
exports.handler = async function handler(context, event, callback) {
  try {
    const response = new Twilio.Response();
    const assistantSid = context.TWILIO_AI_ASSISTANT_SID;
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    // console.log(event)

    switch (event.TranscriptionEvent) {
      case "transcription-started":
        console.log("transcriptionEvent: transcription-started: ", event);

        // Create Sync Stream
        const syncStreamResult = await SyncOperations.createStream({
          context,
          name: `TRANSCRIPTION_${event.CallSid}`,
          syncServiceSid: context.SYNC_SERVICE_SID,
        });
        console.log("Sync Stream create: ", syncStreamResult);

        // Create Sync map Item for call sid with
        const SyncMapResult = await SyncOperations.createMapItem({
          context,
          mapSid: context.MAP_CALL_LOG,
          key: event.CallSid,
          ttl: parseInt(context.TWILIO_TRANSCRIPTION_SYNC_TTL, 10),
          syncServiceSid: context.SYNC_SERVICE_SID,
          data: { syncStream: syncStreamResult.stream.sid },
        });
        console.log("Sync Map Item create: ", SyncMapResult);
        break;
      case "transcription-content":
        console.log(event);
        const token = await signRequest(context, event);
        let aiAssistantPayload = {
          Body: event.Body,
          SessionId: `TRANSCRIPTION_${event.CallSid}`,
          Webhook: `https://${
            context.DOMAIN_NAME
          }/api/ai-assistant-response?_token=${encodeURIComponent(token)}`,
        };
        if (event.Track === "inbound_track") {
          const transcript = JSON.parse(event.TranscriptionData).transcript;
          console.log("transcription: user: ", transcript);
          const syncStreamInboundData = {
            actor: "inbound",
            type: "transcript",
            transcriptionText: transcript,
          };
          const streamMessageInboundResult =
            await SyncOperations.createStreamMessage({
              context,
              name: `TRANSCRIPTION_${event.CallSid}`,
              data: syncStreamInboundData,
              syncServiceSid: context.SYNC_SERVICE_SID,
            });
          console.log(streamMessageInboundResult);

          aiAssistantPayload = {
            ...aiAssistantPayload,
            Author: `inbound`,
            Body: transcript,
            Identity: `phone:${event.CallSid}`,
          }; //from parameter phone:<from>
        } else if (event.Track === "outbound_track") {
          console.log("transcription: agent: ", event.TranscriptionData);
          const transcript = JSON.parse(event.TranscriptionData).transcript;
          const syncStreamOutboundData = {
            actor: "outbound",
            type: "transcript",
            transcriptionText: transcript,
          };
          const streamMessageOutboundResult =
            await SyncOperations.createStreamMessage({
              context,
              name: `TRANSCRIPTION_${event.CallSid}`,
              data: syncStreamOutboundData,
              syncServiceSid: context.SYNC_SERVICE_SID,
            });
          console.log(streamMessageOutboundResult);

          aiAssistantPayload = {
            ...aiAssistantPayload,
            Author: `outbound`,
            Body: transcript,
            Identity: `phone:${event.CallSid}`,
          }; //to parameter phone:<to>
        }

        try {
          await sendMessageToAssistant(
            context,
            assistantSid,
            aiAssistantPayload
          );
        } catch (err) {
          console.error(err);
        }
        break;
      case "transcription-stopped":
        console.log("transcriptionEvent: transcription-stopped", event.CallSid);

        // Update map and remove item for call sid
        const SyncMapItemDeleteResult = await SyncOperations.deleteMapItem({
          context,
          mapSid: context.MAP_CALL_LOG,
          key: event.CallSid,
          syncServiceSid: context.SYNC_SERVICE_SID,
        });
        console.log("Sync Map Item deleted: ", SyncMapItemDeleteResult);

        const SyncStreamDeleteResult = await SyncOperations.deleteStream({
          context,
          mapSid: context.MAP_CALL_LOG,
          name: `TRANSCRIPTION_${event.CallSid}`,
          syncServiceSid: context.SYNC_SERVICE_SID,
        });
        console.log("Sync Stream deleted: ", SyncStreamDeleteResult);
        break;
      default:
        console.log(
          `Unknown event type received [${event.TranscriptionEvent}]`
        );
        break;
    }

    response.setStatusCode(200);
    return callback(null, response);
  } catch (err) {
    console.error("Error", err);
    return callback(err, null);
  }
};
