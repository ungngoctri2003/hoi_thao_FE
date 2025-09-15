const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, 'components/rooms/rooms-management-system.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import for Input and Button if not already present
if (!content.includes('import { Input } from "@/components/ui/input"')) {
  content = content.replace(
    'import { Input } from "@/components/ui/input";',
    'import { Input } from "@/components/ui/input";'
  );
}

// Add state for all features and new feature
const stateAddition = `  // State for all available features
  const [allFeatures, setAllFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");`;

if (!content.includes('const [allFeatures, setAllFeatures]')) {
  content = content.replace(
    '  const [formData, setFormData] = useState({',
    `${stateAddition}\n\n  const [formData, setFormData] = useState({`
  );
}

// Add useEffect to extract features
const featuresExtraction = `
  // Extract all unique features from rooms
  useEffect(() => {
    if (rooms.length > 0) {
      const featuresSet = new Set<string>();
      rooms.forEach(room => {
        if (room.features && Array.isArray(room.features)) {
          room.features.forEach(feature => {
            if (feature && typeof feature === 'string' && feature.trim()) {
              featuresSet.add(feature.trim());
            }
          });
        }
      });
      
      // Add some common features that might not be in the database yet
      const commonFeatures = [
        "Máy chiếu",
        "Hệ thống âm thanh",
        "Bảng trắng",
        "Máy lạnh",
        "Hệ thống video call",
        "Ghi âm",
        "WiFi",
        "Nước uống",
        "Bàn họp",
        "Ghế xoay",
        "Màn hình LED",
        "Điều hòa riêng",
        "Hội trường lớn",
        "Hệ thống âm thanh chuyên nghiệp",
        "Máy chiếu 4K",
        "Máy chiếu HD",
        "Phòng hội nghị",
        "Phòng họp lớn",
        "Phòng họp",
        "Phòng nhỏ",
        "Bàn thực hành",
        "Thiết bị thực hành",
        "Không gian sáng tạo",
        "Bảng viết",
        "Nội thất cao cấp",
        "Projector",
        "Whiteboard",
        "Coffee Machine",
        "Sound System",
        "Video Conferencing",
        "Air Conditioning"
      ];
      
      commonFeatures.forEach(feature => featuresSet.add(feature));
      
      setAllFeatures(Array.from(featuresSet).sort());
    }
  }, [rooms]);`;

if (!content.includes('// Extract all unique features from rooms')) {
  content = content.replace(
    '  // Load data\n  useEffect(() => {\n    loadData();\n  }, []);',
    `  // Load data\n  useEffect(() => {\n    loadData();\n  }, []);${featuresExtraction}`
  );
}

// Add addNewFeature function
const addFeatureFunction = `
  // Add new feature
  const addNewFeature = () => {
    if (newFeature.trim() && !allFeatures.includes(newFeature.trim())) {
      setAllFeatures(prev => [...prev, newFeature.trim()].sort());
      setNewFeature("");
    }
  };`;

if (!content.includes('// Add new feature')) {
  content = content.replace(
    '  // Open edit dialog',
    `${addFeatureFunction}\n\n  // Open edit dialog`
  );
}

// Replace the features section in Create dialog
const createFeaturesSection = `            <div>
              <label className="text-sm font-medium">Tính năng</label>
              
              {/* Add new feature input */}
              <div className="flex gap-2 mt-2 mb-4">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Thêm tính năng mới..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addNewFeature();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addNewFeature}
                  variant="outline"
                  size="sm"
                  disabled={!newFeature.trim()}
                >
                  Thêm
                </Button>
              </div>

              {/* Features checkboxes */}
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {allFeatures.map((feature) => (
                  <label key={feature} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            features: [...formData.features, feature],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            features: formData.features.filter(
                              (f) => f !== feature
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
              
              {/* Selected features count */}
              <div className="text-xs text-gray-500 mt-2">
                Đã chọn {formData.features.length} tính năng
              </div>
            </div>`;

// Replace the old features section
const oldFeaturesPattern = /            <div>\s*<label className="text-sm font-medium">Tính năng<\/label>\s*<div className="grid grid-cols-2 gap-2 mt-2">\s*{\[\s*"Máy chiếu",[\s\S]*?<\/div>\s*<\/div>/g;

content = content.replace(oldFeaturesPattern, createFeaturesSection);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Successfully updated rooms management system with enhanced features!');
console.log('📋 Features now include:');
console.log('  - All features from database');
console.log('  - Common features list');
console.log('  - Add new features functionality');
console.log('  - Scrollable checkbox list');
console.log('  - Selected features counter');
