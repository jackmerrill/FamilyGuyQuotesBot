import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
  Colors,
  ApplicationCommandOptionType,
} from 'discord.js';
import { Logger } from 'tslog';
import { config } from 'dotenv';
import { quotes } from './quotes.json';

config();

const log: Logger = new Logger();

const randomProperty = (obj: any) => {
  const keys = Object.keys(obj);
  // eslint-disable-next-line no-bitwise
  return obj[keys[(keys.length * Math.random()) << 0]];
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

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

log.info('Starting bot...');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.on('ready', async () => {
  log.info('Bot Started!');

  client.user?.setActivity({
    name: `Family Guy on ${client.guilds.cache.size} guilds.`,
    type: ActivityType.Watching,
  });

  if (process.env.NODE_ENV === 'development') {
    client.guilds.cache
      .get(process.env.DEV_GUILD as string)
      ?.commands.create({
        name: 'info',
        description: 'Get info on the bot!',
      })
      .then(() => log.info('Info Command Loaded.'))
      .catch((e: any) => log.error(e));

    client.guilds.cache
      .get(process.env.DEV_GUILD as string)
      ?.commands.create({
        name: 'quote',
        description: 'Get a random quote from Family Guy!',
        options: [
          {
            name: 'character',
            description: 'A Character from the show',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: Object.keys(quotes).map((key) => ({
              name: capitalizeFirstLetter(key),
              value: key,
            })),
          },
        ],
      })
      .then(() => log.info('Quote Command Loaded.'))
      .catch((e: any) => log.error(e));
  } else {
    client.application?.commands
      .create({
        name: 'info',
        description: 'Get info on the bot!',
      })
      .then(() => log.info('Info Command Loaded.'))
      .catch((e: any) => log.error(e));

    client.application?.commands
      .create({
        name: 'quote',
        description: 'Get a random quote from Family Guy!',
        options: [
          {
            name: 'character',
            description: 'A Character from the show',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: Object.keys(quotes).map((key) => ({
              name: capitalizeFirstLetter(key),
              value: key,
            })),
          },
        ],
      })
      .then(() => log.info('Quote Command Loaded.'))
      .catch((e: any) => log.error(e));
  }
});

client.on('guildCreate', (guild) => {
  log.info(
    `Joined Guild ${guild.name}(${guild.id}) with ${guild.memberCount} members.`,
  );
  client.user?.setActivity({
    name: `Family Guy on ${
      client.guilds.cache.size
    } guilds with ${client.guilds.cache
      .map((g) => g.memberCount)
      .reduce((a, b) => a + b)} members.`,
    type: ActivityType.Watching,
  });
});

// @ts-ignore
client.on('interaction', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'info') {
    const date = new Date(client.uptime as number);
    const days = date.getUTCDate() - 1;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    const segments = [];

    if (days > 0) segments.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours > 0) segments.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes > 0) {
      segments.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    }
    if (seconds > 0) {
      segments.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }

    const embed = new EmbedBuilder();

    embed.setTitle('Family Guy Bot Information');
    embed.setAuthor({
      name: client.user?.username || 'Family Guy Bot',
      iconURL: client.user?.avatarURL() ?? '',
    });
    embed.addFields(
      { name: 'Version', value: '1.2.0', inline: true },
      { name: 'Library', value: 'Discord.js', inline: true },
      { name: 'Creator', value: 'AmusedGrape#0001', inline: true },
      {
        name: 'Servers',
        value: client.guilds.cache.size.toLocaleString(),
        inline: true,
      },
      {
        name: 'Invite',
        value:
          '[Click Here](https://discord.com/oauth2/authorize?client_id=839624581055774741&permissions=2048&scope=bot%20applications.commands)',
        inline: true,
      },
      {
        name: 'GitHub',
        value:
          '[Click Here](https://github.com/jackmerrill/FamilyGuyQuotesBot)',
        inline: true,
      },
    );

    embed.setFooter({
      text: `Uptime: ${segments.join(', ')}`,
    });
    embed.setColor(Colors.White);

    await interaction.reply(embed);
  }

  if (interaction.commandName === 'quote') {
    if (interaction.options.length > 0) {
      const c = interaction.options[0].value;

      if (c) {
        // @ts-ignore
        const quote = quotes[c as string][Math.floor(Math.random() * quotes[c as string].length)];
        try {
          // @ts-ignore
          await interaction.reply(`"${quote}" - **${nameMap[c]}**`);
        } catch (e: any) {
          log.error(e);
        }
      }
    } else {
      const randomCharacter = randomProperty(quotes);

      const quote = randomCharacter[Math.floor(Math.random() * randomCharacter.length)];
      try {
        // @ts-ignore
        await interaction.reply(`"${quote}" - **${nameMap[getKeyByValue(quotes, randomCharacter)]}**`);
      } catch (e: any) {
        log.error(e);
      }
    }
  }
});

log.info('Logging in...');
client.login(process.env.BOT_TOKEN).then(() => {
  log.info('Logged in!');
});
