const MyAnimeListUserInfo = require('../models/myanimelist');

const run = (client, interaction) => {
    const USERNAME = interaction.options.getString('username');
    const NEWUSER = new MyAnimeListUserInfo({
        discordUserId: interaction.user.id,
        username: USERNAME
    });

    NEWUSER.save()
        .then(async () => await interaction.reply({ content: `User "${USERNAME}" successfully set as the current MyAnimeList account`, ephemeral: true }))
        .catch(async (err) => {
            console.log(err);
            await interaction.reply({ content: `User "${USERNAME}" could not be set as the current MyAnimeList account, please try again`, ephemeral: true });
        });
}

module.exports = {
    name: 'setanimeuserinfo',
    description: 'Set your MyAnimeList account',
    options: [
        {
            name: 'username',
            description: 'Your MyAnimeList username',
            type: 3,
            required: true
        }
    ],
    run
}