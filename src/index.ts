import { bot } from "./bot";
require("dotenv").config();

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be in your .env");
}

const App = async () => {
  console.log("Starting telegram bot");
  await bot.launch();
  console.log("Bot started on telegram successfully");
};

App();
