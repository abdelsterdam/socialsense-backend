
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
const ORIGIN = process.env.ORIGIN || '*'

app.use(cors({ origin: ORIGIN }))
app.use(express.json())

// ---------- Demo data (fallback) ----------
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

// ---------- Health/diag ----------
app.get('/api/health', (_, res) => res.json({ ok: true }))
app.get('/api/ai/diag', async (_req, res) => {
  const API_KEY = process.env.GEMINI_API_KEY
  if (!API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY ontbreekt' })
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Zeg: test' }] }]
      })
    })
    const data = await r.json()
    if (!r.ok) return res.status(502).json({ status: r.status, error: data })
    res.json({ ok: true, sample: data?.candidates?.[0]?.content?.parts?.[0]?.text || null })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// ---------- API endpoints ----------
app.get('/api/summary', (_req, res) => res.json(summary))
app.get('/api/analytics', (_req, res) => res.json(analytics))

app.post('/api/ai/chat', async (req, res) => {
  const userMessage = req.body?.message || ''
  const API_KEY = process.env.GEMINI_API_KEY
  if (!API_KEY) return res.status(500).json({ reply: 'Server mist GEMINI_API_KEY.' })

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
    const body = {
      contents: [
        { role: 'user',
          parts: [{ text: `Je bent een vriendelijke social media coach. Antwoord in het Nederlands.\n\nVraag: ${userMessage}` }]
        }
      ]
    }

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await r.json()

    if (!r.ok) {
      console.error('Gemini API error', r.status, r.statusText, data)
      const msg = data?.error?.message || 'AI-service gaf een fout terug.'
      return res.status(502).json({ reply: msg })
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || 'Geen antwoord ontvangen van de AI.'
    res.json({ reply })
  } catch (err) {
    console.error('Gemini fetch failed:', err)
    res.status(500).json({ reply: 'Er ging iets mis bij het ophalen van AI-advies.' })
  }
})

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
})
