const axios = require("axios");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { formatString } = require("../util/functions");
const intl = require("intl");
const MyAnimeListUserInfo = require("../models/myanimelist");
require("dotenv").config();

var username, status, sort;
var footerString = '';
var slashCommandId;
var listObj = {
    slashCommandId,
    username,
    status,
    sort,
    footerString
}

const run = async (client, interaction) => {
    let list;
    listObj.slashCommandId = interaction.id;
    footerString = '';

  if (interaction.options.getSubcommand("animelist") === "currentuser") {
    await MyAnimeListUserInfo.findOne({ discordUserId: interaction.user.id })
      .then((user) => (username = user.username, listObj.username = user.username))
      .catch(async (err) => {
        console.log(err);
        await interaction.reply({ content: "Could not find a user", ephemeral: true });
      });
  } else {
    let usernameOption = interaction.options.getString('username');
    let mentionOption = interaction.options.getUser('mention');
    if (usernameOption === null && mentionOption === null) {
      await interaction.reply({ content: 'You must give either a username or user', ephemeral: true });
      return;
    }
    else if (usernameOption && mentionOption === null) username = usernameOption, listObj.username = username;
    else if (usernameOption === null && mentionOption) {
      await MyAnimeListUserInfo.findOne({ discordUserId: mentionOption.id })
        .then((user) => (username = user.username, listObj.username = user.username))
        .catch(async (err) => {
          console.log(err);
          await interaction.reply({ content: "Could not find a user", ephemeral: true });
        });
    }
    else if (usernameOption && mentionOption) {
      await interaction.reply({ content: 'You cannot give both a username and a user', ephemeral: true });
      return;
    }
  };
  status = interaction.options.getString("status"), listObj.status = interaction.options.getString("status");
  sort = interaction.options.getString("sort"), listObj.sort = interaction.options.getString("sort");

  if (status === null) status = '', listObj.status = '';
  else footerString += `| Filter by: ${formatString(status, '_')}`, listObj.footerString = footerString;
  if (sort === null) sort = '', listObj.sort = '';
  else footerString += `| Sort by: ${formatString(sort, '_')}`, listObj.footerString = footerString;

  const LISTCONFIG = {
    method: "get",
    url: `https://api.myanimelist.net/v2/users/${username}/animelist?fields=${encodeURIComponent('list_status')}&status=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}`,
    headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID },
  };

  await axios(LISTCONFIG)
    .then((response) => (listRes = response.data.data))
    .catch(async (err) => {
      console.log(err);
      await interaction.reply({ content: "Could not get that user's anime list", ephemeral: true });
    });

    let listString = "";

    for (j = 0; j < listRes.length; j++) {
      listString += `**${listRes[j].node.title}** - ${formatString(listRes[j].list_status.status, '_')} - ${listRes[j].list_status.score} \n`;
    }
    
    list = new MessageEmbed()
    .setTitle(`${formatString(username)}'s Anime List`)
    .setDescription(listString)
    .setFooter({ text: `1 of 1 ${footerString}` });

  const NEXTPREVIOUS = new MessageActionRow().addComponents([
    new MessageButton().setCustomId('animelist-previous').setLabel('Previous').setStyle('PRIMARY'),
    new MessageButton().setCustomId('animelist-next').setLabel('Next').setStyle('PRIMARY')
  ]);

  await interaction.reply({ embeds: [list], components: [NEXTPREVIOUS] });
};

module.exports = {
  name: "animelist",
  description: "Get a user's anime list",
  options: [
    {
      name: "currentuser",
      description: "Get the current user's anime list",
      type: 1,
      options: [
        {
          name: 'status',
          description: 'Filter the list by status (all is default)',
          type: 3,
          choices: [
            {
              name: 'Watching',
              value: 'watching'
            },
            {
              name: 'Completed',
              value: 'completed'
            },
            {
              name: 'On hold',
              value: 'on_hold'
            },
            {
              name: 'Dropped',
              value: 'dropped'
            },
            {
              name: 'Plan to watch',
              value: 'plan_to_watch'
            }
          ],
          required: false
        },
        {
          name: 'sort',
          description: 'Sort the list (title is default)',
          type: 3,
          choices: [
            {
              name: 'Score on list',
              value: 'list_score'
            },
            {
              name: 'Last updated',
              value: 'list_updated_at'
            },
            {
              name: 'Title',
              value: 'anime_title'
            },
            {
              name: 'Anime Start Date',
              value: 'anime_start_date'
            }
          ],
          required: false
        },
      ]
    },
    {
      name: "anotheruser",
      description: "Get another user's anime list",
      type: 1,
      options: [
        {
          name: "username",
          description: "The username of the user whose list you want to get",
          type: 3,
          required: false,
        },
        {
          name: "mention",
          description: "Mention the user in the server whose list you want to get",
          type: 6,
          required: false,
        },
        {
          name: 'status',
          description: 'Filter the list by status (all is default)',
          type: 3,
          choices: [
            {
              name: 'Watching',
              value: 'watching'
            },
            {
              name: 'Completed',
              value: 'Completed'
            },
            {
              name: 'On hold',
              value: 'on_hold'
            },
            {
              name: 'Dropped',
              value: 'dropped'
            },
            {
              name: 'Plan to watch',
              value: 'plan_to_watch'
            }
          ],
          required: false
        },
        {
          name: 'sort',
          description: 'Sort the list (title is default)',
          type: 3,
          choices: [
            {
              name: 'Score on list',
              value: 'list_score'
            },
            {
              name: 'Last updated',
              value: 'list_updated_at'
            },
            {
              name: 'Title',
              value: 'anime_title'
            },
            {
              name: 'Anime Start Date',
              value: 'anime_start_date'
            }
          ],
          required: false
        },
      ],
    },
  ],
  listObj,
  run
};
