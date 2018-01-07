import fs from 'fs';
import request from 'request-promise';
import Discord from 'discord.js';
import fetchArticles from './fetchArticles';

const config = require(process.env.CONFIG_DIR || '../config');

// TODO Separate discord part

let client = new Discord.Client();
client.on('error', err => {
  console.error(err);
});
client.on('disconnect', (msg, code) => {
  if (code === 0) console.error(msg);
  setTimeout(() => {
    client.connected = false;
    client.connect();
  }, 1000);
});
client.login(config.discordToken);
client.on('connect', refresh);

async function sendNotification(article, url, targets) {
  console.log(article);
  // Send notification to targets
  for (let target of targets) {
    let channel = client.channels.get(target);
    if (channel == null) return;
    await channel.send(article.author + '님이 새 글을 올렸습니다: \'' +
      article.title + '\'\n' + url + article.id);
  }
}

// TODO Separate naver cafe part

let seenFile = { lastIds: {} };

try {
  seenFile = JSON.parse(fs.readFileSync('./seen.json', 'utf-8'));
} catch (e) {
}

function saveSeenFile() {
  fs.writeFile('./seen.json', JSON.stringify(seenFile), err => {
    if (err) console.error(err);
  });
}

async function refresh() {
  console.log('Refreshing...');
  let shouldSave = false;
  for (let target of config.targets) {
    let articles = await fetchArticles(request, target.id);
    // Compare articles against article Id in seen file
    let filteredArticles = articles.filter(
      v => v.id > seenFile.lastIds[target.id]);
    for (let article of filteredArticles) {
      // Send article info into discord
      await sendNotification(article, target.url, target.channels);
    }
    let newId = articles.reduce((p, v) => Math.max(p, v.id), 0);
    if (seenFile.lastIds[target.id] !== newId) {
      seenFile.lastIds[target.id] = newId;
      shouldSave = true;
    }
  }
  if (shouldSave) saveSeenFile();
}

setInterval(refresh, 2 * 60 * 1000);
