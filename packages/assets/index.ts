import type { IconsMap, ImagesMap } from "./types";

// 图标资源
import faviconIcon from "./favicon.ico";
import calendarIcon from "./icons/calendar.svg";
import copyIconSvg from "./icons/copy-icon.svg";

export const icons = {
    favicon: faviconIcon,
    calendar: calendarIcon,
    copyIcon: copyIconSvg,
} satisfies IconsMap;

// 图片资源 - 基础
import logoImg from "./images/logo.png";
import loginImg from "./images/login-img.png";
import emptyImg from "./images/empty.png";

// 账户相关
import accountRefresh from "./images/account/account_refresh.png";
import accountRight from "./images/account/account_right.png";
import accountArt from "./images/account/art.png";
import accountChannel from "./images/account/channel.png";
import accountClose from "./images/account/close.png";
import accountCopyIcon from "./images/account/copy_icon.png";
import accountCreator from "./images/account/creator.png";
import accountEnt from "./images/account/ent.png";
import accountEnt2 from "./images/account/ent2.png";
import accountEntertainer from "./images/account/entertainer.png";
import accountExit from "./images/account/exit.png";
import accountGiftIcon from "./images/account/gift-icon.png";
import accountListIcon from "./images/account/list-icon.png";
import accountLoginTg from "./images/account/login-tg.svg";
import accountLoginX from "./images/account/login-x.svg";
import accountPhantomIcon from "./images/account/phantom_SVG_Icon.svg";
import accountTodayIcon from "./images/account/today_icon.png";
import accountTon from "./images/account/ton.png";
import accountUsdtIcon from "./images/account/ustd-icon.png";
import accountUsdt from "./images/account/ustd.png";

// 网络相关
import networkBnb from "./images/network/bnb.png";
import networkEth from "./images/network/eth.png";
import networkSol from "./images/network/sol.png";
import networkTon from "./images/network/ton.png";
import networkCircleSel from "./images/network/circle-sel.png";
import networkCircle from "./images/network/circle.png";
import networkClose from "./images/network/close.png";
import networkCoinbase from "./images/network/Coinbase.png";
import networkMetamask from "./images/network/MetaMask.png";
import networkWalletConnect from "./images/network/WalletConnect.png";

// 导航相关
import navBook from "./images/nav/book.png";
import navBrowse from "./images/nav/browse.png";
import navClose from "./images/nav/close.png";
import navConnectWalletBg from "./images/nav/connect-wallet-bg.png";
import navDiscord from "./images/nav/discord.png";
import navEco from "./images/nav/eco.png";
import navGenesis from "./images/nav/genesis.png";
import navInvite from "./images/nav/invite.png";
import navLang from "./images/nav/lang.png";
import navMarket from "./images/nav/market.png";
import navMenu from "./images/nav/menu.png";
import navPaper from "./images/nav/paper.png";
import navSearch from "./images/nav/search.png";
import navTelegram from "./images/nav/telegram.png";
import navTrade from "./images/nav/trade.png";
import navTwitter from "./images/nav/twitter.png";
import navUserIcon from "./images/nav/user-icon.png";
import navWalletIcon from "./images/nav/wallet-icon.png";
import navFootBarBg from "./images/nav/foot/foot-bar-bg.png";
import navFootDiscoverOn from "./images/nav/foot/foot-discover-on.png";
import navFootDiscover from "./images/nav/foot/foot-discover.png";
import navFootHomeOn from "./images/nav/foot/foot-home-on.png";
import navFootHome from "./images/nav/foot/foot-home.png";
import navFootProfileOn from "./images/nav/foot/foot-profile-on.png";
import navFootProfile from "./images/nav/foot/foot-profile.png";

// 首页相关
import homeAnalyze from "./images/home/analyze.png";
import homeApplication from "./images/home/application.png";
import homeBlueStar from "./images/home/blue_star.png";
import homeRedStar from "./images/home/red_star.png";
import homeBuy from "./images/home/buy.png";
import homeEntBg from "./images/home/ent-bg.png";
import homeHomeDao from "./images/home/home-dao.png";
import homeNotice from "./images/home/notice.png";
import homeScan from "./images/home/scan.png";
import homeSummary from "./images/home/summary.png";
import homeTitle from "./images/home/title.png";
import homeDaoTab1 from "./images/home/dao-tab-1.svg";
import homeDaoTab2 from "./images/home/dao-tab-2.svg";
import homeDaoTab3 from "./images/home/dao-tab-3.svg";
import homeDaoTab4 from "./images/home/dao-tab-4.svg";
import homeTokenTab1 from "./images/home/token-tab-1.svg";
import homeTokenTab2 from "./images/home/token-tab-2.svg";
import homeTokenTabFilter from "./images/home/token-tab-filter.svg";

import imgWrapper from "./images/img-wrapper.png";
import playVideoIconImg from "./images/play-video.png";

