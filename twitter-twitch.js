import fetch from "node-fetch";
import fs from "fs";
import twitter from "twitter-lite";
import { channel } from "diagnostics_channel";
import config from "./config.js";

//CONFIGS
const twitter_client = new twitter(config);
const twitchoauth_filename = "twitter-twitch.json";
const channels = [];
const twitter_acc = {};
const oauth = JSON.parse(fs.readFileSync(twitchoauth_filename));

//FUNCTIONS
const tweet_message = function (message) {
  twitter_client
    .post("statuses/update", { status: message })
    .then((result) => {
      console.log("Tweet posted");
    })
    .catch(console.error);
};

const check_online = async function (channel_name) {
  try {
    const resp = await fetch(
      "https://api.twitch.tv/helix/streams?user_login=" + channel_name,
      {
        headers: {
          "Client-ID": oauth.twitch_client_id,
          Authorization: "Bearer " + oauth.twitch_secret,
        },
      }
    );
    const response = await resp.json();
    let online_status = false;
    if (response.data.length != 0) {
      online_status = response;
    }
    return online_status;
  } catch (err) {
    console.log(err);
    document.getElementById("user_data").textContent = "Something went wrong";
  }
};

let tweeted_dict = {}; //KEEP TRACK OF TWEETED ALERTS
const main = async function () {
  for (let channel_name of channels) {
    let response = await check_online(channel_name);
    if (response != false) {
      let data = response.data[0];
      let game_title = data.game_name;
      let stream_title = data.title;
      let message = "";
      try {
        message =
          "~ @" +
          twitter_acc[channel_name] +
          " is now live playing " +
          game_title +
          "\n\n" +
          stream_title +
          "\nhttps://www.twitch.tv/" +
          channel_name;
      } catch {
        message =
          channel_name +
          " is now live playing " +
          game_title +
          "\n\n" +
          stream_title +
          "\nhttps://www.twitch.tv/" +
          channel_name;
      }

      try {
        if (!tweeted_dict[channel_name]) {
          tweet_message(message);
          console.log(message);
          console.log("Tweeted " + channel_name);
          tweeted_dict[channel_name] = true;
        }
      } catch {
        pass;
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
console.log(tweeted_dict);
i++;
setInterval(() => {
  console.log("iteration " + i);
  main();
  console.log(tweeted_dict);
  i++;
}, 60000);
