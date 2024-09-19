package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"time"

	"github.com/bwmarrin/discordgo"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Quotes struct {
	Quotes map[string][]string `json:"quotes"`
}

var quotes Quotes

var startTime time.Time = time.Now()

var (
	Version string
	Build   string
)

// Bot parameters
var (
	GuildID        = flag.String("guild", "", "Test guild ID. If not passed - bot registers commands globally")
	BotToken       = os.Getenv("BOT_TOKEN")
	RemoveCommands = flag.Bool("rmcmd", true, "Remove all commands after shutdowning or not")
	QuotesFile     = flag.String("quotes", "quotes.json", "Path to the quotes file")
)

var s *discordgo.Session

func init() { flag.Parse() }

func init() {
	// load the json
	file, err := os.ReadFile(*QuotesFile)
	if err != nil {
		log.Fatalf("Could not read quotes file: %v", err)
	}

	err = json.Unmarshal(file, &quotes)
	if err != nil {
		log.Fatalf("Could not unmarshal quotes: %v", err)
	}
}

var r rand.Rand

func init() {
	s := rand.NewSource(time.Now().UnixNano())
	r = *rand.New(s)
}

func init() {
	var err error
	s, err = discordgo.New("Bot " + BotToken)
	if err != nil {
		log.Fatalf("Invalid bot parameters: %v", err)
	}
}

func quotesToChoices() []*discordgo.ApplicationCommandOptionChoice {
	choices := make([]*discordgo.ApplicationCommandOptionChoice, 0, len(quotes.Quotes))
	for character := range quotes.Quotes {
		choices = append(choices, &discordgo.ApplicationCommandOptionChoice{
			Name:  cases.Title(language.English, cases.Compact).String(character),
			Value: character,
		})
	}
	return choices
}

var (
	integerOptionMinValue = 1.0
	dmPermission          = false

	commands = []*discordgo.ApplicationCommand{
		{
			Name:        "info",
			Description: "Get info on the bot!",
		},
		{
			Name:        "quote",
			Description: "Get a random quote from Family Guy!",
			Options: []*discordgo.ApplicationCommandOption{

				{
					Type:        discordgo.ApplicationCommandOptionString,
					Name:        "character",
					Description: "Choose a character",
					Required:    false,
				},
			},
		},
	}

	commandHandlers = map[string]func(s *discordgo.Session, i *discordgo.InteractionCreate){
		"info": func(s *discordgo.Session, i *discordgo.InteractionCreate) {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Embeds: []*discordgo.MessageEmbed{
						{
							Title:  "Family Guy Quotes Bot",
							Author: &discordgo.MessageEmbedAuthor{Name: "Family Guy Quotes Bot", IconURL: s.State.User.AvatarURL("")},
							Fields: []*discordgo.MessageEmbedField{
								{
									Name:   "Version",
									Value:  Version,
									Inline: true,
								},
								{
									Name:   "Build",
									Value:  Build,
									Inline: true,
								},
								{
									Name:   "Library",
									Value:  "DiscordGo",
									Inline: true,
								},
								{
									Name:   "Creator",
									Value:  "[@amusedgrape](https://jackmerrill.com)",
									Inline: true,
								},
								{
									Name:   "Servers",
									Value:  fmt.Sprintf("%d", len(s.State.Guilds)),
									Inline: true,
								},
								{
									Name:   "Invite",
									Value:  "[Click Here](https://discord.com/oauth2/authorize?client_id=839624581055774741&permissions=2048&scope=bot%20applications.commands)",
									Inline: true,
								},
								{
									Name:   "GitHub",
									Value:  "[Click Here](https://github.com/jackmerrill/FamilyGuyQuotesBot)",
									Inline: true,
								},
							},
							Footer: &discordgo.MessageEmbedFooter{
								Text: fmt.Sprintf("Uptime: %s", time.Since(startTime).String()),
							},
							Color: 0xffffff,
						},
					},
				},
			})
		},
		"quote": func(s *discordgo.Session, i *discordgo.InteractionCreate) {
			// Access options in the order provided by the user.
			options := i.ApplicationCommandData().Options

			// Or convert the slice into a map
			optionMap := make(map[string]*discordgo.ApplicationCommandInteractionDataOption, len(options))
			for _, opt := range options {
				optionMap[opt.Name] = opt
			}

			msg := ""

			// Get the value from the option map.
			// When the option exists, ok = true
			if option, ok := optionMap["character"]; ok {
				character := option.StringValue()

				// Get a random quote from the character
				quotes := quotes.Quotes[character]

				if len(quotes) == 0 {
					msg += "No quotes found for this character."
				} else {
					quote := quotes[r.Intn(len(quotes))]

					msg += fmt.Sprintf("\"%s\" - **%s**", quote, cases.Title(language.English, cases.Compact).String(character))
				}

			} else {
				characters := make([]string, 0)

				for character := range quotes.Quotes {
					characters = append(characters, character)
				}

				// Get a random character
				character := characters[r.Intn(len(characters))]

				// Get a random quote from the character
				quotes := quotes.Quotes[character]

				if len(quotes) == 0 {
					msg += "No quotes found for this character."
				} else {
					quote := quotes[r.Intn(len(quotes))]

					msg += fmt.Sprintf("\"%s\" - **%s**", quote, cases.Title(language.English, cases.Compact).String(character))
				}
			}

			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				// Ignore type for now, they will be discussed in "responses"
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: msg,
				},
			})
		},
	}
)

