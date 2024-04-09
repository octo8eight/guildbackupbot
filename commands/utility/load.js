const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const { clientId } = require("../../config.json");

// Funcs
const clearGuild = async (guild, user) => {
	const guildChannels = guild.channels.cache;
	const guildRoles = guild.roles.cache;

	guildChannels.forEach(async (element) => {
		await element.delete().catch((e) => console.log("Channels error"));
	});
	guildRoles.forEach(async (element) => {
		if (element.editable) {
			await element.delete().catch((e) => console.log("Roles error"));
		}
	});
};

const createChannels = async (guildObject, guild) => {
	guildObject.channels.forEach(async (channel) => {
		if (channel.children) {
			let parent = await guild.channels
				.create({
					name: channel.name,
					type: channel.type,
					position: channel.position,
				})
				.then()
				.catch((e) => console.log(e));
			channel.children.forEach(async (child) => {
				await guild.channels
					.create({
						name: child.name,
						type: child.type,
						position: child.position,
						parent: parent.id,
					})
					.then()
					.catch((e) => console.log(e));
			});
		} else {
			await guild.channels
				.create({
					name: channel.name,
					type: channel.type,
					position: channel.position,
				})
				.then()
				.catch((e) => console.log(e));
		}
	});
};

const createRoles = async (guildObject, guild) => {
	guildObject.roles.forEach(async (role) => {
		const currentRole = await guild.roles
			.create({
				name: role.name,
				type: role.type,
				color: role.color,
				permissions: role.permissions,
				position: role.position,
			})
			.then()
			.catch((e) => console.log(e));
		guild.members.cache.forEach(async (member) => {
			role.roleMembers.forEach(async (subMember) => {
				if (member.id == subMember.id) {
					await guild.members.addRole({ role: currentRole, user: member });
				}
			});
		});
	});
};

const setGuildPreferences = async (guildObject, guild) => {
	await guild
		.edit({
			name: guildObject.guildName,
			description: guildObject.guildDescription,
		})
		.catch((e) => console.log(e));
};

const downloadFile = async (url) => {
	return await axios
		.get(url)
		.then((e) => JSON.stringify(e.data))
		.catch((e) => console.log(e));
};

const backupGuild = async (user, guild, guildObject, msg) => {
	await setGuildPreferences(guildObject, guild).then(async () => {
		await msg.edit({
			embeds: [
				{
					type: "rich",
					title: `Guild backup started...`,
					description: `Guild clearing ❌\nGuild's preferences changed ✅\nChannels created ❌\nRoles created ❌`,
					color: 0xe96207,
					author: {
						name: `Guild Backup 🛡️`,
						url: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
					},
				},
			],
		});
	});

	await clearGuild(guild, user).then(async () => {
		await msg.edit({
			embeds: [
				{
					type: "rich",
					title: `Guild backup started...`,
					description: `Guild clearing ✅\nGuild's preferences changed ✅\nChannels created ❌\nRoles created ❌`,
					color: 0xe96207,
					author: {
						name: `Guild Backup 🛡️`,
						url: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
					},
					footer: {
						text: `Your backup is on progress...`,
					},
				},
			],
		});
	});

	await createChannels(guildObject, guild).then(async () => {
		await msg.edit({
			embeds: [
				{
					type: "rich",
					title: `Guild backup started...`,
					description: `Guild clearing ✅\nGuild's preferences changed ✅\nChannels created ✅\nRoles created ❌`,
					color: 0xe96207,
					author: {
						name: `Guild Backup 🛡️`,
						url: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
					},
					footer: {
						text: `Your backup is on progress...`,
					},
				},
			],
		});
	});

	await createRoles(guildObject, guild).then(async () => {
		await msg.edit({
			embeds: [
				{
					type: "rich",
					title: `Guild backup completed✅`,
					description: `Guild clearing ✅\nGuild's preferences changed ✅\nChannels created ✅\nRoles created ✅`,
					color: 0x02bb21,
					author: {
						name: `Guild Backup 🛡️`,
						url: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
					},
					footer: {
						text: `Your backup is complete.✅`,
					},
				},
			],
		});
	});
};

// CMD interaction
module.exports = {
	data: new SlashCommandBuilder()
		.setName("load")
		.setDescription("Backuping your server")
		.addAttachmentOption((option) =>
			option
				.setName("file")
				.setDescription("JSON file of your backup")
				.setRequired(true),
		),

	async execute(interaction) {
		const fileOption = interaction.options.getAttachment("file");

		if (!fileOption.name.includes(".json")) {
			await interaction.reply("Error your attachment isn't json");
			return;
		}

		const msg = await interaction.user
			.send({
				embeds: [
					{
						type: "rich",
						title: `Guild backup started...`,
						description: `Guild clearing ❌\nChannels created ❌\nRoles created ❌`,
						color: 0xe96207,
						author: {
							name: `Guild Backup 🛡️`,
							url: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
						},
						footer: {
							text: `Your backup is on progress...`,
						},
					},
				],
			})
			.then();

		// await clearGuild(interaction.guild, interaction.user);
		await backupGuild(
			interaction.user,
			interaction.guild,
			JSON.parse(await downloadFile(fileOption.url)),
			msg,
		);
	},
};
