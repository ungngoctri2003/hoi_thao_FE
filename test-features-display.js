// Test script to verify FEATURES display fix
const API_BASE_URL = "http://localhost:4000/api/v1";

// Mock data to test the cleanFeatures function
const mockRoomData = [
  {
    ID: 1,
    NAME: "Phòng Workshop A",
    CAPACITY: 120,
    FEATURES: [
      "Có sẵn",
      "Có sẵn",
      "Không có",
      "Có sẵn",
      "Tính năng 8060",
      "Tính năng 8060",
      "Tính năng 470283",
      "DB_TYPE_CLOB",
      "Có sẵn",
      "Máy chiếu", // Valid feature
      "Hệ thống âm thanh", // Valid feature
      "WiFi", // Valid feature
    ],
  },
  {
    ID: 2,
    NAME: "Phòng Meeting B",
    CAPACITY: 20,
    FEATURES: [
      "Bảng trắng", // Valid feature
      "Máy lạnh", // Valid feature
      "null",
      "undefined",
      "[object Object]",
    ],
  },
  {
    ID: 3,
    NAME: "Phòng Conference C",
    CAPACITY: 100,
    FEATURES: null, // No features
  },
];

// Simulate the cleanFeatures function from the component
function cleanFeatures(features) {
  if (!Array.isArray(features)) return [];

  return features
    .map((feature) => {
      if (typeof feature === "string") {
        const cleaned = feature.trim();
        // Skip invalid or auto-generated values
        if (
          !cleaned ||
          cleaned === "null" ||
          cleaned === "undefined" ||
          cleaned === "[object Object]" ||
          cleaned === "DB_TYPE_CLOB" ||
          cleaned === "Có sẵn" ||
          cleaned === "Không có" ||
          cleaned.startsWith("Tính năng ")
        ) {
          return null;
        }
        return cleaned;
      }
      return null;
    })
    .filter((feature) => feature !== null && feature !== undefined);
}

// Test the cleanFeatures function
console.log("Testing cleanFeatures function...\n");

mockRoomData.forEach((room, index) => {
  console.log(`Room ${index + 1}: ${room.NAME}`);
  console.log("Original FEATURES:", room.FEATURES);

  const cleanedFeatures = cleanFeatures(room.FEATURES || []);
  console.log("Cleaned FEATURES:", cleanedFeatures);
  console.log("Valid features count:", cleanedFeatures.length);
  console.log("---");
});

// Test with actual API call
async function testWithAPI() {
  try {
    console.log("\n\nTesting with actual API...");

    const response = await fetch(`${API_BASE_URL}/venue/rooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch rooms:",
        response.status,
        response.statusText
      );
      return;
    }

    const data = await response.json();
    console.log("API Response received");

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((room, index) => {
        console.log(`\nRoom ${index + 1}: ${room.NAME}`);
        console.log("Raw FEATURES:", room.FEATURES);

        const cleanedFeatures = cleanFeatures(room.FEATURES || []);
        console.log("Cleaned FEATURES:", cleanedFeatures);

        // Simulate display logic
        if (cleanedFeatures.length > 0) {
          console.log("Display badges:", cleanedFeatures.slice(0, 2));
          if (cleanedFeatures.length > 2) {
            console.log(`+${cleanedFeatures.length - 2} more features`);
          }
        } else {
          console.log("No valid features to display");
        }
      });
    }
  } catch (error) {
    console.error("API test failed:", error);
  }
}

// Run tests
console.log("Running mock data tests...");
// Mock data tests are already run above

console.log(
  "\nTo test with actual API, uncomment the line below and add a valid token:"
);
// testWithAPI();
