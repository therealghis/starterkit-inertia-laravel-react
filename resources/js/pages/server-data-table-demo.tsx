import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ClipboardList,
    Layers3,
    ShieldCheck,
    SlidersHorizontal,
    Trash2,
} from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

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
import AppLayout from '@/layouts/app-layout';
import { dashboard, serverDataTableDemo } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type DemoAccount = {
    id: string;
    accountName: string;
    owner: string;
    region: 'Nord' | 'Centro' | 'Sud' | 'Est';
    status: 'active' | 'pending' | 'archived';
    monthlyRevenue: number;
    automationEnabled: boolean;
};

const STATUS_STYLES: Record<DemoAccount['status'], 'default' | 'secondary' | 'outline'> = {
    active: 'default',
    pending: 'secondary',
    archived: 'outline',
};

const SEED_ACCOUNTS: DemoAccount[] = Array.from({ length: 36 }, (_, index) => {
    const regions: DemoAccount['region'][] = ['Nord', 'Centro', 'Sud', 'Est'];
    const statuses: DemoAccount['status'][] = ['active', 'pending', 'archived'];
    const owners = [
        'Giulia Rinaldi',
        'Marco Sala',
        'Elena Moretti',
        'Paolo Ferri',
        'Sara Guidi',
        'Davide Lupi',
    ];
    const accountPrefixes = [
        'Atlas',
        'Nova',
        'Orion',
        'Helix',
        'Delta',
        'Vertex',
        'Pulse',
        'Meridian',
    ];
    const accountSuffixes = [
        'Logistics',
        'Foods',
        'Retail',
        'Labs',
        'Studio',
        'Finance',
        'Cloud',
        'Energy',
    ];

    return {
        id: `acc-${index + 1}`,
        accountName: `${accountPrefixes[index % accountPrefixes.length]} ${accountSuffixes[index % accountSuffixes.length]}`,
        owner: owners[index % owners.length],
        region: regions[index % regions.length],
        status: statuses[index % statuses.length],
        monthlyRevenue: 1800 + index * 275,
        automationEnabled: index % 3 !== 0,
    };
});

const DEFAULT_QUERY: ServerTableQuery = {
    columnFilters: [],
    sorting: [{ id: 'monthlyRevenue', desc: true }],
    pagination: { pageIndex: 0, pageSize: 10 },
};

const FILTERS: DataTableFilterDef[] = [
    {
        kind: 'text',
        columnId: 'accountName',
        label: 'Ricerca account',
        placeholder: 'Cerca per nome account...',
    },
    {
        kind: 'select',
        columnId: 'status',
        label: 'Stato',
        options: [
            { label: 'Attivo', value: 'active' },
            { label: 'In attesa', value: 'pending' },
            { label: 'Archiviato', value: 'archived' },
        ],
    },
    {
        kind: 'multi',
        columnId: 'region',
        label: 'Regione',
        options: [
            { label: 'Nord', value: 'Nord' },
            { label: 'Centro', value: 'Centro' },
            { label: 'Sud', value: 'Sud' },
            { label: 'Est', value: 'Est' },
        ],
    },
    {
        kind: 'numberRange',
        columnId: 'monthlyRevenue',
        label: 'MRR',
        minPlaceholder: 'Min EUR',
        maxPlaceholder: 'Max EUR',
    },
    {
        kind: 'boolean',
        columnId: 'automationEnabled',
        label: 'Automazioni',
        trueLabel: 'Attive',
        falseLabel: 'Disattive',
    },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(value);
}

