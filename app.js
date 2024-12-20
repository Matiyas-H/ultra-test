const express = require('express');
const app = express();
require('dotenv').config();
// Important! Make sure body parsing is properly set up
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const toolsBaseUrl = 'https://ef3a-91-156-168-230.ngrok-free.app';

// Enhanced proxy endpoint with better error handling
app.post('/api/proxy-message', async (req, res) => {
  console.log('=== Received Tool Call from AI ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  const { summaryData } = req.body;

  if (!summaryData) {
    return res.status(400).json({
      success: false,
      error: 'Missing summaryData in request body'
    });
  }

  // Immediately respond to the AI
  res.json({
    success: true,
    messageId: Date.now(), // Generate a temporary ID
    message: 'Message received and processing'
  });

  // Process the API call asynchronously
  (async () => {
    try {
      const response = await fetch('https://app.omnia-voice.com/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXTJS_API_KEY}`
        },
        body: JSON.stringify(summaryData)
      });

      const data = await response.json();
      console.log('API Response:', data);

    } catch (error) {
      console.error('Background API call failed:', error);
      // Here you could implement retry logic or error reporting
    }
  })();
});

const selectedTools = [
  {
    "temporaryTool": {
      "modelToolName": "sendCallSummary",
      "description": "Send call summary to database. Will respond with success message when done.",
      "dynamicParameters": [{
        "name": "summaryData",
        "location": "PARAMETER_LOCATION_BODY",
        "schema": {
          "type": "object",
          "properties": {
            "telyxNumber": {
              "type": "string",
              "description": "Number that was called"
            },
            "callerNumber": {
              "type": "string",
              "description": "Phone number of the caller"
            },
            "callerName": {
              "type": "string",
              "description": "Name of the caller"
            },
            "purpose": {
              "type": "string",
              "description": "Purpose of the call"
            },
            "location": {
              "type": "string",
              "description": "Where they're calling from"
            },
            "message": {
              "type": "string",
              "description": "Their message"
            }
          },
          "required": ["telyxNumber", "callerNumber", "callerName", "purpose", "location", "message"]
        },
        "required": true
      }],
      "http": {
        "baseUrlPattern": `${toolsBaseUrl}/api/proxy-message`,
        "httpMethod": "POST"
      }
    }
  }
];

app.post('/voice', async (req, res) => {
  try {
    const callerNumber = req.body.From;
    const telyxNumber = req.body.To;

    console.log(`Incoming call from ${callerNumber} to ${telyxNumber}`);

    // Format the phone number for the API call
    const formattedNumber = encodeURIComponent(telyxNumber);

    // Fetch AI configuration with better error handling
    let config;
    try {
      const configResponse = await fetch(
        `https://app.omnia-voice.com/api/ai-config?phone_number=${formattedNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXTJS_API_KEY}`
          }
        }
      );

      if (!configResponse.ok) {
        console.error('AI Config API Error:', await configResponse.text());
        throw new Error(`AI Config API returned ${configResponse.status}`);
      }

      config = await configResponse.json();
      console.log('Fetched AI configuration:', config);

    } catch (configError) {
      console.error('Error fetching AI configuration:', configError);
      // Use default configuration if API call fails
      config = {
        data: {
          greeting: "Hello, this is Sarah speaking. How may I help you today?",
          context: "You are a professional personal assistant.",
          userName: ""
        }
      };
      console.log('Using default configuration due to API error');
    }

    const callData = {
      systemPrompt: `You are an AI assistant for ${config.data.userName}. ${config.data.context}

EXACT SEQUENCE TO FOLLOW:

1. START CALL:
Say exactly: "${config.data.greeting}"

2. ASK QUESTIONS:
- Ask each question from "${config.data.questions}" ONE AT A TIME
- Wait for answer before asking next question

3. WHEN ALL QUESTIONS ARE ANSWERED:
- Say "Hetki pieni ja kirjoitan viestin ylös"
- IMMEDIATELY use sendCallSummary with collected information
- Say "Kiitos [caller's name], välitän viestisi ${config.data.userName}lle. Hän on yhteydessä sinuun vapauduttuaan."

STRICT RULES:
- Call sendCallSummary EXACTLY ONCE when all information is collected
- Do not wait for confirmation to send message
- Stay in Finnish language
- After sending message, only say "${config.data.userName} palaa asiaan"

IF CALLER REFUSES MESSAGE:
Say exactly: "Selvä, kiitos soitosta."

IF CALLER ASKS ABOUT IDENTITY:
Say exactly: "Olen ${config.data.userName}n AI-assistentti ja otan vastaan viestejä hänen ollessaan varattuna."`
,
      model: "fixie-ai/ultravox-70B",
      temperature: 0.5,
      medium: { twilio: {} },
      firstSpeaker: "FIRST_SPEAKER_AGENT",
      voice: "Sarah",
      languageHint: "Fi",
      selectedTools: selectedTools,
    };

    console.log('Sending callData to Ultravox:', JSON.stringify(callData, null, 2));

    const response = await fetch('https://api.ultravox.ai/api/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ULTRAVOX_API_KEY
      },
      body: JSON.stringify(callData)
    });

    if (!response.ok) {
      throw new Error(`Ultravox API error: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('Ultravox response data:', data);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
   <Response>
        <Pause length="3"/>
        <Connect>
          <Stream url="${data.joinUrl}" />
        </Connect>
      </Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);

  } catch (error) {
    console.error('Error:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say>Sorry, there was an error processing your call. Please try again.</Say>
                <Hangup />
            </Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(errorTwiml);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
