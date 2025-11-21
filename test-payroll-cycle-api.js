// Test script to check Payroll Cycle API response
// Run this in browser console or Node.js environment

const API_BASE_URL = 'https://hrms-backend-omega.vercel.app/api/v1';
const ENDPOINT = '/payroll_cycles/one';

// You'll need to replace these with actual values
const PAYROLL_CYCLE_ID = 'YOUR_PAYROLL_CYCLE_ID_HERE'; // Get this from payroll cycles list
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Get from localStorage.getItem('hrms_auth_token')

async function testPayrollCycleAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        id: PAYROLL_CYCLE_ID,
        include: {
          organisation: true
        }
      })
    });

    const data = await response.json();
    console.log('=== API Response ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.status && data.data) {
      console.log('\n=== Payroll Cycle Data ===');
      console.log('ID:', data.data.id);
      console.log('Name:', data.data.name);
      console.log('Status:', data.data.status);
      console.log('Pay Period Start:', data.data.pay_period_start);
      console.log('Pay Period End:', data.data.pay_period_end);
      console.log('Salary Month:', data.data.salary_month);
      console.log('Salary Year:', data.data.salary_year);
      console.log('Working Days:', data.data.working_days);
      
      if (data.data.organisation) {
        console.log('\n=== Organisation Data (Included) ===');
        console.log(JSON.stringify(data.data.organisation, null, 2));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

// Uncomment to run:
// testPayrollCycleAPI();

