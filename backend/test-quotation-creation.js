const BASE_URL = 'http://localhost:3000';
let authToken = '';

async function login() {
  console.log('1. Logging in...');
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@operator.com',
      password: 'test123'
    })
  });
  const data = await response.json();

  // Debug: print the response structure
  console.log('   Login response:', JSON.stringify(data, null, 2));

  authToken = data.token || data.data?.token;
  if (!authToken) {
    throw new Error('No token received from login');
  }
  console.log('   ✓ Logged in successfully');
  console.log('   Token:', authToken.substring(0, 20) + '...');
  return data;
}

async function getClients() {
  console.log('\n2. Fetching B2C clients...');
  const response = await fetch(`${BASE_URL}/api/clients`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const data = await response.json();
  const clients = data.data?.b2c_clients || [];
  console.log(`   ✓ Found ${clients.length} B2C clients`);
  if (clients.length > 0) {
    console.log(`   First client: ${clients[0].full_name} (ID: ${clients[0].id})`);
  }
  return clients;
}

async function getB2BClients() {
  console.log('\n3. Fetching B2B clients...');
  const response = await fetch(`${BASE_URL}/api/operators-clients`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const data = await response.json();
  const clients = data.data?.b2b_clients || [];
  console.log(`   ✓ Found ${clients.length} B2B clients`);
  if (clients.length > 0) {
    console.log(`   First client: ${clients[0].full_name} (ID: ${clients[0].id})`);
  }
  return clients;
}

async function createQuotation(clientId, clientType) {
  console.log(`\n4. Creating quotation with ${clientType} client ID ${clientId}...`);

  const quotationData = {
    quotation_code: `TEST-${Date.now()}`,
    travel_dates_from: '2025-12-01',
    travel_dates_to: '2025-12-05',
    num_passengers: 2,
    total_amount: 1000,
    currency: 'EUR',
    valid_until: '2025-11-30',
    status: 'draft',
    notes: 'Test quotation',
    internal_notes: 'This is a test'
  };

  // Add the appropriate client field
  if (clientType === 'b2c') {
    quotationData.client_id = clientId;
  } else {
    quotationData.operators_client_id = clientId;
  }

  console.log('   Request data:', JSON.stringify(quotationData, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(quotationData)
    });
    const data = await response.json();

    if (!response.ok) {
      console.log('   ✗ Failed to create quotation');
      console.log('   Error:', data);
      throw new Error(JSON.stringify(data));
    }

    console.log('   ✓ Quotation created successfully!');
    console.log('   Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.log('   ✗ Failed to create quotation');
    console.log('   Error:', error.message);
    throw error;
  }
}

async function createTestClient() {
  console.log('\n--- Creating test B2C client ---');
  const clientData = {
    full_name: 'Test Client',
    email: 'testclient@example.com',
    phone: '+1234567890',
    is_active: true
  };

  const response = await fetch(`${BASE_URL}/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(clientData)
  });
  const data = await response.json();

  if (!response.ok) {
    console.log('   ✗ Failed to create test client');
    console.log('   Error:', data);
    throw new Error(JSON.stringify(data));
  }

  console.log('   ✓ Test client created successfully!');
  console.log('   Client ID:', data.id);
  return data;
}

async function main() {
  try {
    // Login
    await login();

    // Get clients
    let b2cClients = await getClients();
    const b2bClients = await getB2BClients();

    // Create a test client if none exist
    if (b2cClients.length === 0 && b2bClients.length === 0) {
      console.log('\n⚠ No clients found in database. Creating a test client...');
      const newClient = await createTestClient();
      b2cClients = [newClient];
    }

    // Try to create a quotation
    if (b2cClients.length > 0) {
      console.log('\n--- Testing with B2C Client ---');
      await createQuotation(b2cClients[0].id, 'b2c');
    } else if (b2bClients.length > 0) {
      console.log('\n--- Testing with B2B Client ---');
      await createQuotation(b2bClients[0].id, 'b2b');
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
