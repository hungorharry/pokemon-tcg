const fs = require('fs');

async function testAlgolia() {
  const appId = '3XT9C4X62I';
  const apiKey = 'NjUxNjMzMGU0ZWVkM2EwYzYyYWNjNWY4MDUwYmRmYTBhNzI1OGZkNDQzODg3YzMwOGIxNGEwOWUwYjI2MWFkYmZpbHRlcnM9JTI4bWFya2V0cGxhY2VTb3VyY2UlM0Fjb2xsZWN0K09SK21hcmtldHBsYWNlU291cmNlJTNBYm8lMjkrQU5EKyUyOG1hcmtldHBsYWNlJTNBV0VFS0xZK09SK21hcmtldHBsYWNlJTNBUFJFTUlFUitPUittYXJrZXRwbGFjZSUzQUZJWEVEJTI5K0FORCslMjhOT1QrbWFya2V0cGxhY2VTb3VyY2UlM0FibytPUitOT1QrbWFya2V0cGxhY2UlM0FXRUVLTFklMjkrQU5EKyUyOE5PVCttYXJrZXRwbGFjZVNvdXJjZSUzQWJvK09SK05PVCttYXJrZXRwbGFjZSUzQVBSRU1JRVIlMjkrQU5EKyUyOE5PVCttYXJrZXRwbGFjZVNvdXJjZSUzQWNvbGxlY3QrT1IrTk9UK21hcmtldHBsYWNlJTNBRklYRUQlMjkrQU5EKyUyOE5PVCt2aXNpYmlsaXR5JTNBaW50ZXJuYWwlMjkmdmFsaWRVbnRpbD0xNzkyNTczMzQ0';
  const url = `https://${appId}-dsn.algolia.net/1/indexes/*/queries?x-algolia-application-id=${appId}&x-algolia-api-key=${apiKey}`;

  const body = {
    requests: [
      {
        indexName: 'listings',
        query: 'Snorlax',
        params: 'hitsPerPage=100&page=0'
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log('Status:', res.status);
    const data = await res.json();
    if (data.results && data.results[0]) {
      console.log('Total hits:', data.results[0].nbHits);
      console.log('Hits returned:', data.results[0].hits.length);
      console.log('Sample hit 0:', JSON.stringify(data.results[0].hits[0], null, 2));
    } else {
      console.log('Response:', data);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAlgolia();
