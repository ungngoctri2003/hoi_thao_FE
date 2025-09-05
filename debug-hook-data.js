// Script to debug hook data structure
console.log('🔍 Debugging hook data structure...');

// Simulate the data structure that should come from API
const mockApiResponse = {
  success: true,
  data: [
    {
      id: 1,
      userId: 1,
      conferenceId: 1,
      conferenceName: 'Hội nghị Công nghệ 2024',
      permissions: '{"conferences.view": true, "conferences.create": true, "attendees.view": true, "checkin.manage": true}',
      isActive: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      userId: 1,
      conferenceId: 2,
      conferenceName: 'Hội nghị AI & Machine Learning',
      permissions: '{"conferences.view": true, "attendees.view": true, "analytics.view": true}',
      isActive: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  meta: {
    total: 2,
    page: 1,
    limit: 100
  }
};

console.log('📊 Mock API Response:', JSON.stringify(mockApiResponse, null, 2));

// Simulate the transformation in useConferencePermissions hook
console.log('\n🔄 Simulating hook transformation...');

const permissions = mockApiResponse.data.map((assignment) => {
  console.log('Processing assignment:', assignment);
  
  const transformed = {
    conferenceId: assignment.conferenceId,
    conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
    permissions: typeof assignment.permissions === 'string' 
      ? JSON.parse(assignment.permissions) 
      : assignment.permissions || {},
    isActive: assignment.isActive === 1
  };
  
  console.log('Transformed:', transformed);
  return transformed;
});

console.log('\n✅ Final permissions array:', JSON.stringify(permissions, null, 2));

// Test getAvailableConferences function
const availableConferences = permissions.filter(cp => cp.isActive);
console.log('\n📋 Available conferences:', JSON.stringify(availableConferences, null, 2));

// Test getCurrentConferencePermissions function
const currentConferenceId = permissions.length > 0 ? permissions[0].conferenceId : null;
console.log('\n🎯 Current conference ID:', currentConferenceId);

if (currentConferenceId) {
  const currentPermissions = permissions.find(cp => cp.conferenceId === currentConferenceId && cp.isActive);
  console.log('Current permissions:', currentPermissions?.permissions || {});
}

console.log('\n🔍 Debug Summary:');
console.log('1. API response structure looks correct');
console.log('2. Data transformation should work');
console.log('3. Available conferences should be populated');
console.log('4. Current permissions should be available');

console.log('\n💡 If navbar still shows empty:');
console.log('- Check if API actually returns this data structure');
console.log('- Check if user ID matches in assignments');
console.log('- Check if isActive field is correct (1, not true)');
console.log('- Check if permissions JSON is valid');
console.log('- Check browser console for errors');

// Test with empty data
console.log('\n🧪 Testing with empty data...');
const emptyResponse = { success: true, data: [], meta: {} };
const emptyPermissions = emptyResponse.data.map((assignment) => ({
  conferenceId: assignment.conferenceId,
  conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
  permissions: typeof assignment.permissions === 'string' 
    ? JSON.parse(assignment.permissions) 
    : assignment.permissions || {},
  isActive: assignment.isActive === 1
}));

console.log('Empty permissions:', emptyPermissions);
console.log('Available conferences (empty):', emptyPermissions.filter(cp => cp.isActive));

console.log('\n✅ This explains why navbar shows "Không có hội nghị" when API returns empty array.');
