import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Eye,
    Heart,
    BriefcaseBusiness,
    Building2,
    ChevronRight,
    CirclePlus,
    Landmark,
    LayoutList,
    ScanSearch,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
    destroy as destroyFavorite,
    store as storeFavorite,
} from '@/actions/App/Http/Controllers/MergeAcquisitionFavoriteController';
import AppLayout from '@/layouts/app-layout';
import ConfirmActionDialog from '@/components/confirm-action-dialog';
import type { DataTableFilterDef } from '@/components/data-table-filters';
import { ServerDataTable } from '@/components/server-data-table';
import type { ServerTableQuery } from '@/components/server-data-table';
import { dashboard } from '@/routes';
import {
    buy_side as mergeAcquisitionBuySide,
    index as mergeAcquisitionIndex,
    sell_side as mergeAcquisitionSellSide,
} from '@/routes/merge_acquisition';
import type { BreadcrumbItem } from '@/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    opportunities: OpportunityRow[];
    tableState: TableState;
    rowCount: number;
    pageCount: number;
    filterOptions: FilterOptions;
    summary: Summary;
};

type OpportunityRow = {
    id: number;
    opportunityCode: string;
    operationType: string;
    activitySector: string;
    legalEntity: string;
    activityDescription: string;
    product: string;
    atecoCode: string;
    headquarters: string;
    favorite: boolean;
    companyName: string;
    companyDescription: string;
};

type TableState = {
    columnFilters: Array<{
        id: string;
        value: boolean | number | string | string[];
    }>;
    sorting: Array<{
        id: string;
        desc: boolean;
    }>;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
};

type FilterOptions = {
    economicActivities: Array<{
        label: string;
        value: string;
    }>;
};

const modeIcons = {
    BUY_SIDE: ScanSearch,
    SELL_SIDE: Landmark,
} as const;

const modeCardTones = {
    BUY_SIDE: 'primary',
    SELL_SIDE: 'support',
} as const;

