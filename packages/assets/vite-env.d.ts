/** Vite import.meta.glob（本包由使用 Vite 的应用打包时处理） */
interface ImportMeta {
    glob: (pattern: string, options?: { eager?: boolean }) => Record<string, { default: string }>;
}

declare module "*.png" {
    const src: string;
    export default src;
}

declare module "*.svg" {
    const src: string;
    export default src;
}

declare module "*.ico" {
    const src: string;
    export default src;
}

declare module "*.jpg" {
    const src: string;
    export default src;
}
