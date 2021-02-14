const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const https = require('https');

const logger = require('./logger');

let settings = {};

// load settings
if(fs.existsSync('settings.json')) {
    settings = JSON.parse(fs.readFileSync('settings.json'));
}
else {
    console.error('Settings file does not exist or is not accessible, exiting....\n');
    return;
}

const capitalizeString = function(string) {
    let words = string.split(' ');

    string = '';

    words.forEach(word => {
        if(word.length > 0) {
            string += word[0].toUpperCase() + word.substr(1, word.length - 1).toLowerCase() + ' ';
        }
    });

    return string;
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${settings.commandPrefix}k <kenteken>`);
});

client.ws.on('INTERACTION_CREATE', async interaction => {
    //console.log(interaction);

    if(interaction.data.name === 'gelezen') {
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                content: '<:gelezen:431784269703020547>'
                }
            }
        });
    }
    else {
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                content: '.'
                }
            }
        });
    }

    
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

        if (msg.content.length <= (settings.commandPrefix.length + 10) && kentekenRegex.test(kenteken)) {

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
                        logger(msg, 'fail');

                        msg.channel.send('Ik kon dat kenteken niet vindn kerol.');
                        return;
                    }

                    vehicleInfo = vehicleInfo[0];

                    vehicleInfo.handelsbenaming = vehicleInfo.handelsbenaming.replace(vehicleInfo.merk, '');

                    let bouwjaar = vehicleInfo.datum_eerste_toelating.substr(0, 4);

                    https.get(`https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${kenteken}`, requestOptions, (response) => {
                        let data = '';

                        response.on('data', (chunk) => {
                            data += chunk;
                        });

                        response.on('end', () => {
                            let brandstofInfo = JSON.parse(data);

                            if(brandstofInfo.length !== 0) {
                                brandstofInfo = brandstofInfo[0];

                                let pk = Math.round(brandstofInfo.nettomaximumvermogen * 1.362);

                                if(isNaN(pk)) {
                                    pk = 'Onbekend';
                                }

                                if(typeof vehicleInfo.catalogusprijs === 'undefined') {
                                    vehicleInfo.catalogusprijs = 'Onbekende catalogusprijs';
                                }
                                else {
                                    vehicleInfo.catalogusprijs = "€" + vehicleInfo.catalogusprijs;
                                }

                                let embed = new Discord.MessageEmbed()
                                    .setTitle(`${capitalizeString(vehicleInfo.merk)}${capitalizeString(vehicleInfo.handelsbenaming)}`)
                                    .setURL(`https://kentekencheck.nl/kenteken?i=${kenteken}`)
                                    .setDescription(`${capitalizeString(vehicleInfo.eerste_kleur)} - ${pk} pk - ${vehicleInfo.catalogusprijs} - ${bouwjaar}`)
                                    .setFooter(kenteken);

                                    logger(msg, 'success');

                                return msg.channel.send(embed);
                            }
                        });
                    });
                });
            });
        }
        else {
            logger(msg, 'fail');

            return msg.channel.send("Dat is geen geldig kenteken!! snap jy het wel").then(message => message.delete({timeout: 10000})).catch(console.error);
        }
        
    }
});

client.login(settings.token);