import { HTMLAttributes, ReactNode, forwardRef, MouseEvent } from 'react'
import { images } from '@mirror/assets'
import { resolveImageUrl } from '@mirror/utils'

export type TicketItemCardType = 1 | 2 | 3
export type TicketItemCardShadow = 'pink' | 'purple'

export interface TicketItemCardData {
  name: string
  coverUrl: string
  risingDay?: ReactNode
  priceText?: ReactNode
  offerPriceText?: ReactNode
  buyPriceText?: ReactNode
  rateText?: ReactNode
  supplyText?: ReactNode
  presaleUserText?: ReactNode
  sellInfoText?: ReactNode
  timeText?: ReactNode
}

export interface TicketItemCardLabels {
  price?: string
  numberOfIssues?: string
  offerPrice?: string
  profitLoss?: string
  buyPrice?: string
  day?: string
}

export interface TicketItemCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 卡片类型：1 发售、2 寄售、3 持有
   */
  cardType?: TicketItemCardType

  /**
   * 图片阴影色
   */
  imgShadow?: TicketItemCardShadow

  /**
   * 展示数据
   */
  data: TicketItemCardData

  /**
   * 文案标签配置
   */
  labels?: TicketItemCardLabels

  /**
   * 倒计时展示内容（传入字符串或节点）
   */
  countdown?: ReactNode

  /**
   * 倒计时图标资源
   */
  countdownIconSrc?: string

  /**
   * 上涨天数图标资源
   */
  upDayIconSrc?: string

  /**
   * 按钮文案
   */
  actionText: string

  /**
   * 按钮是否禁用
   */
  actionDisabled?: boolean

  /**
   * 按钮状态样式
   */
  actionState?: 'default' | 'waiting'

  /**
   * 点击按钮回调
   */
  onAction?: () => void
}

const defaultLabels: Required<TicketItemCardLabels> = {
  price: 'Price',
  numberOfIssues: 'Issues',
  offerPrice: 'Offer price',
  profitLoss: 'Profit/Loss',
  buyPrice: 'Buy price',
  day: 'day',
}

/**
 * TicketItemCard 组件
 * 复刻 TicketItemCard.vue 的卡片样式
 */
