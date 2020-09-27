const { MessageEmbed } = require('discord.js');

const instructionsUrl = 'https://github.com/tanndev/silence-among-us#readme';

const commands = [
    '`version|v`: Get version information.',
    '`help|h|?`: Get this help.',
    '`lobby|l`: Re-post information about your lobby.',
    '`lobby|l start [room code] [na|eu|asia]`: Start a new lobby.',
    '`lobby|l stop`: End your lobby.',
    '`lobby|l room|r <room code> [na|eu|asia]`: Update the room information of your lobby.',
    '`lobby|l room|r unlist|remove|x`: Remove the room information of your lobby.',
    '`intermission|i`: Mark your lobby as being in intermission.',
    '`working|work|w`: Mark your lobby as working on tasks.',
    '`meeting|meet|m`: Mark your lobby as being in a meeting.',
    '`dead|kill|d|k <@mentions...>`: Mark the at-mentioned players as being dead.',
    '`revive <@mentions...>`: Mark any at-mentioned players as being alive.'
].map(command => `\t- ${command}`).join('\n');

const examples = [
    '`!sau lobby start`: Start a new lobby with no room code.',
    '`!sl start abcdef eu`: Start a new lobby with a room code.',
    '`!sau work`: Start a new game, from intermission, or end a meeting.',
    '`!sw`: Same thing as `!sau work`, but shorter.',
    '`!sk me @tanner`: Mark yourself and @tanner as dead. (Must be a real at-mention)'
].map(command => `\t- ${command}`).join('\n');

const helpEmbed = new MessageEmbed()
    .setTitle("Silence Among Us - Help")
    .setURL(instructionsUrl)
    .setDescription("Use `!sau <command>` or `!s<command>` to tell me what to do.\nI'll use your current voice channel to find your lobby.")
    .addField('Available Commands', `${commands}\n\nSee the [instructions](${instructionsUrl}) for more details.`)
    .addField('Examples', examples);

module.exports = async function helpCommand(message) {
    return message.channel.send(helpEmbed);
};