const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const { formatString } = require('../util/functions');
const intl = require('intl');
require("dotenv").config();

const run = async (client, interaction) => {
  const ANIME = interaction.options.getString("name");
  let animeRes;
  let nsfw;
  let genresString = '', studiosString = '';

  const SEARCHCONFIG = {
    method: "get",
    url: `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(ANIME)}&limit=1&fields=${encodeURIComponent('start_date, end_date, synopsis, mean, rank, popularity, nsfw, genres, media_type, status, num_episodes, start_season, source, average_episode_duration, rating, studios')}`,
    headers: { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID }
  };

  await axios(SEARCHCONFIG)
    .then(response => {
      animeRes = response.data.data[0].node;
    })
    .catch(async err => {
      console.log(err);
      await interaction.reply('Something went wrong, please try again');
    });

    let status = formatString(animeRes.status, '_');
    let season = formatString(animeRes.start_season.season);
    let mediaType = formatString(animeRes.media_type);
    let rating = formatString(animeRes.rating);

    switch(animeRes.nsfw) {
      case 'white':
        nsfw = 'Not NSFW';
        break;
      case 'gray':
        nsfw = 'Might be NSFW';
        break;
      case 'black':
        nsfw = 'NSFW';
        break;
    }

    for (i = 0; i < animeRes.genres.length; i++) {
      if (animeRes.genres[i].name !== (animeRes.genres).slice(-1)[0].name) genresString += `${animeRes.genres[i].name}, `;
      else genresString += animeRes.genres[i].name;
    };
    for (i = 0; i < animeRes.studios.length; i++) {
      if (animeRes.studios[i].name !== (animeRes.studios).slice(-1)[0].name) studiosString += `${animeRes.studios[i].name}, `;
      else studiosString += animeRes.studios[i].name;
    };

    const ANIMEINFO = new MessageEmbed()
      .setTitle(animeRes.title)
      .setDescription(animeRes.synopsis.split('\n')[0])
      .setImage(animeRes.main_picture.large)
      .addFields(
        { name: 'Media Information', value: `Started: ${new Date(animeRes.start_date).toLocaleDateString()} \nEnded: ${new Date(animeRes.end_date).toLocaleDateString()} \nStatus: ${status} \nSeason: ${season} ${animeRes.start_season.year} \nNSFW: ${nsfw} \nGenres: ${genresString} \nMedia Type: ${mediaType} \nRating: ${rating} \nStudios: ${studiosString}` },
        { name: 'MAL Stats', value: `Average Rating: ${animeRes.mean} \nRanking: #${(animeRes.rank).toLocaleString('en-US')} \nPopularity: ${animeRes.popularity} \n`}
      )

  await interaction.reply({ embeds: [ANIMEINFO] });
};

module.exports = {
  name: "anime",
  description: "All anime commands",
  options: [
    {
      name: "animeinfo",
      description: "Get information about an anime",
      type: 1,
      options: [
        {
          name: "name",
          description: "The name of the anime",
          type: 3,
          required: true,
        },
      ],
    },
  ],
  run,
};
