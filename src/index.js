import fs from 'fs';
import request from 'request-promise';
import Discord from 'discord.js';
import fetchArticles from './fetchArticles';

import * as config from '../config';

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

async function sendNotification(article, targets) {
  console.log(article);
  // Send notification to targets
  for (let target of targets) {
    let channel = client.channels.get(target);
    if (channel == null) return;
    return channel.send(article.author + '님이 새 글을 올렸습니다: \'' +
      article.title + '\'\n' + config.cafeURL + article.id);
  }
}

// TODO Separate naver cafe part

let seenFile = { lastId: Infinity };

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
  console.log('refresh');
  let articles = await fetchArticles(request, config.cafeId);
  // Compare articles against article Id in seen file
  let filteredArticles = articles.filter(v => v.id > seenFile.lastId);
  for (let article of filteredArticles) {
    // Send article info into discord
    await sendNotification(article, config.discordTarget);
  }
  let newId = articles.reduce((p, v) => Math.max(p, v.id), 0);
  if (seenFile.lastId !== newId) {
    seenFile.lastId = newId;
    saveSeenFile();
  }
}

setInterval(refresh, 10000);
