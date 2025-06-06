// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual values
const supabaseUrl = 'https://dogocszfppldzerxefyi.supabase.co';
const supabaseAnonKey = 'your-anon-key-here'; // Get this from Supabase dashboard

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test basic connection
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log('✅ Connection successful!');
    console.log('Available buckets:', data);

    // Check if ip-files bucket exists
    const ipFilesBucket = data.find((bucket) => bucket.name === 'ip-files');
    if (ipFilesBucket) {
      console.log('✅ ip-files bucket found!');
    } else {
      console.log(
        '❌ ip-files bucket not found. Please create it in Supabase dashboard.'
      );
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
