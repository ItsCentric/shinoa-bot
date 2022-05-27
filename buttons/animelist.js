const { listObj } = require('../slashcommands/animelist');
const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const { formatString } = require('../util/functions');
require("dotenv").config();

var offset = 10;
var currentSlashCommand;
var pageCount = 1;
var currentPage = 1;

module.exports = {
  name: 'animelist',
  run: async (bot, interaction, parameters) => {
      if (listObj.slashCommandId !== currentSlashCommand) {
          currentSlashCommand = listObj.slashCommandId;
          offset = 0;
          pageCount = 1;
          currentPage = 1;
      }
      
      if (parameters[0] === 'next') {
        offset += 10;
        if (currentPage === pageCount) {
          pageCount++;
          currentPage++;
        }
        else currentPage++;
        let listString = "";
        let listRes;
        const LISTCONFIG = {
          method: "get",
          url: `https://api.myanimelist.net/v2/users/${listObj.username}/animelist?fields=${encodeURIComponent('list_status')}&status=${encodeURIComponent(listObj.status)}&sort=${encodeURIComponent(listObj.sort)}&offset=${offset}`,
          headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID },
        };
        
        await axios(LISTCONFIG)
        .then((response) => (listRes = response.data.data))
        .catch(async (err) => {
          console.log(err);
          await interaction.reply({ content: "Could not get the next page", ephemeral: true });
          return;
        });

        if (listRes.length === 0) {
          await interaction.reply({ content: 'There are no more pages to display', ephemeral: true });
          pageCount--;
          currentPage--;
          offset -= 10;
          return;
        }
        
        for (j = 0; j < listRes.length; j++) {
          listString += `**${listRes[j].node.title}** - ${formatString(listRes[j].list_status.status, '_')} - ${listRes[j].list_status.score} \n`;
        }
        
        list = new MessageEmbed()
        .setTitle(`${formatString(listObj.username)}'s Anime List`)
        .setDescription(listString)
        .setFooter({ text: `${currentPage} of ${pageCount} ${listObj.footerString}` });
        
        await interaction.update({ embeds: [list] });
      }
      else if (parameters[0] === 'previous') {
        offset -= 10;
        if (offset < 0) offset = 0;
        else currentPage--;
        let listString = "";
        let listRes;
        const LISTCONFIG = {
          method: "get",
          url: `https://api.myanimelist.net/v2/users/${listObj.username}/animelist?fields=${encodeURIComponent('list_status')}&status=${encodeURIComponent(listObj.status)}&sort=${encodeURIComponent(listObj.sort)}&offset=${offset}`,
          headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID },
        };
        
        await axios(LISTCONFIG)
        .then((response) => (listRes = response.data.data))
        .catch(async (err) => {
          console.log(err);
          await interaction.reply({ content: "Could not get the previous page", ephemeral: true });
          return;
        });
        
        for (j = 0; j < listRes.length; j++) {
          listString += `**${listRes[j].node.title}** - ${formatString(listRes[j].list_status.status, '_')} - ${listRes[j].list_status.score} \n`;
        }
            
        list = new MessageEmbed()
          .setTitle(`${formatString(listObj.username)}'s Anime List`)
          .setDescription(listString)
          .setFooter({ text: `${currentPage} of ${pageCount} ${listObj.footerString}` });
        
        await interaction.update({ embeds: [list] });
    }
  }
}