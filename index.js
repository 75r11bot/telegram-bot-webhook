const { Telegraf } = require("telegraf");
require("dotenv").config();
const http = require("http");

// Load environment variables
const { BOT_TOKEN, WEBHOOK_PATH, WEBHOOK_PORT } = process.env;

// Create a new Telegraf instance
const bot = new Telegraf(BOT_TOKEN);

// Set up a webhook handler
const webhookHandler = async (req, res) => {
  // Handle the incoming update
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling update:", error.message);
    res.status(500).send("Error");
  }
};

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === WEBHOOK_PATH && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      req.body = JSON.parse(body);
      webhookHandler(req, res);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start the HTTP server
const PORT = WEBHOOK_PORT || 3000;
server.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});

// Set the webhook
const WEBHOOK_URL = `https://yourdomain.com${WEBHOOK_PATH}`;
bot.telegram.setWebhook(WEBHOOK_URL);

// Start polling (if needed)
// bot.launch();
