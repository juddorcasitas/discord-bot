const strUtil = require("../util/strUtil");
const ytdl = require("ytdl-core");
const yt_search = require("youtube-search-api");
const Discord = require("discord.js")

module.exports = {
  name: "find",
  description: "Find a video to play in your channel!",
  async execute(message) {
    try {
      
      // get key words for search
      const keywords = strUtil.parseSearchArgs(message.content);
      // const args = message.content.split(" ");
      const queue = message.client.queue;
      const serverQueue = message.client.queue.get(message.guild.id);

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.channel.send(
          "You need to be in a voice channel to search music!"
        );
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
          "I need the permissions to join and speak in your voice channel!"
        );
      }

      var resp = await yt_search.GetListByKeyword(keywords.join(" "), false);

      if(resp){
        const items = resp.items
        message.channel.send(`Searching Related videos`);

        // get max 3 items - if less then just length
        const iter = items.length > 2 ? 3: items.length;

        for(let i = 0; i < iter; i++){
            var item = items[i];
            console.log(item);
            var title = item.title;
            var id = item.id;
            var vidLength = item.length.simpleText; 
            var thumb = item.thumbnail.thumbnails[0].url;
            var embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(title)
            // .setURL('https://discord.js.org/')
            // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription(`Length: ${vidLength}`)
            .setThumbnail(thumb)
            // .addFields(
            //     { name: 'Regular field title', value: 'Some value here' },
            //     { name: '\u200B', value: '\u200B' },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            // )
            .addField('Video ID', `${id}`, true)
            //.setImage('https://i.imgur.com/wSTFkRM.png')
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
            message.channel.send(embed)
        }
        
      }

    //   .then(res=>{
    //       const q = serverQueue;
    //       console.log(res);
    //       q.textChannel.send(`Searching Related videos`);
    //   })
    //   .catch(err=>{
    //       // no error handling right now
    //       const q = serverQueue;
    //       console.log(err)
    //       q.textChannel.send(`Uh Oh, something went wrong. Please try again`);
    //   });

    //   const songInfo = await ytdl.getInfo(args[1]);
    //   const song = {
    //     title: songInfo.videoDetails.title,
    //     url: songInfo.videoDetails.video_url
    //   };

    //     if (!serverQueue) {
    //     const queueContruct = {
    //         textChannel: message.channel,
    //         voiceChannel: voiceChannel,
    //         connection: null,
    //         songs: [],
    //         volume: 5,
    //         playing: true
    //     };

    //     queue.set(message.guild.id, queueContruct);

    //     queueContruct.songs.push(song);

    //     try {
    //       var connection = await voiceChannel.join();
    //       queueContruct.connection = connection;
    //       this.play(message, queueContruct.songs[0]);
    //     } catch (err) {
    //       console.log(err);
    //       queue.delete(message.guild.id);
    //       return message.channel.send(err);
    //     }
    //   } else {
    //     serverQueue.songs.push(song);
    //     return message.channel.send(
    //       `${song.title} has been added to the queue!`
    //     );
    //   }
    } catch (error) {
      console.log(error);
      message.channel.send(error.message);
    }
  },

  play(message, song) {
    const queue = message.client.queue;
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        this.play(message, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }
};
