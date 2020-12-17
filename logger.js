module.exports = function(msg, type) {
    let log = '';

    if(msg.channel.type === 'text') {
        log += `[${msg.guild.name}(${msg.guild.id})]`;
    }
    else {
        log += "[DM]";
    }

    let color = '\x1b[31m';

    if(type === 'success') {
        color = '\x1b[32m';
    }

    log += ` - ${msg.author.username}#${msg.author.discriminator}(${msg.author.id}) - ${msg.content} - ${color}${type}\x1b[0m`;

    console.log(log);
}