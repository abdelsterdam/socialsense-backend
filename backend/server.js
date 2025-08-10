
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN }))
app.use(express.json())

// Mock data sources
const summary = {
  followers: 24800,
  views: 156000,
  engagementRate: 6.2,
  bestPlatform: 'TikTok',
  tip: 'Je Instagram Reels presteren 35% beter tussen 18:00–20:00. Probeer je volgende video vanavond te posten.'
}

const analytics = {
  growth: [
    { month: 'Jan', value: 4000 },{ month: 'Feb', value: 3000 },{ month: 'Mrt', value: 4800 },{ month: 'Apr', value: 4300 },{ month: 'Mei', value: 6000 },{ month: 'Jun', value: 5800 }
  ],
  engagement: [
    { platform: 'Instagram', value: 4.5 },
    { platform: 'TikTok', value: 8.1 },
    { platform: 'YouTube', value: 2.3 }
  ]
}

app.get('/api/summary', (req, res)=>{
  res.json(summary)
})

app.get('/api/analytics', (req, res)=>{
  res.json(analytics)
})

app.post('/api/ai/chat', async (req, res)=>{
  const message = (req.body?.message || '').toLowerCase()
  // ultra-simple demo logic
  let reply = 'Interessante vraag! Op basis van je recente cijfers: post 3x per week, test 2 formats en houd je hooks < 3 sec.'
  if(message.includes('groei') || message.includes('grow')){
    reply = 'Focus 30 dagen op één niche, post 3–4x/week, en recycle je best presterende video’s als Reels/Shorts.'
  } else if(message.includes('tiktok')){
    reply = 'TikTok: Gebruik 1 sterke hook in de eerste 2 seconden, ondertitel automatisch, en houd 9–15s aan.'
  } else if(message.includes('instagram')){
    reply = 'Instagram: Reels tussen 18:00–20:00 leveren je gemiddeld +35% bereik. Test 2 hashtags sets.'
  }
  res.json({ reply })
})

app.listen(PORT, ()=>{
  console.log('API running on http://localhost:'+PORT)
})
