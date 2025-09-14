// Simple API test script
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Yardstick SaaS Notes API\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.test',
        password: 'password'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.user ? 'Success' : 'Failed');

    if (loginData.token) {
      const token = loginData.token;
      
      // Test notes endpoints
      console.log('\n3. Testing notes CRUD...');
      
      // Create note
      const createResponse = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Note',
          content: 'This is a test note content'
        })
      });
      const note = await createResponse.json();
      console.log('✅ Create note:', note.id ? 'Success' : 'Failed');

      // List notes
      const listResponse = await fetch(`${BASE_URL}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const notes = await listResponse.json();
      console.log('✅ List notes:', notes.length, 'notes found');

      // Test upgrade (admin only)
      console.log('\n4. Testing subscription upgrade...');
      const upgradeResponse = await fetch(`${BASE_URL}/tenants/acme/upgrade`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const upgradeData = await upgradeResponse.json();
      console.log('✅ Upgrade:', upgradeData.message || upgradeData.error);
    }

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
