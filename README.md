# Twitch Twitter Alert
 
Tweets when channel specified is live

## Setup

1. Clone the repository and navigate to the project directory.

2. Install the dependencies by running the following command:
    ```
    npm install
    ```
3. Update Twitch and Twitter API keys:
- Rename the `.env.example` file to `.env`.
- Open the `.env` file and update the placeholders with your actual Twitch and Twitter API keys.
- Save the changes.

## Add Channels

To specify the Twitch channels you want to monitor, add them to the `channels.json` file. Follow the steps below:

1. Open the `channels.json` file.

2. Add the Twitch channel names to the `"channels"` array. For example:
    ```json
    {
        "channels": {
            "channel1": "twitterchannel1",
            "channel2": "twitterchannel2",
            "channel3": ""
        }
    }
    ```
3. Save the changes.

## Running the Application

You have multiple options to run the application:

### Option 1: Using start.bat (Windows)
1. Double-click on the start.bat file.
2. The application will start running and display the output in the console.

### Option 2: Using Node.js
1. Open a terminal or command prompt.
2. Run the following command:
    ```
    node .\twitter-twitch.js
    ```
3. The application will start running, and you will see the output in the terminal.