class Guild {
	constructor(guildName, guildIcon, guildBanner, description, guild) {
		this.guildName = guildName;
		this.guildIcon = guildIcon;
		this.guildBanner = guildBanner;
		this.description = description;
		this.channels = this.fetchGuildChannels(guild);
		this.roles = this.fetchGuildRoles(guild);
		this.members = this.fetchGuildMembers(guild);
	}

	fetchGuildChannels(guild) {
		let channels = [];
		guild.channels.cache.forEach((element) => {
			if (element.type == 4) {
				let children = [];
				element.children.cache.forEach((child) => {
					children.push(
						new Channel(child.name, child.type, child.position, null),
					);
				});
				channels.push(
					new Channel(element.name, element.type, element.position, children),
				);
			} else if (element.type !== 4 && element.parent == null) {
				channels.push(
					new Channel(element.name, element.type, element.position, null),
				);
			}
		});

		return channels;
	}

	fetchGuildRoles(guild) {
		let roles = [];
		guild.roles.cache.forEach((element) => {
			if (element.editable) {
				roles.push(
					new Role(
						element.name,
						element.permissions,
						element.color,
						this.fetchRoleMembers(element.members),
						element.position,
					),
				);
			}
		});

		return roles;
	}

	fetchRoleMembers(roleMembers) {
		let members = [];

		roleMembers.forEach((element) => {
			members.push(new Member(element.user.nickname, element.user.id));
		});

		return members;
	}

	fetchGuildMembers(guild) {
		let members = [];

		guild.members.cache.forEach((element) => {
			members.push(new Member(element.user.nickname, element.user.id));
		});

		return members;
	}
}

class Role {
	constructor(name, permissions, color, roleMembers, position) {
		this.name = name;
		this.permissions = permissions;
		this.color = color;
		this.roleMembers = roleMembers;
		this.positon = position;
	}
}

class Channel {
	constructor(name, type, position, children) {
		this.name = name;
		this.type = type;
		this.position = position;
		this.children = children;
	}
}

class Member {
	constructor(nickname, id) {
		this.nickname = nickname;
		this.id = id;
	}
}

module.exports = { Guild };
