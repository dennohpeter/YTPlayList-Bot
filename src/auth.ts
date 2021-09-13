import { AnyARecord } from "dns";
import { mkdirSync, readFileSync, writeFile } from "fs";
var readline = require("readline");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/ytlistbot.json
var SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/plus.login",
  "https://www.googleapis.com/auth/userinfo.email",
];
var TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "ytlistbot.json";

// Load client secrets from a local file.
const getAuth = async (): Promise<string> => {
  const content = JSON.parse(
    readFileSync(`${__dirname}/auth/client_secret.json`, "utf-8")
  );
  return await authorize(content);
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = async (credentials: {
  installed: { client_secret: any; client_id: any; redirect_uris: any[] };
}): Promise<string> => {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  try {
    const token = JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));
    oauth2Client.credentials = token;
    return oauth2Client;
  } catch (error: any) {
    return getNewToken(oauth2Client);
  }
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 *     client.
 */
const getNewToken = async (oauth2Client: {
  generateAuthUrl: (arg0: { access_type: string; scope: string[] }) => any;
  getToken: (
    arg0: string,
    arg1: (err: AnyARecord, token: string) => void
  ) => void;
  credentials: string;
}): Promise<any> => {
  var authUrl = await oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  var rl = await readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    storeToken;
    await rl.question(
      "Enter the code from that page here: ",
      function (code: string) {
        rl.close();
        oauth2Client.getToken(code, function (err: AnyARecord, token: string) {
          if (err) {
            console.log("Error while trying to retrieve access token", err);
            return;
          }
          oauth2Client.credentials = token;
          storeToken(token);
        });
      }
    );
  } catch (error: any) {}
  return oauth2Client;
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token: string) {
  try {
    mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EXIST") {
      throw err;
    }
  }
  writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
    if (err) throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
}

export { getAuth };
