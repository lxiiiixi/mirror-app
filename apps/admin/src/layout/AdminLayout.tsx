import { LayoutGrid, Menu, PanelLeftClose, PanelLeftOpen, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

function resolvePageMeta(pathname: string) {
    if (pathname.startsWith("/tokens/")) {
        return {
            title: "代币详情配置",
            breadcrumbs: [{ label: "代币管理", href: "/tokens" }, { label: "详情配置" }],
        };
    }

    return {
        title: "代币管理",
        breadcrumbs: [{ label: "控制台" }, { label: "代币管理" }],
    };
}

export function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const pageMeta = useMemo(() => resolvePageMeta(location.pathname), [location.pathname]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_20%_-5%,rgba(235,20,132,0.18),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(251,207,232,0.45),transparent_30%),#f7f8fc)] text-zinc-800">
            <div className="relative flex min-h-screen">
                {mobileOpen ? (
                    <button
                        aria-label="关闭侧边栏"
                        className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[1px] md:hidden"
                        onClick={() => setMobileOpen(false)}
                        type="button"
                    />
                ) : null}

                <aside
                    className={`glass-sidebar fixed inset-y-3 left-3 z-40 flex flex-col overflow-hidden rounded-2xl border border-white/50 shadow-[0_20px_60px_rgba(119,129,159,0.35)] transition-all duration-300 md:translate-x-0 ${
                        collapsed ? "w-[66px]" : "w-[260px]"
                    } ${mobileOpen ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"}`}
                >
                    <div className="border-b border-white/40 px-3 py-4">
                        <div className="flex items-center gap-2 px-1">
                            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--brand)]/90 text-white shadow-lg shadow-pink-500/30">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            {!collapsed ? (
                                <span className="truncate text-sm font-semibold">Mirror Admin</span>
                            ) : null}
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 px-3 py-5">
                        <NavLink
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-[var(--brand)] text-white shadow-lg shadow-pink-500/30"
                                        : "text-zinc-700 hover:bg-white/70"
                                }`
                            }
                            onClick={() => setMobileOpen(false)}
                            to="/tokens"
                        >
                            <LayoutGrid className="h-4 w-4 shrink-0" />
                            {!collapsed ? <span className="truncate">代币管理</span> : null}
                        </NavLink>
                    </nav>
                    <div
                        className={`flex items-center justify-between ${!collapsed ? "flex-row" : "flex-col"}`}
                    >
                        <div className="border-t border-white/40 px-3 py-4 text-xs text-zinc-500">
                            {!collapsed ? "Mirror@gmail.com" : "Mirror"}
                        </div>
                        <div className="py-4 px-3">
                            <button
                                className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/70 cursor-pointer"
                                onClick={() => setCollapsed(value => !value)}
                                type="button"
                            >
                                {collapsed ? (
                                    <PanelLeftOpen className="h-4 w-4" />
                                ) : (
                                    <PanelLeftClose className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </aside>

                <div
                    className={`flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ${
                        collapsed ? "md:pl-[108px]" : "md:pl-[282px]"
                    }`}
                >
                    <header className="sticky top-0 z-20 border-b border-white/55 bg-white/65 px-4 py-3 backdrop-blur-xl md:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    className="grid h-9 w-9 place-items-center rounded-xl border border-white bg-white/70 text-zinc-700 md:hidden"
                                    onClick={() => setMobileOpen(true)}
                                    type="button"
                                >
                                    <Menu className="h-4 w-4" />
                                </button>

                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-zinc-900">
                                        {pageMeta.title}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                                        {pageMeta.breadcrumbs.map((item, index) => (
                                            <span
                                                className="flex items-center gap-2"
                                                key={`${item.label}-${index}`}
                                            >
                                                {item.href ? (
                                                    <NavLink
                                                        className="hover:text-zinc-700"
                                                        to={item.href}
                                                    >
                                                        {item.label}
                                                    </NavLink>
                                                ) : (
                                                    <span>{item.label}</span>
                                                )}
                                                {index < pageMeta.breadcrumbs.length - 1 ? (
                                                    <span>/</span>
                                                ) : null}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="hidden items-center gap-2 rounded-xl border border-white bg-white/70 px-3 py-2 text-sm text-zinc-500 md:flex">
                                    <Search className="h-4 w-4" />
                                    <input
                                        className="w-40 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                                        placeholder="全局搜索"
                                    />
                                </label>
                                <button className="btn btn-ghost" type="button">
                                    导出
                                </button>
                                <button className="btn btn-brand" type="button">
                                    新建
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto px-4 pb-6 pt-4 md:px-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
