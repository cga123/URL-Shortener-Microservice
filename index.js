require('dotenv').config();
const express = require('express');
const cors = require('cors');
// 引入 dns 模組
const dns = require('dns');
// 引入 url 模組
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// 添加 body 解析中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL 存儲和計數器
const urlDatabase = {};
let shortUrlCounter = 1;

// POST 端點來創建短 URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = urlparser.parse(originalUrl);
  
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err || !parsedUrl.protocol || !parsedUrl.protocol.includes('http')) {
      res.json({ error: 'invalid url' });
    } else {
      const shortUrl = shortUrlCounter++;
      urlDatabase[shortUrl] = originalUrl;
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// GET 端點來重定向短 URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
