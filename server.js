import express from "express";
import path from 'path';
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { google } from "googleapis";
import auth from "./auth.js"; 
import axios from "axios";



dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "Role: You are an AI assistant designed to help farmers in India predict the best crops for cultivation and schedule optimal irrigation timings based on soil, climate, and other agricultural factors. Your goal is to provide simple and easy-to-understand answers, avoiding complex scientific jargon.\n\n💡 Data Handling:\n\nIf manual inputs (like temperature, soil type, or rainfall) are provided, prioritize them over real-time data.\nIf no manual inputs are given, fetch real-time data for weather, soil, and water availability using Google Search Grounding.\n💡 Response Format:\n\nGive 5 best crop recommendations based on all input factors.\nKeep the answers farmer-friendly.\n Include a descriptive reason for each crop recommendation e.g., \" Best for this season,\" \"Needs less water,\" \"High market demand,\" \" Details about farming techniques to efficiently grow this,\" \" Best Irrigation Techniques,\" \" What Input Factors you have considered,\" Other reasons as necessary, \n💡 Decision Factors: Consider:\n\nLocation & Climate (Region, temperature, rainfall, humidity, water availability)\nSoil Factors (pH, moisture, texture, drainage, nitrogen-phosphorus-potassium levels)\nPrevious Crop Grown (To ensure crop rotation for better soil health)\nLand Size & Cultivation Period (Short-term or long-term crops based on available time)\n for irrigation scheduler for the time period entered by user create an optimal irrigation schedule based on the crop, land size land unit, water abundance of the location entered and climatic factors like rainfall and temperature. your schedule should only include days when the irrigation is planned and no events like skip days to include in the calender. \n  Decision Factors: Consider:\n\nLocation & Climate (Region, temperature, rainfall, humidity, water availability) ",
});


const calendar = google.calendar({ version: "v3", auth });


// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});




// API Route to get recommendations
app.post("/recommend", async (req, res) => {
    try {
        const {
            farmerName,
            location,
            landSize,
            landUnit,
            lastCrop,
            termPeriod,
            temperature,
            humidity,
            rainfall,
            soilType,
            soilPH,
            nitrogen,
            phosphorus,
            potassium
        } = req.body;

        // Format input as prompt for AI
        const userPrompt = `Recommend the best 5 crops based on the following details: 
        - Farmer Name: ${farmerName}
        - Location: ${location}
        - Land Size: ${landSize} ${landUnit}
        - Last Crop Grown: ${lastCrop}
        - Cultivation Period: ${termPeriod} months
        - Temperature: ${temperature}°C
        - Humidity: ${humidity}%
        - Rainfall: ${rainfall} mm
        - Soil Type: ${soilType}
        - Soil pH: ${soilPH}
        - Nitrogen: ${nitrogen}%
        - Phosphorus: ${phosphorus}%
        - Potassium: ${potassium}%. 
        Respond the crop recommendations with 5 crop recommendations including a brief reason: of why this crop is suggested what type of irrigation is mostly preferred and other details of farming that crop.
        Just respond with an **array** of JSON objects, each containing "crop" and "reason". Do not include any additional text or formatting.
        Strict Instruction: Give the response as a raw JSON object without any code block formatting or triple backticks or anything.

some Example response are:
[
  { "crop": " ", "reason": " " },
  { "crop": " ", "reason": " " },
  { "crop": " ", "reason": " " },
  { "crop": " ", "reason": " " },
  { "crop": " ", "reason": " " }
] ,
[
  { "crop": "", "reason": "" },
  { "crop": "", "reason": "" },
  { "crop": "", "reason": "" },
  { "crop": " ", "reason": "" },
  { "crop": "", "reason": "" }
] ,
[
  { "crop": "", "reason": "" },
  { "crop": "", "reason": "" },
  { "crop": "", "reason": "" },
  { "crop": "", "reason": " " },
  { "crop": "", "reason": " " }
] 

`;

        // Generate AI response
        const chatSession = model.startChat({
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain",
            },
        });

        const result = await chatSession.sendMessage(userPrompt);
        res.json({ recommendations: result.response.text() });

    } catch (error) {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ error: "Failed to generate recommendations." });
    }
});









