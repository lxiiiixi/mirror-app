import { useState } from 'react'
import { images } from '@mirror/assets'
import {
  Button,
  Card,
  Modal,
  Spinner,
  ProductCard,
  ProductCardCarousel,
  ProductData,
  Banner,
  BannerItem,
  Notice,
  TicketItemCard,
  ProjectTabs,
} from '../ui'

/**
 * UI 组件展示页面
 * 用于展示所有可用的纯 UI 组件
 */
function UIShowcase() {
  const [clickCount, setClickCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [email, setEmail] = useState('')
  const [activeProjectTab, setActiveProjectTab] = useState(0)
  
  // 管理每个 section 的折叠状态
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    button: true,
    card: true,
    input: true,
    tabs: true,
    spinner: true,
    modal: true,
    features: true,
    productCard: true,
    banner: true,
    notice: true,
    ticketItemCard: true,
    projectTabs: true,
  })

  // ProductCard 示例数据
  const sampleProducts: ProductData[] = [
    {
      id: 1,
      name: 'I Became the Youngest Member',
      coverUrl: 'https://picsum.photos/seed/comic1/400/600',
      type: 'comic',
      shareCount: 539,
      isShared: false,
      creators: ['Gangseoul', 'Masgom', 'Masgom'],
    },
    {
      id: 2,
      name: 'TOGETHER',
      coverUrl: 'https://picsum.photos/seed/music1/400/600',
      type: 'music',
      shareCount: 462,
      isShared: true,
      creators: ['Jeff(WHYNOTME)', 'NULL'],
    },
    {
      id: 3,
      name: 'The Last Journey',
      coverUrl: 'https://picsum.photos/seed/movie1/400/600',
      type: 'movie',
      shareCount: 128,
      isShared: false,
      creators: ['John Director', 'Jane Producer'],
    },
  ]

  // 带简介的产品数据用于轮播
  const carouselProducts = sampleProducts.map((product, index) => ({
    ...product,
    description:
      index === 0
        ? '"25...that\'s too old to become an idol." Do Seohan, who got eliminated from the successful idol survival audition "I Am The Strongest Idol"...'
        : `这是一个精彩的作品，讲述了一个关于梦想与坚持的故事。作品${index + 1}`,
  }))

  const handleProductClick = (product: ProductData) => {
    alert(`点击了作品：${product.name}`)
  }

  const handleShareToX = (product: ProductData) => {
    alert(`分享到 X：${product.name}`)
  }

  // Banner 示例数据
  const sampleBanners: BannerItem[] = [
    {
      id: 1,
      img: 'https://picsum.photos/seed/banner1/534/258',
      link: '/page1',
      alt: 'Banner 1',
    },
    {
      id: 2,
      img: 'https://picsum.photos/seed/banner2/534/258',
      link: '/page2',
      alt: 'Banner 2',
    },
    {
      id: 3,
      img: 'https://picsum.photos/seed/banner3/534/258',
      link: '/page3',
      alt: 'Banner 3',
    },
    {
      id: 4,
      img: 'https://picsum.photos/seed/banner4/534/258',
      link: '/page4',
      alt: 'Banner 4',
    },
    {
      id: 5,
      img: 'https://picsum.photos/seed/banner5/534/258',
      link: '/page5',
      alt: 'Banner 5',
    },
  ]

  const handleBannerClick = (banner: BannerItem) => {
    alert(`点击了 Banner: ${banner.alt}`)
  }

  const handleNoticeJump = () => {
    alert('跳转到公告详情页')
  }

  const handleTicketAction = (name: string) => {
    alert(`点击了 TicketItemCard：${name}`)
  }

  const projectTabs = [
    {
      label: 'VIP',
      iconSrc: images.home.tokenTab2,
    },
    {
      label: 'My Mining',
      iconSrc: images.home.tokenTab1,
    },
    {
      label: 'Node',
      iconSrc: images.home.tokenTab2,
    },
  ]

  // 切换 section 的展开/折叠状态
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          UI 组件展示
        </h2>
      </div>

      {/* Button 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('button')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Button 按钮组件</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.button ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            主题色按钮、半透明灰色按钮与全宽/圆角规格
          </p>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections.button ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* 基础按钮 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              按钮变体
            </h4>
            <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
              <Button
                variant="primary"
                onClick={() => setClickCount((c) => c + 1)}
              >
                主题按钮
              </Button>
              <Button
                variant="secondary"
                onClick={() => setClickCount((c) => c + 1)}
              >
                次要按钮
              </Button>
              <Button variant="primary" disabled>
                禁用按钮
              </Button>
              <span className="ml-4 text-sm text-[--color-text-muted]">
                点击次数: {clickCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Card 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('card')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Card 玻璃卡片</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.card ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            对应旧版的毛玻璃卡片风格，适合承载信息块
          </p>
        </div>
        <div
          className={`grid gap-6 md:grid-cols-2 overflow-hidden transition-all duration-300 ${
            expandedSections.card ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <Card>
            <p className="text-sm uppercase tracking-[0.3em] text-[--color-text-muted]">
              Mirror Core
            </p>
            <h4 className="mt-3 text-xl font-semibold text-white">
              玻璃拟态卡片
            </h4>
            <p className="mt-2 text-sm text-[--color-text-muted]">
              使用线性渐变、边框与模糊打造层次感。
            </p>
          </Card>
          <Card variant="solid">
            <p className="text-sm uppercase tracking-[0.3em] text-[--color-text-muted]">
              Solid Panel
            </p>
            <h4 className="mt-3 text-xl font-semibold text-white">深色承载区</h4>
            <p className="mt-2 text-sm text-[--color-text-muted]">
              用于承载表单或列表的基础容器。
            </p>
          </Card>
        </div>
      </section>

      {/* Spinner 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('spinner')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Spinner 加载器</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.spinner ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            基础加载动效，可用于按钮或页面遮罩
          </p>
        </div>
        <div
          className={`flex items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 overflow-hidden transition-all duration-300 ${
            expandedSections.spinner ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <Spinner size="small" />
          <Spinner size="medium" />
          <Spinner size="large" />
        </div>
      </section>

      {/* Modal 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('modal')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Modal 弹窗</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.modal ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            适配旧版毛玻璃弹窗样式，支持标题与操作区
          </p>
        </div>
        <div
          className={`rounded-3xl border border-white/10 bg-white/5 p-6 overflow-hidden transition-all duration-300 ${
            expandedSections.modal ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            打开弹窗
          </Button>
        </div>
        <Modal
          open={modalOpen}
          title="Mirror 提示"
          onClose={() => setModalOpen(false)}
          actions={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                确认
              </Button>
            </div>
          }
        >
          <p className="text-sm text-[--color-text-muted]">
            该弹窗复刻旧版的玻璃拟态质感，并支持自定义内容与操作。
          </p>
        </Modal>
      </section>

      {/* ProductCard 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('productCard')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">ProductCard 产品卡片组件</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.productCard ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            用于展示作品信息的卡片组件，支持基础卡片和轮播卡片两种形式
          </p>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections.productCard ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* 基础产品卡片 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              基础产品卡片 (ProductCard)
            </h4>
            <div className="flex flex-wrap items-start gap-6 rounded-3xl border border-white/10 bg-white/5 p-8">
              {sampleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                  onShareToX={handleShareToX}
                />
              ))}
            </div>
          </div>

          {/* 轮播产品卡片 */}
          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              轮播产品卡片 (ProductCardCarousel)
            </h4>
              <ProductCardCarousel
                products={carouselProducts}
                onClickProduct={handleProductClick}
                onShareToX={handleShareToX}
                autoplay={true}
                autoplayInterval={5000}
              />
          </div>
        </div>
      </section>

      {/* TicketItemCard 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('ticketItemCard')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">TicketItemCard 票券卡片</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.ticketItemCard ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            复刻旧版票券卡片样式，支持发售 / 寄售 / 持有三种形态
          </p>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections.ticketItemCard ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-wrap items-start gap-6 rounded-3xl border border-white/10 bg-white/5 p-8">
            <TicketItemCard
              cardType={1}
              imgShadow="pink"
              countdown="02:14:08"
              actionText="立即购买"
              onAction={() => handleTicketAction('发售卡片')}
              data={{
                name: 'The Mirror Ticket',
                coverUrl: 'https://picsum.photos/seed/ticket1/400/600',
                risingDay: 12,
                presaleUserText: '预售人数 128',
                priceText: '12.50 USDT',
                supplyText: '120 / 300 份',
                timeText: '2024.08.01 - 2024.08.15',
              }}
              labels={{
                price: 'Price',
                numberOfIssues: 'Issues',
                day: 'day',
              }}
            />

            <TicketItemCard
              cardType={2}
              imgShadow="purple"
              actionText="立即购买"
              actionState="waiting"
              onAction={() => handleTicketAction('寄售卡片')}
              data={{
                name: 'Genesis Ticket',
                coverUrl: 'https://picsum.photos/seed/ticket2/400/600',
                risingDay: 5,
                priceText: '18.80 USDT',
                offerPriceText: '12.00 USDT',
                rateText: '+56%',
                sellInfoText: '剩余 42 份可售',
              }}
              labels={{
                price: 'Price',
                offerPrice: 'Offer price',
                profitLoss: 'Profit/Loss',
                day: 'day',
              }}
            />

            <TicketItemCard
              cardType={3}
              imgShadow="pink"
              actionText="发售"
              actionDisabled={true}
              onAction={() => handleTicketAction('持有卡片')}
              data={{
                name: 'Collector Ticket',
                coverUrl: 'https://picsum.photos/seed/ticket3/400/600',
                risingDay: 20,
                buyPriceText: '6.60 USDT',
                rateText: '+12%',
              }}
              labels={{
                buyPrice: 'Buy price',
                profitLoss: 'Profit/Loss',
                day: 'day',
              }}
            />
          </div>
        </div>
      </section>

      {/* ProjectTabs 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('projectTabs')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">ProjectTabs 标签切换</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.projectTabs ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            复刻旧版 ProjectTabs 的玻璃质感与激活态
          </p>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections.projectTabs ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
            <ProjectTabs
              tabs={projectTabs}
              activeIndex={activeProjectTab}
              onChange={(index) => setActiveProjectTab(index)}
              padded={true}
            />
            <ProjectTabs
              tabs={projectTabs}
              activeIndex={activeProjectTab}
              onChange={(index) => setActiveProjectTab(index)}
            />
        </div>
      </section>

      {/* Banner 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('banner')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Banner 轮播组件</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.banner ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            2D 堆叠轮播效果，支持触摸滑动和自动播放
          </p>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections.banner ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Banner 轮播 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              2D 堆叠轮播效果
            </h4>
              <Banner
                banners={sampleBanners}
                autoplay={true}
                interval={6000}
                onCardClick={handleBannerClick}
              />
          </div>
        </div>
      </section>

      {/* Notice 组件展示 */}
      <section className="space-y-6">
        <div
          className="cursor-pointer select-none"
          onClick={() => toggleSection('notice')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Notice 公告组件</h3>
            <span
              className={`text-white transition-transform duration-300 ${
                expandedSections.notice ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            跑马灯效果的公告通知条
          </p>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections.notice ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* 基础公告 */}
          <div className="space-y-4 max-w-[375px]">
              <Notice
                message="🎉 Welcome to Mirror! Join our community and explore amazing content!"
                onJump={handleNoticeJump}
              />
          </div>
        </div>
      </section>
    </div>
  )
}

export default UIShowcase
