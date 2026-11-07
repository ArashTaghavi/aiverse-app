import { useId } from "react";

export interface AreaChartProps {
    values: readonly number[];
    labels: readonly string[];
    label: string;
    unit?: string;
}

export default function AreaChart({
    values,
    labels,
    label,
    unit = "",
}: AreaChartProps) {
    const id = useId().replaceAll(":", "");
    const samples = values.map((value) =>
        Number.isFinite(value) ? Math.max(0, value) : 0,
    );
    if (!samples.length)
        return <p className="p-6 text-sm text-ui-muted">No chart data.</p>;
    const max = Math.max(1, ...samples) * 1.15;
    const points = samples.map(
        (value, index) =>
            `${(index / Math.max(1, samples.length - 1)) * 600},${160 - (value / max) * 150}`,
    );
    return (
        <div className="flex gap-3">
            <div className="flex w-12 shrink-0 flex-col justify-between pb-6 text-right font-mono text-[10px] text-ui-muted">
                {[max, max / 2, 0].map((value, index) => (
                    <span key={index}>
                        {Math.round(value).toLocaleString("en-US")}
                        {unit}
                    </span>
                ))}
            </div>
            <div className="min-w-0 flex-1">
                <svg
                    viewBox="0 0 600 170"
                    preserveAspectRatio="none"
                    className="h-44 w-full"
                    role="img"
                    aria-label={label}
                >
                    <title>{label}</title>
                    <desc>
                        {samples
                            .map(
                                (value, index) =>
                                    `${index + 1}: ${value}${unit}`,
                            )
                            .join("; ")}
                    </desc>
                    <defs>
                        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="0%"
                                stopColor="#a78bfa"
                                stopOpacity="0.22"
                            />
                            <stop
                                offset="100%"
                                stopColor="#a78bfa"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    {[10, 85, 160].map((y) => (
                        <line
                            key={y}
                            x1="0"
                            x2="600"
                            y1={y}
                            y2={y}
                            stroke="white"
                            strokeOpacity="0.06"
                            strokeDasharray="4 6"
                        />
                    ))}
                    <path
                        d={`M 0,170 L ${points.join(" L ")} L 600,170 Z`}
                        fill={`url(#${id})`}
                    />
                    <polyline
                        points={points.join(" ")}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="mt-2 flex justify-between text-[10px] text-ui-muted">
                    {labels.map((text, index) => (
                        <span key={index}>{text}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
