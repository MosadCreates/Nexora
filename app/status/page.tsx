import { redirect } from 'next/navigation'

// Redirects to UptimeRobot public status page
// Update URL after creating UptimeRobot account
export default function StatusPage() {
  redirect('https://dashboard.uptimerobot.com/status/1012035/global-settings')
}
