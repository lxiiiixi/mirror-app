import { CSSProperties, HTMLAttributes } from 'react'
import { images } from '@mirror/assets'
import { resolveImageUrl } from '@mirror/utils'

export interface TokenAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  showTokenBorder?: boolean
  size?: number
  imageSize?: number
}

export function TokenAvatar({
  src,
  alt = 'token',
  showTokenBorder = true,
  size = 80,
  imageSize,
  className = '',
  ...props
}: TokenAvatarProps) {
  const resolvedImageSize = imageSize ?? Math.round(size * 0.8125)
  const styleVars: CSSProperties = {
    '--token-avatar-size': `${size}px`,
    '--token-avatar-image-size': `${resolvedImageSize}px`,
  }

  return (
    <div
      className={`token-avatar ${showTokenBorder ? '' : 'no-border'} ${className}`.trim()}
      style={styleVars}
      {...props}
    >
      <img className="cover-img" src={resolveImageUrl(src ?? '')} alt={alt} />
      <style jsx>{`
        .token-avatar {
          margin: 0 auto;
          display: flex;
          width: var(--token-avatar-size);
          height: var(--token-avatar-size);
          background: url(${images.works.avatarBorder}) no-repeat center / contain;
        }

        .token-avatar.no-border {
          background: none;
          width: auto;
          height: auto;
        }

        .token-avatar.no-border .cover-img {
          width: auto;
          height: auto;
          max-width: var(--token-avatar-size);
          max-height: var(--token-avatar-size);
          border: none;
          object-fit: contain;
        }

        .cover-img {
          margin: auto;
          width: var(--token-avatar-image-size);
          height: var(--token-avatar-image-size);
          border: 1px solid rgba(153, 153, 153, 1);
          border-radius: 50%;
          object-fit: contain;
        }
      `}</style>
    </div>
  )
}
