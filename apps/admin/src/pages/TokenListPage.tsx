import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, CirclePlus, Download, Eye, Filter, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenRows } from "../mock/tokens";
import type { TokenRow, TokenStatus } from "../types/token";

const statusTextColor: Record<TokenStatus, string> = {
    草稿: "text-zinc-600 bg-zinc-100",
    预热: "text-amber-700 bg-amber-100",
    销售中: "text-emerald-700 bg-emerald-100",
    已结束: "text-slate-700 bg-slate-200",
};

function formatMoney(value: number) {
    return `${value.toLocaleString("zh-CN")} USDT`;
}

function StatusPill({ status }: { status: TokenStatus }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusTextColor[status]}`}>
            {status}
        </span>
    );
}

function OperationButtons({ row }: { row: TokenRow }) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
                onClick={() => navigate(`/tokens/${row.id}`)}
                type="button"
            >
                <Eye className="h-3.5 w-3.5" />
                查看
            </button>
        </div>
    );
}

export function TokenListPage() {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<"全部" | TokenStatus>("全部");
    const [sortByProgress, setSortByProgress] = useState(false);
    const navigate = useNavigate();

    const rows = useMemo(() => {
        const lowerKeyword = keyword.trim().toLowerCase();
        const filtered = tokenRows.filter((item) => {
            const matchedStatus = status === "全部" ? true : item.status === status;
            const matchedKeyword =
                lowerKeyword.length === 0
                    ? true
                    : [item.id, item.name, item.symbol].some((part) => part.toLowerCase().includes(lowerKeyword));

            return matchedStatus && matchedKeyword;
        });

        if (!sortByProgress) {
            return filtered;
        }

        return [...filtered].sort((a, b) => b.progress - a.progress);
    }, [keyword, sortByProgress, status]);

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(29,41,57,0.08)] backdrop-blur-sm md:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900">代币列表</h1>
                        <p className="mt-1 text-sm text-zinc-500">数据驱动表格，支持固定列、横向滚动、筛选与快速跳转详情配置。</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="btn btn-ghost" type="button">
                            <Download className="h-4 w-4" />
                            导出列表
                        </button>
                        <button className="btn btn-brand" onClick={() => navigate("/tokens/TK-1001")} type="button">
                            <CirclePlus className="h-4 w-4" />
                            创建代币
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                        className="field-input min-w-[220px] flex-1"
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="搜索代币 ID / 名称 / Symbol"
                        value={keyword}
                    />

                    <Select.Root value={status} onValueChange={(value) => setStatus(value as "全部" | TokenStatus)}>
                        <Select.Trigger className="inline-flex h-10 min-w-32 items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 data-[placeholder]:text-zinc-400">
                            <Select.Value placeholder="状态" />
                            <Select.Icon>
                                <ChevronDown className="h-4 w-4 text-zinc-500" />
                            </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content className="z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                                <Select.Viewport className="p-1">
                                    {["全部", "草稿", "预热", "销售中", "已结束"].map((item) => (
                                        <Select.Item
                                            className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                                            key={item}
                                            value={item}
                                        >
                                            <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                                <Check className="h-4 w-4 text-[var(--brand)]" />
                                            </Select.ItemIndicator>
                                            <Select.ItemText>{item}</Select.ItemText>
                                        </Select.Item>
                                    ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>

                    <button className="btn btn-ghost" onClick={() => setSortByProgress((value) => !value)} type="button">
                        <Filter className="h-4 w-4" />
                        {sortByProgress ? "已按进度排序" : "按进度排序"}
                    </button>

                    <button className="btn btn-ghost" type="button">
                        <RefreshCcw className="h-4 w-4" />
                        刷新
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(29,41,57,0.08)] backdrop-blur-sm">
                <ScrollArea.Root className="h-[calc(100vh-295px)] min-h-[380px] w-full overflow-hidden rounded-2xl">
                    <ScrollArea.Viewport className="h-full w-full">
                        <table className="w-full min-w-[1450px] border-separate border-spacing-0 text-sm">
                            <thead className="sticky top-0 z-20">
                                <tr className="bg-zinc-50/95 text-xs uppercase tracking-wide text-zinc-500">
                                    <th className="sticky left-0 z-30 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 text-left font-semibold">
                                        ID / 名称
                                    </th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">Symbol</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">发行价格</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">募集金额</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">销售进度</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">买卖人数</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">流动性余额</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">签到人数</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">团队数量</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">空投情况</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">更新时间</th>
                                    <th className="border-b border-zinc-200 px-4 py-3 text-left font-semibold">状态</th>
                                    <th className="sticky right-0 z-30 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 text-right font-semibold">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr
                                        className="group cursor-pointer border-b border-zinc-100 text-zinc-700 transition hover:bg-pink-50/50"
                                        key={row.id}
                                        onClick={() => navigate(`/tokens/${row.id}`)}
                                    >
                                        <td className="sticky left-0 z-10 border-b border-zinc-100 bg-white px-4 py-3 group-hover:bg-pink-50/85">
                                            <p className="font-semibold text-zinc-900">{row.id}</p>
                                            <p className="mt-0.5 text-xs text-zinc-500">{row.name}</p>
                                        </td>
                                        <td className="border-b border-zinc-100 px-4 py-3 font-medium">{row.symbol}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.price.toFixed(2)} USDT</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{formatMoney(row.raised)}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.progress}%</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.buyers.toLocaleString("zh-CN")}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{formatMoney(row.liquidity)}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.checkins.toLocaleString("zh-CN")}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.teams}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.airdrop.toLocaleString("zh-CN")} TOK</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">{row.updatedAt}</td>
                                        <td className="border-b border-zinc-100 px-4 py-3">
                                            <StatusPill status={row.status} />
                                        </td>
                                        <td className="sticky right-0 z-10 border-b border-zinc-100 bg-white px-4 py-3 group-hover:bg-pink-50/85">
                                            <OperationButtons row={row} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar className="flex touch-none select-none bg-zinc-100 p-0.5" orientation="horizontal">
                        <ScrollArea.Thumb className="flex-1 rounded-full bg-zinc-300" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Scrollbar className="flex touch-none select-none bg-zinc-100 p-0.5" orientation="vertical">
                        <ScrollArea.Thumb className="flex-1 rounded-full bg-zinc-300" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Corner className="bg-zinc-100" />
                </ScrollArea.Root>
            </section>
        </div>
    );
}
