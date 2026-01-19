import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-10 text-center shadow-lg shadow-emerald-100/40 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {t('notFound.code')}
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-slate-900">
        {t('notFound.title')}
      </h2>
      <p className="mt-3 text-sm text-slate-600">
        {t('notFound.description')}
      </p>
      <Link
        className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
        to="/"
      >
        {t('notFound.back')}
      </Link>
    </div>
  )
}

export default NotFound
