const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

let settings = {};

// load settings
if(fs.existsSync('settings.json')) {
    settings = JSON.parse(fs.readFileSync('settings.json'));
}
else {
    console.error('Settings file does not exist or is not accessible, exiting....\n');
    return;
}

client.login(settings.token);

client.on('ready', () => {
    console.log(client.user.id);

    // guild cmds
    // client.api.applications(client.user.id).guilds('136769767578140672').commands.post({data: {
    //     name: 'nobodyasked',
    //     description: 'Niemand vroeg hierom broer'
    // }});

    // global
    // client.api.applications(client.user.id).commands.post({data: {
    //     name: 'gelezen',
    //     description: ':gelezen: xd'
    // }});
});