// Test JWT authentication and role-based access
const BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
  console.log('🧪 Testing JWT Authentication and Role-Based Access\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test admin login
    console.log('\n2. Testing admin login...');
    const adminLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.test',
        password: 'password'
      })
    });
    const adminData = await adminLoginResponse.json();
    
    if (adminData.token) {
      console.log('✅ Admin login successful');
      console.log('   User role:', adminData.user.role);
      console.log('   Tenant:', adminData.user.tenant_slug);
      
      // Test admin-only features
      console.log('\n3. Testing admin-only user invitation...');
      const inviteResponse = await fetch(`${BASE_URL}/users/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminData.token}`
        },
        body: JSON.stringify({
          email: 'newuser@acme.test',
          role: 'member'
        })
      });
      
      if (inviteResponse.ok) {
        const inviteData = await inviteResponse.json();
        console.log('✅ Admin can invite users:', inviteData.message);
      } else {
        const errorData = await inviteResponse.json();
        console.log('❌ Admin invitation failed:', errorData.error);
      }
      
      // Test admin-only upgrade
      console.log('\n4. Testing admin-only subscription upgrade...');
      const upgradeResponse = await fetch(`${BASE_URL}/tenants/acme/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminData.token}`
        }
      });
      
      if (upgradeResponse.ok) {
        const upgradeData = await upgradeResponse.json();
        console.log('✅ Admin can upgrade subscription:', upgradeData.message);
      } else {
        const errorData = await upgradeResponse.json();
        console.log('❌ Admin upgrade failed:', errorData.error);
      }
    } else {
      console.log('❌ Admin login failed:', adminData.error);
    }

    // Test member login
    console.log('\n5. Testing member login...');
    const memberLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@acme.test',
        password: 'password'
      })
    });
    const memberData = await memberLoginResponse.json();
    
    if (memberData.token) {
      console.log('✅ Member login successful');
      console.log('   User role:', memberData.user.role);
      console.log('   Tenant:', memberData.user.tenant_slug);
      
      // Test member restrictions
      console.log('\n6. Testing member restrictions...');
      const memberInviteResponse = await fetch(`${BASE_URL}/users/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${memberData.token}`
        },
        body: JSON.stringify({
          email: 'test@acme.test',
          role: 'member'
        })
      });
      
      if (memberInviteResponse.status === 403) {
        const errorData = await memberInviteResponse.json();
        console.log('✅ Member correctly restricted from inviting users:', errorData.error);
      } else {
        console.log('❌ Member should not be able to invite users');
      }
      
      // Test member upgrade capability
      console.log('\n7. Testing member upgrade capability...');
      const memberUpgradeResponse = await fetch(`${BASE_URL}/tenants/acme/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${memberData.token}`
        }
      });
      
      if (memberUpgradeResponse.ok) {
        const upgradeData = await memberUpgradeResponse.json();
        console.log('✅ Member can upgrade subscription:', upgradeData.message);
      } else {
        const errorData = await memberUpgradeResponse.json();
        console.log('❌ Member upgrade failed:', errorData.error);
      }
    } else {
      console.log('❌ Member login failed:', memberData.error);
    }

    console.log('\n🎉 Authentication and role-based access tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };
