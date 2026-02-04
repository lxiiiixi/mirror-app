import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export interface QrcodeCanvasProps {
    value: string;
    size?: number;
    className?: string;
}

export function QrcodeCanvas({ value, size = 60, className = "" }: QrcodeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!value || !canvasRef.current) return;

        QRCode.toCanvas(canvasRef.current, value, {
            width: size,
            margin: 0,
            color: {
                dark: "#ffffff",
                light: "#0000001A",
            },
        }).catch(error => {
            console.error("[QrcodeCanvas] render failed", error);
        });
    }, [size, value]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
        />
    );
}
