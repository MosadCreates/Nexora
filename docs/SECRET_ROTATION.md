# Secret Rotation Runbook

## When to rotate: immediately upon suspected or confirmed leak

## SUPABASE_SERVICE_ROLE_KEY
1. Supabase → Settings → API → Regenerate service role key
2. Update in Vercel → Settings → Environment Variables
3. Redeploy on Vercel
4. Time to rotate: ~5 minutes

## GEMINI_API_KEY  
1. Google AI Studio → API Keys → Delete compromised key
2. Create new key
3. Update in Vercel → Settings → Environment Variables
4. Redeploy on Vercel
5. Time to rotate: ~5 minutes

## POLAR_ORGANIZATION_TOKEN
1. Polar.sh → Settings → API → Revoke token
2. Create new token with same permissions
3. Update in Vercel → Settings → Environment Variables
4. Redeploy on Vercel
5. Time to rotate: ~5 minutes

## POLAR_WEBHOOK_SECRET
1. Polar.sh → Settings → Webhooks → Roll secret
2. Update in Vercel → Settings → Environment Variables
3. Redeploy on Vercel
4. Time to rotate: ~5 minutes

## UPSTASH_REDIS_REST_TOKEN
1. Upstash → your database → Reset REST token
2. Update in Vercel → Settings → Environment Variables
3. Redeploy on Vercel
4. Time to rotate: ~5 minutes

## SENTRY_AUTH_TOKEN
1. Sentry → Settings → Auth Tokens → Revoke
2. Create new token
3. Update in Vercel → Settings → Environment Variables
4. Redeploy on Vercel
5. Time to rotate: ~5 minutes

## HEALTH_CHECK_SECRET
1. Generate new: openssl rand -hex 32
2. Update in Vercel → Settings → Environment Variables
3. Redeploy on Vercel
4. Time to rotate: ~2 minutes

## After rotating ALL secrets:
- [ ] All secrets updated in Vercel
- [ ] Redeployed on Vercel
- [ ] Verified app is working (visit /api/health)
- [ ] Check Sentry for any new errors
- [ ] Check UptimeRobot for uptime
- [ ] Notify users if their data may have been compromised
