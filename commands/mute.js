const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('votemute')
    .setDescription('Mutes the mentioned user after voting.')
    .addUserOption(option => option
      .setName('user')
      .setDescription('User to be muted')
      .setRequired(true)),
    async execute(interaction) {
      const mandateUser = await interaction.user;
      const targetUser = await interaction.options.getUser('user');
      const guild = await interaction.guild;

      mandateMember = await guild.members.fetch(mandateUser.id);
      targetMember = await guild.members.fetch(targetUser.id);

      mandateMemberChannel = await mandateMember.voice.channelId;
      targetMemberChannel = await targetMember.voice.channelId;
      
      if(mandateMemberChannel != targetMemberChannel || mandateMemberChannel == null || targetMemberChannel == null) {
        interaction.reply({ content: "You have to be in the same voice channel as the user!", ephemeral: true });
      
      } else {
        interaction.reply({content: `A voting to mute the user ${targetUser} has been started. Vote will end in 30 seconds.`, fetchReply: true})
          .then(message => {
            const reactionFilter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name);

            message.react('👍');
            message.react('👎');

            message.awaitReactions({reactionFilter, time: 30000})
              .then(collected => {
                if(collected.get('👍').count > collected.get('👎').count) {
                  targetMember.voice.setMute(true, `${targetUser} lost a mute vote`).then(
                    () => {
                      message.edit(`${targetUser} you have lost the voting and hence will be muted from now on.`);
                    }
                  ).catch(
                    error => {
                      console.error(error);
                      if(error.code === 40032) {
                        message.edit('It seems like the user left the channel during the voting 😦');
                      } else if (error.code === 10008) {
                        console.log("Message deleted...")
                      } else {
                        message.edit('Ups, an error occured during the voting. Maybe you can just try to redo the voting 😅');
                      }
                    });
                } else {
                  message.edit(`${targetUser} you have won the voting and hence keep your voice privileges.`);
                }
              });        
            });
        }
      }
}