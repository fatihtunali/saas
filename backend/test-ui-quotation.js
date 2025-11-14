const BASE_URL = 'http://localhost:3000';
let authToken = '';

async function login() {
  console.log('1. Logging in as test@operator.com...');
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@operator.com',
      password: 'test123'
    })
  });
  const data = await response.json();
  authToken = data.data.token;
  console.log('   ✓ Logged in successfully\n');
  return data;
}

async function testQuotationCreation() {
  console.log('2. Testing quotation creation (simulating UI form submission)...\n');

  // This simulates exactly what the frontend does
  const formData = {
    quotation_code: `TEST-B2C-${Date.now()}`,  // Unique code for testing
    travel_dates_from: '2025-12-01',
    travel_dates_to: '2025-12-05',
    num_passengers: 2,
    total_amount: 0,  // Empty initially
    currency: 'EUR',
    valid_until: '2025-11-30',
    status: 'draft',
    notes: '',
    internal_notes: '',
    client_id: 1,  // Selected B2C client
    operators_client_id: null
  };

  console.log('   Form data being sent:');
  console.log('   - Client ID (B2C):', formData.client_id);
  console.log('   - Operators Client ID (B2B):', formData.operators_client_id);
  console.log('   - Travel dates:', formData.travel_dates_from, 'to', formData.travel_dates_to);
  console.log('   - Passengers:', formData.num_passengers);
  console.log('   - Currency:', formData.currency);
  console.log('');

  // Simulate the frontend's data preparation (from create/page.tsx lines 191-212)
  const quotationData = {
    quotationCode: formData.quotation_code,
    travelDatesFrom: formData.travel_dates_from,
    travelDatesTo: formData.travel_dates_to,
    numPassengers: formData.num_passengers,
    totalAmount: formData.total_amount,
    currency: formData.currency,
    validUntil: formData.valid_until,
    status: formData.status,
    notes: formData.notes,
    internalNotes: formData.internal_notes,
  };

  // Add client fields only if they have values (our fix)
  if (formData.client_id) {
    quotationData.clientId = formData.client_id;
  }
  if (formData.operators_client_id) {
    quotationData.operatorsClientId = formData.operators_client_id;
  }

  console.log('   Transformed API payload:');
  console.log(JSON.stringify(quotationData, null, 2));
  console.log('');

  try {
    const response = await fetch(`${BASE_URL}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(quotationData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('   ❌ FAILED - Server returned error:');
      console.log('   Status:', response.status);
      console.log('   Error:', result);
      return false;
    }

    console.log('   ✅ SUCCESS - Quotation created!');
    console.log('   Response:');
    console.log('   - ID:', result.id);
    console.log('   - Client ID:', result.client_id);
    console.log('   - Operators Client ID:', result.operators_client_id);
    console.log('   - Status:', result.status);
    console.log('   - Total Amount:', result.total_amount);
    console.log('');
    return true;

  } catch (error) {
    console.log('   ❌ FAILED - Exception:', error.message);
    return false;
  }
}

async function testWithB2BClient() {
  console.log('3. Testing with B2B client selection...\n');

  const formData = {
    quotation_code: `TEST-B2B-${Date.now()}`,  // Unique code for testing
    travel_dates_from: '2025-12-10',
    travel_dates_to: '2025-12-15',
    num_passengers: 4,
    total_amount: 0,
    currency: 'EUR',
    valid_until: '2025-12-05',
    status: 'draft',
    notes: '',
    internal_notes: '',
    client_id: null,  // Not selected
    operators_client_id: 2  // Selected B2B client
  };

  const quotationData = {
    quotationCode: formData.quotation_code,
    travelDatesFrom: formData.travel_dates_from,
    travelDatesTo: formData.travel_dates_to,
    numPassengers: formData.num_passengers,
    totalAmount: formData.total_amount,
    currency: formData.currency,
    validUntil: formData.valid_until,
    status: formData.status,
    notes: formData.notes,
    internalNotes: formData.internal_notes,
  };

  if (formData.client_id) {
    quotationData.clientId = formData.client_id;
  }
  if (formData.operators_client_id) {
    quotationData.operatorsClientId = formData.operators_client_id;
  }

  console.log('   Testing B2B client (ID:', formData.operators_client_id, ')');

  try {
    const response = await fetch(`${BASE_URL}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(quotationData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('   ❌ FAILED');
      console.log('   Error:', result);
      return false;
    }

    console.log('   ✅ SUCCESS - B2B Quotation created!');
    console.log('   - ID:', result.id);
    console.log('   - Operators Client ID:', result.operators_client_id);
    console.log('');
    return true;

  } catch (error) {
    console.log('   ❌ FAILED:', error.message);
    return false;
  }
}

async function testValidation() {
  console.log('4. Testing validation (no client selected)...\n');

  const quotationData = {
    quotationCode: '',
    travelDatesFrom: '2025-12-01',
    travelDatesTo: '2025-12-05',
    numPassengers: 2,
    totalAmount: 0,
    currency: 'EUR',
    status: 'draft',
  };
  // Intentionally NOT adding clientId or operatorsClientId

  console.log('   Sending request WITHOUT any client field...');

  try {
    const response = await fetch(`${BASE_URL}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(quotationData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('   ✅ CORRECT - Server rejected (as expected)');
      console.log('   Error:', result.error || result.message);
      console.log('');
      return true;
    }

    console.log('   ❌ WRONG - Should have been rejected but succeeded!');
    return false;

  } catch (error) {
    console.log('   Exception:', error.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('   UI QUOTATION CREATION TEST');
  console.log('========================================\n');

  try {
    await login();

    const test1 = await testQuotationCreation();
    const test2 = await testWithB2BClient();
    const test3 = await testValidation();

    console.log('========================================');
    console.log('   TEST RESULTS');
    console.log('========================================');
    console.log('B2C Client Test:', test1 ? '✅ PASS' : '❌ FAIL');
    console.log('B2B Client Test:', test2 ? '✅ PASS' : '❌ FAIL');
    console.log('Validation Test:', test3 ? '✅ PASS' : '❌ FAIL');
    console.log('========================================\n');

    if (test1 && test2 && test3) {
      console.log('🎉 ALL TESTS PASSED! The UI form should work correctly.\n');
      process.exit(0);
    } else {
      console.log('⚠️  SOME TESTS FAILED. There may be issues.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
