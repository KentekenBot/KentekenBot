# KentekenBot

A Discord bot that allows you to get info from Dutch license plates using commands.


## Run Locally

Clone the project

```bash
  git clone git@github.com:Kefkef123/KentekenBot.git
```

Go to the project directory

```bash
  cd KentekenBot
```

Install dependencies

```bash
  npm ci
```

Setup settings

```bash
  cp settings.json.example settings.json
```

Create empty db (on Windows just make an empty file yourself)

```bash
  touch kentekenbot.db
```

Run the database migrations

```bash
  npx sequelize-cli db:migrate
```

Start the bot

```bash
  npm run dev
```

Optionally you can remove the heartbeat url from the config.

When you run the bot for the first time the slash commands might not show instantly. 
After a minute refresh your Discord client and it should show up.