import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import type {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    PaginationState,
    Row,
    RowSelectionState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical } from "lucide-react"
import * as React from "react"

import type {
    DataTableFilterDef,
    DataTableFilterOption,
} from "@/components/data-table-filters"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

/**
 * Reusable filterFn: expects filter value as { min?: number; max?: number }.
 */
export const numberRangeFilterFn: FilterFn<any> = (row, columnId, value) => {
    const raw = row.getValue(columnId)

    // Accept both numbers and numeric strings.
    const v =
        typeof raw === "number"
            ? raw
            : typeof raw === "string"
                ? Number(raw)
                : Number.NaN

    if (Number.isNaN(v)) return false

    const min = value?.min
    const max = value?.max

    if (min != null && v < min) return false
    return !(max != null && v > max);
}

/**
 * Reusable filterFn: expects filter value as string[] (selected values).
 * The row value is cast to string for comparison.
 */
export const multiSelectFilterFn: FilterFn<any> = (row, columnId, value) => {
    const selected: string[] = Array.isArray(value) ? value : []
    if (selected.length === 0) return true
    return selected.includes(String(row.getValue(columnId)))
}

/**
 * Reusable filterFn: expects filter value as boolean (true/false).
 */
export const booleanEqualsFilterFn: FilterFn<any> = (row, columnId, value) => {
    if (value === undefined || value === null) return true
    return Boolean(row.getValue(columnId)) === Boolean(value)
}

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    getRowId?: (row: TData, index: number) => string;
    enableDrag?: boolean;
    enableFiltering?: boolean;
    enableRowSelection?: boolean;
    enableSorting?: boolean;
    onDeleteSelected?: (rows: TData[]) => void;
    deleteSelectedLabel?: string;
    /**
     * Optional, config-driven filter bar. If provided, it replaces the legacy single "name" filter input.
     */
    filters?: DataTableFilterDef[];

    /**
     * Column id used by the legacy single search input (kept for backward compatibility).
     * If you pass `filters`, prefer adding a `kind: "text"` filter instead.
     */
    searchFilterColumnId?: string; // default: "name"

    /**
     * Show a "Reset filters" button when filters are active.
     */
    showResetFilters?: boolean;
};

function arrayMove<T>(list: T[], fromIndex: number, toIndex: number) {
    const next = [...list]
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    return next
}

