const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search messages in the server")
    .addStringOption(option =>
      option.setName("word")
            .setDescription("Word to search")
            .setRequired(true))
    .addIntegerOption(option =>
      option.setName("limit")
            .setDescription("Minimum message length")
            .setRequired(true))
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash command...");
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
      { body: commands }
    );
    console.log("Slash command registered!");
  } catch (err) {
    console.error(err);
  }
})();
