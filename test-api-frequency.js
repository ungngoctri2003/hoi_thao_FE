// Test script để kiểm tra tần suất gọi API
const API_BASE_URL = "http://localhost:4000/api/v1";

let callCount = 0;
let lastCallTime = null;
let callInterval = null;

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
}

function makeAPICall() {
  callCount++;
  lastCallTime = new Date();

  log(`📞 API Call #${callCount} - ${lastCallTime.toISOString()}`);

  fetch(`${API_BASE_URL}/attendees`, {
    headers: {
      Authorization: `Bearer ${
        localStorage.getItem("accessToken") || "test-token"
      }`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        log(`✅ Call #${callCount} - Success (${response.status})`);
      } else {
        log(`❌ Call #${callCount} - Failed (${response.status})`);
      }
    })
    .catch((error) => {
      log(`❌ Call #${callCount} - Error: ${error.message}`);
    });
}

function startMonitoring() {
  log("🔍 Starting API call monitoring...");
  log("This will make an API call every 2 seconds to test frequency");

  callInterval = setInterval(() => {
    makeAPICall();
  }, 2000);

  // Stop after 30 seconds
  setTimeout(() => {
    stopMonitoring();
  }, 30000);
}

function stopMonitoring() {
  if (callInterval) {
    clearInterval(callInterval);
    callInterval = null;
    log(`🛑 Monitoring stopped. Total calls made: ${callCount}`);
  }
}

// Auto-start monitoring
log("🚀 API Frequency Test loaded");
log("Starting monitoring in 2 seconds...");

setTimeout(() => {
  startMonitoring();
}, 2000);

// Handle process exit
process.on("SIGINT", () => {
  log("🛑 Received SIGINT, stopping monitoring...");
  stopMonitoring();
  process.exit(0);
});