function ActivityDescriptionDialog({ opportunity }: { opportunity: OpportunityRow }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="line-clamp-2 cursor-pointer text-left text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
                >
                    {opportunity.activityDescription}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Descrizione attività</DialogTitle>
                    <DialogDescription>
                        {opportunity.opportunityCode} • {opportunity.operationType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <Badge
                            variant={opportunity.operationType === 'BUY_SIDE' ? 'default' : 'secondary'}
                            className="rounded-full px-3 py-1"
                        >
                            {opportunity.operationType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{opportunity.activitySector}</span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background px-4 py-4 text-sm leading-7 text-foreground/90">
                        {opportunity.activityDescription}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ProductDialog({ opportunity }: { opportunity: OpportunityRow }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="line-clamp-2 cursor-pointer text-left text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
                >
                    {opportunity.product}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Prodotto</DialogTitle>
                    <DialogDescription>
                        {opportunity.opportunityCode} • {opportunity.operationType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <Badge
                            variant={opportunity.operationType === 'BUY_SIDE' ? 'default' : 'secondary'}
                            className="rounded-full px-3 py-1"
                        >
                            {opportunity.operationType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{opportunity.activitySector}</span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background px-4 py-4 text-sm leading-7 text-foreground/90">
                        {opportunity.product}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SensitiveDetailsDialog({ opportunity }: { opportunity: OpportunityRow }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="size-4" />
                    Dettaglio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Dettaglio riservato</DialogTitle>
                    <DialogDescription>
                        I dati sensibili restano nascosti fino all&apos;apertura delle sezioni dedicate.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold">{opportunity.opportunityCode}</p>
                            <p className="text-sm text-muted-foreground">
                                {opportunity.operationType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'} • {opportunity.activitySector}
                            </p>
                        </div>
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            Sensibile
                        </Badge>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="company-name">
                            <AccordionTrigger>Nome azienda</AccordionTrigger>
                            <AccordionContent>
                                <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
                                    {opportunity.companyName}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="company-description">
                            <AccordionTrigger>Descrizione azienda</AccordionTrigger>
                            <AccordionContent>
                                <div className="rounded-xl border border-border/70 bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
                                    {opportunity.companyDescription}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function MergeAcquisitionIndex({
    activeType,
    operationModes,
    opportunities,
    tableState,
    rowCount,
    pageCount,
    filterOptions,
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

    const filters: DataTableFilterDef[] = [
        {
            kind: 'text',
            columnId: 'opportunityCode',
            label: 'Codice opportunità',
            placeholder: 'Es. MA-2026-001',
        },
        {
            kind: 'select',
            columnId: 'activitySector',
            label: 'Settore attività',
            options: filterOptions.economicActivities,
        },
        {
            kind: 'text',
            columnId: 'legalEntity',
            label: 'Forma giuridica',
            placeholder: 'Es. Srl',
        },
        {
            kind: 'text',
            columnId: 'activityDescription',
            label: 'Descrizione attività',
            placeholder: 'Cerca nella descrizione',
        },
        {
            kind: 'text',
            columnId: 'atecoCode',
            label: 'Codice ateco',
            placeholder: 'Es. 62.01',
        },
        {
            kind: 'text',
            columnId: 'headquarters',
            label: 'Sede',
            placeholder: 'Provincia o paese',
        },
        {
            kind: 'boolean',
            columnId: 'favorite',
            label: 'Preferito',
            trueLabel: 'Sì',
            falseLabel: 'No',
        },
    ];

    const currentListingRoute = useMemo(() => {
        if (activeType === 'BUY_SIDE') {
            return mergeAcquisitionBuySide();
        }

        if (activeType === 'SELL_SIDE') {
            return mergeAcquisitionSellSide();
        }

        return mergeAcquisitionIndex();
    }, [activeType]);

    const toggleFavorite = useCallback((opportunityId: number, isFavorite: boolean) => {
        const action = isFavorite
            ? destroyFavorite(opportunityId)
            : storeFavorite(opportunityId);

        router.visit(action, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const columns = useMemo<ColumnDef<OpportunityRow>[]>(
        () => [
            {
                id: 'actions',
                header: 'Azioni',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-wrap items-center gap-2">
                        <SensitiveDetailsDialog opportunity={row.original} />
                        <ConfirmActionDialog
                            triggerLabel={row.original.favorite ? 'Preferito' : 'Preferisci'}
                            title={
                                row.original.favorite
                                    ? 'Rimuovere dai preferiti?'
                                    : 'Aggiungere ai preferiti?'
                            }
                            description={
                                row.original.favorite
                                    ? `Vuoi rimuovere l'opportunità ${row.original.opportunityCode} dai tuoi preferiti?`
                                    : `Vuoi aggiungere l'opportunità ${row.original.opportunityCode} ai tuoi preferiti?`
                            }
                            confirmLabel={
                                row.original.favorite
                                    ? 'Rimuovi dai preferiti'
                                    : 'Aggiungi ai preferiti'
                            }
                            onConfirm={() => toggleFavorite(row.original.id, row.original.favorite)}
                            variant={row.original.favorite ? 'secondary' : 'default'}
                            confirmVariant={row.original.favorite ? 'destructive' : 'default'}
                            triggerIcon={<Heart className="size-4" />}
                            ariaLabel={
                                row.original.favorite
                                    ? `Rimuovi ${row.original.opportunityCode} dai preferiti`
                                    : `Aggiungi ${row.original.opportunityCode} ai preferiti`
                            }
                        />
                    </div>
                ),
            },
            {
                accessorKey: 'opportunityCode',
                header: 'Codice',
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="font-medium tracking-tight">
                            {row.original.opportunityCode}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Opportunity ID {row.original.id}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'operationType',
                header: 'Tipo',
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.operationType === 'BUY_SIDE'
                                ? 'default'
                                : 'secondary'
                        }
                        className="rounded-full px-3 py-1"
                    >
                        {row.original.operationType === 'BUY_SIDE'
                            ? 'Buy-side'
                            : 'Sell-side'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'activitySector',
                header: 'Settore',
                enableSorting: false,
            },
            {
                accessorKey: 'legalEntity',
                header: 'Forma giuridica',
            },
            {
                accessorKey: 'activityDescription',
                header: 'Descrizione attività',
                cell: ({ row }) => <ActivityDescriptionDialog opportunity={row.original} />,
            },
            {
                accessorKey: 'product',
                header: 'Prodotto',
                cell: ({ row }) => <ProductDialog opportunity={row.original} />,
            },
            {
                accessorKey: 'atecoCode',
                header: 'Ateco',
            },
            {
                accessorKey: 'headquarters',
                header: 'Sede',
                enableSorting: false,
            },
            {
                accessorKey: 'favorite',
                header: 'Preferito',
                enableSorting: false,
                cell: ({ row }) => (
                    <Badge
                        variant={row.original.favorite ? 'default' : 'outline'}
                        className="rounded-full px-3 py-1"
                    >
                        {row.original.favorite ? 'Sì' : 'No'}
                    </Badge>
                ),
            },
        ],
        [toggleFavorite],
    );

    const handleQueryChange = useCallback(
        (query: ServerTableQuery) => {
            const requestQuery: Record<string, boolean | number | string> = {
                page: query.pagination.pageIndex + 1,
                page_size: query.pagination.pageSize,
            };

            const activeSorting = query.sorting[0];

            if (activeSorting) {
                requestQuery.sort = activeSorting.id;
                requestQuery.direction = activeSorting.desc ? 'desc' : 'asc';
            }

            for (const filter of query.columnFilters) {
                if (filter.id === 'opportunityCode' && typeof filter.value === 'string' && filter.value !== '') {
                    requestQuery.identification_code = filter.value;
                }

                if (filter.id === 'activitySector' && typeof filter.value === 'string' && filter.value !== '') {
                    requestQuery.economic_activity_id = filter.value;
                }

                if (filter.id === 'legalEntity' && typeof filter.value === 'string' && filter.value !== '') {
                    requestQuery.legal_entity = filter.value;
                }

                if (filter.id === 'activityDescription' && typeof filter.value === 'string' && filter.value !== '') {
                    requestQuery.activity_description = filter.value;
                }

                if (filter.id === 'atecoCode' && typeof filter.value === 'string' && filter.value !== '') {
                    requestQuery.ateco_code = filter.value;
                }

                if (filter.id === 'headquarters' && typeof filter.value === 'string' && filter.value !== '') {
                    requestQuery.headquarters = filter.value;
                }

                if (filter.id === 'favorite' && typeof filter.value === 'boolean') {
                    requestQuery.favorite = filter.value ? 'true' : 'false';
                }
            }

            router.get(currentListingRoute.url, requestQuery, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'activeType',
                    'opportunities',
                    'tableState',
                    'rowCount',
                    'pageCount',
                    'summary',
                ],
            });
        },
        [currentListingRoute],
    );

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
                                        Vista attiva: {activeType === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                                    </Badge>
                                ) : null}
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Opportunita M&amp;A</PageHeroTitle>
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
                                            href={
                                                mode.value === 'BUY_SIDE'
                                                    ? mergeAcquisitionBuySide()
                                                    : mergeAcquisitionSellSide()
                                            }
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

                <section className="space-y-5 rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80">
                                    <LayoutList className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        Opportunità attive
                                    </h2>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Vista operativa con filtri server-side per trovare rapidamente i mandati rilevanti.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                            <Building2 className="size-4" />
                            {rowCount} risultati
                        </div>
                    </div>

                    <ServerDataTable
                        columns={columns}
                        data={opportunities}
                        rowCount={rowCount}
                        pageCount={pageCount}
                        initialColumnFilters={tableState.columnFilters}
                        initialSorting={tableState.sorting}
                        initialPagination={tableState.pagination}
                        onQueryChange={handleQueryChange}
                        filters={filters}
                        filtersLayout="stacked"
                        debounceMs={250}
                        enableSorting
                    />
                </section>
            </div>
        </AppLayout>
    );
}
