import { HTMLAttributes, forwardRef } from 'react'

export type CardVariant = 'glass' | 'solid'
export type CardPadding = 'none' | 'small' | 'medium' | 'large'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 卡片样式变体
   */
  variant?: CardVariant

  /**
   * 卡片内边距
   */
  padding?: CardPadding
}

/**
 * Card 组件
 * 玻璃拟态卡片基础容器
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', padding = 'medium', className = '', ...props }, ref) => {
    const baseClasses = [
      'relative',
      'overflow-hidden',
      'rounded-3xl',
      'border',
      'backdrop-blur-3xl',
      'shadow-[0_32px_80px_rgba(3,6,32,0.45)]',
      'transition-shadow',
      'duration-200',
    ]

    const variantClasses: Record<CardVariant, string[]> = {
      glass: [
        'border-[#727272]',
        'bg-[image:var(--gradient-card)]',
        'bg-[color:rgba(255,255,255,0.04)]',
      ],
      solid: [
        'border-[--color-surface-border]',
        'bg-[--color-surface]',
      ],
    }

    const paddingClasses: Record<CardPadding, string[]> = {
      none: [],
      small: ['p-4'],
      medium: ['p-6'],
      large: ['p-8'],
    }

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      ...paddingClasses[padding],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return <div ref={ref} className={classes} {...props} />
  },
)

Card.displayName = 'Card'