// API Route to get irrigation schedule
app.post("/irrigation-schedule", async (req, res) => {
  try {
      const {
          farmerName,
          location,
          landSize,
          landUnit,
          lastCrop,
          termPeriod,
          rainfall,
          soilType,
          soilPH,
          selectedCrop
      } = req.body;

      const userPrompt = `Generate an optimal irrigation schedule for the following details and schedule will start from the current date or week:
      - Farmer Name: ${farmerName}
      - Location: ${location}
      - Land Size: ${landSize} ${landUnit}
      - Last Crop Grown: ${lastCrop}
      - Cultivation Period: ${termPeriod} months
      - Rainfall: ${rainfall} mm
      - Soil Type: ${soilType}
      - Soil pH: ${soilPH}
      - Selected Crop: ${selectedCrop}.

      The irrigation schedule starts **from today (${new Date().toISOString().split("T")[0]})** onwards.
- All dates must be in the **future**.
      Respond with an array of JSON objects containing "date", "time", and "message" fields for scheduling irrigation. Keep in mind the water requirements of the selected crop, rainfall predictions, and soil moisture retention and land size and location.
      Just respond with an **array** of JSON objects, each containing "date", "time" and "message". Do not include any additional text or formatting or new line thing just the array of object.
      Strict Instruction: Give the response as a raw JSON object without any code block formatting or triple backticks or anything or a '\n' i just want my array no other formatting.
      Some Example Response are:
      [
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "Irrigate with 20mm water due to high temperature." },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": " ..." },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "Provide deep irrigation as soil moisture is low." }
      ]
      [
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" }
      ]
      [
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": " " },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" }
      ] 
      [
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": " " },
        { "date": "YYYY-MM-DD", "time": "HH:MM", "message": "" }
      ],

      [
        {
            "date": "2024-07-01",
            "time": "06:00",
            "message": "Initial flooding for rice paddy: Maintain 5-7 cm water level."
        },
        {
            "date": "2024-07-05",
            "time": "06:00",
            "message": "Top up water level to 5-7 cm due to porous soil and high evaporation."
        },
        {
            "date": "2024-07-10",
            "time": "06:00",
            "message": "Maintain water level; check for leaks due to porous soil."
        },
        {
            "date": "2024-07-15",
            "time": "06:00",
            "message": "Replenish water to 5-7 cm level; monitor for pest activity in standing water."
        },
        {
            "date": "2024-07-20",
            "time": "06:00",
            "message": "Maintain standing water; ensure even distribution across 30 Katha land."
        },
        {
            "date": "2024-07-25",
            "time": "06:00",
            "message": "Check water level and irrigate to maintain 5-7 cm; Kolkata humidity might reduce evaporation."
        },
        {
            "date": "2024-07-30",
            "time": "06:00",
            "message": "Maintain consistent water depth for optimal rice growth."
        },
        {
            "date": "2024-08-05",
            "time": "06:00",
            "message": "Top up water level to compensate for losses; inspect bunds for seepage."
        },
        {
            "date": "2024-08-10",
            "time": "06:00",
            "message": "Maintain consistent flooding; weed around the paddy to reduce water competition."
        },
        {
            "date": "2024-08-15",
            "time": "06:00",
            "message": "Ensure adequate water supply for tillering stage; address any nutrient deficiencies."
        },
        {
            "date": "2024-08-20",
            "time": "06:00",
            "message": "Maintain water level; scout for diseases and pests."
        },
        {
            "date": "2024-08-25",
            "time": "06:00",
            "message": "Check and adjust water level as needed based on plant growth stage."
        },
        {
            "date": "2024-08-30",
            "time": "06:00",
            "message": "Maintain water level to support panicle initiation; apply fertilizer if required."
        },
        {
            "date": "2024-09-05",
            "time": "06:00",
            "message": "Maintain water level during flowering; protect from stagnant water pests."
        },
        {
            "date": "2024-09-10",
            "time": "06:00",
            "message": "Ensure sufficient water during grain filling; manage pests and diseases effectively."
        },
        {
            "date": "2024-09-15",
            "time": "06:00",
            "message": "Maintain consistent water supply until the dough stage."
        },
        {
            "date": "2024-09-20",
            "time": "06:00",
            "message": "Reduce water level gradually as grains mature."
        },
        {
            "date": "2024-09-25",
            "time": "06:00",
            "message": "Stop irrigation approximately 10-15 days before harvest."
        }
]

      `;

      const chatSession = model.startChat({
          generationConfig: {
              temperature: 1,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 8192,
              responseMimeType: "text/plain",
          },
      });

    //   const result = await chatSession.sendMessage(userPrompt);


      const result = await chatSession.sendMessage(userPrompt);
let responseText = result.response.text().trim(); // Trim extra spaces/newlines

// Ensure it's a valid JSON array
    try {
        if (responseText.startsWith("```json")) {
            responseText = responseText.replace(/^```json|```$/g, "").trim(); // Remove code block formatting
        }
        
        const irrigationSchedule = JSON.parse(responseText); // Convert string to JSON array

         // Loop through each schedule and add event to Google Calendar
         for (const schedule of irrigationSchedule) {
            const { date, time, message } = schedule;
            const dateTime = new Date(`${date}T${time}:00.000Z`).toISOString(); // Convert to ISO format

            await axios.post("http://localhost:5000/schedule", {  // Adjust URL if needed
                summary: message,
                dateTime: dateTime
            });
        }

        res.json({ success: true, irrigationSchedule });




        // res.json({ irrigationSchedule });
    } catch (error) {
            console.error("Error parsing JSON:", error);
            res.status(500).json({ error: "Invalid JSON format received." });
}}catch (error) {
          console.error("Error generating irrigation schedule:", error);
          res.status(500).json({ error: "Failed to generate irrigation schedule." });
      }
    });









// Schedule Event Route
app.post("/schedule", async (req, res) => {
  const { summary, dateTime } = req.body;

  if (!summary || !dateTime) {
      return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const event = {
      summary,
      start: { dateTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: new Date(new Date(dateTime).getTime() + 3600000).toISOString(), timeZone: "Asia/Kolkata" }
  };

  try {
      const response = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
      });

      console.log("✅ Event Scheduled:", response.data.htmlLink);
      res.json({ success: true, message: "Event Scheduled", link: response.data.htmlLink });

  } catch (error) {
      console.error("❌ Error scheduling event:", error.response ? error.response.data : error);
      res.status(500).json({ success: false, message: "Failed to schedule event" });
  }
});


// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});