// banner 相关：自动扫描目录，新增图片无需改此处
const bannerGlob = import.meta.glob("./images/home/banner/*.png", { eager: true });
const bannerImageMap: Record<string, string> = {};
for (const path in bannerGlob) {
    const name = path.replace(/^.+\/([^/]+)\.png$/, "$1");
    bannerImageMap[name] = (bannerGlob[path] as { default: string }).default;
}
export { bannerImageMap };

// 挖矿相关
import miningAboutLevel from "./images/mining/about-level.png";
import miningBillDown from "./images/mining/bill_down.png";
import miningBillUp from "./images/mining/bill_up.png";
import miningBorder1 from "./images/mining/border-1.png";
import miningBorder2 from "./images/mining/border-2.png";
import miningBorder3 from "./images/mining/border-3.png";
import miningBtn1 from "./images/mining/btn-1.png";
import miningShareBg from "./images/mining/share-bg.png";
import miningInviteArrowDown from "./images/mining/invite/arrow-down.png";
import miningInviteArrowRight from "./images/mining/invite/arrow-right.png";
import miningInvite from "./images/mining/invite/invite.png";
import miningMedal from "./images/mining/invite/medal.png";

// VIP 相关
import vipDiscord from "./images/vip/discord.png";
import vipGiftBg from "./images/vip/gift-bg.png";
import vipShareLogo from "./images/vip/share-logo.png";
import vipWhitePaperIcon from "./images/vip/white-paper-icon.png";
import vipX from "./images/vip/x.png";

// 作品相关
import worksAvatarBorder from "./images/works/avatar-border.svg";
import worksBackBtn from "./images/works/back-btn.png";
import worksCheckIn from "./images/works/check-in.png";
import worksCheckInSuccess from "./images/works/check-in-success.png";
import worksCheckInSuccessHeadingEn from "./images/works/check-in-success-heading-en.png";
import worksCheckInSuccessHeadingZh from "./images/works/check-in-success-heading-zh.png";
import worksCheckInSuccessHeadingHk from "./images/works/check-in-success-heading-hk.png";
import worksDescTop from "./images/works/desc-top.svg";
import worksFbLogo from "./images/works/fb-logo.png";
import worksFilterIcon from "./images/works/filter_icon.svg";
import worksInsLogo from "./images/works/ins-logo.png";
import worksLock from "./images/works/lock.png";
import worksPayMethod from "./images/works/pay-method.png";
import worksSelectBtn from "./images/works/select-btn.svg";
import worksTgIcon from "./images/works/tg-icon.png";
import worksTiktokLogo from "./images/works/tiktok-logo.png";
import worksToTopIcon from "./images/works/to-top-icon.png";
import worksToXWhite from "./images/works/to-x-white.png";
import worksToX from "./images/works/to-x.png";
import worksTwLogo from "./images/works/tw-logo.png";
import worksUploadWorkBtn from "./images/works/upload-work-btn.png";
import worksYoutubeLogo from "./images/works/youtube-logo.png";
import worksWeiboLogo from "./images/works/weibo.png";
import worksDcLogo from "./images/works/dc.png";

import worksProductAnimate from "./images/works/product/animate.svg";
import worksProductComic from "./images/works/product/comic.svg";
import worksProductDrama from "./images/works/product/drama.svg";
import worksProductMovie from "./images/works/product/movie.svg";
import worksProductMusic from "./images/works/product/music.svg";
import worksProductNovel from "./images/works/product/novel.svg";
import worksProductPlaylet from "./images/works/product/playlet.svg";
import worksProductRegular from "./images/works/product/regular.svg";
import worksProductTv from "./images/works/product/tv.svg";
import worksProductVlog from "./images/works/product/vlog.svg";

// discover 相关
import discoverUserHead from "./images/discover/user-head.png";
import discoverAuth from "./images/discover/auth.png";
import discoverD1 from "./images/discover/d1.png";
import discoverD2 from "./images/discover/d2.png";
import discoverD3 from "./images/discover/d3.png";
import discoverD1Cn from "./images/discover/d1_cn.png";
import discoverD2Cn from "./images/discover/d2_cn.png";
import discoverD3Cn from "./images/discover/d3_cn.png";

// Ticket related
import ticketCountdownIcon from "./images/ticket/countdown-icon.png";
import ticketUpDayIcon from "./images/ticket/up-day-icon.png";

// IDO 相关
import idoLook from "./images/ido/look.png";
import idoMore from "./images/ido/more.png";
import idoRegularUser from "./images/ido/regular-user.png";
import idoVipUser from "./images/ido/vip-user.png";
import idoWhitelistedUser from "./images/ido/whitelisted-user.png";

