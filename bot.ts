import { Client, Intents } from 'discord.js';
import { Logger } from 'tslog';
import { config } from 'dotenv';
import { quotes } from './quotes.json';

config();

const log: Logger = new Logger();

const randomProperty = (obj: any) => {
  const keys = Object.keys(obj);
  // eslint-disable-next-line no-bitwise
  return obj[keys[keys.length * Math.random() << 0]];
};

function getKeyByValue(object: any, value: any) {
  return Object.keys(object).find((key) => object[key] === value);
}

const nameMap = {
  peter: 'Peter Griffin',
  lois: 'Lois Griffin',
  chris: 'Chris Griffin',
  meg: 'Meg Griffin',
  stewie: 'Stewie Griffin',
  brian: 'Brian Griffin',
  cleveland: 'Cleveland Brown',
  quagmire: 'Glenn Quagmire',
  joe: 'Joe Swanson',
};

log.info('Starting bot...');

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', async () => {
  log.info('Bot Started!');

  if (process.env.NODE_ENV === 'development') {
    client.guilds.cache.get('468920088817565717')?.commands.create({
      name: 'quote',
      description: 'Get a random quote from Family Guy!',
      options: [
        {
          name: 'Character',
          description: 'A Character from the show',
          type: 'STRING',
          required: false,
          choices: [
            {
              name: 'Peter',
              value: 'peter',
            },
            {
              name: 'Lois',
              value: 'lois',
            },
            {
              name: 'Chris',
              value: 'chris',
            },
            {
              name: 'Meg',
              value: 'meg',
            },
            {
              name: 'Stewie',
              value: 'stewie',
            },
            {
              name: 'Brian',
              value: 'brian',
            },
            {
              name: 'Cleveland',
              value: 'cleveland',
            },
            {
              name: 'Quagmire',
              value: 'quagmire',
            },
            {
              name: 'Joe',
              value: 'joe',
            },
          ],
        },
      ],
    }).then(() => log.info('Command Loaded.')).catch((e) => log.error(e));
  } else {
    client.application?.commands.create({
      name: 'quote',
      description: 'Get a random quote from Family Guy!',
      options: [
        {
          name: 'Character',
          description: 'A Character from the show',
          type: 'STRING',
          required: false,
          choices: [
            {
              name: 'Peter',
              value: 'peter',
            },
            {
              name: 'Lois',
              value: 'lois',
            },
            {
              name: 'Chris',
              value: 'chris',
            },
            {
              name: 'Meg',
              value: 'meg',
            },
            {
              name: 'Stewie',
              value: 'stewie',
            },
            {
              name: 'Brian',
              value: 'brian',
            },
            {
              name: 'Cleveland',
              value: 'cleveland',
            },
            {
              name: 'Quagmire',
              value: 'quagmire',
            },
            {
              name: 'Joe',
              value: 'joe',
            },
          ],
        },
      ],
    }).then(() => log.info('Command Loaded.')).catch((e) => log.error(e));
  }
});

// @ts-ignore
client.on('interaction', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'quote') {
    if (interaction.options.length > 0) {
      const c = interaction.options[0].value;

      if (c) {
        // @ts-ignore
        const quote = quotes[c as string][Math.floor(Math.random() * quotes[c as string].length)];
        // @ts-ignore
        await interaction.reply(`"${quote}" - **${nameMap[c]}**`);
      }
    } else {
      const randomCharacter = randomProperty(quotes);

      const quote = randomCharacter[Math.floor(Math.random() * randomCharacter.length)];
      // @ts-ignore
      await interaction.reply(`"${quote}" - **${nameMap[getKeyByValue(quotes, randomCharacter)]}**`);
    }
  }
});

log.info('Logging in...');
client.login(process.env.BOT_TOKEN).then(() => {
  log.info('Logged in!');
});
