#!/usr/bin/env node

// Simple test script to verify backend API is working
const API_BASE_URL = 'http://localhost:3001/api';

async function testHealthCheck() {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testRegistration() {
  try {
    const testUser = {
      email: `test_${Date.now()}@demo.com`,
      password: 'password123',
      fullName: 'Test User',
      phone: '+91-9876543210',
      role: 'patient'
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    console.log('✅ Registration test:', {
      success: data.success,
      message: data.message,
      hasToken: !!data.token,
      hasUser: !!data.user
    });

    if (data.success) {
      // Test login with the same credentials
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        }),
      });

      const loginData = await loginResponse.json();
      console.log('✅ Login test:', {
        success: loginData.success,
        message: loginData.message,
        hasToken: !!loginData.token,
        hasUser: !!loginData.user
      });

      return { registrationToken: data.token, loginToken: loginData.token };
    }
  } catch (error) {
    console.log('❌ Registration/Login test failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Backend API...\n');
  
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend not running. Please start the backend server first.');
    return;
  }
  
  console.log('\n🧪 Testing Registration and Login...');
  const tokens = await testRegistration();
  
  if (tokens) {
    console.log('\n✅ All tests passed! Backend API is working correctly.');
    console.log('📝 You can now test the frontend registration and login flow.');
  } else {
    console.log('\n❌ Tests failed. Check the backend logs for errors.');
  }
}

runTests();
