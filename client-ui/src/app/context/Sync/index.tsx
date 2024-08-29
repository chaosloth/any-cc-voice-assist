"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SyncClient } from "twilio-sync";
import { generateSlug } from "random-word-slugs";

export enum State {
  Initializing = "Initializing",
  Ready = "Ready",
  ErrorNoToken = "ErrorNoToken",
  ErrorTokeExpired = "ErrorTokeExpired",
  ErrorConnectionError = "ErrorConnectionError",
}

export type SyncProviderProps = {
  state: State;
  identity: string | undefined;
  client: SyncClient | undefined;
  token: string | undefined;
};

const initialState: SyncProviderProps = {
  state: State.Initializing,
  identity: undefined,
  client: undefined,
  token: undefined,
};

const SyncContext = createContext(initialState);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(State.Initializing);
  const [identity, setIdentity] = useState<string>();
  const [client, setSyncClient] = useState<SyncClient>();
  const [token, setToken] = useState<string>();

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  /**
   *
   * Set the users identity based on passed in parameters or local cache
   *
   */
  useEffect(() => {
    // Get client ID from local storage or generate new one
    let localIdentity =
      localStorage.getItem("identity") || "client_id:" + generateSlug();

    // Parse identity query parameter (optional)
    const searchParams = new URLSearchParams(document.location.search);
    const searchParamsIdentity = searchParams.get("identity");
    if (searchParamsIdentity) {
      console.log(
        `Setting identity from search params [${searchParamsIdentity}]`
      );
      localIdentity = searchParamsIdentity || localIdentity;
    }

    // Set the local identity
    localStorage.setItem("identity", localIdentity);
    console.log(`Using identity [${localIdentity}]`);
    setIdentity(localIdentity);
  }, []);

  /**
   *
   * Get a token and register the device
   *
   */
  // Helper method to get an access token
  const getToken = () =>
    fetch(`${BASE_URL}/api/token?identity=${identity}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(`Received access token`, data);
        // Create Twilio Sync client with newly received token
        return data.token;
      })
      .catch((reason: any) => {
        console.error("Error getting token", reason);
      });

  /**
   *
   * Create sync client and logic for token refresh
   *
   */
  useEffect(() => {
    if (!identity || identity === "") return;

    (async () => {
      console.log(`Fetching access token with identity before connect`);
      try {
        // Get a new token on load
        let token = await getToken();

        if (!token) {
          console.warn(`Twilio token unavailable, see error logs`);
          return;
        }

        setToken(token);
        console.log("Creating new sync client");

        let client = new SyncClient(token);
        setSyncClient(client);

        client.on("tokenAboutToExpire", async () => {
          console.log("tokenAboutToExpire - Fetching token for sync client");
          const newToken = await getToken();
          if (!newToken) {
            console.warn(`Twilio token unavailable, see error logs`);
            setState(State.ErrorNoToken);
            return;
          }
          setToken(newToken);
          await client.updateToken(newToken);
          console.log("tokenAboutToExpire - Updated access token", newToken);
        });

        client.on("tokenExpired", async () => {
          console.log("tokenExpired - Fetching token for sync client");
          setState(State.ErrorTokeExpired);
        });

        client.on("connectionError", async (connectionError) => {
          console.log("Sync Client Connection error", connectionError);
          setState(State.ErrorConnectionError);
        });

        client.on("connectionStateChanged", async (newState) => {
          console.log("Sync Connection State", newState);
        });
      } catch (err) {
        console.error("Error creating sync client. Check logs", err);
      }
    })();

    return () => {
      if (client) {
        console.log("Shutting down sync client");
        client.shutdown();
        setSyncClient(undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);

  return (
    <SyncContext.Provider value={{ state, identity, client, token }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncClient() {
  return useContext(SyncContext);
}
