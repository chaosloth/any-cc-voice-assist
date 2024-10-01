exports.handler = (context, event, callback) => {
  const response = new Twilio.Response();

  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  const twilioSyncServiceSid = context.SYNC_SERVICE_SID;
  console.log("Incoming event to retrieve transcript", event);

  if (!event.CallSid) {
    const error = "Missing CallSid data";
    response.setBody({ message: error });
    response.setStatusCode(400);
    return callback(null, response);
  }

  const listUniqueName = "TRANSCRIPTION_" + event.CallSid;
  const client = context.getTwilioClient();

  console.log("Using Sync service with SID", twilioSyncServiceSid);
  console.log("List Unique ID", listUniqueName);

  try {
    // Check if list exists and update
    client.sync.v1
      .services(twilioSyncServiceSid)
      .syncLists(listUniqueName)
      .syncListItems.list({ limit: 50 })
      .then((syncListItems) => {
        response.setBody(syncListItems);
        callback(null, response);
      })
      .catch(async (error) => {
        console.log("Error getting list items");
        callback(error.message);
      });
  } catch (err) {
    console.log("Oh shoot. Something went really wrong, check logs", err);
    callback(err);
  }
};
