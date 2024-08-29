const { OpenAI } = require("openai");

const SyncOperations = require(Runtime.getFunctions()[
  "common/twilio-wrappers/sync"
].path);
exports.handler = async function handler(context, event, callback) {
  try {
    const actionInstructions = `You are a customer service assistant to the contact center agent. 
The agent can perform any of the following functions, or you can make suggestions. 
You task is to recommend which task is most appropriate based on the customer transcript. 
You must mark the task as complete if you can see it in the transcript. 

POSSIBLE ACTIONS:
- Inform the customer of our refund policy, url: https://help.twilio.com/articles/360010066814
- Check if the  refund is within policy, url: https://help.twilio.com/articles/360010066814
- View recent customer transactions, url: https://www.twilio.com/en-us/customer-data-platform
- Check stock of replacement product(s), url: https://www.twilio.com/en-us/customer-data-platform
- Escalate the customer request to manager, url: https://www.twilio.com/en-us/flex
- Discuss alternate solutions to customer, url: https://www.twilio.com/en-us/flex
- Raise a defect with the product team, url: https://www.twilio.com/en-us/flex

You MUST respond back with a JSON object based on this template {"type": "action", "title": "", "description":"", "url:"", "complete": false} or {} if no action is found
Do NOT use markdown syntax
`;

    const suggestionInstructions = `You are a customer service assistant to the contact center agent. You task is to recommend which task is most appropriate based on the customer transcript. 
You MUST respond back with a JSON object based on this template {"type": "suggestion", "title":"", "suggestion":""}
Do NOT use markdown syntax
`;

    const openai = new OpenAI({
      apiKey: context.OPENAI_API_KEY,
    });

    const formatMessage = (message, direction) => ({
      role: direction.includes("inbound_track") ? "user" : "assistant",
      content: message,
    });

    const performInstructions = async (
      instructionType,
      instructions,
      incomingTranscript
    ) => {
      const prompt = [];
      prompt.push(formatMessage(incomingTranscript, event.Track));
      prompt.push({
        role: "system",
        content: instructions,
      });

      const result = await openai.chat.completions.create({
        model: context.OPENAI_MODEL,
        messages: prompt,
      });

      console.log("OpenAI Completion", result);

      if (result.choices[0].message.content) {
        const suggestionJson = result.choices[0].message.content?.trim();
        console.log("JSON RESP >> ", suggestionJson);
        let suggestion = {};
        let success = false;
        try {
          suggestion = JSON.parse(suggestionJson);
          success = true;
          const syncStreamAIData = {
            actor: "AI",
            type: instructionType,
            ai: suggestion,
          };
          const streamMessageAIResult =
            await SyncOperations.createStreamMessage({
              context,
              name: `TRANSCRIPTION_${event.CallSid}`,
              data: syncStreamAIData,
              syncServiceSid: context.SYNC_SERVICE_SID,
            });
          console.log(streamMessageAIResult);
        } catch (err) {
          success = false;
          console.log("Error parsing results from AI", err);
        }
        console.log(suggestion);
        response.setBody({ success, ...suggestion });
      }
    };

    const response = new Twilio.Response();

    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    // console.log(event)

    switch (event.TranscriptionEvent) {
      case "transcription-started":
        console.log(
          "transcriptionEvent: transcription-started: ",
          event.CallSid
        );

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

          // Insert AI call here
          // await Promise.all([
          //   performInstructions("action", actionInstructions, transcript),
          //   performInstructions(
          //     "suggestion",
          //     suggestionInstructions,
          //     transcript
          //   ),
          // ]);
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
    callback(null, response);
  } catch (err) {
    console.error("Error", err);
    callback(err, null);
  }
};
