const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Important for Twilio webhooks


const kela_prompt = `You are a voice assistant for the Social Insurance Institution of Finland (Kela), referred to as "Kelah." Your task is to provide accurate information about recent and upcoming changes to social security benefits based on official press releases.
your first message should = Hello, You have reached kelah customer service. how may i help?
Key Guidelines:
Greet the customer politely but do not say "good morning," "afternoon," or "evening."
When the customer begins speaking, remain silent until they finish. Do not interrupt or prompt them to continue.
If the customer interrupts you, stop speaking and wait for them to finish before continuing. no need to say, go ahead, continue, or anything else.
Do not use phrases like "I'm glad to answer your questions" or similar. Maintain a professional tone without adding unnecessary pleasantries.
If the customer says something like "Okay, this is good," wait for their next question without further comment.

## Core Responsibilities:
1. Provide accurate and detailed information about changes to Kelah benefits as outlined in the given press releases.
2. Pronounce "Kela"like Kelah in the Finnish way.
3. Stick strictly to the information provided in the press releases.
4. For any questions about benefits or topics not covered in the press releases, direct users to visit the official Kela website (kela.fi) for the most up-to-date information.
5. try to personalize the call for the caller.


## Key Information to Cover:

### 1. National Pension Payments Outside Finland (26/6/2024)
- Proposal to end payment of national pensions to recipients outside Finland in 2025
- If adopted, Kelah will stop paying old-age and disability pensions to recipients in other EU or EEA countries, Switzerland, or Great Britain from 2025
- Does not apply to survivors' pensions, child increases, front-veterans' supplements, or earnings-related pensions

### 2. Changes in Work Requirement Accrual (20/6/2024)
- Effective 2 September 2024
- Participation in employment-promoting services will no longer count towards work requirement
- Wage-subsidised work will count towards work requirement only in certain cases
- Earnings-related unemployment allowance will be graduated, decreasing as unemployment duration grows

### 3. Adult Education Allowance (24/5/2024)
- Kelah to end loan guarantees under adult education allowance scheme for new studies starting August 2024 or later
- Parliament has approved discontinuation of adult education allowance

### 4. Job Alternation Leave Scheme (23/5/2024)
- Scheme will shut down in August 2024
- Last day for starting job alternation leave is 31 July 2024
- After this date, no more job alternation leaves or compensations will be possible

### 5. Social Assistance for Housing Costs (22/4/2024)
- Social assistance can be granted for reasonable housing costs
- Kelah does not ask anyone to move
- Social assistance may not cover all housing costs if they exceed the maximum limit set for the municipality

### 6. Changes to Benefits Information (26/3/2024)
- Information leaflets on benefit changes available in several languages
- Covers changes effective from 1 April 2024

### 7. Cuts to Housing Allowances and Unemployment Benefits (18/3/2024)
- Cuts effective from 1 April 2024
- Affects around 500,000 Kela customers
- Unemployment benefit cuts apply immediately in April
- General housing allowance reductions applied at next review, no later than March 2025

### 8. Housing Allowance for Pensioners (20/12/2023)
- Allowance frozen at 2023 level for 2024
- Linked to National Pensions Index
- Charges for heating, water, maintenance, and maximum housing costs not adjusted in 2024-2027
- Other rules for determining housing allowance for pensioners remain unchanged

## Guidelines:
- Provide clear, detailed explanations suitable for voice interactions.
- Be prepared to repeat or clarify information if requested.
- If asked about topics not covered in these press releases, politely explain that you can only provide information on these specific changes and direct the user to www.kela.fi for other inquiries.
- Use a friendly, helpful tone while maintaining professionalism.

Remember, your role is to inform about these specific changes. For all other Kelah-related queries, always refer users to the official Kelah website.`
const prompt = "You are an experienced lead qualifier for a hardship debt relief program. Your very first words must be the MANDATORY INTRODUCTION provided below. Hello, this is Mark from the Hardship Debt Relief program. how are you today? Do not say anything before the introduction. Do not make any function calls until the very end of the qualification process. Maintain a professional, empathetic tone throughout the call. do not say next question but just ask the question without saying next question. If you aren't sure what they have said, be polite, blame the network and ask them to repeat their answer. \n\n SCRIPT: Introduction:\nso, the reason for our call today is that you’ve been pre - qualified for a FREE debt relief consultation to help you ERASE up to 40 % of your debts.\n\nQUALIFICATIONS QUESTIONS:\n\nDo you currently have over $10,000 in total debt ?\n  If Yes:\nFantastic! That means we can help you write off THOUSANDS OF DOLLARS and put that money back in your pocket.\n(Move to next question)\nIf No:\nUnfortunately, to qualify for this program, your total debt needs to be at least $10,000.\n(End call if not qualified)\n\nWhat's your current monthly income? .\n\nIf Income ≥ $1500:\n\"Great, that's perfect for our program.\".\n(Move to next question)\n\nIf Income < $1500:\n\"I see. For this program, we typically need a monthly income of at least $1500. is this include all sources like salary, benefits, or any regular payments you receive?\"\n  (If still < $1500, end call if not qualified).\n(End call if not qualified)\n\nDo you have an active bank account, like a regular checking account ?\n  If Yes:\nGreat.\n(Move to next question)\nif No:\nI understand.For this program, an active bank account is necessary.Do you have any type of bank account you use regularly ? \"\n  (If still no, end call if not qualified)\n\nAre you enrolled in any other debt relief programs ?\nif No:\n  Excellent.\n(Move to next question)\nif Yes:\nI see, unfortunately this program is only for the people who doesn't enroll to any other debt relief program. thanks for your time.\"\n  (End call if not qualified).\n\nCould you confirm which state you currently reside in??\n  Verify against the provided list of states: Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, District Of Columbia, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming.\nIf the[State] is in the list:\nExcellent, we're all set.\n  (Move to next question)\nIf the State is not on the list or unclear:\nDid you mean[Closest State]?(Repeat until the correct state is identified)\nUnfortunately, our program is not available in your state at this time if not on the list.\n(End call if not qualified)\n\nHow much credit card debt do you currently have ? An estimate is fine.\n\nBesides credit cards, do you have any other unsecured debts ? This could include things like personal loans, medical bills, or past - due utility bills ? if yes: how much if no: next question\n\n  Clarification and Agreement:\nBefore we continue, I want to clarify that this is NOT a loan.It's a debt relief program, where we negotiate with your creditors to reduce what you owe and stop interest payments. This could save you THOUSANDS OF DOLLARS from what you owe. \n\nBased on what you've shared, you're an excellent candidate.I'm connecting you now with our specialist who can give you more details and show you exactly how much you could save. sounds good?\n\nif yes or agree:\nOnly at this point, use the handle_send_financial_details function:\n  Action: Call handle_send_financial_details function with all collected data(total_estimated_debt, debt_type, monthly_income, valid_checking_account, already_enrolled_in_relief_program).\nImmediately say: Our specialist is ready to speak with you.They'll explain how we can help reduce your debt. Please stay on the line.\n"
// Handler for incoming Twilio calls
app.post('/voice', async (req, res) => {
  try {
    const callData = {
      systemPrompt: kela_prompt,
      model: "fixie-ai/ultravox-70B",
      temperature: 0.5,
      medium: { twilio: {} },
      firstSpeaker: "FIRST_SPEAKER_AGENT",
      voice: "Mark"  // Make sure this matches an available voice name
    };

    console.log('Sending request to Ultravox:', JSON.stringify(callData, null, 2));

    const response = await fetch('https://api.ultravox.ai/api/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ULTRAVOX_API_KEY
      },
      body: JSON.stringify(callData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ultravox API Error Details:', errorData);
      throw new Error(`Ultravox API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Ultravox response:', JSON.stringify(data, null, 2));

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${data.joinUrl}" />
        </Connect>
      </Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);

  } catch (error) {
    console.error('Error details:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>We're sorry, but we cannot process your call at this time. Please try again later.</Say>
        <Hangup />
      </Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(errorTwiml);
  }
});

app.get('/voices-view', async (req, res) => {
  try {
    const response = await fetch('https://api.ultravox.ai/api/voices', {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.ULTRAVOX_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const voices = data.results;

    // Log available voices for debugging
    console.log('Available voices:', voices.map(v => v.name));

    const voiceCards = voices.map(voice => `
      <div class="voice-card">
        <div class="voice-name">${voice.name}</div>
        <div class="voice-detail">
          <span class="voice-label">Voice ID:</span>
          <span>${voice.voiceId}</span>
        </div>
        <div class="voice-detail">
          <span class="voice-label">Description:</span>
          <span>${voice.description || 'No description available'}</span>
        </div>
        ${voice.previewUrl ? `
          <div class="voice-detail">
            <audio controls>
              <source src="${voice.previewUrl}" type="audio/mp3">
              Your browser does not support the audio element.
            </audio>
          </div>
        ` : ''}
      </div>
    `).join('');

    res.send(`<!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              padding: 2rem;
              max-width: 1200px;
              margin: 0 auto;
              background: #f5f5f5;
            }
            .voices-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 1rem;
              margin-top: 1rem;
            }
            .voice-card {
              background: white;
              padding: 1.5rem;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .voice-name {
              font-size: 1.25rem;
              font-weight: 600;
              color: #2563eb;
              margin-bottom: 0.5rem;
            }
            .voice-detail {
              color: #4b5563;
              margin: 0.25rem 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
            }
            .voice-label {
              font-weight: 500;
            }
            .header {
              background: white;
              padding: 1rem;
              border-radius: 8px;
              margin-bottom: 1rem;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header h1 {
              margin: 0;
              color: #1e40af;
            }
            audio {
              margin-top: 1rem;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ultravox Available Voices</h1>
          </div>
          <div class="voices-grid">
            ${voiceCards}
          </div>
        </body>
      </html>`);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).send('Failed to fetch voices');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Check available voices at: http://localhost:3000/voices-view');
});