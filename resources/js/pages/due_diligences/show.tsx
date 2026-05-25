import { Head, Link, router } from '@inertiajs/react';
import { FolderSearch, ListChecks, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmActionDialog from '@/components/confirm-action-dialog';
import AppLayout from '@/layouts/app-layout';
import DueDiligenceCustomItemDialog from '@/pages/due_diligences/components/due-diligence-custom-item-dialog';
import DueDiligenceItemAttachments from '@/pages/due_diligences/components/due-diligence-item-attachments';
import DueDiligenceItemNotesDialog from '@/pages/due_diligences/components/due-diligence-item-notes-dialog';
import DueDiligenceItemStatusSelect from '@/pages/due_diligences/components/due-diligence-item-status-select';
import DueDiligenceProgressSummary from '@/pages/due_diligences/components/due-diligence-progress-summary';
import { destroy as destroyDueDiligenceCustomItem } from '@/routes/due_diligence_items/custom';
import { show as dueDiligenceShow } from '@/routes/due_diligences';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import { index as dueDiligenceIndex } from '@/routes/merge_acquisition/due_diligences';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

type DueDiligenceShowProps = {
    dueDiligence: {
        id: number;
        title: string;
        year: number | null;
        status: string;
        company_notes: string | null;
        admin_notes: string | null;
    };
    mergeAcquisition: {
        id: number;
        identification_code: string;
        company_name: string | null;
    };
    summary: {
        total: number;
        open: number;
        in_progress: number;
        completed: number;
        not_applicable: number;
        completion_percentage: number;
    };
    statuses: Array<{
        value: string;
        label: string;
    }>;
    items: Array<{
        id: number;
        entity: string;
        topic: string;
        request_text: string;
        status: string;
        company_notes: string | null;
        admin_notes: string | null;
        is_custom: boolean;
        sort_order: number;
        attachments: Array<{
            id: number;
            filename: string;
            mimetype: string;
            size: number | null;
            download_url: string;
            delete_url: string;
        }>;
    }>;
};

type FilterKey =
    | 'all'
    | 'open'
    | 'in_progress'
    | 'completed'
    | 'not_applicable'
    | 'with_attachments'
    | 'without_attachments';

function formatStatusLabel(status: string): string {
    return {
        open: 'Aperta',
        in_progress: 'In corso',
        completed: 'Completata',
        not_applicable: 'N/A',
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

function getEmptyStateMessage(filter: FilterKey): string {
    return {
        all: 'Nessuna riga presente in questa due diligence.',
        open: 'Nessuna riga aperta trovata.',
        in_progress: 'Nessuna riga in corso trovata.',
        completed: 'Nessuna riga completata trovata.',
        not_applicable: 'Nessuna riga marcata N/A trovata.',
        with_attachments: 'Nessuna riga con allegati trovata.',
        without_attachments: 'Nessuna riga senza allegati trovata.',
    }[filter];
}

export default function DueDiligencesShow({
    dueDiligence,
    mergeAcquisition,
    summary,
    statuses,
    items,
}: DueDiligenceShowProps) {
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
        {
            title: 'Due Diligence',
            href: dueDiligenceIndex(mergeAcquisition.id),
        },
        {
            title: dueDiligence.title,
            href: dueDiligenceShow(dueDiligence.id),
        },
    ];

    const quickFilters: Array<{
        key: FilterKey;
        label: string;
        count: number;
    }> = [
        {
            key: 'all',
            label: 'Tutte',
            count: items.length,
        },
        {
            key: 'open',
            label: 'Aperte',
            count: items.filter((item) => item.status === 'open').length,
        },
        {
            key: 'in_progress',
            label: 'In corso',
            count: items.filter((item) => item.status === 'in_progress').length,
        },
        {
            key: 'completed',
            label: 'Completate',
            count: items.filter((item) => item.status === 'completed').length,
        },
        {
            key: 'not_applicable',
            label: 'N/A',
            count: items.filter((item) => item.status === 'not_applicable').length,
        },
        {
            key: 'with_attachments',
            label: 'Con allegati',
            count: items.filter((item) => item.attachments.length > 0).length,
        },
        {
            key: 'without_attachments',
            label: 'Senza allegati',
            count: items.filter((item) => item.attachments.length === 0).length,
        },
    ];

    const filteredItems = items.filter((item) => {
        if (activeFilter === 'all') {
            return true;
        }

        if (activeFilter === 'with_attachments') {
            return item.attachments.length > 0;
        }

        if (activeFilter === 'without_attachments') {
            return item.attachments.length === 0;
        }

        return item.status === activeFilter;
    });

    const handleDeleteCustomItem = (itemId: number) => {
        setDeletingItemId(itemId);

        router.delete(destroyDueDiligenceCustomItem(itemId), {
            preserveScroll: true,
            onFinish: () => {
                setDeletingItemId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={dueDiligence.title} />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <PageHero tone="support">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <ListChecks className="size-4" />
                                {mergeAcquisition.identification_code}
                                {mergeAcquisition.company_name
                                    ? ` · ${mergeAcquisition.company_name}`
                                    : ''}
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <PageHeroTitle>{dueDiligence.title}</PageHeroTitle>
                                    {dueDiligence.year !== null && (
                                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                                            {dueDiligence.year}
                                        </Badge>
                                    )}
                                    <Badge
                                        variant={statusBadgeVariant(dueDiligence.status)}
                                        className="rounded-full px-3 py-1"
                                    >
                                        {formatStatusLabel(dueDiligence.status)}
                                    </Badge>
                                </div>

                                <PageHeroDescription>
                                    Vista operativa della checklist documentale con avanzamento,
                                    allegati, note e gestione delle righe custom.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroStats>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Righe totali</PageHeroStatLabel>
                                    <PageHeroStatValue>{summary.total}</PageHeroStatValue>
                                </PageHeroStat>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Completamento</PageHeroStatLabel>
                                    <PageHeroStatValue>
                                        {summary.completion_percentage}%
                                    </PageHeroStatValue>
                                </PageHeroStat>
                            </PageHeroStats>

                            <PageHeroActions>
                                <Button asChild variant="outline">
                                    <Link href={dueDiligenceIndex(mergeAcquisition.id)}>
                                        Torna alla lista DD
                                    </Link>
                                </Button>
                                <DueDiligenceCustomItemDialog
                                    dueDiligenceId={dueDiligence.id}
                                />
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <DueDiligenceProgressSummary summary={summary} />

                <Card className="border-border/70 bg-card/90">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-1">
                                <CardTitle>Checklist documentale</CardTitle>
                                <CardDescription>
                                    Filtra e gestisci le richieste della due diligence direttamente
                                    dalla tabella.
                                </CardDescription>
                            </div>

                            <div className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                                {filteredItems.length} risultati
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {quickFilters.map((filter) => (
                                <Button
                                    key={filter.key}
                                    type="button"
                                    size="sm"
                                    variant={activeFilter === filter.key ? 'default' : 'outline'}
                                    onClick={() => setActiveFilter(filter.key)}
                                >
                                    {filter.label}
                                    <span className="text-xs opacity-80">{filter.count}</span>
                                </Button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {filteredItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center">
                                <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background">
                                        <FolderSearch className="size-6 text-muted-foreground" />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-xl font-semibold tracking-tight">
                                            Nessun risultato
                                        </h2>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {getEmptyStateMessage(activeFilter)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-border/70">
                                <Table className="table-fixed">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-40">Entità</TableHead>
                                            <TableHead className="min-w-40">Argomento</TableHead>
                                            <TableHead className="min-w-72">Richiesta</TableHead>
                                            <TableHead className="min-w-44">Stato</TableHead>
                                            <TableHead className="min-w-80">Allegati</TableHead>
                                            <TableHead className="min-w-32">Note</TableHead>
                                            <TableHead className="min-w-44">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.map((item) => {
                                            const isDeleting = deletingItemId === item.id;

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="align-top whitespace-normal">
                                                        <div className="space-y-1">
                                                            <p className="break-all font-medium text-foreground">
                                                                {item.entity}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Riga #{item.sort_order}
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="align-top whitespace-normal">
                                                        <p className="break-all font-medium text-foreground">
                                                            {item.topic}
                                                        </p>
                                                    </TableCell>

                                                    <TableCell className="align-top whitespace-normal">
                                                        <p className="break-all text-sm leading-6 text-foreground/90">
                                                            {item.request_text}
                                                        </p>
                                                    </TableCell>

                                                    <TableCell className="align-top whitespace-normal">
                                                        <DueDiligenceItemStatusSelect
                                                            itemId={item.id}
                                                            currentStatus={item.status}
                                                            statuses={statuses}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top whitespace-normal">
                                                        <DueDiligenceItemAttachments
                                                            itemId={item.id}
                                                            attachments={item.attachments}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top whitespace-normal">
                                                        <DueDiligenceItemNotesDialog item={item} />
                                                    </TableCell>

                                                    <TableCell className="align-top whitespace-normal">
                                                        {item.is_custom ? (
                                                            <ConfirmActionDialog
                                                                triggerLabel="Elimina riga custom"
                                                                title="Eliminare la riga custom?"
                                                                description={`La riga "${item.topic}" verra eliminata da questa due diligence.`}
                                                                confirmLabel="Elimina riga"
                                                                onConfirm={() =>
                                                                    handleDeleteCustomItem(
                                                                        item.id,
                                                                    )
                                                                }
                                                                disabled={isDeleting}
                                                                triggerIcon={
                                                                    <Trash2 className="size-4" />
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                Da template
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