export const TicketItemCard = forwardRef<HTMLDivElement, TicketItemCardProps>(
  (
    {
      cardType = 1,
      imgShadow = 'pink',
      data,
      labels,
      countdown,
      countdownIconSrc,
      upDayIconSrc,
      actionText,
      actionDisabled = false,
      actionState = 'default',
      onAction,
      className = '',
      ...props
    },
    ref,
  ) => {
    const mergedLabels = { ...defaultLabels, ...labels }
    const isFlipped = cardType === 2 || cardType === 3
    const showCountdown = Boolean(countdown)
    const risingDay = data.risingDay ?? 0
    const countdownIcon = countdownIconSrc || images.ticket?.countdownIcon
    const upDayIcon = upDayIconSrc || images.ticket?.upDayIcon

    const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      if (actionDisabled) return
      onAction?.()
    }

    const rootClassName = [
      'ticket-item-card',
      'text-[11px]',
      isFlipped ? 'card-type-2' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const actionClassName = [
      'buy-btn',
      actionDisabled ? 'disabled' : '',
      actionState === 'waiting' ? 'waiting' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={rootClassName} {...props}>
        {showCountdown && (
          <div className={`time text-[14px] ${isFlipped ? 'leftTime' : ''}`}>
            {countdownIcon ? (
              <img className="countdown-icon" src={countdownIcon} alt="countdown" />
            ) : null}
            <span className="countdown-text">{countdown}</span>
          </div>
        )}

        <div className="up-day-box text-[13px]">
          <span>
            {risingDay} {mergedLabels.day}
          </span>
          {upDayIcon ? <img className="up-day-icon" src={upDayIcon} alt="up day" /> : null}
        </div>

        <div
          className={`ticket-item-card__img-wrapper ${imgShadow} ${isFlipped ? 'order-2' : 'order-1'}`}
        >
          <img className="ticket-item-card__img" src={resolveImageUrl(data.coverUrl)} alt={data.name} />
        </div>

        <div className="ticket-item-card__content">
          <div className="ticket-item-card__content-title">
            <span className="name text-[16px]">{data.name}</span>
          </div>

          {cardType === 1 && (
            <div className="ticket-item-card__content-desc text-[12px]">
              {data.presaleUserText ? <div className="btn_user">{data.presaleUserText}</div> : null}
              {data.priceText ? (
                <div>
                  <span>{mergedLabels.price}</span>
                  <span className="value text-[13px]">{data.priceText}</span>
                </div>
              ) : null}
              {data.supplyText ? (
                <div>
                  <span>{mergedLabels.numberOfIssues}</span>
                  <span className="value text-[13px]">{data.supplyText}</span>
                </div>
              ) : null}
              {data.timeText ? (
                <div>
                  <span className="timeStr text-[8px]">{data.timeText}</span>
                </div>
              ) : null}
              <div className="btn-wrapper">
                <button
                  type="button"
                  className={actionClassName}
                  onClick={handleActionClick}
                  disabled={actionDisabled}
                >
                  <span className="text-[10px]">{actionText}</span>
                </button>
              </div>
            </div>
          )}

          {cardType === 2 && (
            <div className="ticket-item-card__content-desc text-[12px]">
              {data.priceText ? (
                <div>
                  <span>{mergedLabels.price}</span>
                  <span className="value text-[13px]">{data.priceText}</span>
                </div>
              ) : null}
              {data.offerPriceText ? (
                <div>
                  <span>{mergedLabels.offerPrice}</span>
                  <span className="value text-[13px]">{data.offerPriceText}</span>
                </div>
              ) : null}
              {data.rateText ? (
                <div>
                  <span>{mergedLabels.profitLoss}</span>
                  <span className="value glow-green">{data.rateText}</span>
                </div>
              ) : null}
              {data.sellInfoText ? (
                <div>
                  <span className="value">{data.sellInfoText}</span>
                </div>
              ) : null}
              <div className="btn-wrapper">
                <button
                  type="button"
                  className={actionClassName}
                  onClick={handleActionClick}
                  disabled={actionDisabled}
                >
                  <span>{actionText}</span>
                </button>
              </div>
            </div>
          )}

          {cardType === 3 && (
            <div className="ticket-item-card__content-desc text-[12px]">
              {data.buyPriceText ? (
                <div>
                  <span>{mergedLabels.buyPrice}</span>
                  <span className="value text-[13px]">{data.buyPriceText}</span>
                </div>
              ) : null}
              {data.rateText ? (
                <div>
                  <span>{mergedLabels.profitLoss}</span>
                  <span className="value text-[13px] glow-green">{data.rateText}</span>
                </div>
              ) : null}
              <div className="btn-wrapper">
                <button
                  type="button"
                  className={actionClassName}
                  onClick={handleActionClick}
                  disabled={actionDisabled}
                >
                  <span className="text-[10px]">{actionText}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .ticket-item-card {
            color: #ffffff;
            display: flex;
            min-height: 103px;
            opacity: 1;
            position: relative;
            border-radius: 10px;
            padding: 10px;
            box-sizing: border-box;
            gap: 10px;
            background: var(--gradient-card);
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(50px);
          }

          .pink {
            box-shadow: 0 0 9.8px 0 rgba(255, 18, 142, 0.5);
          }

          .purple {
            box-shadow: 0 0 9.8px 0 rgba(157, 15, 179, 0.5);
          }

          .time {
            top: -25px;
            position: absolute;
            right: 0;
            font-weight: 600;
            font-feature-settings: "kern" on;
            color: #ffb302;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .countdown-icon {
            width: 17px;
            height: 17px;
          }

          .countdown-text {
            color: #eb1484;
          }

          .leftTime {
            left: 0;
            right: unset;
          }

          .up-day-box {
            min-width: 66px;
            height: 25px;
            border-top-right-radius: 10px;
            border-bottom-left-radius: 10px;
            background: #4f505e;
            position: absolute;
            z-index: 10;
            right: -1px;
            top: -1px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 4px;
          }

          .up-day-icon {
            width: 11px;
            height: 11px;
          }

          .ticket-item-card__img-wrapper {
            width: 89.7px;
            min-width: 89.7px;
            height: 128.1px;
            margin-top: -25px;
            position: relative;
            border-radius: 2px;
          }

          .ticket-item-card__img-wrapper.order-1 {
            order: 1;
          }

          .ticket-item-card__img-wrapper.order-2 {
            order: 2;
          }

          .ticket-item-card__img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            --r: 2px;
            -webkit-mask-image: radial-gradient(circle at var(--r), transparent var(--r), red 0);
            -webkit-mask-position: calc(-1 * var(--r));
            -webkit-mask-size: 100% 8px;
            border-radius: 2px;
          }

          .ticket-item-card__content {
            flex: 1;
            order: 1;
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .btn-wrapper {
            position: absolute;
            right: 0;
            bottom: 0;
          }

          .btn_user {
            color: #ff2d85 !important;
          }

          .ticket-item-card__content-title {
            font-family: var(--font-display);
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 5px;
          }

          .ticket-item-card__content-title .name {
            line-height: 19px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            display: block;
            max-width: 150px;
          }

          .ticket-item-card__content-desc {
            font-weight: 700;
            color: #999999;
            line-height: 18px;
          }

          .ticket-item-card__content-desc > div {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 1px;
          }

          .ticket-item-card__content-desc .value {
            color: #ffffff;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          .ticket-item-card__content-desc .buy-btn {
            cursor: pointer;
            display: flex;
            justify-content: flex-end;
            flex: 1;
            background: transparent;
            border: none;
            padding: 0;
          }

          .ticket-item-card__content-desc .buy-btn > span {
            padding-left: 10px;
            padding-right: 10px;
            height: 28px;
            opacity: 1;
            border-radius: 4px;
            background: #eb1484;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 500;
            color: #ffffff;
          }

          .ticket-item-card__content-desc .buy-btn.disabled > span {
            background: #8d8d8d !important;
          }

          .ticket-item-card__content-desc .buy-btn:disabled {
            cursor: not-allowed;
          }

          .ticket-item-card__content-desc .buy-btn.waiting > span {
            background-color: yellow !important;
            color: #000 !important;
          }

          .ticket-item-card.card-type-2 .up-day-box {
            right: unset;
            left: -1px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 0;
            border-top-left-radius: 10px;
            border-bottom-right-radius: 10px;
          }

          .ticket-item-card.card-type-2 .ticket-item-card__content-title {
            justify-content: flex-end;
          }

          .ticket-item-card.card-type-2 .ticket-item-card__content-title .name {
            max-width: 165px;
            text-align: right;
          }

          .glow-green {
            color: #00ff00;
            text-shadow: 0 0 4px #00ff00, 0 0 8px #00ff00;
          }

          .timeStr {
            color: #ffffff;
          }
        `}</style>
      </div>
    )
  },
)

TicketItemCard.displayName = 'TicketItemCard'
