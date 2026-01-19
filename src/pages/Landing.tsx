import { useTranslation } from 'react-i18next'

function Landing() {
  const { t } = useTranslation()

  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-lg shadow-emerald-100/50 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
          {t('landing.eyebrow')}
        </p>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('landing.title')}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          {t('landing.description')}
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t('landing.highlights.overview')}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t('landing.highlights.mobile')}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            {t('landing.highlights.handoff')}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t('landing.h5.title')}
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-6 py-8 text-center text-sm text-slate-600">
          {t('landing.h5.placeholder')}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {t('landing.h5.description')}
        </p>
      </div>
    </section>
  )
}

export default Landing
