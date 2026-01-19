import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function Home() {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-lg shadow-emerald-100/50 backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {t('home.badge')}
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('home.title')}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
          {t('home.description')}
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t('home.bullets.tailwind')}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t('home.bullets.utilities')}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            {t('home.bullets.polish')}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            onClick={() => setCount((value) => value + 1)}
          >
            {t('home.buttons.clicked', { count })}
          </button>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
            {t('home.buttons.details')}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t('home.status.title')}
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-sm text-slate-500">{t('home.status.latency')}</p>
            <p className="text-2xl font-semibold text-slate-900">
              {t('home.status.latencyValue')}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-sm text-slate-500">{t('home.status.deploy')}</p>
            <p className="text-2xl font-semibold text-slate-900">
              {t('home.status.deployValue')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
