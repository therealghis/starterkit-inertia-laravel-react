import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    Column,
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    RowSelectionState,
    SortingState,
    Table as TanStackTable,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Filter,
    Settings2,
    X,
} from 'lucide-react';
import * as React from 'react';

import type { DataTableFilterDef } from '@/components/data-table-filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type ServerTableQuery = {
    columnFilters: ColumnFiltersState;
    sorting: SortingState;
    pagination: PaginationState;
};

type ServerDataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    rowCount: number;
    pageCount: number;
    initialColumnFilters?: ColumnFiltersState;
    initialSorting?: SortingState;
    initialPagination?: PaginationState;
    onQueryChange: (query: ServerTableQuery) => void;
    filters?: DataTableFilterDef[];
    showResetFilters?: boolean;
    filtersLayout?: 'inline' | 'stacked';
    debounceMs?: number;
    enableRowSelection?: boolean;
    enableSorting?: boolean;
    enableColumnVisibilityMenu?: boolean;
    onDeleteSelected?: (rows: TData[]) => void;
    deleteSelectedLabel?: string;
};

type ActiveFilterChip = {
    key: string;
    label: string;
    value: string;
    clear: () => void;
};

type FilterValue = ColumnFiltersState[number]['value'];

function parseOptionalNumber(input: string): number | undefined {
    if (input.trim() === '') {
        return undefined;
    }

    const parsed = Number(input);

    return Number.isFinite(parsed) ? parsed : undefined;
}

function getNumberRangeLabel(value: { min?: number; max?: number } | undefined): string | null {
    if (!value) {
        return null;
    }

    if (value.min !== undefined && value.max !== undefined) {
        return `${value.min} - ${value.max}`;
    }

    if (value.min !== undefined) {
        return `da ${value.min}`;
    }

    if (value.max !== undefined) {
        return `fino a ${value.max}`;
    }

    return null;
}

function getSelectLabel(filter: Extract<DataTableFilterDef, { kind: 'select' }>, value: string): string {
    return filter.options.find((option) => option.value === value)?.label ?? value;
}

function getMultiLabel(filter: Extract<DataTableFilterDef, { kind: 'multi' }>, selected: string[]): string | null {
    if (selected.length === 0) {
        return null;
    }

    const labels = filter.options
        .filter((option) => selected.includes(option.value))
        .map((option) => option.label);

    if (labels.length <= 2) {
        return labels.join(', ');
    }

    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
}

function getFilterValue(
    columnFilters: ColumnFiltersState,
    columnId: string,
): FilterValue | undefined {
    return columnFilters.find((filter) => filter.id === columnId)?.value;
}

function getFilterChip(
    columnFilters: ColumnFiltersState,
    filter: DataTableFilterDef,
    clear: () => void,
): ActiveFilterChip | null {
    if (filter.kind === 'text') {
        const value = (getFilterValue(columnFilters, filter.columnId) as string | undefined)?.trim();

        if (!value) {
            return null;
        }

        return {
            key: filter.columnId,
            label: filter.label,
            value,
            clear,
        };
    }

    if (filter.kind === 'select') {
        const value = getFilterValue(columnFilters, filter.columnId) as string | undefined;

        if (!value) {
            return null;
        }

        return {
            key: filter.columnId,
            label: filter.label,
            value: getSelectLabel(filter, value),
            clear,
        };
    }

    if (filter.kind === 'boolean') {
        const value = getFilterValue(columnFilters, filter.columnId) as boolean | undefined;

        if (value === undefined) {
            return null;
        }

        return {
            key: filter.columnId,
            label: filter.label,
            value: value ? (filter.trueLabel ?? 'Sì') : (filter.falseLabel ?? 'No'),
            clear,
        };
    }

    if (filter.kind === 'multi') {
        const value = (getFilterValue(columnFilters, filter.columnId) as string[] | undefined) ?? [];
        const label = getMultiLabel(filter, value);

        if (!label) {
            return null;
        }

        return {
            key: filter.columnId,
            label: filter.label,
            value: label,
            clear,
        };
    }

    if (filter.kind === 'numberRange') {
        const value = getFilterValue(columnFilters, filter.columnId) as
            | {
                  min?: number;
                  max?: number;
              }
            | undefined;
        const label = getNumberRangeLabel(value);

        if (!label) {
            return null;
        }

        return {
            key: filter.columnId,
            label: filter.label,
            value: label,
            clear,
        };
    }

    return null;
}

function getDesktopFieldClassName(filter: DataTableFilterDef, filtersLayout: 'inline' | 'stacked'): string {
    if (filtersLayout === 'stacked') {
        return filter.kind === 'numberRange' ? 'md:col-span-2' : '';
    }

    if (filter.kind === 'text') {
        return 'md:col-span-2';
    }

    if (filter.kind === 'numberRange') {
        return 'xl:col-span-2';
    }

    return '';
}

