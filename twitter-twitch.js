import dotenv from 'dotenv';
import fs from 'fs';
import fetch from "node-fetch";
import { TwitterApi } from 'twitter-api-v2';

dotenv.config();

//CONFIGS
const twitterUserClient = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: process.env.ACCESS_TOKEN_KEY,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
});
const channels = {
    /* twitch_username: twitter_username */
};
const oauth = {
    twitch_client_id: process.env.TWITCH_CLIENT_ID,
    twitch_token: process.env.TWITCH_TOKEN,
    twitch_secret: process.env.TWITCH_SECRET,
};

const MODE = Object.freeze({
    LIVE: 'live',
    DEV: 'dev',
})

//FUNCTIONS
const tweet_message = async (message) => {
    const createdTweet = await twitterUserClient.v2.tweet('This is api test 2');
    return 'data' in createdTweet
};

const check_online = async function (channel_name) {
    let status = false;
    do {
        const url = "https://api.twitch.tv/helix/streams?user_login=" + channel_name
        const resp = await fetch(
            url,
            {
                headers: {
                    "Client-ID": oauth.twitch_client_id,
                    Authorization: "Bearer " + oauth.twitch_token,
                },
            }
        );
        const response = await resp.json();
        status = 'data' in response;
        if (!status) {
            await auth_request();
            continue;
        }

        return response.data.length > 0 ? response : false;
    } while (!status)
};

const auth_request = async () => {
    const url = 'https://id.twitch.tv/oauth2/token';
    const formdata = new FormData();
    formdata.append("client_id", oauth.twitch_client_id);
    formdata.append("client_secret", oauth.twitch_secret);
    formdata.append("grant_type", "client_credentials");

    const response = await fetch(url, {
        method: 'POST',
        body: formdata,
    });

    const data = await response.json();
    if (data && 'access_token' in data) {
        updateEnvTwitchToken(data.access_token);
        oauth.twitch_token = data.access_token;
    } else {
        console.error('Error: ' + data.message);
    }
}

const updateEnvTwitchToken = (access_token) => {
    const envFilePath = '.env';
    const envFileContent = fs.readFileSync(envFilePath, 'utf8');
    const updatedEnvFileContent = envFileContent.replace(
        /^TWITCH_TOKEN=.*/gm,
        `TWITCH_TOKEN="${access_token}"`
    );
    fs.writeFileSync(envFilePath, updatedEnvFileContent, { flag: 'w' });
}

// Keep track of tweeted alerts
let tweeted_dict = Object.fromEntries(Object.keys(channels).map(channel_name => [channel_name, false]));
console.log(tweeted_dict);
const main = async function (mode = MODE.LIVE) {
    for (let channel_name in channels) {
        let response = await check_online(channel_name);
        if (response) {
            let data = response.data[0];
            let game_title = data.game_name;
            let stream_title = data.title;
            let message = `~ @${channels[channel_name] || channel_name} is now live playing ${game_title} \n\n ${stream_title} \nhttps://www.twitch.tv/${channel_name}`;

            if (!tweeted_dict[channel_name]) {
                if (mode === MODE.LIVE) {
                    tweet_message(message);
                } else {
                    tweet_message(`This is a test\n${message}`);
                    console.log(message);
                }
                // console.log("Tweeted " + channel_name);
                tweeted_dict[channel_name] = true;
            }
        } else {
            tweeted_dict[channel_name] = false;
        }
    }
};

//MAIN
let i = 0;
console.log("iteration " + i);
main();
i++;
setInterval(() => {
    console.log("iteration " + i);
    main();
    console.log(tweeted_dict);
    i++;
}, 60000);