function DraggableRow<TData>({
                                 row,
                                 enableDrag,
                             }: {
    row: Row<TData>
    enableDrag: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.id, // IMPORTANT: usa l'id di TanStack (coerente con SortableContext.items)
        disabled: !enableDrag,
    })

    return (
        <TableRow
            ref={setNodeRef}
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {row.getVisibleCells().map((cell) => {
                // Render del drag handle SOLO qui (evita 2x useSortable sullo stesso item)
                if (cell.column.id === "drag") {
                    return (
                        <TableCell key={cell.id} className="w-10 px-2 py-3 text-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:bg-transparent"
                                ref={setActivatorNodeRef}
                                {...attributes}
                                {...listeners}
                                type="button"
                            >
                                <GripVertical className="size-3 text-muted-foreground" />
                                <span className="sr-only">Trascina per riordinare</span>
                            </Button>
                        </TableCell>
                    )
                }

                return (
                    <TableCell key={cell.id} className="px-6 py-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                )
            })}
        </TableRow>
    )
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             getRowId,
                                             enableDrag = true,
                                             enableFiltering = true,
                                             enableRowSelection = false,
                                             enableSorting = false,
                                             onDeleteSelected,
                                             deleteSelectedLabel,
                                             filters,
                                             searchFilterColumnId,
                                             showResetFilters = true,
                                         }: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [tableData, setTableData] = React.useState<TData[]>(() => data)

    React.useEffect(() => {
        setTableData(data)
    }, [data])

    const resolveRowId = React.useCallback(
        (row: TData, index: number) => {
            if (getRowId) return getRowId(row, index)
            if (row && typeof row === "object" && "id" in row) {
                return String((row as { id: number | string }).id)
            }
            return String(index)
        },
        [getRowId]
    )

    const dragEnabled = enableDrag && sorting.length === 0

    const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
        const leading: ColumnDef<TData, TValue>[] = []

        if (enableDrag) {
            leading.push({
                id: "drag",
                header: () => null,
                cell: () => null,
                enableHiding: false,
                enableSorting: false,
            })
        }

        if (enableRowSelection) {
            leading.push({
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() &&
                                    'indeterminate')
                            }
                            onCheckedChange={(value) =>
                                table.toggleAllPageRowsSelected(!!value)
                            }
                            aria-label="Seleziona tutte le righe"
                            onPointerDown={(e) => {
                                if (enableDrag) e.stopPropagation();
                            }}
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) =>
                                row.toggleSelected(!!value)
                            }
                            aria-label="Seleziona riga"
                            onPointerDown={(e) => {
                                if (enableDrag) e.stopPropagation();
                            }}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            });
        }

        const smartColumns = columns.map((col) => {
            const colId = col.id ?? (col as any).accessorKey;

            const filterDef = filters?.find((f) => f.columnId === colId);

            if (filterDef) {
                if (filterDef.kind === 'multi') {
                    return {
                        filterFn: multiSelectFilterFn,
                        ...col,
                    };
                }
                if (filterDef.kind === 'numberRange') {
                    return {
                        filterFn: numberRangeFilterFn,
                        ...col,
                    };
                }
                if (filterDef.kind === 'boolean') {
                    return {
                        filterFn: booleanEqualsFilterFn,
                        ...col,
                    };
                }
            }
            return col;
        });

        return [...leading, ...smartColumns]
    }, [columns, enableDrag, enableRowSelection, filters])

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        state: {
            columnFilters,
            columnVisibility,
            pagination,
            rowSelection,
            sorting,
        },
        enableRowSelection,
        enableSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getRowId: resolveRowId,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const searchColumnId = searchFilterColumnId ?? 'name';
    const nameColumn = table.getColumn(searchColumnId);


    const legacySearchEnabled =
        enableFiltering && (!filters || filters.length === 0) && !!nameColumn;

    const hasActiveFilters = table.getState().columnFilters.length > 0;
    function resetFilters() {
        table.resetColumnFilters()
        table.setPageIndex(0)
    }

    function parseOptionalNumber(input: string): number | undefined {
        if (input.trim() === "") return undefined
        const n = Number(input)
        return Number.isFinite(n) ? n : undefined
    }

    // IMPORTANT: items = righe effettivamente renderizzate (pagina corrente)
    const pageRowIds = table.getRowModel().rows.map((r) => r.id)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }, // evita che un click diventi drag
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragEnd(event: DragEndEvent) {
        if (!dragEnabled) return

        const { active, over } = event
        if (!over || active.id === over.id) return

        setTableData((current) => {
            const oldIndex = current.findIndex(
                (r, i) => resolveRowId(r, i) === String(active.id)
            )
            const newIndex = current.findIndex(
                (r, i) => resolveRowId(r, i) === String(over.id)
            )

            if (oldIndex === -1 || newIndex === -1) return current
            return arrayMove(current, oldIndex, newIndex)
        })
    }

    const visibleColumns = table
        .getAllColumns()
        .filter(
            (col) => typeof col.accessorFn !== "undefined" && col.getCanHide()
        )

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCount = selectedRows.length;
    const filteredRows = table.getFilteredRowModel().rows;
    const totalFiltered = filteredRows.length;
    const totalRows = table.getFilteredRowModel().rows.length
    const currentPage = totalRows === 0 ? 0 : table.getState().pagination.pageIndex + 1
    const totalPages = totalRows === 0 ? 0 : table.getPageCount()
    const deleteSelectedText = deleteSelectedLabel ?? 'Elimina selezionati';

    const TableContent = (
        <Table className="text-sm">
            <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead
                                key={header.id}
                                className={
                                    header.column.id === 'drag'
                                        ? 'w-10 px-2'
                                        : 'px-6'
                                }
                            >
                                {header.isPlaceholder ? null : enableSorting &&
                                header.column.getCanSort() ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-1 h-8 px-2 text-left"
                                        onClick={header.column.getToggleSortingHandler()}
                                        type="button"
                                    >
                                        {flexRender(
                                            header.column
                                                .columnDef
                                                .header,
                                            header.getContext(),
                                        )}
                                        {header.column.getIsSorted() ===
                                        'asc' ? (
                                            <ChevronUp className="ml-2 size-4" />
                                        ) : header.column.getIsSorted() ===
                                        'desc' ? (
                                            <ChevronDown className="ml-2 size-4" />
                                        ) : (
                                            <ArrowUpDown className="ml-2 size-4" />
                                        )}
                                    </Button>
                                ) : (
                                    flexRender(
                                        header.column.columnDef
                                            .header,
                                        header.getContext(),
                                    )
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>

            <TableBody>
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                        enableDrag ? (
                            <DraggableRow
                                key={row.id}
                                row={row}
                                enableDrag={dragEnabled}
                            />
                        ) : (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-6 py-5">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={tableColumns.length}
                            className="px-6 py-8 text-center text-muted-foreground"
                        >
                            Nessun risultato.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-1 flex-wrap items-end gap-3">
                    {filters?.length ? (
                        <>
                            {filters.map((f) => {
                                const col = table.getColumn(f.columnId);
                                if (!col) return null;

                                if (f.kind === 'text') {
                                    return (
                                        <div
                                            key={f.columnId}
                                            className="min-w-[220px]"
                                        >
                                            <label className="text-xs text-muted-foreground">
                                                {f.label}
                                            </label>
                                            <Input
                                                placeholder={
                                                    f.placeholder ?? 'Filtra...'
                                                }
                                                value={
                                                    (col.getFilterValue() as string) ??
                                                    ''
                                                }
                                                onChange={(e) => {
                                                    col.setFilterValue(
                                                        e.target.value,
                                                    );
                                                    table.setPageIndex(0);
                                                }}
                                            />
                                        </div>
                                    );
                                }

                                if (f.kind === 'select') {
                                    const selectAllValue = '__all__';
                                    const value =
                                        (col.getFilterValue() as string) ??
                                        selectAllValue;
                                    const clearable = f.clearable !== false;
                                    return (
                                        <div
                                            key={f.columnId}
                                            className="min-w-[220px]"
                                        >
                                            <label className="text-xs text-muted-foreground">
                                                {f.label}
                                            </label>
                                            <Select
                                                value={value}
                                                onValueChange={(v) => {
                                                    if (
                                                        clearable &&
                                                        v === selectAllValue
                                                    ) {
                                                        col.setFilterValue(
                                                            undefined,
                                                        );
                                                    } else {
                                                        col.setFilterValue(v);
                                                    }
                                                    table.setPageIndex(0);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            f.placeholder ??
                                                            'Seleziona...'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clearable && (
                                                        <SelectItem
                                                            value={
                                                                selectAllValue
                                                            }
                                                        >
                                                            Tutti
                                                        </SelectItem>
                                                    )}
                                                    {f.options.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                }

                                if (f.kind === 'multi') {
                                    const selected =
                                        (col.getFilterValue() as string[]) ??
                                        [];
                                    const label =
                                        selected.length > 0
                                            ? `${f.label} (${selected.length})`
                                            : f.label;

                                    return (
                                        <div
                                            key={f.columnId}
                                            className="min-w-[220px]"
                                        >
                                            <label className="text-xs text-muted-foreground">
                                                {f.label}
                                            </label>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between"
                                                        type="button"
                                                    >
                                                        {label}
                                                        <ChevronDown className="ml-2 size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="start"
                                                    className="w-56"
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            col.setFilterValue(
                                                                undefined,
                                                            );
                                                            table.setPageIndex(
                                                                0,
                                                            );
                                                        }}
                                                    >
                                                        Tutti
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {f.options.map((opt) => {
                                                        const checked =
                                                            selected.includes(
                                                                opt.value,
                                                            );
                                                        return (
                                                            <DropdownMenuCheckboxItem
                                                                key={opt.value}
                                                                checked={
                                                                    checked
                                                                }
                                                                onCheckedChange={(
                                                                    next,
                                                                ) => {
                                                                    const nextSelected =
                                                                        next
                                                                            ? Array.from(
                                                                                new Set(
                                                                                    [
                                                                                        ...selected,
                                                                                        opt.value,
                                                                                    ],
                                                                                ),
                                                                            )
                                                                            : selected.filter(
                                                                                (
                                                                                    v,
                                                                                ) =>
                                                                                    v !==
                                                                                    opt.value,
                                                                            );

                                                                    col.setFilterValue(
                                                                        nextSelected.length
                                                                            ? nextSelected
                                                                            : undefined,
                                                                    );
                                                                    table.setPageIndex(
                                                                        0,
                                                                    );
                                                                }}
                                                                onSelect={(e) =>
                                                                    e.preventDefault()
                                                                }
                                                            >
                                                                {opt.label}
                                                            </DropdownMenuCheckboxItem>
                                                        );
                                                    })}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    );
                                }

                                if (f.kind === 'numberRange') {
                                    const current =
                                        (col.getFilterValue() as
                                            | { min?: number; max?: number }
                                            | undefined) ?? {};

                                    return (
                                        <div
                                            key={f.columnId}
                                            className="min-w-[260px]"
                                        >
                                            <label className="text-xs text-muted-foreground">
                                                {f.label}
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    inputMode="numeric"
                                                    placeholder={
                                                        f.minPlaceholder ??
                                                        'Min'
                                                    }
                                                    value={current.min ?? ''}
                                                    onChange={(e) => {
                                                        const min =
                                                            parseOptionalNumber(
                                                                e.target.value,
                                                            );
                                                        const next = {
                                                            ...current,
                                                            min,
                                                        };
                                                        const isEmpty =
                                                            next.min ===
                                                            undefined &&
                                                            next.max ===
                                                            undefined;
                                                        col.setFilterValue(
                                                            isEmpty
                                                                ? undefined
                                                                : next,
                                                        );
                                                        table.setPageIndex(0);
                                                    }}
                                                />
                                                <Input
                                                    inputMode="numeric"
                                                    placeholder={
                                                        f.maxPlaceholder ??
                                                        'Max'
                                                    }
                                                    value={current.max ?? ''}
                                                    onChange={(e) => {
                                                        const max =
                                                            parseOptionalNumber(
                                                                e.target.value,
                                                            );
                                                        const next = {
                                                            ...current,
                                                            max,
                                                        };
                                                        const isEmpty =
                                                            next.min ===
                                                            undefined &&
                                                            next.max ===
                                                            undefined;
                                                        col.setFilterValue(
                                                            isEmpty
                                                                ? undefined
                                                                : next,
                                                        );
                                                        table.setPageIndex(0);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }

                                if (f.kind === 'boolean') {
                                    const current = col.getFilterValue() as
                                        | boolean
                                        | undefined;

                                    return (
                                        <div
                                            key={f.columnId}
                                            className="min-w-[220px]"
                                        >
                                            <label className="text-xs text-muted-foreground">
                                                {f.label}
                                            </label>
                                            <Select
                                                value={
                                                    current === true
                                                        ? 'true'
                                                        : current === false
                                                            ? 'false'
                                                            : ''
                                                }
                                                onValueChange={(v) => {
                                                    if (v === '')
                                                        col.setFilterValue(
                                                            undefined,
                                                        );
                                                    else
                                                        col.setFilterValue(
                                                            v === 'true',
                                                        );
                                                    table.setPageIndex(0);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tutti" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">
                                                        Tutti
                                                    </SelectItem>
                                                    <SelectItem value="true">
                                                        {f.trueLabel ?? 'Sì'}
                                                    </SelectItem>
                                                    <SelectItem value="false">
                                                        {f.falseLabel ?? 'No'}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </>
                    ) : legacySearchEnabled ? (
                        <Input
                            placeholder="Cerca..."
                            value={
                                (nameColumn?.getFilterValue() as string) ?? ''
                            }
                            onChange={(e) => {
                                nameColumn?.setFilterValue(e.target.value);
                                table.setPageIndex(0);
                            }}
                            className="sm:max-w-sm"
                        />
                    ) : (
                        <div className="flex-1" />
                    )}

                    {showResetFilters && hasActiveFilters ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            type="button"
                        >
                            Reset filtri
                        </Button>
                    ) : null}
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                    {enableRowSelection ? (
                        <>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    onDeleteSelected?.(
                                        selectedRows.map((row) => row.original),
                                    )
                                }
                                disabled={
                                    selectedCount === 0 || !onDeleteSelected
                                }
                                type="button"
                            >
                                {deleteSelectedText}
                            </Button>
                        </>
                    ) : null}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Colonne
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {visibleColumns.map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-sm text-muted-foreground">
                        Righe per pagina
                    </span>
                    <Select
                        value={String(table.getState().pagination.pageSize)}
                        onValueChange={(v) => {
                            table.setPageSize(Number(v));
                            table.setPageIndex(0);
                        }}
                    >
                        <SelectTrigger className="w-[90px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top" align="end" className="min-w-[96px]">
                            {[5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-background shadow-sm">
                {enableDrag ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={pageRowIds}
                            strategy={verticalListSortingStrategy}
                        >
                            {TableContent}
                        </SortableContext>
                    </DndContext>
                ) : (
                    TableContent
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                        {enableRowSelection
                            ? `${selectedCount} di ${totalFiltered} selezionate`
                            : ' '}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                            Pagina {currentPage} di {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            type="button"
                        >
                            Precedente
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            type="button"
                        >
                            Successiva
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { DataTableFilterDef, DataTableFilterOption }
