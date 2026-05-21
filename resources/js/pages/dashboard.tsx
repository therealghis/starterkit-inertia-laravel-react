import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis
} from 'recharts';
import {
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    Globe2,
    Landmark,
    MailOpen,
    Sparkles,
    Star,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import { index as mergeAcquisitionMineIndex } from '@/routes/merge_acquisition_mine';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AppCard,
    AppCardContent,
    AppCardDescription,
    AppCardFooter,
    AppCardHeader,
    AppCardIcon,
    AppCardTitle,
} from '@/components/ui/app-card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '@/components/ui/chart';
import {
    PageHero,
    PageHeroActions,
    PageHeroAside,
    PageHeroBody,
    PageHeroContent,
    PageHeroDescription,
    PageHeroEyebrow,
    PageHeroStat,
    PageHeroStatLabel,
    PageHeroStats,
    PageHeroStatValue,
    PageHeroTitle,
} from '@/components/ui/page-hero';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type DashboardProps = {
    kpis: {
        myOpportunities: number;
        myOpportunitiesFavoritedByOthers: number;
        myOpportunitiesWithContactRequests: number;
        myTotalContactRequestsReceived: number;
        totalPlatformOpportunities: number;
    };
    myOpportunityBreakdown: {
        buySide: number;
        sellSide: number;
    };
    contactRequestsReceivedTrend: Array<{
        date: string;
        value: number;
    }>;
    topInterestingOpportunities: Array<{
        id: number;
        opportunityCode: string;
        operationType: string;
        receivedFavoritesCount: number;
        receivedContactRequestsCount: number;
        totalSignalsCount: number;
    }>;
};

type KpiCardProps = {
    title: string;
    value: number;
    description: string;
    detail?: string;
    tone: 'primary' | 'support' | 'accent' | 'caution';
    icon: ReactNode;
};

const breakdownChartConfig = {
    value: {
        label: 'Opportunità',
        color: 'var(--color-chart-2)',
    },
} as const;

const contactTrendChartConfig = {
    value: {
        label: 'Richieste',
        color: 'var(--color-chart-3)',
    },
} as const;

function formatNumber(value: number): string {
    return new Intl.NumberFormat('it-IT').format(value);
}

function formatShortDate(value: string): string {
    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
    }).format(new Date(`${value}T00:00:00`));
}

function KpiCard({
    title,
    value,
    description,
    detail,
    tone,
    icon,
}: KpiCardProps) {
    return (
        <AppCard tone={tone} className="gap-4">
            <AppCardHeader className="grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-x-4 gap-y-2">
                <AppCardIcon>{icon}</AppCardIcon>
                <div className="space-y-1">
                    <AppCardDescription className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                        {title}
                    </AppCardDescription>
                    <AppCardTitle className="text-4xl tracking-tight">
                        {formatNumber(value)}
                    </AppCardTitle>
                </div>
            </AppCardHeader>
            <AppCardContent className="space-y-2">
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
                {detail ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                        {detail}
                    </Badge>
                ) : null}
            </AppCardContent>
        </AppCard>
    );
}

