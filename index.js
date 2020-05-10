const botSettings = require("./botsettings.json");
const Discord = require('discord.js');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

var prefix = botSettings.prefix;
const myid = "253627942196871168";
const clid = "204997093067063296";
const mention_me = `<@!${myid}>`;
let link;

const bot = new Discord.Client();

function debug(string){ console.log("DEBUG: "+string.toUpperCase()); }

const commands = [];
commands[0] = [
    "userinfo",
    "setprefix",
    "rlrank",
    "invite",
];
commands[1] = [
    `**${prefix}userinfo [**_optional_**: mention]**\nShows information about a user`,
    `**${prefix}setprefix [**__required__**: prefix]**\nChange the used prefix (current: ${prefix})`,
    `**${prefix}rlrank [**_optional_**: Steam ID; **_optional_**: Game Mode]**\nWithout params gives ${mention_me}'s Rocket League 2v2 rank`,
    `**${prefix}invite**\nShows my invite link and the invite for festa dos brabo server`,
];

bot.on('ready', async () => {
    console.log(`Bot is ready ${bot.user.username}`);
    try{
        link = await bot.generateInvite(8);
        console.log(link);
    } catch(e){
        console.log(e.stack);
    }
    //online, idle, dnd (do not disturb), invisible
    bot.user.setPresence({ activity: { name: 'as Roadhog | ~help', type: 'PLAYING'}, status: 'online' })
        .then(console.log)
        .catch(console.error);
});

bot.on('message', async (msg) => {
    
    if(msg.author.bot) return;

    if(msg.channel.type === "dm") {return};

    let messageArray = msg.content.toLowerCase().replace(/\s+/g,' ').split(" ");
    console.log("messageArray ( .split(' ') ): "+messageArray);
    let command = messageArray[0];
    if(!command.startsWith(prefix)) return;
    command = command.slice(1);
    console.log("command: "+command);
    let args = messageArray.slice(1);
    console.log("args: "+args);

    //help
    if(command.trim() === `help`){
        
        let embed = new Discord.MessageEmbed();

        if(!args[0]){
            let i=0;
            let desc = "";
            while(i < commands[0].length){
                desc += commands[1][i]+"\n\n";
                i++;
            }
            embed.setTitle("Help").setDescription(desc);
        } else {
            let i=0;
            while(i < commands[0].length){
                if(args[0] == commands[0][i]) embed.setTitle("Help: "+commands[0][i]).setDescription(commands[1][i]);
                i++;
            }
        }

        msg.channel.send(embed);

        return;
    }

    let iter = 0;
    //userinfo
    if(command.trim() === `${commands[0][iter++]}`){
        let a;
        if (args.length > 0 && args[0][0] == '<' && args[0][1] == '@' && args[0][2] == '!'){
            let id = args[0].slice(3,args[0].length-1);
            a = bot.users.cache.get(id);
        } else a = msg.author;
        if(a == undefined){
            msg.channel.send("User not found. You need to mention someone.");
            return;
        }
        let embed = new Discord.MessageEmbed()
            .setImage(a.avatarURL())
            .setColor('#FF0000')
            .addField("Full Username", `${a.username}#${a.discriminator}`)
            .addField("ID", a.id)
            .addField("Created At", a.createdAt);
        
        msg.channel.send(embed);

        return;
    }

    //setprefix
    if(command.trim() === `${commands[0][iter++]}`){
        if(myid == msg.author.id || clid == msg.author.id){
            if(!args[0]){
                return;
            }
            let json_raw = fs.readFileSync('botsettings.json');
            let json = JSON.parse(json_raw);
            if(args[0].length > 1){
                msg.channel.send("The prefix has to be 1 character length");
                return;
            }
            json.prefix = args[0].trim();
            fs.writeFileSync("botsettings.json", JSON.stringify(json, null, 4), 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Inside writeFileSync");
            });
            
            prefix = json.prefix;
            bot.user.setPresence({ activity: { name: `as Roadhog | ${prefix}help`, type: 'PLAYING'}, status: 'online' })
                .then(console.log)
                .catch(console.error);
            msg.channel.send(`The prefix has changed to ${prefix}`);

            return;
        }
        else{
            msg.channel.send("You do not have permission.");
        }
    }
    
    //rlrank
    if(command.trim() === `${commands[0][iter++]}`){
        
        const season = "14";
        const mysteamid = "trocsson";

        function getRLRank(profile, gameMode){ 
            let url="https://rocketleague.tracker.network";
            let img_url = "";
            let rank = 0;
            profile = ""+profile; gameMode = ""+gameMode;
            if(profile == "") profile = mysteamid;
            if(gameMode == "") gameMode = "2v2";
            else if(profile == "" && gameMode != "") return "There is something wrong... Are you sure you are telling me your Steam ID?";
            return new Promise(resolve => {
                request(url+"/profile/steam/"+profile, (error, response, html) => {
                    if(!error && response.statusCode == 200){
                        const $ = cheerio.load(html);
                        var tbody = 0;
                        if(!$('.alert.alert-danger.alert-dismissable').html()){
                            if (5 == $('#season-'+season+'').find('.card-table.items')[0].children[1].children[1].children.length) tbody = 1;
                            //verify if "Reward Level" exists, and if it does, go for the next tbody
                            //rank = parseInt($('#season-'+season+'').find('.card-table.items').find('tbody')[tbody].children[(i*2+3)].children[9].children[0].data.replace(/,/, '').trim());
                            var i = 1;
                            let found = false;
                            var columns = $('#season-'+season).find('.card-table.items').find('tbody')[tbody].children;
                            if(gameMode.includes("solo")) while(i < columns.length && !found){
                                let data = columns[i].children[2].children[0].data.trim();
                                console.log(data.toLocaleLowerCase());
                                if(data.toLocaleLowerCase().includes(gameMode)) found = true; else i += 2;
                            } else while(i < columns.length && !found){
                                let data = columns[i].children[2].children[0].data.trim();
                                console.log(data.toLocaleLowerCase());
                                if(data.toLocaleLowerCase().includes(gameMode) && !data.toLocaleLowerCase().includes("solo")) found = true; else i += 2;
                            }
                            if(found){
                                rank = columns[i].children[2].children[0].data.trim();
                                rank += " -> " + columns[i].children[6].children[0].data.trim().replace(/,/, "");
                                img_url = url + "" + columns[i].children[1].children[1].attribs.src;
                            }
                            resolve({rank, img_url});
                        } else resolve("Did you spell your Steam ID right? I couldn't find it...");
                    } else resolve("The server did not reply, let's try again later.");
                });
            });
        }

        let profile = args[0] || mysteamid;
        let gameMode = args[1] || "2v2";

        let r = await getRLRank(profile, gameMode);
        
        if(profile == mysteamid) profile = mention_me;

        if(r == null) msg.channel.send(`<@${msg.author.id}>, there is something wrong...`);
        else if(r.rank){
            let embed = new Discord.MessageEmbed()
            .setDescription(`${profile}'s Rocket League rank (season ${season})\n\n**${r.rank}**`)
            .setImage(r.img_url)
            .setColor('#FF0000')
            
            msg.channel.send(embed);
        } else msg.channel.send(r);

        return;

    }

    //invite
    if(command.trim() === `${commands[0][iter++]}`){
        let serverID = "532633362460835870";
        let guild_name = bot.guilds.cache.get(serverID);
        msg.channel.send(`Invite me to a server: <${link}>\n${guild_name} server's invite: https://discord.gg/vz2SCqs`);
        return;
    }

});




bot.login(botSettings.token);