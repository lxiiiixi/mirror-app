/** 图标资源：favicon、calendar、copyIcon */
export interface IconsMap {
    calendar: string;
    copyIcon: string;
}

/** 作品类型图标（product） */
export interface WorksProductMap {
    animate: string;
    comic: string;
    drama: string;
    movie: string;
    music: string;
    novel: string;
    playlet: string;
    regular: string;
    tv: string;
    vlog: string;
}

/** 作品相关图片（works） */
export interface WorksImagesMap {
    avatarBorder: string;
    backBtn: string;
    checkIn: string;
    checkInSuccess: string;
    checkInSuccessHeadingEn: string;
    checkInSuccessHeadingZh: string;
    checkInSuccessHeadingHk: string;
    dcLogo: string;
    descTop: string;
    fbLogo: string;
    filterIcon: string;
    insLogo: string;
    lock: string;
    payMethod: string;
    selectBtn: string;
    tgIcon: string;
    tiktokLogo: string;
    toTopIcon: string;
    toXWhite: string;
    toX: string;
    twLogo: string;
    uploadWorkBtn: string;
    weiboLogo: string;
    youtubeLogo: string;
    product: WorksProductMap;
}

/** 完整 images 树形结构，便于引用时获得自动补全与错误检查 */
export interface ImagesMap {
    logo: string;
    loginImg: string;
    empty: string;
    icons: IconsMap;
    account: {
        refresh: string;
        right: string;
        art: string;
        channel: string;
        close: string;
        copyIcon: string;
        creator: string;
        ent: string;
        ent2: string;
        entertainer: string;
        exit: string;
        giftIcon: string;
        listIcon: string;
        loginTg: string;
        loginX: string;
        phantomIcon: string;
        todayIcon: string;
        ton: string;
        usdtIcon: string;
        usdt: string;
    };
    network: {
        bnb: string;
        eth: string;
        sol: string;
        ton: string;
        circleSel: string;
        circle: string;
        close: string;
        coinbase: string;
        metamask: string;
        walletConnect: string;
    };
    nav: {
        book: string;
        browse: string;
        close: string;
        connectWalletBg: string;
        discord: string;
        eco: string;
        genesis: string;
        invite: string;
        lang: string;
        market: string;
        menu: string;
        paper: string;
        search: string;
        telegram: string;
        trade: string;
        twitter: string;
        userIcon: string;
        walletIcon: string;
        footBarBg: string;
        footDiscoverOn: string;
        footDiscover: string;
        footHomeOn: string;
        footHome: string;
        footProfileOn: string;
        footProfile: string;
    };
    home: {
        analyze: string;
        application: string;
        blueStar: string;
        redStar: string;
        buy: string;
        entBg: string;
        homeDao: string;
        notice: string;
        scan: string;
        summary: string;
        title: string;
        daoTab1: string;
        daoTab2: string;
        daoTab3: string;
        daoTab4: string;
        tokenTab1: string;
        tokenTab2: string;
        tokenTabFilter: string;
    };
    banner: Record<string, string>;
    mining: {
        aboutLevel: string;
        billDown: string;
        billUp: string;
        border1: string;
        border2: string;
        border3: string;
        btn1: string;
        shareBg: string;
        inviteArrowDown: string;
        inviteArrowRight: string;
        inviteLevel1: string;
        inviteLevel2: string;
        inviteLevel3: string;
        inviteLevel4: string;
        inviteLevel5: string;
        invite: string;
        medal: string;
    };
    vip: {
        discord: string;
        giftBg: string;
        shareLogo: string;
        whitePaperIcon: string;
        x: string;
    };
    works: WorksImagesMap;
    ticket: {
        countdownIcon: string;
        upDayIcon: string;
    };
    ido: {
        look: string;
        more: string;
        regularUser: string;
        vipUser: string;
        whitelistedUser: string;
    };
    discover: {
        userHead: string;
        auth: string;
        d1: string;
        d2: string;
        d3: string;
        d1Cn: string;
        d2Cn: string;
        d3Cn: string;
    };
    images: {
        imgWrapper: string;
        playVideoIcon: string;
        qrcodeBg: string;
    };
}
