import { useTranslation } from 'react-i18next'

function Status() {
  const { t } = useTranslation()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-lg shadow-emerald-100/40 backdrop-blur">
        <h2 className="text-xl font-semibold">{t('status.title')}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('status.description')}
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <span>{t('status.services.api')}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
              {t('status.labels.healthy')}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <span>{t('status.services.queue')}</span>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
              {t('status.labels.degraded')}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <span>{t('status.services.realtime')}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
              {t('status.labels.healthy')}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          {t('status.activity.title')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('status.activity.description')}
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-700">
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="font-semibold text-slate-900">
              {t('status.activity.items.deploy')}
            </p>
            <p className="mt-1 text-slate-500">
              {t('status.activity.items.deployMeta')}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="font-semibold text-slate-900">
              {t('status.activity.items.queue')}
            </p>
            <p className="mt-1 text-slate-500">
              {t('status.activity.items.queueMeta')}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="font-semibold text-slate-900">
              {t('status.activity.items.security')}
            </p>
            <p className="mt-1 text-slate-500">
              {t('status.activity.items.securityMeta')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Status
