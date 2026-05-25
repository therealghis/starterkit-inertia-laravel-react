import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CirclePlus, FolderSearch, ScanSearch } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { ServerDataTable } from '@/components/server-data-table';
import type { ServerTableQuery } from '@/components/server-data-table';
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
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import {
    create as dueDiligenceCreate,
    index as dueDiligenceIndex,
} from '@/routes/merge_acquisition/due_diligences';
import type { BreadcrumbItem } from '@/types';

type DueDiligenceIndexProps = {
    mergeAcquisition: {
        id: number;
        identification_code: string;
        company_name: string | null;
    };
    dueDiligences: DueDiligenceRow[];
};

type DueDiligenceRow = {
    id: number;
    title: string;
    year: number | null;
    status: string;
    items_count: number;
    completed_items_count: number;
    created_at: string;
    show_url: string;
};

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

function formatStatusLabel(status: string): string {
    return {
        open: 'Aperta',
        in_progress: 'In corso',
        completed: 'Completata',
        not_applicable: 'Non applicabile',
    }[status] ?? status;
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' {
    if (status === 'completed') {
        return 'default';
    }

    if (status === 'in_progress') {
        return 'secondary';
    }

    return 'outline';
}

export default function DueDiligencesIndex({
    mergeAcquisition,
    dueDiligences,
}: DueDiligenceIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
        {
            title: 'Due Diligence della M&A',
            href: dueDiligenceIndex(mergeAcquisition.id),
        },
    ];

    const createUrl = dueDiligenceCreate(mergeAcquisition.id);

    const columns: ColumnDef<DueDiligenceRow>[] = [
        {
            accessorKey: 'title',
            header: 'Titolo',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <p className="font-medium text-foreground">{row.original.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {mergeAcquisition.identification_code}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'year',
            header: 'Anno',
            cell: ({ row }) => row.original.year ?? 'N/D',
        },
        {
            accessorKey: 'status',
            header: 'Stato',
            cell: ({ row }) => (
                <Badge variant={statusBadgeVariant(row.original.status)}>
                    {formatStatusLabel(row.original.status)}
                </Badge>
            ),
        },
        {
            id: 'progress',
            header: 'Avanzamento',
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.completed_items_count} / {row.original.items_count}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Creata il',
            cell: ({ row }) => formatDateTime(row.original.created_at),
        },
        {
            id: 'action',
            header: 'Azione',
            cell: ({ row }) => (
                <Button asChild size="sm" variant="outline">
                    <Link href={row.original.show_url}>Apri</Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Due Diligence" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <PageHero tone="support">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <ScanSearch className="size-4" />
                                {mergeAcquisition.identification_code}
                                {mergeAcquisition.company_name ? ` · ${mergeAcquisition.company_name}` : ''}
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Due Diligence</PageHeroTitle>
                                <PageHeroDescription>
                                    Checklist documentali collegate alla M&A selezionata.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroStats>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Totali</PageHeroStatLabel>
                                    <PageHeroStatValue>{dueDiligences.length}</PageHeroStatValue>
                                </PageHeroStat>
                            </PageHeroStats>

                            <PageHeroActions>
                                <Button asChild>
                                    <Link href={createUrl}>
                                        <CirclePlus className="size-4" />
                                        Crea Due Diligence
                                    </Link>
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                {dueDiligences.length === 0 ? (
                    <section className="rounded-3xl border border-dashed border-border/70 bg-card/70 px-6 py-12 text-center shadow-sm">
                        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                            <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background">
                                <FolderSearch className="size-6 text-muted-foreground" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold tracking-tight">
                                    Nessuna due diligence creata per questa M&A.
                                </h2>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Crea la prima checklist documentale per iniziare a raccogliere i
                                    materiali richiesti.
                                </p>
                            </div>

                            <Button asChild>
                                <Link href={createUrl}>
                                    <CirclePlus className="size-4" />
                                    Crea Due Diligence
                                </Link>
                            </Button>
                        </div>
                    </section>
                ) : (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    Elenco due diligence
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Vista operativa delle checklist documentali collegate a questa M&A.
                                </p>
                            </div>

                            <div className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                                {dueDiligences.length} risultati
                            </div>
                        </div>

                        <ServerDataTable
                            columns={columns}
                            data={dueDiligences}
                            rowCount={dueDiligences.length}
                            pageCount={1}
                            initialPagination={{
                                pageIndex: 0,
                                pageSize: Math.max(dueDiligences.length, 10),
                            }}
                            onQueryChange={(_query: ServerTableQuery) => {
                                return;
                            }}
                        />
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
