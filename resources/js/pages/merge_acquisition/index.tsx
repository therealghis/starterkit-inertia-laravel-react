import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    ChevronRight,
    CirclePlus,
    Landmark,
    ScanSearch,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import type { BreadcrumbItem } from '@/types';
import {
    AppCard,
    AppCardContent,
    AppCardDescription,
    AppCardFooter,
    AppCardHeader,
    AppCardIcon,
    AppCardTitle,
} from '@/components/ui/app-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

type OperationMode = {
    value: string;
    label: string;
    eyebrow: string;
    description: string;
    ctaLabel: string;
};

type Summary = {
    activeOpportunities: number;
    buySideOpportunities: number;
    sellSideOpportunities: number;
};

type MergeAcquisitionIndexProps = {
    activeType: string | null;
    operationModes: OperationMode[];
    summary: Summary;
};

const modeIcons = {
    BUY_SIDE: ScanSearch,
    SELL_SIDE: Landmark,
} as const;

const modeCardTones = {
    BUY_SIDE: 'primary',
    SELL_SIDE: 'support',
} as const;

export default function MergeAcquisitionIndex({
    activeType,
    operationModes,
    summary,
}: MergeAcquisitionIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="M&A" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <PageHero tone="support">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                >
                                    Origination Desk
                                </Badge>
                                {activeType ? (
                                    <Badge className="rounded-full px-3 py-1">
                                        Filtro attivo: {activeType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                                    </Badge>
                                ) : null}
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Opportunita M&amp;A</PageHeroTitle>
                                <PageHeroDescription>
                                    Un punto di ingresso chiaro per gestire opportunita
                                    buy-side e sell-side con un&apos;interfaccia sobria,
                                    credibile e pronta a crescere con il flusso operativo.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroStats>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Attive</PageHeroStatLabel>
                                    <PageHeroStatValue>
                                        {summary.activeOpportunities}
                                    </PageHeroStatValue>
                                </PageHeroStat>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Buy-side</PageHeroStatLabel>
                                    <PageHeroStatValue>
                                        {summary.buySideOpportunities}
                                    </PageHeroStatValue>
                                </PageHeroStat>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Sell-side</PageHeroStatLabel>
                                    <PageHeroStatValue>
                                        {summary.sellSideOpportunities}
                                    </PageHeroStatValue>
                                </PageHeroStat>
                            </PageHeroStats>

                            <PageHeroActions>
                                <Button disabled size="lg" aria-label="Creazione opportunita disponibile nel prossimo step">
                                    <CirclePlus className="size-4" />
                                    Nuova opportunita
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <section className="grid gap-4 xl:grid-cols-2">
                    {operationModes.map((mode) => {
                        const Icon = modeIcons[mode.value as keyof typeof modeIcons] ?? BriefcaseBusiness;
                        const isActive = activeType === mode.value;

                        return (
                            <AppCard
                                key={mode.value}
                                tone={modeCardTones[mode.value as keyof typeof modeCardTones] ?? 'default'}
                                className={
                                    isActive
                                        ? 'border-foreground/20 shadow-lg ring-1 ring-foreground/10'
                                        : 'border-border/70'
                                }
                            >
                                <AppCardHeader className="gap-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-3">
                                            <Badge
                                                variant="outline"
                                                className="rounded-full bg-background/65 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase"
                                            >
                                                {mode.eyebrow}
                                            </Badge>
                                            <div className="space-y-2">
                                                <AppCardTitle className="text-2xl tracking-tight">
                                                    {mode.label}
                                                </AppCardTitle>
                                                <AppCardDescription className="max-w-xl text-sm leading-6">
                                                    {mode.description}
                                                </AppCardDescription>
                                            </div>
                                        </div>

                                        <AppCardIcon className="size-12 rounded-2xl">
                                            <Icon className="size-5" />
                                        </AppCardIcon>
                                    </div>
                                </AppCardHeader>

                                <AppCardContent className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="size-4" />
                                        {mode.value === 'BUY_SIDE'
                                            ? `${summary.buySideOpportunities} opportunita attive`
                                            : `${summary.sellSideOpportunities} opportunita attive`}
                                    </div>

                                    {isActive ? (
                                        <Badge className="rounded-full px-3 py-1">
                                            Vista corrente
                                        </Badge>
                                    ) : null}
                                </AppCardContent>

                                <AppCardFooter className="justify-between gap-4 pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Accesso rapido al perimetro operativo dedicato.
                                    </p>

                                    <Button asChild size="lg">
                                        <Link
                                            href={mergeAcquisitionIndex({
                                                query: { type: mode.value },
                                            }).url}
                                        >
                                            {mode.ctaLabel}
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    </Button>
                                </AppCardFooter>
                            </AppCard>
                        );
                    })}
                </section>

                <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/70 p-6 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase"
                            >
                                Prossimo step
                            </Badge>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    Registro opportunita attive
                                </h2>
                                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                    Nel prossimo step inseriamo la tabella con filtri,
                                    dettaglio sensibile in modal e gestione preferiti.
                                    La pagina e gia predisposta per un&apos;esperienza
                                    ordinata, professionale e orientata alla selezione.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="outline" disabled>
                                <CirclePlus className="size-4" />
                                Crea opportunita
                            </Button>
                            <Button variant="ghost" asChild>
                                <Link href={mergeAcquisitionIndex().url}>
                                    Vista completa
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
