const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const https = require('https');

let settings = {};

// load settings
if(fs.existsSync('settings.json')) {
    settings = JSON.parse(fs.readFileSync('settings.json'));
}
else {
    console.error('Settings file does not exist or is not accessible, exiting....\n');
    return;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${settings.commandPrefix}k <kenteken>`);
});

client.on('message', msg => {
    if(msg.author.bot) {
        return;
    }

    if (msg.content === settings.commandPrefix+'ping') {
        return msg.reply("Pong bitch");
    }

    if(msg.content.substr(0, settings.commandPrefix.length + 1) === settings.commandPrefix + 'k') {
        let kentekenRegex = /^(([A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2})|([0-9]{2}-?[A-Z]{3}-?[0-9])|([0-9]-?[A-Z]{3}-?[0-9]{2})|([A-Z]-?\d{3}-?[A-Z]{2})|([A-Z]{2}-?[0-9]{3}-?[A-Z]))$/;

        let kenteken = msg.content.substr(settings.commandPrefix.length + 2).toUpperCase().split('-').join('');

        console.log(kenteken);

        if (msg.content.length <= (settings.commandPrefix.length + 10) && kentekenRegex.test(kenteken)) {
            //msg.channel.send("Huts dat is een geldig kenteken, nu nog iets er mee doen.....");

            let requestOptions = {
                headers: {
                    "X-App-Token": settings.openDataToken
                }
            }

            https.get(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`, requestOptions, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    let vehicleInfo = JSON.parse(data);

                    if(vehicleInfo.length === 0) {
                        msg.channel.send('Ik kon dat kenteken niet vindn kerol.');
                        return;
                    }

                    vehicleInfo = vehicleInfo[0];

                    console.log(vehicleInfo);

                    msg.channel.send(`Dat is een ${vehicleInfo.merk} ${vehicleInfo.handelsbenaming} (${vehicleInfo.eerste_kleur})`);
                });
            });
        }
        else {
            msg.channel.send("Dat is geen geldig kenteken!! snap jy het wel").then(message => message.delete({timeout: 10000})).catch(console.error);
        }
        
    }
});

client.login(settings.token);