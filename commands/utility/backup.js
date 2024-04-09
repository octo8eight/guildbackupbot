const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { Guild } = require("../../classes/classes.js");
const { clientId } = require("../../config.json");

const fetchGuildInfo = (guild) => {
	const backup = new Guild(
		guild.name,
		guild.iconURL(),
		guild.bannerURL(),
		guild.description,
		guild,
	);
	const jsonfile = JSON.stringify(backup, null, 4);
	fs.writeFile(`./temp/${guild.id}.json`, jsonfile, (err) => {
		if (err !== null) {
			console.log(err);
		}
	});

	return backup;
};

// CMD interaction
module.exports = {
	data: new SlashCommandBuilder()
		.setName("backup")
		.setDescription("Do a backup of your guild"),
	async execute(interaction) {
		const info = fetchGuildInfo(interaction.guild);
		await interaction.reply({
			embeds: [
				new EmbedBuilder({
					type: "rich",
					title: `Guild backup created succesfully ✅`,
					description: `Here is your backup info:\nYour guild name: __${info.guildName}__\nYour roles count: **${info.roles.length}**\nYour members count: **${info.members.length}**`,
					color: 0x02bb21,
					author: {
						name: `Guild Backup 🛡️`,
						url: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
					},
					footer: {
						text: `You can download your backup above!⬆️`,
					},
				}),
			],
			files: [`./temp/${interaction.guild.id}.json`],
			ephemeral: true,
		});

		fs.unlink(`./temp/${interaction.guild.id}.json`, (err) => {
			if (err !== null) {
				console.log(err);
			}
		});
	},
};
