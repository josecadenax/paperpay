import type { Metadata } from 'next'
import { DashboardView } from '@/views/DashboardView'

export const metadata: Metadata = { title: 'Panel editorial · PaperPay' }

export default function EditorialPage() {
  return <DashboardView />
}