export const images = {
    logo: logoImg,
    loginImg,
    empty: emptyImg,
    icons,

    account: {
        refresh: accountRefresh,
        right: accountRight,
        art: accountArt,
        channel: accountChannel,
        close: accountClose,
        copyIcon: accountCopyIcon,
        creator: accountCreator,
        ent: accountEnt,
        ent2: accountEnt2,
        entertainer: accountEntertainer,
        exit: accountExit,
        giftIcon: accountGiftIcon,
        listIcon: accountListIcon,
        loginTg: accountLoginTg,
        loginX: accountLoginX,
        phantomIcon: accountPhantomIcon,
        todayIcon: accountTodayIcon,
        ton: accountTon,
        usdtIcon: accountUsdtIcon,
        usdt: accountUsdt,
    },

    network: {
        bnb: networkBnb,
        eth: networkEth,
        sol: networkSol,
        ton: networkTon,
        circleSel: networkCircleSel,
        circle: networkCircle,
        close: networkClose,
        coinbase: networkCoinbase,
        metamask: networkMetamask,
        walletConnect: networkWalletConnect,
    },

    nav: {
        book: navBook,
        browse: navBrowse,
        close: navClose,
        connectWalletBg: navConnectWalletBg,
        discord: navDiscord,
        eco: navEco,
        genesis: navGenesis,
        invite: navInvite,
        lang: navLang,
        market: navMarket,
        menu: navMenu,
        paper: navPaper,
        search: navSearch,
        telegram: navTelegram,
        trade: navTrade,
        twitter: navTwitter,
        userIcon: navUserIcon,
        walletIcon: navWalletIcon,
        footBarBg: navFootBarBg,
        footDiscoverOn: navFootDiscoverOn,
        footDiscover: navFootDiscover,
        footHomeOn: navFootHomeOn,
        footHome: navFootHome,
        footProfileOn: navFootProfileOn,
        footProfile: navFootProfile,
    },

    home: {
        analyze: homeAnalyze,
        application: homeApplication,
        blueStar: homeBlueStar,
        redStar: homeRedStar,
        buy: homeBuy,
        entBg: homeEntBg,
        homeDao: homeHomeDao,
        notice: homeNotice,
        scan: homeScan,
        summary: homeSummary,
        title: homeTitle,
        daoTab1: homeDaoTab1,
        daoTab2: homeDaoTab2,
        daoTab3: homeDaoTab3,
        daoTab4: homeDaoTab4,
        tokenTab1: homeTokenTab1,
        tokenTab2: homeTokenTab2,
        tokenTabFilter: homeTokenTabFilter,
    },

    banner: bannerImageMap,

    mining: {
        aboutLevel: miningAboutLevel,
        billDown: miningBillDown,
        billUp: miningBillUp,
        border1: miningBorder1,
        border2: miningBorder2,
        border3: miningBorder3,
        btn1: miningBtn1,
        shareBg: miningShareBg,
        inviteArrowDown: miningInviteArrowDown,
        inviteArrowRight: miningInviteArrowRight,
        invite: miningInvite,
        medal: miningMedal,
    },

    vip: {
        discord: vipDiscord,
        giftBg: vipGiftBg,
        shareLogo: vipShareLogo,
        whitePaperIcon: vipWhitePaperIcon,
        x: vipX,
    },

    works: {
        avatarBorder: worksAvatarBorder,
        backBtn: worksBackBtn,
        checkIn: worksCheckIn,
        checkInSuccess: worksCheckInSuccess,
        checkInSuccessHeadingEn: worksCheckInSuccessHeadingEn,
        checkInSuccessHeadingZh: worksCheckInSuccessHeadingZh,
        checkInSuccessHeadingHk: worksCheckInSuccessHeadingHk,
        dcLogo: worksDcLogo,
        descTop: worksDescTop,
        fbLogo: worksFbLogo,
        filterIcon: worksFilterIcon,
        insLogo: worksInsLogo,
        lock: worksLock,
        payMethod: worksPayMethod,
        selectBtn: worksSelectBtn,
        tgIcon: worksTgIcon,
        tiktokLogo: worksTiktokLogo,
        toTopIcon: worksToTopIcon,
        toXWhite: worksToXWhite,
        toX: worksToX,
        twLogo: worksTwLogo,
        uploadWorkBtn: worksUploadWorkBtn,
        weiboLogo: worksWeiboLogo,
        youtubeLogo: worksYoutubeLogo,
        product: {
            animate: worksProductAnimate,
            comic: worksProductComic,
            drama: worksProductDrama,
            movie: worksProductMovie,
            music: worksProductMusic,
            novel: worksProductNovel,
            playlet: worksProductPlaylet,
            regular: worksProductRegular,
            tv: worksProductTv,
            vlog: worksProductVlog,
        },
    },

    ticket: {
        countdownIcon: ticketCountdownIcon,
        upDayIcon: ticketUpDayIcon,
    },

    ido: {
        look: idoLook,
        more: idoMore,
        regularUser: idoRegularUser,
        vipUser: idoVipUser,
        whitelistedUser: idoWhitelistedUser,
    },

    discover: {
        userHead: discoverUserHead,
        auth: discoverAuth,
        d1: discoverD1,
        d2: discoverD2,
        d3: discoverD3,
        d1Cn: discoverD1Cn,
        d2Cn: discoverD2Cn,
        d3Cn: discoverD3Cn,
    },

    images: {
        imgWrapper,
        playVideoIcon: playVideoIconImg,
    },
} satisfies ImagesMap;

export type { IconsMap, ImagesMap, WorksImagesMap, WorksProductMap } from "./types";
