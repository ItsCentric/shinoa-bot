const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const myanimelistSchema = new Schema({
    discordUserId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
});

const MyAnimeListUserInfo = mongoose.model('MyAnimeListUserInfo', myanimelistSchema);

module.exports = MyAnimeListUserInfo;