function applyFilters(rows: DemoAccount[], query: ServerTableQuery): DemoAccount[] {
    return rows.filter((row) =>
        query.columnFilters.every((filter) => {
            if (filter.id === 'accountName') {
                const value = String(filter.value ?? '').trim().toLowerCase();

                return value === '' || row.accountName.toLowerCase().includes(value);
            }

            if (filter.id === 'status') {
                return row.status === filter.value;
            }

            if (filter.id === 'region') {
                const selected = Array.isArray(filter.value) ? filter.value : [];

                return selected.length === 0 || selected.includes(row.region);
            }

            if (filter.id === 'monthlyRevenue') {
                const value = filter.value as { min?: number; max?: number } | undefined;

                if (!value) {
                    return true;
                }

                if (value.min !== undefined && row.monthlyRevenue < value.min) {
                    return false;
                }

                if (value.max !== undefined && row.monthlyRevenue > value.max) {
                    return false;
                }

                return true;
            }

            if (filter.id === 'automationEnabled') {
                if (filter.value === undefined) {
                    return true;
                }

                return row.automationEnabled === Boolean(filter.value);
            }

            return true;
        }),
    );
}

function applySorting(rows: DemoAccount[], query: ServerTableQuery): DemoAccount[] {
    if (query.sorting.length === 0) {
        return rows;
    }

    return [...rows].sort((left, right) => {
        for (const sorting of query.sorting) {
            const leftValue = left[sorting.id as keyof DemoAccount];
            const rightValue = right[sorting.id as keyof DemoAccount];

            if (leftValue === rightValue) {
                continue;
            }

            const result = leftValue > rightValue ? 1 : -1;

            return sorting.desc ? result * -1 : result;
        }

        return 0;
    });
}

