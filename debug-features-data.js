// Debug script to check actual FEATURES data from database
const API_BASE_URL = "http://localhost:4000/api/v1";

async function debugFeaturesData() {
  try {
    console.log("🔍 Debugging FEATURES data from database...\n");

    const response = await fetch(`${API_BASE_URL}/venue/rooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
      },
    });

    if (!response.ok) {
      console.error(
        "❌ Failed to fetch rooms:",
        response.status,
        response.statusText
      );
      return;
    }

    const data = await response.json();
    console.log("✅ API Response received\n");

    if (data.data && Array.isArray(data.data)) {
      console.log(`📊 Found ${data.data.length} rooms\n`);

      data.data.forEach((room, index) => {
        console.log(`🏠 Room ${index + 1}: ${room.NAME}`);
        console.log("   📋 Raw FEATURES:", room.FEATURES);
        console.log("   🔍 FEATURES type:", typeof room.FEATURES);
        console.log("   📝 FEATURES isArray:", Array.isArray(room.FEATURES));

        if (Array.isArray(room.FEATURES)) {
          console.log("   📊 FEATURES length:", room.FEATURES.length);
          console.log("   📋 FEATURES items:");
          room.FEATURES.forEach((feature, featureIndex) => {
            console.log(
              `      ${
                featureIndex + 1
              }. "${feature}" (type: ${typeof feature})`
            );
          });
        }

        // Test cleanFeatures function
        const cleanFeatures = (features) => {
          if (!Array.isArray(features)) return [];

          return features
            .map((feature) => {
              if (typeof feature === "string") {
                const cleaned = feature.trim();
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
        };

        const validFeatures = cleanFeatures(room.FEATURES || []);
        console.log("   ✅ Valid features after cleaning:", validFeatures);
        console.log("   📊 Valid features count:", validFeatures.length);

        if (validFeatures.length === 0) {
          console.log("   ⚠️  No valid features found - will use fallback");
        }

        console.log("   " + "─".repeat(50));
      });
    } else {
      console.log("❌ No room data found in response");
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Run the debug
debugFeaturesData();
