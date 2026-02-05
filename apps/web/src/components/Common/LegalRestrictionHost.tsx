import { useTranslation } from 'react-i18next'
import { LegalRestrictionModal } from '../Modals'
import { useLegalRestrictionStore } from '../../store/useLegalRestrictionStore'

export function LegalRestrictionHost() {
  const { t } = useTranslation()
  const open = useLegalRestrictionStore((state) => state.open)
  const hide = useLegalRestrictionStore((state) => state.hide)

  return (
    <LegalRestrictionModal
      open={open}
      title={t('legalRestrictionDialog.title')}
      content={t('legalRestrictionDialog.content')}
      confirmLabel={t('legalRestrictionDialog.confirm')}
      onConfirm={hide}
    />
  )
}
