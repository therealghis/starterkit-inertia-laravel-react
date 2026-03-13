import { Head, router } from '@inertiajs/react';
import type {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    SortingState,
} from '@tanstack/react-table';
import { Clock3 } from 'lucide-react';

import type { DataTableFilterDef } from '@/components/data-table-filters';
import { ServerDataTable } from '@/components/server-data-table';
import type { ServerTableQuery } from '@/components/server-data-table';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import securityScans from '@/routes/security-scans';
import type { BreadcrumbItem } from '@/types';

type SecurityScanRow = {
    id: number;
    scan_key: string;
    scan_mode: string;
    status: 'running' | 'completed' | 'failed';
    date: string | null;
    severity_counts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        unknown: number;
    };
    new_count: number;
    fixed_count: number;
    raw_reports: Array<{
        filename: string;
        path: string | null;
    }>;
};

type OpenFindingRow = {
    id: number;
    vulnerability_id: string | null;
    package: string;
    installed_version: string | null;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
    target: string | null;
    first_seen_at: string | null;
    last_seen_at: string | null;
};

type TableState = {
    filters: Record<string, string>;
    sorting: {
        column: string;
        direction: 'asc' | 'desc';
    };
    pagination: {
        page: number;
        perPage: number;
    };
};

type SecurityScansPageProps = {
    activeTab: 'scans' | 'open-findings';
    scans: {
        data: SecurityScanRow[];
        total: number;
        last_page: number;
    };
    scansTable: TableState;
    openFindings: {
        data: OpenFindingRow[];
        total: number;
        last_page: number;
    };
    openFindingsTable: TableState;
};

function statusVariant(
    status: SecurityScanRow['status'],
): 'default' | 'secondary' | 'destructive' {
    if (status === 'completed') {
        return 'default';
    }

    if (status === 'running') {
        return 'secondary';
    }

    return 'destructive';
}

function severityVariant(
    severity: OpenFindingRow['severity'],
): 'destructive' | 'default' | 'secondary' | 'outline' {
    if (severity === 'CRITICAL') {
        return 'destructive';
    }

    if (severity === 'HIGH') {
        return 'default';
    }

    if (severity === 'MEDIUM') {
        return 'secondary';
    }

    return 'outline';
}

function statusLabel(
    status: SecurityScanRow['status'],
    t: (key: string) => string,
): string {
    if (status === 'completed') {
        return t('Completed');
    }

    if (status === 'running') {
        return t('Running');
    }

    return t('Failed');
}