export default function ServerDataTableDemo() {
    const [accounts, setAccounts] = useState(SEED_ACCOUNTS);
    const [query, setQuery] = useState<ServerTableQuery>(DEFAULT_QUERY);
    const [, startTransition] = useTransition();

    const columns = useMemo<ColumnDef<DemoAccount>[]>(
        () => [
            {
                accessorKey: 'accountName',
                header: 'Account',
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="font-medium">{row.original.accountName}</div>
                        <div className="text-xs text-muted-foreground">{row.original.id}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Stato',
                cell: ({ row }) => (
                    <Badge variant={STATUS_STYLES[row.original.status]}>
                        {row.original.status === 'active'
                            ? 'Attivo'
                            : row.original.status === 'pending'
                              ? 'In attesa'
                              : 'Archiviato'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'region',
                header: 'Regione',
                cell: ({ row }) => (
                    <Badge variant="outline" className="rounded-full">
                        {row.original.region}
                    </Badge>
                ),
            },
            {
                accessorKey: 'owner',
                header: 'Owner',
            },
            {
                accessorKey: 'monthlyRevenue',
                header: 'MRR',
                cell: ({ row }) => (
                    <span className="font-medium">
                        {formatCurrency(row.original.monthlyRevenue)}
                    </span>
                ),
            },
            {
                accessorKey: 'automationEnabled',
                header: 'Automazioni',
                cell: ({ row }) => (
                    <Badge variant={row.original.automationEnabled ? 'default' : 'outline'}>
                        {row.original.automationEnabled ? 'Attive' : 'Disattive'}
                    </Badge>
                ),
            },
        ],
        [],
    );

    const filteredAccounts = useMemo(
        () => applyFilters(accounts, query),
        [accounts, query],
    );
    const sortedAccounts = useMemo(
        () => applySorting(filteredAccounts, query),
        [filteredAccounts, query],
    );
    const pageCount = Math.max(
        1,
        Math.ceil(sortedAccounts.length / query.pagination.pageSize),
    );
    const pageStart = query.pagination.pageIndex * query.pagination.pageSize;
    const paginatedAccounts = useMemo(
        () => sortedAccounts.slice(pageStart, pageStart + query.pagination.pageSize),
        [pageStart, query.pagination.pageSize, sortedAccounts],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Server Data Table Example',
            href: serverDataTableDemo(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Server Data Table Example" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Card className="border-sidebar-border/70 bg-gradient-to-br from-background via-background to-muted/40">
                    <CardHeader className="gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                                <Layers3 className="size-3.5" />
                                Example usage
                            </Badge>
                            <Badge variant="outline">
                                <SlidersHorizontal className="size-3.5" />
                                Filtri desktop visibili
                            </Badge>
                            <Badge variant="outline">
                                <ShieldCheck className="size-3.5" />
                                Simulazione server-side
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <CardTitle>Server Data Table come esempio di utilizzo</CardTitle>
                            <CardDescription>
                                Questa pagina resta navigabile ma il suo scopo e mostrare una
                                configurazione completa del componente: sorting, filtri,
                                selezione righe, bulk action, column visibility e paginazione con
                                dati gestiti dal parent.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-sidebar-border/70 bg-background/80 p-4">
                            <p className="text-sm text-muted-foreground">Account totali</p>
                            <p className="mt-2 text-2xl font-semibold">{accounts.length}</p>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-background/80 p-4">
                            <p className="text-sm text-muted-foreground">Risultati filtrati</p>
                            <p className="mt-2 text-2xl font-semibold">
                                {filteredAccounts.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-background/80 p-4">
                            <p className="text-sm text-muted-foreground">Bulk action demo</p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
                                <Trash2 className="size-4" />
                                Elimina selezionati
                            </p>
                        </div>
                        <div className="rounded-xl border border-dashed border-sidebar-border/70 bg-background/80 p-4 md:col-span-3">
                            <p className="flex items-center gap-2 text-sm font-medium">
                                <ClipboardList className="size-4" />
                                Come leggerlo
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Usa questo file come riferimento pratico per integrare
                                <span className="font-medium text-foreground"> ServerDataTable</span>
                                : definizione colonne, stato query lato parent, applicazione dei
                                filtri, sorting server-driven e gestione delle bulk action.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <ServerDataTable
                    columns={columns}
                    data={paginatedAccounts}
                    rowCount={sortedAccounts.length}
                    pageCount={pageCount}
                    initialSorting={DEFAULT_QUERY.sorting}
                    initialPagination={DEFAULT_QUERY.pagination}
                    onQueryChange={(nextQuery) => {
                        const filteredNext = applyFilters(accounts, nextQuery);
                        const sortedNext = applySorting(filteredNext, nextQuery);
                        const nextPageCount = Math.max(
                            1,
                            Math.ceil(
                                sortedNext.length / nextQuery.pagination.pageSize,
                            ),
                        );

                        startTransition(() =>
                            setQuery({
                                ...nextQuery,
                                pagination: {
                                    ...nextQuery.pagination,
                                    pageIndex: Math.min(
                                        nextQuery.pagination.pageIndex,
                                        nextPageCount - 1,
                                    ),
                                },
                            }),
                        );
                    }}
                    filters={FILTERS}
                    filtersLayout="inline"
                    debounceMs={200}
                    enableRowSelection
                    enableSorting
                    enableColumnVisibilityMenu
                    onDeleteSelected={(rows) => {
                        const rowIds = new Set(rows.map((row) => row.id));

                        setAccounts((current) => {
                            const nextAccounts = current.filter(
                                (account) => !rowIds.has(account.id),
                            );
                            const filteredNext = applyFilters(nextAccounts, query);
                            const sortedNext = applySorting(filteredNext, query);
                            const nextPageCount = Math.max(
                                1,
                                Math.ceil(
                                    sortedNext.length / query.pagination.pageSize,
                                ),
                            );

                            setQuery((currentQuery) => ({
                                ...currentQuery,
                                pagination: {
                                    ...currentQuery.pagination,
                                    pageIndex: Math.min(
                                        currentQuery.pagination.pageIndex,
                                        nextPageCount - 1,
                                    ),
                                },
                            }));

                            return nextAccounts;
                        });
                    }}
                    deleteSelectedLabel="Rimuovi selezionati"
                />
            </div>
        </AppLayout>
    );
}
