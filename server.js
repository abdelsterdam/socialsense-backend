import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
const ORIGIN = process.env.ORIGIN || '*'

app.use(cors({ origin: ORIGIN }))
app.use(express.json())

// Mock dashboard data (fallback)
const summary = {
  followers: 24800,
  views: 156000,
  engagementRate: 6.2,
  bestPlatform: 'TikTok',
  tip: 'Je Instagram Reels presteren 35% beter tussen 18:00–20:00.'
}

const analytics = {
  growth: [
    { month: 'Jan', value: 4000 },
    { month: 'Feb', value: 3000 },
    { month: 'Mrt', value: 4800 },
    { month: 'Apr', value: 4300 },
    { month: 'Mei', value: 6000 },
    { month: 'Jun', value: 5800 }
  ],
  engagement: [
    { platform: 'Instagram', value: 4.5 },
    { platform: 'TikTok', value: 8.1 },
    { platform: 'YouTube', value: 2.3 }
  ]
}

// Endpoints
app.get('/api/summary', (req, res) => {
  res.json(summary)
})

app.get('/api/analytics', (req, res) => {
  res.json(analytics)
})

app.post('/api/ai/chat', async (req, res) => {
  const userMessage = req.body?.message || ''
  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `Je bent een vriendelijke social media coach. Antwoord in het Nederlands:\n\n${userMessage}` }
              ]
            }
          ]
        })
      }
    )

    const data = await geminiRes.json()
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Geen antwoord ontvangen van de AI.'
    res.json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ reply: 'Er ging iets mis bij het ophalen van AI-advies.' })
  }
})

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
