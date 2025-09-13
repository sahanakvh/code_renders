#!/usr/bin/env node

// Test registration API call
async function testRegistration() {
  try {
    const testUser = {
      email: "test_user_" + Date.now() + "@demo.com",
      password: "password123",
      fullName: "Test User Registration",
      phone: "9035458788",
      role: "patient"
    };

    console.log('🧪 Testing registration with:', {
      email: testUser.email,
      fullName: testUser.fullName,
      role: testUser.role
    });

    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', data);

    if (data.success) {
      console.log('✅ Registration successful!');
      console.log('👤 User ID:', data.user?.id);
      console.log('🔑 Token received:', !!data.token);
    } else {
      console.log('❌ Registration failed:', data.message);
    }

  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

testRegistration();
