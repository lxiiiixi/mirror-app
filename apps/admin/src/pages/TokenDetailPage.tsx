import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { ArrowLeft, CalendarRange, Check, CirclePlus, Save, Trash2, UploadCloud, X } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    contentModules,
    defaultBatches,
    defaultGifts,
    defaultTokenDetail,
    statCards,
    tokenRows,
} from "../mock/tokens";
import type { AirdropBatch, GiftCard, LanguageValue, TokenDetailForm, WorkTypeValue } from "../types/token";

function SectionCard({
    title,
    description,
    children,
    actions,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_30px_rgba(29,41,57,0.08)] backdrop-blur-sm md:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
                    {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}

function FieldLabel({ text }: { text: string }) {
    return <label className="mb-1.5 block text-sm font-medium text-zinc-700">{text}</label>;
}

function SuffixInput({
    suffix,
    value,
    onChange,
    type = "number",
}: {
    suffix: string;
    value: number;
    onChange: (value: number) => void;
    type?: string;
}) {
    return (
        <div className="relative">
            <input
                className="field-input pr-16"
                onChange={(event) => onChange(Number(event.target.value || 0))}
                type={type}
                value={Number.isFinite(value) ? value : 0}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{suffix}</span>
        </div>
    );
}

function normalizeDatetime(value: string) {
    return value.replace("T", " ");
}

const languageOptions: { label: string; value: LanguageValue }[] = [
    { label: "中文", value: "zh" },
    { label: "English", value: "en" },
    { label: "日本語", value: "jp" },
];

const workTypeOptions: { label: string; value: WorkTypeValue }[] = [
    { label: "电影", value: "movie" },
    { label: "小说", value: "novel" },
    { label: "短剧", value: "shortDrama" },
    { label: "音乐", value: "music" },
];

const airdropTone: Record<AirdropBatch["status"], string> = {
    待执行: "bg-zinc-100 text-zinc-600",
    执行中: "bg-amber-100 text-amber-700",
    已完成: "bg-emerald-100 text-emerald-700",
};

export function TokenDetailPage() {
    const { tokenId } = useParams();
    const navigate = useNavigate();

    const token = useMemo(
        () => tokenRows.find((item) => item.id === tokenId) ?? tokenRows[0],
        [tokenId],
    );

    const [form, setForm] = useState<TokenDetailForm>({
        ...defaultTokenDetail,
        tokenName: token.name,
        symbol: token.symbol,
    });
    const [language, setLanguage] = useState<LanguageValue>("zh");
    const [workType, setWorkType] = useState<WorkTypeValue>("movie");
    const [batches, setBatches] = useState<AirdropBatch[]>(defaultBatches);
    const [appendAmount, setAppendAmount] = useState(0);
    const [appendTime, setAppendTime] = useState("2026-02-28T12:00");
    const [gifts, setGifts] = useState<GiftCard[]>(defaultGifts);
    const [modules, setModules] = useState(contentModules);
    const [giftDialogOpen, setGiftDialogOpen] = useState(false);
    const [newGiftTitle, setNewGiftTitle] = useState("新礼品");
    const [newGiftPoints, setNewGiftPoints] = useState(500);
    const [newGiftStock, setNewGiftStock] = useState(100);

    const updateForm = <K extends keyof TokenDetailForm>(key: K, value: TokenDetailForm[K]) => {
        setForm((previous) => ({ ...previous, [key]: value }));
    };

    const handleCoverUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        updateForm("coverImage", URL.createObjectURL(file));
    };

    const addBatch = () => {
        if (!appendAmount || !appendTime) {
            return;
        }

        const batchNo = `A-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
            batches.length + 1,
        ).padStart(2, "0")}`;

        setBatches((previous) => [
            {
                id: `batch-${Date.now()}`,
                batchNo,
                amount: appendAmount,
                time: normalizeDatetime(appendTime),
                status: "待执行",
            },
            ...previous,
        ]);

        setAppendAmount(0);
    };

    const removeBatch = (id: string) => {
        setBatches((previous) => previous.filter((item) => item.id !== id));
    };

    const updateGift = (giftId: string, updater: (gift: GiftCard) => GiftCard) => {
        setGifts((previous) => previous.map((gift) => (gift.id === giftId ? updater(gift) : gift)));
    };

    const removeGift = (giftId: string) => {
        setGifts((previous) => previous.filter((gift) => gift.id !== giftId));
    };

    const createGift = () => {
        setGifts((previous) => [
            {
                id: `gift-${Date.now()}`,
                title: newGiftTitle,
                points: newGiftPoints,
                stock: newGiftStock,
                image:
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=420&q=80",
                status: "下架",
                requiredFields: {
                    recipient: true,
                    phone: false,
                    address: false,
                },
            },
            ...previous,
        ]);

        setGiftDialogOpen(false);
        setNewGiftTitle("新礼品");
        setNewGiftPoints(500);
        setNewGiftStock(100);
    };

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(29,41,57,0.08)] backdrop-blur-sm md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="btn btn-ghost" onClick={() => navigate("/tokens")} type="button">
                            <ArrowLeft className="h-4 w-4" />
                            返回列表
                        </button>
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                            {token.id}
                        </span>
                    </div>
                    <button className="btn btn-brand" type="button">
                        <Save className="h-4 w-4" />
                        保存配置
                    </button>
                </div>
            </section>

            <SectionCard description="三列栅格表单，统一时间范围、金额单位、比例输入和封面上传。" title="基础信息与发行参数">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                        <FieldLabel text="代币名称" />
                        <input
                            className="field-input"
                            onChange={(event) => updateForm("tokenName", event.target.value)}
                            value={form.tokenName}
                        />
                    </div>

                    <div>
                        <FieldLabel text="Symbol" />
                        <input
                            className="field-input"
                            onChange={(event) => updateForm("symbol", event.target.value)}
                            value={form.symbol}
                        />
                    </div>

                    <div>
                        <FieldLabel text="合约地址" />
                        <input
                            className="field-input"
                            onChange={(event) => updateForm("contractAddress", event.target.value)}
                            value={form.contractAddress}
                        />
                    </div>

                    <div>
                        <FieldLabel text="发布时间范围" />
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <input
                                className="field-input"
                                onChange={(event) => updateForm("publishRangeStart", event.target.value)}
                                type="datetime-local"
                                value={form.publishRangeStart}
                            />
                            <span className="text-zinc-400">~</span>
                            <input
                                className="field-input"
                                onChange={(event) => updateForm("publishRangeEnd", event.target.value)}
                                type="datetime-local"
                                value={form.publishRangeEnd}
                            />
                        </div>
                    </div>

                    <div>
                        <FieldLabel text="销售时间范围" />
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <input
                                className="field-input"
                                onChange={(event) => updateForm("saleRangeStart", event.target.value)}
                                type="datetime-local"
                                value={form.saleRangeStart}
                            />
                            <span className="text-zinc-400">~</span>
                            <input
                                className="field-input"
                                onChange={(event) => updateForm("saleRangeEnd", event.target.value)}
                                type="datetime-local"
                                value={form.saleRangeEnd}
                            />
                        </div>
                    </div>

                    <div>
                        <FieldLabel text="封面上传（固定尺寸）" />
                        <label className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-[var(--brand)]/60 hover:bg-pink-50/50">
                            {form.coverImage ? (
                                <img alt="cover" className="h-full w-full rounded-xl object-cover" src={form.coverImage} />
                            ) : (
                                <>
                                    <UploadCloud className="mb-2 h-5 w-5 text-zinc-500" />
                                    <span className="text-xs text-zinc-500">点击上传 320 x 320</span>
                                </>
                            )}
                            <input className="hidden" onChange={handleCoverUpload} type="file" />
                        </label>
                    </div>

                    <div>
                        <FieldLabel text="发行总量" />
                        <SuffixInput onChange={(value) => updateForm("issueAmount", value)} suffix="枚" value={form.issueAmount} />
                    </div>

                    <div>
                        <FieldLabel text="发行价格" />
                        <SuffixInput onChange={(value) => updateForm("issuePrice", value)} suffix="USDT" value={form.issuePrice} />
                    </div>

                    <div>
                        <FieldLabel text="最小购买量" />
                        <SuffixInput onChange={(value) => updateForm("minPurchase", value)} suffix="枚" value={form.minPurchase} />
                    </div>

                    <div>
                        <FieldLabel text="最大购买量" />
                        <SuffixInput onChange={(value) => updateForm("maxPurchase", value)} suffix="枚" value={form.maxPurchase} />
                    </div>

                    <div>
                        <FieldLabel text="流动性比例" />
                        <SuffixInput onChange={(value) => updateForm("liquidityRatio", value)} suffix="%" value={form.liquidityRatio} />
                    </div>

                    <div>
                        <FieldLabel text="推荐奖励比例" />
                        <SuffixInput onChange={(value) => updateForm("referralRatio", value)} suffix="%" value={form.referralRatio} />
                    </div>

                    <div>
                        <FieldLabel text="团队奖励比例" />
                        <SuffixInput onChange={(value) => updateForm("teamRatio", value)} suffix="%" value={form.teamRatio} />
                    </div>

                    <div>
                        <FieldLabel text="礼品积分比例" />
                        <SuffixInput onChange={(value) => updateForm("giftPointRatio", value)} suffix="%" value={form.giftPointRatio} />
                    </div>

                    <div className="md:col-span-2 xl:col-span-3">
                        <FieldLabel text="项目描述" />
                        <textarea
                            className="field-input min-h-24 resize-y"
                            onChange={(event) => updateForm("description", event.target.value)}
                            value={form.description}
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard description="只读统计区，与可编辑字段做视觉区分。" title="实时数据展示">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {statCards.map((item) => (
                        <div
                            className="rounded-xl border border-zinc-200/80 bg-zinc-50/75 p-4 text-zinc-700"
                            key={item.label}
                        >
                            <p className="text-xs text-zinc-500">{item.label}</p>
                            <p className="mt-2 text-2xl font-semibold text-zinc-900">{item.value}</p>
                            <p className="mt-1 text-xs text-emerald-600">{item.trend}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard
                actions={
                    <button className="btn btn-brand" onClick={addBatch} type="button">
                        <CirclePlus className="h-4 w-4" />
                        添加批次
                    </button>
                }
                description="支持追加空投数量与时间，批次可持续新增。"
                title="空投追加配置"
            >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                        <FieldLabel text="追加空投数量" />
                        <SuffixInput onChange={setAppendAmount} suffix="TOK" value={appendAmount} />
                    </div>
                    <div>
                        <FieldLabel text="空投时间" />
                        <div className="relative">
                            <input
                                className="field-input pr-10"
                                onChange={(event) => setAppendTime(event.target.value)}
                                type="datetime-local"
                                value={appendTime}
                            />
                            <CalendarRange className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel text="当前批次数" />
                        <div className="field-input flex items-center justify-between bg-zinc-50 text-zinc-700">
                            <span>共 {batches.length} 批</span>
                            <span className="text-xs text-zinc-500">可删除</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {batches.map((batch) => (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3" key={batch.id}>
                            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-zinc-700">
                                <span className="font-medium text-zinc-900">{batch.batchNo}</span>
                                <span>{batch.amount.toLocaleString("zh-CN")} TOK</span>
                                <span className="text-zinc-400">{batch.time}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs ${airdropTone[batch.status]}`}>{batch.status}</span>
                            </div>
                            <button
                                className="inline-flex items-center rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50"
                                onClick={() => removeBatch(batch.id)}
                                type="button"
                            >
                                删除
                            </button>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard description="分段选择器用于多语言与作品类型快速切换。" title="多语言与类型选择">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                        <FieldLabel text="语言切换" />
                        <ToggleGroup.Root
                            className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1"
                            onValueChange={(value) => {
                                if (value) {
                                    setLanguage(value as LanguageValue);
                                }
                            }}
                            type="single"
                            value={language}
                        >
                            {languageOptions.map((item) => (
                                <ToggleGroup.Item
                                    className="rounded-lg px-4 py-2 text-sm text-zinc-600 transition data-[state=on]:bg-[var(--brand)] data-[state=on]:text-white"
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </ToggleGroup.Item>
                            ))}
                        </ToggleGroup.Root>
                    </div>

                    <div>
                        <FieldLabel text="作品类型" />
                        <ToggleGroup.Root
                            className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1"
                            onValueChange={(value) => {
                                if (value) {
                                    setWorkType(value as WorkTypeValue);
                                }
                            }}
                            type="single"
                            value={workType}
                        >
                            {workTypeOptions.map((item) => (
                                <ToggleGroup.Item
                                    className="rounded-lg px-4 py-2 text-sm text-zinc-600 transition data-[state=on]:bg-[var(--brand)] data-[state=on]:text-white"
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </ToggleGroup.Item>
                            ))}
                        </ToggleGroup.Root>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                actions={
                    <Dialog.Root onOpenChange={setGiftDialogOpen} open={giftDialogOpen}>
                        <Dialog.Trigger asChild>
                            <button className="btn btn-brand" type="button">
                                <CirclePlus className="h-4 w-4" />
                                创建礼品
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" />
                            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white p-5 shadow-2xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <Dialog.Title className="text-base font-semibold text-zinc-900">创建礼品</Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100" type="button">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </Dialog.Close>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <FieldLabel text="礼品标题" />
                                        <input
                                            className="field-input"
                                            onChange={(event) => setNewGiftTitle(event.target.value)}
                                            value={newGiftTitle}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel text="所需积分" />
                                            <SuffixInput onChange={setNewGiftPoints} suffix="分" value={newGiftPoints} />
                                        </div>
                                        <div>
                                            <FieldLabel text="库存数量" />
                                            <SuffixInput onChange={setNewGiftStock} suffix="件" value={newGiftStock} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end gap-2">
                                    <Dialog.Close asChild>
                                        <button className="btn btn-ghost" type="button">
                                            取消
                                        </button>
                                    </Dialog.Close>
                                    <button className="btn btn-brand" onClick={createGift} type="button">
                                        <Check className="h-4 w-4" />
                                        确认创建
                                    </button>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                }
                description="每个礼品独立卡片，支持创建 / 上架 / 下架 / 删除，折叠后保持页面紧凑。"
                title="礼品与兑换系统"
            >
                <Accordion.Root className="space-y-3" type="multiple">
                    {gifts.map((gift) => (
                        <Accordion.Item className="overflow-hidden rounded-xl border border-zinc-200" key={gift.id} value={gift.id}>
                            <Accordion.Header>
                                <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 bg-zinc-50 px-3 py-3 text-left">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <img alt={gift.title} className="h-14 w-14 rounded-lg object-cover" src={gift.image} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-zinc-900">{gift.title}</p>
                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                {gift.points} 积分 · 库存 {gift.stock}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                gift.status === "上架"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-zinc-200 text-zinc-600"
                                            }`}
                                        >
                                            {gift.status}
                                        </span>
                                        <span className="text-zinc-400 transition group-data-[state=open]:rotate-180">⌄</span>
                                    </div>
                                </Accordion.Trigger>
                            </Accordion.Header>

                            <Accordion.Content className="bg-white px-3 py-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                        <FieldLabel text="礼品标题" />
                                        <input
                                            className="field-input"
                                            onChange={(event) =>
                                                updateGift(gift.id, (current) => ({ ...current, title: event.target.value }))
                                            }
                                            value={gift.title}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel text="所需积分" />
                                        <SuffixInput
                                            onChange={(value) =>
                                                updateGift(gift.id, (current) => ({ ...current, points: value }))
                                            }
                                            suffix="分"
                                            value={gift.points}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel text="库存数量" />
                                        <SuffixInput
                                            onChange={(value) =>
                                                updateGift(gift.id, (current) => ({ ...current, stock: value }))
                                            }
                                            suffix="件"
                                            value={gift.stock}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel text="信息字段配置" />
                                        <div className="space-y-2 rounded-xl border border-zinc-200 p-3">
                                            {[
                                                { key: "recipient", label: "收件人" },
                                                { key: "phone", label: "电话" },
                                                { key: "address", label: "地址" },
                                            ].map((item) => (
                                                <label
                                                    className="flex items-center justify-between text-sm text-zinc-700"
                                                    key={item.key}
                                                >
                                                    {item.label}
                                                    <Switch.Root
                                                        checked={gift.requiredFields[item.key as keyof GiftCard["requiredFields"]]}
                                                        className="relative h-6 w-11 rounded-full bg-zinc-300 transition data-[state=checked]:bg-[var(--brand)]"
                                                        onCheckedChange={(checked) =>
                                                            updateGift(gift.id, (current) => ({
                                                                ...current,
                                                                requiredFields: {
                                                                    ...current.requiredFields,
                                                                    [item.key]: checked,
                                                                },
                                                            }))
                                                        }
                                                    >
                                                        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[22px]" />
                                                    </Switch.Root>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() =>
                                            updateGift(gift.id, (current) => ({
                                                ...current,
                                                status: current.status === "上架" ? "下架" : "上架",
                                            }))
                                        }
                                        type="button"
                                    >
                                        {gift.status === "上架" ? "下架" : "上架"}
                                    </button>
                                    <button
                                        className="btn btn-ghost text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                                        onClick={() => removeGift(gift.id)}
                                        type="button"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        删除
                                    </button>
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </SectionCard>

            <SectionCard description="内容扩展区域，支持模块开关与优先级调整。" title="内容扩展">
                <div className="space-y-2">
                    {modules.map((module) => (
                        <div
                            className="grid grid-cols-1 items-center gap-3 rounded-xl border border-zinc-200 p-3 md:grid-cols-[1fr_auto_auto]"
                            key={module.id}
                        >
                            <p className="font-medium text-zinc-800">{module.name}</p>
                            <Switch.Root
                                checked={module.enabled}
                                className="relative h-6 w-11 rounded-full bg-zinc-300 transition data-[state=checked]:bg-[var(--brand)]"
                                onCheckedChange={(checked) =>
                                    setModules((previous) =>
                                        previous.map((item) =>
                                            item.id === module.id ? { ...item, enabled: checked } : item,
                                        ),
                                    )
                                }
                            >
                                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[22px]" />
                            </Switch.Root>
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                优先级
                                <input
                                    className="field-input h-9 w-20"
                                    onChange={(event) => {
                                        const value = Number(event.target.value || 0);
                                        setModules((previous) =>
                                            previous.map((item) =>
                                                item.id === module.id ? { ...item, priority: value } : item,
                                            ),
                                        );
                                    }}
                                    type="number"
                                    value={module.priority}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}
