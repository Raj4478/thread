const shortLivedToken = 'THAARUiyqfzCNBUVFrd2Y1UzA1X1pSNEt1ZAGxSWFVNQnAtbGJ4dEVNdUxrRFlGd0hKMlRiWGtYdm5YZAmt1RGlVMjBlRTdTeTVkUVVFSnJmRktiSmJTTlBBOGlDT0RoR1p6ZADZAsb3lNQzlQcXBWQ3lHbXFQeWVpemQzX1JrTExfcjdPUnpnZAThHQkhXRi1WeVFFUlZABeWN3VS1kQQZDZD'; // Replace with your valid token

const appSecret = '77c2e7950ef71155f53cf5bb5573982a';

const url = `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.access_token) {
      console.log('✅ Long-lived token:', data.access_token);
      console.log('⏳ Expires in:', data.expires_in, 'seconds');
    } else {
      console.error('❌ Error:', data);
    }
  })
  .catch(error => {
    console.error('❌ Fetch error:', error);
  });
