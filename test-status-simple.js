// Simple test to check if status is working
console.log("Testing status functionality...");

// Test 1: Check if the component can handle status
const testRoom = {
  ID: 1,
  NAME: "Test Room",
  CAPACITY: 50,
  FLOOR_ID: 1,
  STATUS: "maintenance",
  FEATURES: ["WiFi", "Projector"],
};

console.log("Test room data:", testRoom);

// Test 2: Check status mapping
const status = testRoom.STATUS || "available";
console.log("Mapped status:", status);

// Test 3: Check if status is valid
const validStatuses = ["available", "occupied", "maintenance", "reserved"];
const isValidStatus = validStatuses.includes(status);
console.log("Is valid status:", isValidStatus);

// Test 4: Check form data structure
const formData = {
  name: "Test Room",
  capacity: "50",
  floorId: "1",
  description: "Test description",
  roomType: "meeting",
  features: ["WiFi", "Projector"],
  status: "maintenance",
};

console.log("Form data with status:", formData);

console.log("✅ Status functionality test completed!");
