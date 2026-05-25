import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type DueDiligenceProgressSummaryProps = {
    summary: {
        total: number;
        open: number;
        in_progress: number;
        completed: number;
        not_applicable: number;
        completion_percentage: number;
    };
};

type SummaryMetric = {
    label: string;
    value: number | string;
};

function formatPercentage(value: number): string {
    return new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function DueDiligenceProgressSummary({
    summary,
}: DueDiligenceProgressSummaryProps) {
    const metrics: SummaryMetric[] = [
        {
            label: 'Totale richieste',
            value: summary.total,
        },
        {
            label: 'Aperte',
            value: summary.open,
        },
        {
            label: 'In corso',
            value: summary.in_progress,
        },
        {
            label: 'Completate',
            value: summary.completed,
        },
        {
            label: 'N/A',
            value: summary.not_applicable,
        },
        {
            label: 'Percentuale completamento',
            value: `${formatPercentage(summary.completion_percentage)}%`,
        },
    ];

    return (
        <Card className="border-border/70 bg-card/90">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <CardTitle>Riepilogo avanzamento</CardTitle>
                    <CardDescription>
                        Stato sintetico della checklist documentale della due diligence.
                    </CardDescription>
                </div>

                <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
                    {formatPercentage(summary.completion_percentage)}% completato
                </Badge>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="rounded-2xl border border-border/70 bg-background/60 px-4 py-4"
                    >
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
