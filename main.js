const WebSocket = require('ws');
const { promisify } = require('util');
const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.cyan.bold(`███████╗██╗     ██╗  ██╗     ██████╗██╗   ██╗██████╗ ███████╗██████╗`));
console.log(chalk.cyan.bold(`╚══███╔╝██║     ██║ ██╔╝    ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗`));
console.log(chalk.cyan.bold(`  ███╔╝ ██║     █████╔╝     ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝`));
console.log(chalk.cyan.bold(` ███╔╝  ██║     ██╔═██╗     ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗`));
console.log(chalk.cyan.bold(`███████╗███████╗██║  ██╗    ╚██████╗   ██║   ██████╔╝███████╗██║  ██║`));
console.log(chalk.cyan.bold(`╚══════╝╚══════╝╚═╝  ╚═╝     ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝`));
console.log(chalk.cyan.bold(`                 Running Teneo Node BETA CLI Version                 `));
console.log(chalk.cyan.bold(`                t.me/zlkcyber *** github.com/zlkcyber                `));

let socket = null;
let pingInterval;
let countdownInterval;
let potentialPoints = 0;
let countdown = "Calculating...";
let pointsTotal = 0;
let pointsToday = 0;

const reffCode = "OwAG3kib1ivOJG4Y0OCZ8lJETa6ypvsDtGmdhcjA";

const readFileAsync = promisify(fs.readFile);

async function readTokenFile() {
  try {
    const data = await readFileAsync('tokens.txt', 'utf8');
    const tokens = data.split('\n').map((line) => line.trim()).filter(Boolean);
    if (tokens.length === 0) {
      throw new Error('tokens.txt is empty.');
    }
    return tokens[0]; // Use the first token in the file
  } catch (error) {
    console.error('Error reading tokens.txt:', error.message);
    process.exit(1);
  }
}

async function connectWebSocket(token) {
  if (socket) return;
  const version = "v0.2";
  const url = "wss://secure.ws.teneo.pro";
  const wsUrl = `${url}/websocket?accessToken=${encodeURIComponent(token)}&version=${encodeURIComponent(version)}`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected at", new Date().toISOString());
    startPinging();
    startCountdownAndPoints();
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received message from WebSocket:", data);
    if (data.pointsTotal !== undefined && data.pointsToday !== undefined) {
      pointsTotal = data.pointsTotal;
      pointsToday = data.pointsToday;
    }
  };

  let reconnectAttempts = 0;
  socket.onclose = () => {
    socket = null;
    console.log("WebSocket disconnected");
    stopPinging();
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
    setTimeout(() => connectWebSocket(token), delay);
    reconnectAttempts++;
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
    stopPinging();
  }
}

function startPinging() {
  stopPinging();
  pingInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "PING" }));
    }
  }, 10000);
}

function stopPinging() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

function startCountdownAndPoints() {
  clearInterval(countdownInterval);
  updateCountdownAndPoints();
  countdownInterval = setInterval(updateCountdownAndPoints, 60 * 1000); // 1 minute interval
}

function updateCountdownAndPoints() {
  const now = new Date();
  const maxPoints = 25;
  potentialPoints = maxPoints; // Mock logic for now
  console.log("Total Points:", pointsTotal, "| Today Points:", pointsToday, "| Countdown:", countdown);
}

async function main() {
  try {
    const token = await readTokenFile();
    console.log("Successfully retrieved token from tokens.txt.");
    await connectWebSocket(token);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
