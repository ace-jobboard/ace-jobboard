import { prisma } from '@/lib/db'

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 2)  return 'à l\'instant'
  if (mins  < 60) return `il y a ${mins} min`
  if (hours < 24) return `il y a ${hours}h`
  if (days  < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`
  return date.toLocaleDateString('fr-FR')
}

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const bugs        = feedbacks.filter(f => f.type === 'bug')
  const suggestions = feedbacks.filter(f => f.type === 'suggestion')
  const unread      = feedbacks.filter(f => !f.isRead)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Retours utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">
          {feedbacks.length} retour{feedbacks.length !== 1 ? 's' : ''} au total —{' '}
          {bugs.length} bug{bugs.length !== 1 ? 's' : ''},{' '}
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''},{' '}
          <span className="font-medium text-amber-600">{unread.length} non lu{unread.length !== 1 ? 's' : ''}</span>
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun retour pour l&apos;instant
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className={`rounded-xl border p-4 ${!f.isRead ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      f.type === 'bug'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-teal/10 text-teal'
                    }`}
                  >
                    {f.type === 'bug' ? '🐛 Bug' : '💡 Suggestion'}
                  </span>
                  {!f.isRead && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      Nouveau
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {timeAgo(new Date(f.createdAt))}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{f.message}</p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                {f.email && (
                  <span>
                    ✉️{' '}
                    <a href={`mailto:${f.email}`} className="text-teal hover:underline">
                      {f.email}
                    </a>
                  </span>
                )}
                {f.page && <span>📄 {f.page}</span>}
                {f.userId && <span>👤 Connecté</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
