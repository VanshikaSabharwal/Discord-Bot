require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Simple in-memory cache per channel
const messageCache = new Map(); // key: channelId, value: Array of messages

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "search") {
    const word = interaction.options.getString("word");
    const limit = interaction.options.getInteger("limit");
    const channelFilter = interaction.options.getChannel("channel"); // optional
    const userFilter = interaction.options.getUser("user"); // optional

    let results = [];

    // Search channels
    for (const channel of interaction.guild.channels.cache.values()) {
      if (!channel.isTextBased()) continue;
      if (channelFilter && channel.id !== channelFilter.id) continue;

      try {
        // Fetch from cache or Discord
        let messages = messageCache.get(channel.id);
        if (!messages) {
          messages = await channel.messages.fetch({ limit: 100 });
          messageCache.set(channel.id, messages);
        }

        messages.forEach(msg => {
          if (
            msg.content.toLowerCase().includes(word.toLowerCase()) &&
            msg.content.length > limit &&
            (!userFilter || msg.author.id === userFilter.id)
          ) {
            results.push({
              channelId: channel.id,
              channelName: channel.name,
              messageId: msg.id,
              content: msg.content,
              author: msg.author.username
            });
          }
        });
      } catch (err) {
        console.log(`Failed to fetch messages from #${channel.name}: ${err.message}`);
      }
    }

    // Deduplicate messages
    const uniqueResults = Array.from(new Map(results.map(r => [r.messageId, r])).values());

    if (uniqueResults.length === 0) {
      return interaction.reply({
        content: `No messages found with "${word}" longer than ${limit}`,
        ephemeral: true
      });
    }

    // Pagination
    const pageSize = 10;
    for (let i = 0; i < uniqueResults.length; i += pageSize) {
      const page = uniqueResults.slice(i, i + pageSize);

      const embed = new EmbedBuilder()
        .setTitle(`Search Results for "${word}"`)
        .setDescription(
          page.map(
            r => `#${r.channelName} • **${r.author}** • <https://discord.com/channels/${interaction.guild.id}/${r.channelId}/${r.messageId}>\n> ${r.content}`
          ).join("\n\n")
        )
        .setColor(0x00ff00)
        .setFooter({ text: `Page ${Math.floor(i / pageSize) + 1} of ${Math.ceil(uniqueResults.length / pageSize)}` });

      // Send first page as reply, rest as followups
      if (i === 0) {
        await interaction.reply({ embeds: [embed], ephemeral: false });
      } else {
        await interaction.followUp({ embeds: [embed], ephemeral: false });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
