import app from '@/app.js'
import { env } from '@/config/env.js'

// Local development / traditional Node hosting entry point. Vercel does not
// run this file — it imports src/app.ts directly via api/index.ts instead,
// since serverless functions don't use a persistent listener.
app.listen(env.port, () => {
  console.log(`[AFTERSHOW] Backend listening on http://localhost:${env.port}`)
  console.log(`[AFTERSHOW] Allowed frontend origin: ${env.frontendUrl}`)
})