function formatDate(value: string | null, locale: string): string {
    if (value === null) {
        return '-';
    }

    return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function tableQuery(table: TableState): ServerTableQuery {
    const columnFilters: ColumnFiltersState = [];

    Object.entries(table.filters).forEach(([key, value]) => {
        if (value !== '') {
            columnFilters.push({ id: key, value });
        }
    });

    const sorting: SortingState = [
        {
            id: table.sorting.column,
            desc: table.sorting.direction === 'desc',
        },
    ];

    const pagination: PaginationState = {
        pageIndex: Math.max(0, table.pagination.page - 1),
        pageSize: table.pagination.perPage,
    };

    return {
        columnFilters,
        sorting,
        pagination,
    };
}

function filterValue(query: ServerTableQuery, key: string): string {
    const filter = query.columnFilters.find((item) => item.id === key);

    return typeof filter?.value === 'string' ? filter.value : '';
}

export default function SecurityScansIndex({
    activeTab,
    scans,
    scansTable,
    openFindings,
    openFindingsTable,
}: SecurityScansPageProps) {
    const { t, locale } = useTranslations();

    const scansInitialQuery = tableQuery(scansTable);
    const findingsInitialQuery = tableQuery(openFindingsTable);

    const scansColumns: ColumnDef<SecurityScanRow>[] = [
        {
            accessorKey: 'date',
            header: t('Date'),
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">
                        {formatDate(row.original.date, locale)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.scan_key}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: t('Status'),
            cell: ({ row }) => (
                <Badge variant={statusVariant(row.original.status)}>
                    {statusLabel(row.original.status, t)}
                </Badge>
            ),
        },
        {
            accessorKey: 'critical_count',
            header: t('Severity'),
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="destructive">
                        {t('Critical')}: {row.original.severity_counts.critical}
                    </Badge>
                    <Badge variant="default">
                        {t('High')}: {row.original.severity_counts.high}
                    </Badge>
                    <Badge variant="secondary">
                        {t('Medium')}: {row.original.severity_counts.medium}
                    </Badge>
                    <Badge variant="outline">
                        {t('Low')}: {row.original.severity_counts.low}
                    </Badge>
                    <Badge variant="outline">
                        {t('Unknown')}: {row.original.severity_counts.unknown}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'new_count',
            header: t('New / Fixed'),
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">
                        {t('New')}: {row.original.new_count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {t('Fixed')}: {row.original.fixed_count}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'raw_reports',
            header: t('Raw reports'),
            enableSorting: false,
            cell: ({ row }) => (
                <div className="space-y-1 text-sm">
                    {row.original.raw_reports.length > 0 ? (
                        row.original.raw_reports.map((report) => (
                            <div
                                key={`${row.original.id}-${report.filename}`}
                                className="font-mono text-xs text-muted-foreground"
                            >
                                {report.filename}
                            </div>
                        ))
                    ) : (
                        <span className="text-muted-foreground">
                            {t('No raw reports')}
                        </span>
                    )}
                </div>
            ),
        },
    ];

    const findingsColumns: ColumnDef<OpenFindingRow>[] = [
        {
            accessorKey: 'vulnerability_id',
            header: t('CVE'),
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">
                        {row.original.vulnerability_id ?? '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.target ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'package',
            header: t('Package'),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.package}</div>
            ),
        },
        {
            accessorKey: 'installed_version',
            header: t('Version'),
            cell: ({ row }) => row.original.installed_version ?? '-',
        },
        {
            accessorKey: 'severity',
            header: t('Severity'),
            cell: ({ row }) => (
                <Badge variant={severityVariant(row.original.severity)}>
                    {row.original.severity}
                </Badge>
            ),
        },
        {
            accessorKey: 'first_seen_at',
            header: t('First seen'),
            cell: ({ row }) => formatDate(row.original.first_seen_at, locale),
        },
        {
            accessorKey: 'last_seen_at',
            header: t('Last seen'),
            cell: ({ row }) => formatDate(row.original.last_seen_at, locale),
        },
    ];

    const scansFilters: DataTableFilterDef[] = [
        {
            kind: 'text',
            columnId: 'search',
            label: t('Search'),
            placeholder: t('Search by scan key or mode...'),
        },
        {
            kind: 'select',
            columnId: 'status',
            label: t('Status'),
            options: [
                { label: t('Completed'), value: 'completed' },
                { label: t('Running'), value: 'running' },
                { label: t('Failed'), value: 'failed' },
            ],
        },
    ];

    const findingsFilters: DataTableFilterDef[] = [
        {
            kind: 'select',
            columnId: 'severity',
            label: t('Severity'),
            options: [
                { label: t('Critical'), value: 'CRITICAL' },
                { label: t('High'), value: 'HIGH' },
                { label: t('Medium'), value: 'MEDIUM' },
                { label: t('Low'), value: 'LOW' },
                { label: t('Unknown'), value: 'UNKNOWN' },
            ],
        },
        {
            kind: 'text',
            columnId: 'target',
            label: t('Target'),
            placeholder: t('Filter by target...'),
        },
        {
            kind: 'text',
            columnId: 'vulnerability_id',
            label: t('Vulnerability ID'),
            placeholder: t('Filter by vulnerability id...'),
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Dashboard'),
            href: dashboard(),
        },
        {
            title: t('Security scans'),
            href: securityScans.index(),
        },
    ];

    function changeTab(value: string): void {
        if (value !== 'scans' && value !== 'open-findings') {
            return;
        }

        router.get(
            securityScans.index().url,
            {
                tab: value,
                scansSearch: scansTable.filters.search,
                scansStatus: scansTable.filters.status,
                scansSort: scansTable.sorting.column,
                scansDirection: scansTable.sorting.direction,
                scansPage: scansTable.pagination.page,
                scansPerPage: scansTable.pagination.perPage,
                findingsSeverity: openFindingsTable.filters.severity,
                findingsTarget: openFindingsTable.filters.target,
                findingsVulnerabilityId: openFindingsTable.filters.vulnerability_id,
                findingsSort: openFindingsTable.sorting.column,
                findingsDirection: openFindingsTable.sorting.direction,
                findingsPage: openFindingsTable.pagination.page,
                findingsPerPage: openFindingsTable.pagination.perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Security scans')} />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Security scans')}</CardTitle>
                        <CardDescription>
                            {t(
                                'Operational visibility for the latest Trivy runs and the current open findings.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Use these tabs to review the latest scan runs and the vulnerabilities that are still open.',
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={changeTab}>
                    <TabsList variant="line">
                        <TabsTrigger value="scans">{t('Latest scans')}</TabsTrigger>
                        <TabsTrigger value="open-findings">
                            {t('Open findings')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scans" className="space-y-4">
                        <ServerDataTable
                            columns={scansColumns}
                            data={scans.data}
                            rowCount={scans.total}
                            pageCount={Math.max(scans.last_page, 1)}
                            initialColumnFilters={scansInitialQuery.columnFilters}
                            initialSorting={scansInitialQuery.sorting}
                            initialPagination={scansInitialQuery.pagination}
                            onQueryChange={(query) => {
                                router.get(
                                    securityScans.index().url,
                                    {
                                        tab: 'scans',
                                        scansSearch: filterValue(query, 'search'),
                                        scansStatus: filterValue(query, 'status'),
                                        scansSort: query.sorting[0]?.id ?? 'finished_at',
                                        scansDirection: query.sorting[0]?.desc ? 'desc' : 'asc',
                                        scansPage: query.pagination.pageIndex + 1,
                                        scansPerPage: query.pagination.pageSize,
                                        findingsSeverity: openFindingsTable.filters.severity,
                                        findingsTarget: openFindingsTable.filters.target,
                                        findingsVulnerabilityId: openFindingsTable.filters.vulnerability_id,
                                        findingsSort: openFindingsTable.sorting.column,
                                        findingsDirection: openFindingsTable.sorting.direction,
                                        findingsPage: openFindingsTable.pagination.page,
                                        findingsPerPage: openFindingsTable.pagination.perPage,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    },
                                );
                            }}
                            filters={scansFilters}
                            filtersLayout="inline"
                            debounceMs={250}
                            enableSorting
                            enableColumnVisibilityMenu
                        />
                    </TabsContent>

                    <TabsContent value="open-findings" className="space-y-4">
                        <ServerDataTable
                            columns={findingsColumns}
                            data={openFindings.data}
                            rowCount={openFindings.total}
                            pageCount={Math.max(openFindings.last_page, 1)}
                            initialColumnFilters={findingsInitialQuery.columnFilters}
                            initialSorting={findingsInitialQuery.sorting}
                            initialPagination={findingsInitialQuery.pagination}
                            onQueryChange={(query) => {
                                router.get(
                                    securityScans.index().url,
                                    {
                                        tab: 'open-findings',
                                        scansSearch: scansTable.filters.search,
                                        scansStatus: scansTable.filters.status,
                                        scansSort: scansTable.sorting.column,
                                        scansDirection: scansTable.sorting.direction,
                                        scansPage: scansTable.pagination.page,
                                        scansPerPage: scansTable.pagination.perPage,
                                        findingsSeverity: filterValue(query, 'severity'),
                                        findingsTarget: filterValue(query, 'target'),
                                        findingsVulnerabilityId: filterValue(query, 'vulnerability_id'),
                                        findingsSort: query.sorting[0]?.id ?? 'last_seen_at',
                                        findingsDirection: query.sorting[0]?.desc ? 'desc' : 'asc',
                                        findingsPage: query.pagination.pageIndex + 1,
                                        findingsPerPage: query.pagination.pageSize,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    },
                                );
                            }}
                            filters={findingsFilters}
                            filtersLayout="inline"
                            debounceMs={250}
                            enableSorting
                            enableColumnVisibilityMenu
                        />
                    </TabsContent>
                </Tabs>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="size-4" />
                    {t('This page is intended as a simple internal operational panel.')}
                </div>
            </div>
        </AppLayout>
    );
}
