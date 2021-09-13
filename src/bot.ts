import { url } from "inspector";
import { Context, Telegraf } from "telegraf";
import { getFilters, Item, Result } from "ytsr";
import { getAuth } from "./auth";
import { toTitleCase } from "./helpers";
import { SearchResult } from "./interface";
import { addVideoToPlaylist, createPlaylist } from "./playlist";
import { youtubeSearch } from "./ytsr";
require("dotenv").config();

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be in your .env");
}

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.on("text", async (ctx: any) => {
  const text: string = ctx.message?.text
    ? ctx.message?.text
    : ctx.update.message?.text || "";

  let details = text.split(",");
  details = details.map((item: string) => {
    return item.trim();
  });
  details = details.filter(Boolean);

  let searchString = details[0];
  let type = toTitleCase(details[1] || "");
  let feature = details[2];
  let duration = details[3];
  let sortBy = details[4];
  let message = "";

  message = `Searching youtube for ${searchString.toLowerCase()} ${type.toLowerCase()}s...`;
  console.log(message);
  await ctx.reply(message);
  let searchResults = await youtubeSearch(
    searchString,
    type,
    feature,
    duration
  );

  if (!searchResults) {
    message = `No search results found for ${searchString}`;
    console.log(message);
    return await ctx.reply(message);
  }

  const auth = await getAuth();
  // create playlist from the user's searchString
  try {
    let result = await createPlaylist(auth, searchString);
    let playlist_id = result.data?.id;

    // Adding the videos to user playlist
    message = "Adding found videos to playlist...";
    console.log(message);
    await ctx.reply(message);
    for (let index = 0; index < searchResults!.items.length; index++) {
      const item = searchResults!.items[index];

      if (item.type == "playlist") {
        message = `Title: ${item.title}`;
        message += `\nUrl: ${item.url}`;
        message += `\nLength: ${item.length}`;
      } else if (item.type == "video") {
        // Authorize a client with the loaded credentials, then call the YouTube API.
        await addVideoToPlaylist(item.id, auth, playlist_id);
      }
    }
    message = `Here is the playlist link created https://www.youtube.com/playlist?list=${playlist_id}`;
    console.log(message);
    return await ctx.reply(message, { disable_web_page_preview: true });
  } catch (error: any) {
    console.log("Error:", error);
  }
});

export { bot };
