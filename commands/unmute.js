const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voteunmute')
    .setDescription('Unmutes the mentioned user after voting.')
    .addUserOption(option => option
      .setName('user')
      .setDescription('User to be unmuted')
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
        interaction.reply({content: `A voting to unmute the user ${targetUser} has been started. Vote will end in 30 seconds.`, fetchReply: true})
          .then(message => {
            const reactionFilter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name);

            message.react('👍');
            message.react('👎');

            message.awaitReactions({reactionFilter, time: 30000})
              .then(collected => {
                if(collected.get('👍').count > collected.get('👎').count) {
                  targetMember.voice.setMute(false, `${targetUser} won an unmute vote`).then(
                    () => {
                      message.reply(`${targetUser} you have won the voting and hence will be unmuted from now on.`);
                    }
                  ).catch(
                    error => {
                      console.error(error);
                      if(error.code === 40032) {
                        message.reply('It seems like the user left the channel during the voting 😦');
                      } else {
                        message.reply('Ups, an error occured during the voting. Maybe you can just try to redo the voting 😅');
                      }
                    });
                } else {
                  message.reply(`${targetUser} you have lost the voting and hence stay muted.`);
                }
              });        
            });
        }
      }
}