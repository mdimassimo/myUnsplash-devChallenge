const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configura la función Proxy
const functionName = 'proxyFunction';
const functionDefinition = `
  const fetch = require('node-fetch');

  exports.handler = async (event, context) => {
    try {
      const imageUrl = event.queryStringParameters.url;
      const response = await fetch(imageUrl);
      const imageBuffer = await response.buffer();

      return {
        statusCode: 200,
        body: imageBuffer.toString('base64'),
        isBase64Encoded: true,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error fetching image' }),
      };
    }
  };
`;

supabase.createFunction(functionName, functionDefinition);