function FilterField<TData>({
    filter,
    value,
    onChange,
    className,
}: {
    filter: DataTableFilterDef;
    value: FilterValue | undefined;
    onChange: (value: FilterValue | undefined) => void;
    className?: string;
}) {
    if (filter.kind === 'text') {
        return (
            <div className={cn("space-y-1.5", className)}>
                <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                </label>
                <Input
                    placeholder={filter.placeholder ?? 'Filtra...'}
                    value={(value as string | undefined) ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        );
    }

    if (filter.kind === 'select') {
        const clearable = filter.clearable !== false;
        const selectAllValue = '__all__';
        const currentValue = (value as string | undefined) ?? selectAllValue;

        return (
            <div className={cn("space-y-1.5", className)}>
                <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                </label>
                <Select
                    value={currentValue}
                    onValueChange={(nextValue) => {
                        if (clearable && nextValue === selectAllValue) {
                            onChange(undefined);
                            return;
                        }

                        onChange(nextValue);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder ?? 'Seleziona...'} />
                    </SelectTrigger>
                    <SelectContent>
                        {clearable ? (
                            <SelectItem value={selectAllValue}>Tutti</SelectItem>
                        ) : null}
                        {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (filter.kind === 'boolean') {
        const currentValue = value as boolean | undefined;
        const normalizedValue =
            currentValue === true ? 'true' : currentValue === false ? 'false' : 'all';

        return (
            <div className={cn("space-y-1.5", className)}>
                <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                </label>
                <Select
                    value={normalizedValue}
                    onValueChange={(nextValue) => {
                        if (nextValue === 'all') {
                            onChange(undefined);
                            return;
                        }

                        onChange(nextValue === 'true');
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti</SelectItem>
                        <SelectItem value="true">{filter.trueLabel ?? 'Sì'}</SelectItem>
                        <SelectItem value="false">{filter.falseLabel ?? 'No'}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (filter.kind === 'multi') {
        const selected = (value as string[] | undefined) ?? [];
        const triggerLabel = getMultiLabel(filter, selected) ?? filter.label;

        return (
            <div className={cn("space-y-1.5", className)}>
                <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                </label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between font-normal"
                        >
                            <span className="truncate">{triggerLabel}</span>
                            <ChevronDown className="ml-2 size-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60">
                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                onChange(undefined);
                            }}
                        >
                            Tutti
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {filter.options.map((option) => {
                            const checked = selected.includes(option.value);

                            return (
                                <DropdownMenuCheckboxItem
                                    key={option.value}
                                    checked={checked}
                                    onCheckedChange={(nextChecked) => {
                                        const nextSelection = nextChecked
                                            ? Array.from(new Set([...selected, option.value]))
                                            : selected.filter((value) => value !== option.value);

                                        onChange(
                                            nextSelection.length > 0 ? nextSelection : undefined,
                                        );
                                    }}
                                    onSelect={(event) => event.preventDefault()}
                                >
                                    {option.label}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    const currentValue = (value as { min?: number; max?: number } | undefined) ?? {};

    return (
        <div className={cn("space-y-1.5", className)}>
            <label className="text-xs font-medium text-muted-foreground">
                {filter.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
                <Input
                    inputMode="numeric"
                    placeholder={filter.minPlaceholder ?? 'Min'}
                    value={currentValue.min ?? ''}
                    onChange={(event) => {
                        const nextValue = {
                            ...currentValue,
                            min: parseOptionalNumber(event.target.value),
                        };

                        onChange(
                            nextValue.min === undefined && nextValue.max === undefined
                                ? undefined
                                : nextValue,
                        );
                    }}
                />
                <Input
                    inputMode="numeric"
                    placeholder={filter.maxPlaceholder ?? 'Max'}
                    value={currentValue.max ?? ''}
                    onChange={(event) => {
                        const nextValue = {
                            ...currentValue,
                            max: parseOptionalNumber(event.target.value),
                        };

                        onChange(
                            nextValue.min === undefined && nextValue.max === undefined
                                ? undefined
                                : nextValue,
                        );
                    }}
                />
            </div>
        </div>
    );
}

function FilterPanel({
    columnFilters,
    filters,
    filtersLayout,
    showResetFilters,
    hasActiveFilters,
    onResetFilters,
    onFilterValueChange,
    className,
}: {
    columnFilters: ColumnFiltersState;
    filters: DataTableFilterDef[];
    filtersLayout: 'inline' | 'stacked';
    showResetFilters: boolean;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
    onFilterValueChange: (columnId: string, value: FilterValue | undefined) => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-sidebar-border/70 bg-muted/20 p-4',
                className,
            )}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">Filtri</p>
                    <p className="text-xs text-muted-foreground">
                        Modifica i criteri per aggiornare subito i risultati.
                    </p>
                </div>
                {showResetFilters && hasActiveFilters ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onResetFilters}
                    >
                        Reset filtri
                    </Button>
                ) : null}
            </div>

            <div
                className={cn(
                    'grid gap-3',
                    filtersLayout === 'stacked'
                        ? 'md:grid-cols-2 xl:grid-cols-3'
                        : 'md:grid-cols-2 xl:grid-cols-5',
                )}
            >
                {filters.map((filter) => (
                    <FilterField
                        key={filter.columnId}
                        filter={filter}
                        value={getFilterValue(columnFilters, filter.columnId)}
                        onChange={(value) => onFilterValueChange(filter.columnId, value)}
                        className={getDesktopFieldClassName(filter, filtersLayout)}
                    />
                ))}
            </div>
        </div>
    );
}

function ActiveFilterBar({
    chips,
    onResetFilters,
}: {
    chips: ActiveFilterChip[];
    onResetFilters: () => void;
}) {
    if (chips.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <Badge
                    key={chip.key}
                    variant="outline"
                    className="gap-2 rounded-full border-sidebar-border/80 bg-background px-3 py-1 text-xs"
                >
                    <span className="font-medium">{chip.label}:</span>
                    <span className="text-muted-foreground">{chip.value}</span>
                    <button
                        type="button"
                        onClick={chip.clear}
                        className="rounded-full text-muted-foreground transition hover:text-foreground"
                        aria-label={`Rimuovi filtro ${chip.label}`}
                    >
                        <X className="size-3.5" />
                    </button>
                </Badge>
            ))}

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={onResetFilters}
            >
                Rimuovi tutto
            </Button>
        </div>
    );
}

function ColumnVisibilityMenu<TData>({
    columns,
}: {
    columns: Column<TData, unknown>[];
}) {
    if (columns.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                    <Settings2 className="mr-2 size-4" />
                    Colonne
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                        {column.id}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ServerDataTable<TData, TValue>({
    columns,
    data,
    rowCount,
    pageCount,
    initialColumnFilters,
    initialSorting,
    initialPagination,
    onQueryChange,
    filters,
    showResetFilters = true,
    filtersLayout = 'inline',
    debounceMs,
    enableRowSelection = false,
    enableSorting = true,
    enableColumnVisibilityMenu = true,
    onDeleteSelected,
    deleteSelectedLabel,
}: ServerDataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        () => initialColumnFilters ?? [],
    );
    const [sorting, setSorting] = React.useState<SortingState>(() => initialSorting ?? []);
    const [pagination, setPagination] = React.useState<PaginationState>(
        () => initialPagination ?? { pageIndex: 0, pageSize: 10 },
    );
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

    const query = React.useMemo(
        () => ({
            columnFilters,
            sorting,
            pagination,
        }),
        [columnFilters, pagination, sorting],
    );

    React.useEffect(() => {
        if (!debounceMs || debounceMs <= 0) {
            onQueryChange(query);
            return;
        }

        const timeoutId = window.setTimeout(() => onQueryChange(query), debounceMs);

        return () => window.clearTimeout(timeoutId);
    }, [debounceMs, onQueryChange, query]);

    const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
        if (!enableRowSelection) {
            return columns;
        }

        const selectionColumn: ColumnDef<TData, TValue> = {
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        };

        return [selectionColumn, ...columns];
    }, [columns, enableRowSelection]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            columnFilters,
            sorting,
            pagination,
            columnVisibility,
            rowSelection,
        },
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        pageCount,
        rowCount,
        enableRowSelection,
        onColumnFiltersChange: (updater) => {
            setColumnFilters((previous) => {
                const next = typeof updater === 'function' ? updater(previous) : updater;
                setPagination((current) => ({ ...current, pageIndex: 0 }));

                return next;
            });
        },
        onSortingChange: (updater) => {
            setSorting((previous) => {
                const next = typeof updater === 'function' ? updater(previous) : updater;
                setPagination((current) => ({ ...current, pageIndex: 0 }));

                return next;
            });
        },
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
    });

    const hasFilters = (filters?.length ?? 0) > 0;
    const hasActiveFilters = columnFilters.length > 0;
    const deleteSelectedText = deleteSelectedLabel ?? 'Elimina selezionati';
    const selectedRowCount = Object.keys(rowSelection).length;
    const visibleColumns = table
        .getAllColumns()
        .filter((column) => column.id !== 'select' && column.getCanHide());

    const setFilterValue = React.useCallback((columnId: string, value: FilterValue | undefined) => {
        setColumnFilters((previous) => {
            const next = previous.filter((filter) => filter.id !== columnId);

            if (value === undefined) {
                return next;
            }

            return [...next, { id: columnId, value }];
        });
        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, []);

    const activeFilterChips = React.useMemo(
        () =>
            (filters ?? [])
                .map((filter) =>
                    getFilterChip(columnFilters, filter, () => setFilterValue(filter.columnId, undefined)),
                )
                .filter((chip): chip is ActiveFilterChip => chip !== null),
        [columnFilters, filters, setFilterValue],
    );

    function resetFilters(): void {
        setColumnFilters([]);
        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }

    function deleteSelectedRows(): void {
        if (!onDeleteSelected) {
            return;
        }

        const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

        onDeleteSelected(selectedRows);
        setRowSelection({});
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                    {hasFilters ? (
                        <>
                            <div className="hidden xl:block">
                                <FilterPanel
                                    columnFilters={columnFilters}
                                    filters={filters ?? []}
                                    filtersLayout={filtersLayout}
                                    showResetFilters={showResetFilters}
                                    hasActiveFilters={hasActiveFilters}
                                    onResetFilters={resetFilters}
                                    onFilterValueChange={setFilterValue}
                                />
                            </div>
                            <ActiveFilterBar
                                chips={activeFilterChips}
                                onResetFilters={resetFilters}
                            />
                        </>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    {enableRowSelection && onDeleteSelected ? (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedRows}
                            disabled={selectedRowCount === 0}
                        >
                            {deleteSelectedText}
                        </Button>
                    ) : null}

                    {hasFilters ? (
                        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="xl:hidden"
                                >
                                    <Filter className="mr-2 size-4" />
                                    Filtri
                                    {hasActiveFilters ? ` (${activeFilterChips.length})` : ''}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-lg">
                                <SheetHeader>
                                    <SheetTitle>Filtri tabella</SheetTitle>
                                    <SheetDescription>
                                        Aggiorna i criteri per restringere i risultati.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="px-4 pb-4">
                                    <FilterPanel
                                        columnFilters={columnFilters}
                                        filters={filters ?? []}
                                        filtersLayout="stacked"
                                        showResetFilters={showResetFilters}
                                        hasActiveFilters={hasActiveFilters}
                                        onResetFilters={resetFilters}
                                        onFilterValueChange={setFilterValue}
                                        className="border-0 bg-transparent p-0"
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    ) : null}

                    {enableColumnVisibilityMenu ? (
                        <ColumnVisibilityMenu columns={visibleColumns} />
                    ) : null}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-background shadow-sm">
                <Table className="text-sm">
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.column.id === 'select' ? 'w-10 px-2' : 'px-6'
                                        }
                                    >
                                        {header.isPlaceholder ? null : enableSorting &&
                                          header.column.getCanSort() ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-1 h-8 px-2 text-left"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getIsSorted() === 'asc' ? (
                                                    <ChevronUp className="ml-2 size-4" />
                                                ) : header.column.getIsSorted() === 'desc' ? (
                                                    <ChevronDown className="ml-2 size-4" />
                                                ) : (
                                                    <ArrowUpDown className="ml-2 size-4" />
                                                )}
                                            </Button>
                                        ) : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === 'select'
                                                    ? 'w-10 px-2 text-center'
                                                    : 'px-6 py-4'
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableColumns.length}
                                    className="px-6 py-10 text-center"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">Nessun risultato</p>
                                        <p className="text-sm text-muted-foreground">
                                            Prova a cambiare i filtri o a ripristinare la ricerca.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="flex flex-col gap-3 border-t border-sidebar-border/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                        {enableRowSelection
                            ? `${selectedRowCount} selezionate su ${rowCount}`
                            : `${rowCount} risultati totali`}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Righe</span>
                            <Select
                                value={String(pagination.pageSize)}
                                onValueChange={(value) =>
                                    setPagination({ pageIndex: 0, pageSize: Number(value) })
                                }
                            >
                                <SelectTrigger className="w-[96px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent side="top" align="end" className="min-w-[96px]">
                                    {[5, 10, 20, 50, 100].map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Pagina {pagination.pageIndex + 1} di {pageCount}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPagination((current) => ({
                                        ...current,
                                        pageIndex: Math.max(0, current.pageIndex - 1),
                                    }))
                                }
                                disabled={!table.getCanPreviousPage()}
                            >
                                Precedente
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPagination((current) => ({
                                        ...current,
                                        pageIndex: Math.min(pageCount - 1, current.pageIndex + 1),
                                    }))
                                }
                                disabled={!table.getCanNextPage()}
                            >
                                Successiva
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { ColumnFiltersState, PaginationState, SortingState };
