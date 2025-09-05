// Simple test script to verify contact form API functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api/contact';

async function testContactAPI() {
  console.log('🧪 Testing Contact Form API...\n');

  try {
    // Test 1: Get concern types
    console.log('1. Testing GET /concern-types');
    const concernResponse = await fetch(`${API_BASE}/concern-types`);
    const concernData = await concernResponse.json();
    
    if (concernResponse.ok && concernData.success) {
      console.log('✅ Concern types fetched successfully');
      console.log(`   Found ${concernData.data.length} concern types`);
    } else {
      console.log('❌ Failed to fetch concern types:', concernData.error);
    }

    // Test 2: Submit valid contact form
    console.log('\n2. Testing POST /submit (valid data)');
    const validFormData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      concernType: 'general',
      subject: 'Test inquiry about products',
      message: 'This is a test message to verify the contact form functionality.'
    };

    const submitResponse = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validFormData)
    });

    const submitData = await submitResponse.json();
    
    if (submitResponse.ok && submitData.success) {
      console.log('✅ Contact form submitted successfully');
      console.log(`   Submission ID: ${submitData.submissionId}`);
    } else {
      console.log('❌ Failed to submit contact form:', submitData.error);
      if (submitData.details) {
        console.log('   Validation errors:', submitData.details);
      }
    }

    // Test 3: Submit invalid contact form (should fail)
    console.log('\n3. Testing POST /submit (invalid data)');
    const invalidFormData = {
      name: 'A', // Too short, single name
      email: 'invalid-email', // Invalid email format
      concernType: '', // Empty
      subject: 'Hi', // Too short, single word
      message: 'Short' // Too short, single word
    };

    const invalidResponse = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidFormData)
    });

    const invalidData = await invalidResponse.json();
    
    if (!invalidResponse.ok && invalidData.details) {
      console.log('✅ Validation working correctly - form rejected');
      console.log(`   Found ${invalidData.details.length} validation errors`);
    } else {
      console.log('❌ Validation not working - invalid form was accepted');
    }

    // Test 4: Test rate limiting (submit multiple times quickly)
    console.log('\n4. Testing rate limiting');
    const rateLimitPromises = [];
    for (let i = 0; i < 5; i++) {
      rateLimitPromises.push(
        fetch(`${API_BASE}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...validFormData,
            email: `test${i}@example.com`
          })
        })
      );
    }

    const rateLimitResponses = await Promise.all(rateLimitPromises);
    const rateLimitedCount = rateLimitResponses.filter(r => r.status === 429).length;
    
    if (rateLimitedCount > 0) {
      console.log('✅ Rate limiting working correctly');
      console.log(`   ${rateLimitedCount} requests were rate limited`);
    } else {
      console.log('⚠️  Rate limiting may not be working (all requests succeeded)');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Contact form API testing completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testContactAPI();
}

module.exports = testContactAPI;
