
# Family Guy Discord Quotes

A simple Discord bot that uses Slash Commands to pick a random Family Guy quote from various main characters.

Add the bot [here](https://discord.com/oauth2/authorize?client_id=839624581055774741&permissions=2048&scope=bot%20applications.commands)!

## Contributing

Contributions are always welcome! Feel free to add your own quotes by making a pull request.

#### Adding a quote

Simply follow the JSON format and add a new quote to the character of your choosing, making sure the quote does not already exist.

#### Adding a character

Again, follow the JSON format and add a new character with at least 5-10 quotes minimum (any less and the PR won't be accepted).

Example:
```json
...
"bonnie": [
  "put the quotes here"
],
...
```

Then, add the new character to the `charMap` const in `bot.ts` with the following syntax:
```js
...
lowercaseName: "Firstname Lastname",
...
```

  
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`BOT_TOKEN` - Discord Bot Token

`NODE_ENV` - Node.js Environment, should be `development` if you are editing the bot, and `production` for deployment.

`DEV_GUILD` - The development guild ID.

  
## Installation 

Clone this project via Git

```bash 
  git clone https://github.com/jackmerrill/FamilyGuyQuotesBot.git
  cd FamilyGuyQuotesBot
  yarn install
```

To build and run

```bash
  yarn build
  yarn run
```

To develop

```bash
  yarn dev
```
