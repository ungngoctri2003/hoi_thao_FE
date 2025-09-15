// Patch for rooms management system - Features section
// Replace the features section in both Create and Edit dialogs

export const FeaturesSection = ({ 
  formData, 
  setFormData, 
  allFeatures, 
  newFeature, 
  setNewFeature, 
  addNewFeature 
}: {
  formData: any;
  setFormData: any;
  allFeatures: string[];
  newFeature: string;
  setNewFeature: (value: string) => void;
  addNewFeature: () => void;
}) => {
  return (
    <div>
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
    </div>
  );
};
