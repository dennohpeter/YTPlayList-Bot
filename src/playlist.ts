import { title } from "process";

var { google } = require("googleapis");

const createPlaylist = async (
  auth: string,
  title: string = "My Mix",
  description?: string
) => {
  return await google
    .youtube({
      version: "v3",
      auth: auth,
    })
    .playlists.insert({
      part: ["snippet,status"],
      resource: {
        snippet: {
          title: `My ${title} Playlist`,
          description: description || `My ${title} Playlist`,
          tags: [`${title} playlist`],
          defaultLanguage: "en",
        },
        status: {
          privacyStatus: "private",
        },
      },
    });
};

// Add a video to a playlist.
const addVideoToPlaylist = async (
  video_id: string,
  auth: string,
  playlist_id: string
) => {
  var details = {
    videoId: video_id,
    kind: "youtube#video",
  };

  return await google
    .youtube({
      version: "v3",
      auth: auth,
    })
    .playlistItems.insert({
      part: "snippet",
      resource: {
        snippet: {
          playlistId: playlist_id,
          resourceId: details,
        },
      },
    });
};

export { createPlaylist, addVideoToPlaylist };
