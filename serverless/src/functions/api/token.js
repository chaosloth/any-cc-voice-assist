

export const handler = async (
  context,
  event,
  callback
) => {
  console.log("event received - /api/token: ", event);

  // make sure you enable ACCOUNT_SID and AUTH_TOKEN in Functions/Configuration
  const ACCOUNT_SID = context.TWILIO_ACCOUNT_SID || context.ACCOUNT_SID;
  const SYNC_SERVICE_SID = context.SYNC_SERVICE_SID;
  const API_KEY = context.TWILIO_API_KEY;
  const API_SECRET = context.TWILIO_API_SECRET;

  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept"
  );

  if (!event.identity || event.identity == "") {
    console.log("Missing identity in request");
    response.setStatusCode(400);
    response.setBody({ status: "missing identity" });
    return callback(null, response);
  }

  try {
    const AccessToken = Twilio.jwt.AccessToken;
    const SyncGrant = AccessToken.SyncGrant;

    const syncGrant = new SyncGrant({
      serviceSid: SYNC_SERVICE_SID,
    });

    const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET, {
      identity: event.identity,
      ttl: 60 * 60 * 3,
      // ttl: 30,
    });

    accessToken.addGrant(syncGrant);

    response.appendHeader("Content-Type", "application/json");
    response.setBody({ token: accessToken.toJwt() });
  } catch (err) {
    console.error(`Error creating access token`, err);
    response.setStatusCode(500);
    response.setBody({ status: "Error generating token, see logs" });
  }

  return callback(null, response);
};
