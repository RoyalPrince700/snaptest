const fetch = require('node-fetch');

const API_KEY = 'fw_3ZUSMveNEMr96CoCdBtLosU1';
const MODEL = 'accounts/fireworks/models/llama4-maverick-instruct-basic';

async function testFireworks() {
  const res = await fetch('https://api.fireworks.ai/inference/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: 'Hello, world!',
      max_tokens: 10
    })
  });

  const data = await res.json();
  console.log(data);
}

testFireworks(); 