export default function Dashboard({
    kpis,
    myOpportunityBreakdown,
    contactRequestsReceivedTrend,
    topInterestingOpportunities,
}: DashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ];

    const breakdownData = [
        {
            name: 'Buy-side',
            value: myOpportunityBreakdown.buySide,
            fill: 'var(--color-chart-2)',
        },
        {
            name: 'Sell-side',
            value: myOpportunityBreakdown.sellSide,
            fill: 'var(--color-chart-5)',
        },
    ];

    const totalRequestsInRange = contactRequestsReceivedTrend.reduce(
        (total, item) => total + item.value,
        0,
    );
    const contactedOpportunitiesRate = kpis.myOpportunities === 0
        ? 0
        : Math.round((kpis.myOpportunitiesWithContactRequests / kpis.myOpportunities) * 100);
    const opportunitiesSavedRate = kpis.myOpportunities === 0
        ? 0
        : Math.round((kpis.myOpportunitiesFavoritedByOthers / kpis.myOpportunities) * 100);
    const averageRequestsPerContactedOpportunity = kpis.myOpportunitiesWithContactRequests === 0
        ? 0
        : Number(
            (
                kpis.myTotalContactRequestsReceived /
                kpis.myOpportunitiesWithContactRequests
            ).toFixed(1),
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <PageHero tone="primary">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                >
                                    M&amp;A Control Room
                                </Badge>
                                <Badge className="rounded-full px-3 py-1">
                                    Focus sulle tue opportunità
                                </Badge>
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Dashboard opportunità</PageHeroTitle>
                                <PageHeroDescription>
                                    Una vista operativa sui volumi che gestisci, sui segnali ricevuti dal mercato
                                    e sulla tua incidenza rispetto all&apos;intera piattaforma.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroStats>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Richieste 30 giorni</PageHeroStatLabel>
                                    <PageHeroStatValue>
                                        {formatNumber(totalRequestsInRange)}
                                    </PageHeroStatValue>
                                </PageHeroStat>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Opportunity share</PageHeroStatLabel>
                                    <PageHeroStatValue>
                                        {kpis.totalPlatformOpportunities === 0
                                            ? '0%'
                                            : `${Math.round((kpis.myOpportunities / kpis.totalPlatformOpportunities) * 100)}%`}
                                    </PageHeroStatValue>
                                </PageHeroStat>
                            </PageHeroStats>

                            <PageHeroActions>
                                <Button asChild size="lg">
                                    <Link href={mergeAcquisitionMineIndex()}>
                                        Le mie opportunità
                                        <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg">
                                    <Link href={mergeAcquisitionIndex()}>
                                        Tutta le Opportunità
                                        <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                    <KpiCard
                        title="Le mie opportunità"
                        value={kpis.myOpportunities}
                        description="Totale delle opportunità M&A attive pubblicate dal tuo account."
                        tone="primary"
                        icon={<BriefcaseBusiness className="size-5" />}
                    />
                    <KpiCard
                        title="Salvate da altri"
                        value={kpis.myOpportunitiesFavoritedByOthers}
                        description="Opportunità tue che almeno un altro utente ha inserito tra i preferiti."
                        detail={`${opportunitiesSavedRate}% del tuo portafoglio`}
                        tone="support"
                        icon={<Star className="size-5" />}
                    />
                    <KpiCard
                        title="Opportunità contattate"
                        value={kpis.myOpportunitiesWithContactRequests}
                        description="Numero di opportunità che hanno già ricevuto almeno una richiesta."
                        detail={`${formatNumber(kpis.myTotalContactRequestsReceived)} richieste totali`}
                        tone="accent"
                        icon={<MailOpen className="size-5" />}
                    />
                    <KpiCard
                        title="Totale piattaforma"
                        value={kpis.totalPlatformOpportunities}
                        description="Numero complessivo di opportunità attive oggi sulla piattaforma."
                        tone="caution"
                        icon={<Globe2 className="size-5" />}
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                    <AppCard tone="support">
                        <AppCardHeader className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <AppCardDescription className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                                        Richieste ricevute nel tempo
                                    </AppCardDescription>
                                    <AppCardTitle className="text-2xl tracking-tight">
                                        Ultimi 30 giorni
                                    </AppCardTitle>
                                </div>
                                <Badge variant="outline" className="rounded-full px-3 py-1">
                                    {formatNumber(kpis.myTotalContactRequestsReceived)} totali
                                </Badge>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Andamento giornaliero delle richieste ricevute dalle tue opportunità attive.
                            </p>
                        </AppCardHeader>
                        <AppCardContent>
                            <ChartContainer
                                config={contactTrendChartConfig}
                                className="h-[280px] w-full"
                            >
                                <AreaChart data={contactRequestsReceivedTrend}>
                                    <defs>
                                        <linearGradient id="contact-requests-fill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={24}
                                        tickFormatter={formatShortDate}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        width={32}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) =>
                                                    typeof value === 'string'
                                                        ? formatShortDate(value)
                                                        : value
                                                }
                                            />
                                        }
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="var(--color-value)"
                                        fill="url(#contact-requests-fill)"
                                        strokeWidth={2.5}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </AppCardContent>
                        <AppCardFooter className="justify-between gap-3 text-sm text-muted-foreground">
                            <span>{contactedOpportunitiesRate}% delle tue opportunità è già stata contattata</span>
                            <span>{averageRequestsPerContactedOpportunity} richieste medie per opportunità contattata</span>
                        </AppCardFooter>
                    </AppCard>

                    <div className="grid gap-4">
                        <AppCard tone="accent">
                            <AppCardHeader className="space-y-2">
                                <AppCardDescription className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                                    Buy-side vs Sell-side
                                </AppCardDescription>
                                <AppCardTitle className="text-2xl tracking-tight">
                                    Mix del tuo portafoglio
                                </AppCardTitle>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-4 md:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
                                <ChartContainer
                                    config={breakdownChartConfig}
                                    className="mx-auto h-[220px] w-full max-w-[220px]"
                                >
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={breakdownData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={58}
                                            outerRadius={82}
                                            paddingAngle={4}
                                        >
                                            {breakdownData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>

                                <div className="grid gap-3">
                                    {breakdownData.map((item) => (
                                        <div
                                            key={item.name}
                                            className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{ backgroundColor: item.fill }}
                                                    />
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                </div>
                                                <span className="text-lg font-semibold">
                                                    {formatNumber(item.value)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard tone="caution">
                            <AppCardHeader className="space-y-2">
                                <AppCardDescription className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                                    Lettura rapida
                                </AppCardDescription>
                                <AppCardTitle className="text-2xl tracking-tight">
                                    Segnali utili
                                </AppCardTitle>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-3">
                                <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3">
                                    <div className="mb-1 flex items-center gap-2">
                                        <Sparkles className="size-4 text-[color:var(--chart-1)]" />
                                        <span className="text-sm font-medium">Opportunità con attenzione esterna</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatNumber(kpis.myOpportunitiesFavoritedByOthers)} schede sono state salvate da altri utenti.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3">
                                    <div className="mb-1 flex items-center gap-2">
                                        <MailOpen className="size-4 text-[color:var(--chart-3)]" />
                                        <span className="text-sm font-medium">Copertura richieste</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {contactedOpportunitiesRate}% delle tue opportunità ha già generato almeno una richiesta.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3">
                                    <div className="mb-1 flex items-center gap-2">
                                        <Building2 className="size-4 text-[color:var(--chart-5)]" />
                                        <span className="text-sm font-medium">Domanda media</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {averageRequestsPerContactedOpportunity} richieste per opportunità contattata.
                                    </p>
                                </div>
                            </AppCardContent>
                        </AppCard>
                    </div>
                </section>

                <section>
                    <AppCard tone="default">
                        <AppCardHeader className="space-y-2">
                            <AppCardDescription className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                                Classifica dettagliata
                            </AppCardDescription>
                            <AppCardTitle className="text-2xl tracking-tight">
                                Opportunità ordinate per segnali
                            </AppCardTitle>
                        </AppCardHeader>
                        <AppCardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Codice</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-right">Preferiti</TableHead>
                                        <TableHead className="text-right">Richieste</TableHead>
                                        <TableHead className="text-right">Totale</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topInterestingOpportunities.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-12 text-center text-sm text-muted-foreground"
                                            >
                                                Nessun segnale disponibile sulle tue opportunità.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topInterestingOpportunities.map((opportunity) => (
                                            <TableRow key={opportunity.id}>
                                                <TableCell className="font-medium">
                                                    {opportunity.opportunityCode}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            opportunity.operationType === 'BUY_SIDE'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="rounded-full px-3 py-1"
                                                    >
                                                        {opportunity.operationType === 'BUY_SIDE'
                                                            ? (
                                                                <>
                                                                    <Landmark className="size-3.5" />
                                                                    Buy-side
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    <Building2 className="size-3.5" />
                                                                    Sell-side
                                                                </>
                                                            )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatNumber(opportunity.receivedFavoritesCount)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatNumber(opportunity.receivedContactRequestsCount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                                                        {formatNumber(opportunity.totalSignalsCount)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </AppCardContent>
                        <AppCardFooter className="justify-between gap-3 text-sm text-muted-foreground">
                            <span>La classifica unisce preferiti ricevuti e richieste ricevute.</span>
                            <Button asChild variant="outline" size="sm">
                                <Link href={mergeAcquisitionMineIndex()}>
                                    Vai alle mie opportunità
                                </Link>
                            </Button>
                        </AppCardFooter>
                    </AppCard>
                </section>
            </div>
        </AppLayout>
    );
}