func UpdateStatus(s *discordgo.Session) {
	guildCount := len(s.State.Guilds)
	guildMemberCount := 0

	for _, guild := range s.State.Guilds {
		guildMemberCount += guild.MemberCount
	}
	s.UpdateWatchStatus(0, fmt.Sprintf("Family Guy on %d servers with %d members", guildCount, guildMemberCount))
}

func init() {
	s.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if h, ok := commandHandlers[i.ApplicationCommandData().Name]; ok {
			h(s, i)
		}
	})

	s.AddHandler(func(s *discordgo.Session, i *discordgo.GuildCreate) {
		log.Printf("Joined guild: %s <%s> (%d members)", i.Guild.Name, i.Guild.ID, i.Guild.MemberCount)
		UpdateStatus(s)
	})
}

func main() {
	s.AddHandler(func(s *discordgo.Session, r *discordgo.Ready) {
		log.Printf("Logged in as: %v#%v", s.State.User.Username, s.State.User.Discriminator)
		UpdateStatus(s)
	})
	err := s.Open()
	if err != nil {
		log.Fatalf("Cannot open the session: %v", err)
	}

	log.Println("Adding commands...")
	registeredCommands := make([]*discordgo.ApplicationCommand, len(commands))
	commands[1].Options[0].Choices = quotesToChoices()
	for i, v := range commands {
		cmd, err := s.ApplicationCommandCreate(s.State.User.ID, *GuildID, v)
		if err != nil {
			log.Panicf("Cannot create '%v' command: %v", v.Name, err)
		}
		registeredCommands[i] = cmd
	}

	defer s.Close()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	log.Println("Press Ctrl+C to exit")
	<-stop

	if *RemoveCommands {
		log.Println("Removing commands...")
		// // We need to fetch the commands, since deleting requires the command ID.
		// // We are doing this from the returned commands on line 375, because using
		// // this will delete all the commands, which might not be desirable, so we
		// // are deleting only the commands that we added.
		// registeredCommands, err := s.ApplicationCommands(s.State.User.ID, *GuildID)
		// if err != nil {
		// 	log.Fatalf("Could not fetch registered commands: %v", err)
		// }

		for _, v := range registeredCommands {
			err := s.ApplicationCommandDelete(s.State.User.ID, *GuildID, v.ID)
			if err != nil {
				log.Panicf("Cannot delete '%v' command: %v", v.Name, err)
			}
		}
	}

	log.Println("Gracefully shutting down.")
}
