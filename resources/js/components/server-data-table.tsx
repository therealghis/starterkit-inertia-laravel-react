import { Form } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import type {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    RowSelectionState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronUp, LucideCog } from 'lucide-react';
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
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

// --- Definizioni Tipi Filtri (Identici al Client) ---
export type DataTableFilterOption = {
    label: string
    value: string
}

export type DataTableFilterDef =
    | { kind: "text"; columnId: string; label: string; placeholder?: string }
    | { kind: "select"; columnId: string; label: string; options: DataTableFilterOption[]; clearable?: boolean; placeholder?: string }
    | { kind: "multi"; columnId: string; label: string; options: DataTableFilterOption[] }
    | { kind: "numberRange"; columnId: string; label: string; minPlaceholder?: string; maxPlaceholder?: string }
    | { kind: "boolean"; columnId: string; label: string; trueLabel?: string; falseLabel?: string }

export type ServerTableQuery = {
    columnFilters: ColumnFiltersState
    sorting: SortingState
    pagination: PaginationState
}

type ServerDataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    rowCount: number
    pageCount: number
    initialColumnFilters?: ColumnFiltersState
    initialSorting?: SortingState
    initialPagination?: PaginationState
    onQueryChange: (q: ServerTableQuery) => void
    filters?: DataTableFilterDef[]
    showResetFilters?: boolean
    filtersLayout?: "panel" | "inline"
    debounceMs?: number
    enableRowSelection?: boolean
    enableSorting?: boolean
    enableColumnVisibilityMenu?: boolean
    // Nuove prop per matching con Client Table
    onDeleteSelected?: (rows: TData[]) => void
    deleteSelectedLabel?: string
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
                                                   filtersLayout = "panel",
                                                   debounceMs,
                                                   enableRowSelection = false,
                                                   enableSorting = true,
                                                   enableColumnVisibilityMenu = true,
                                                   onDeleteSelected,
                                                   deleteSelectedLabel,
                                               }: ServerDataTableProps<TData, TValue>) {

    // --- State Management ---
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() => initialColumnFilters ?? [])
    const [sorting, setSorting] = React.useState<SortingState>(() => initialSorting ?? [])
    const [pagination, setPagination] = React.useState<PaginationState>(() => initialPagination ?? { pageIndex: 0, pageSize: 10 })
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [filtersOpen, setFiltersOpen] = React.useState(false)

    // Sync props -> state (se arrivano nuovi valori dal server/parent)
    React.useEffect(() => {
        if (initialColumnFilters) setColumnFilters(initialColumnFilters)
    }, [initialColumnFilters])
    React.useEffect(() => {
        if (initialSorting) setSorting(initialSorting)
    }, [initialSorting])
    React.useEffect(() => {
        if (initialPagination) setPagination(initialPagination)
    }, [initialPagination])

    // Debounce & Emit Query Change
    React.useEffect(() => {
        const payload = { columnFilters, sorting, pagination }
        if (!debounceMs || debounceMs <= 0) {
            onQueryChange(payload)
            return
        }
        const t = window.setTimeout(() => onQueryChange(payload), debounceMs)
        return () => window.clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(columnFilters), JSON.stringify(sorting), JSON.stringify(pagination)])

    // --- Dynamic Columns Construction (Checkbox Injection) ---
    const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
        const leading: ColumnDef<TData, TValue>[] = []

        if (enableRowSelection) {
            leading.push({
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            })
        }
        return [...leading, ...columns]
    }, [columns, enableRowSelection])

    // --- Table Instance ---
    const table = useReactTable({
        data,
        columns: tableColumns,
        state: { columnFilters, sorting, pagination, columnVisibility, rowSelection },
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        pageCount,
        rowCount,
        enableRowSelection,
        onColumnFiltersChange: (updater) => {
            setColumnFilters(prev => {
                const next = typeof updater === "function" ? updater(prev) : updater
                setPagination(p => ({ ...p, pageIndex: 0 })) // Reset a pag 1 se filtro cambia
                return next
            })
        },
        onSortingChange: (updater) => {
            setSorting(prev => {
                const next = typeof updater === "function" ? updater(prev) : updater
                setPagination(p => ({ ...p, pageIndex: 0 })) // Reset a pag 1 se sort cambia
                return next
            })
        },
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
    })

    const visibleColumns = table.getAllColumns().filter(col => typeof col.accessorFn !== "undefined" && col.getCanHide())
    const hasActiveFilters = columnFilters.length > 0
    const deleteSelectedText = deleteSelectedLabel ?? 'Elimina selezionati'

    function resetFilters() {
        setColumnFilters([])
        setPagination(p => ({ ...p, pageIndex: 0 }))
    }

    function parseOptionalNumber(input: string): number | undefined {
        if (input.trim() === "") return undefined
        const n = Number(input)
        return Number.isFinite(n) ? n : undefined
    }

    const filtersContent = filters?.length ? (
        <Form
            className="space-y-3"
            onSubmit={(event) => event.preventDefault()}
        >
            <div className="grid grid-cols-2 gap-3">
                {filters.map((f) => {
                    const col = table.getColumn(f.columnId)
                    if (!col) return null

                    if (f.kind === 'text') {
                        return (
                            <div key={f.columnId} className="space-y-1">
                                <label className="text-xs text-muted-foreground">{f.label}</label>
                                <Input
                                    placeholder={f.placeholder ?? 'Filtra...'}
                                    value={(col.getFilterValue() as string) ?? ''}
                                    onChange={(e) => col.setFilterValue(e.target.value)}
                                />
                            </div>
                        )
                    }
                    if (f.kind === 'select') {
                        const selectAllValue = '__all__'
                        const value = (col.getFilterValue() as string) ?? selectAllValue
                        const clearable = f.clearable !== false
                        return (
                            <div key={f.columnId} className="space-y-1">
                                <label className="text-xs text-muted-foreground">{f.label}</label>
                                <Select
                                    value={value}
                                    onValueChange={(v) => {
                                        if (clearable && v === selectAllValue) col.setFilterValue(undefined)
                                        else col.setFilterValue(v)
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder={f.placeholder ?? 'Seleziona...'} /></SelectTrigger>
                                    <SelectContent>
                                        {clearable && <SelectItem value={selectAllValue}>Tutti</SelectItem>}
                                        {f.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )
                    }
                    if (f.kind === 'boolean') {
                        const current = col.getFilterValue() as boolean | undefined
                        const valStr = current === true ? 'true' : current === false ? 'false' : ''
                        return (
                            <div key={f.columnId} className="space-y-1">
                                <label className="text-xs text-muted-foreground">{f.label}</label>
                                <Select
                                    value={valStr}
                                    onValueChange={(v) => {
                                        if (v === '') col.setFilterValue(undefined)
                                        else col.setFilterValue(v === 'true')
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder="Tutti" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tutti</SelectItem>
                                        <SelectItem value="true">{f.trueLabel ?? 'Sì'}</SelectItem>
                                        <SelectItem value="false">{f.falseLabel ?? 'No'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )
                    }
                    if (f.kind === 'multi') {
                        const selected = (col.getFilterValue() as string[]) ?? []
                        const label = selected.length > 0 ? `${f.label} (${selected.length})` : f.label

                        return (
                            <div key={f.columnId} className="space-y-1">
                                <label className="text-xs text-muted-foreground">{f.label}</label>
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
                                    <DropdownMenuContent align="start" className="w-56">
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault()
                                                col.setFilterValue(undefined)
                                            }}
                                        >
                                            Tutti
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {f.options.map((opt) => {
                                            const checked = selected.includes(opt.value)
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={opt.value}
                                                    checked={checked}
                                                    onCheckedChange={(next) => {
                                                        const nextSelected = next
                                                            ? Array.from(new Set([...selected, opt.value]))
                                                            : selected.filter((v) => v !== opt.value)

                                                        col.setFilterValue(
                                                            nextSelected.length ? nextSelected : undefined
                                                        )
                                                    }}
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    {opt.label}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )
                    }
                    if (f.kind === 'numberRange') {
                        const current = (col.getFilterValue() as { min?: number; max?: number } | undefined) ?? {}

                        return (
                            <div key={f.columnId} className="space-y-1">
                                <label className="text-xs text-muted-foreground">{f.label}</label>
                                <div className="flex gap-2">
                                    <Input
                                        inputMode="numeric"
                                        placeholder={f.minPlaceholder ?? 'Min'}
                                        value={current.min ?? ''}
                                        onChange={(e) => {
                                            const min = parseOptionalNumber(e.target.value)
                                            const next = { ...current, min }
                                            const isEmpty = next.min === undefined && next.max === undefined
                                            col.setFilterValue(isEmpty ? undefined : next)
                                        }}
                                    />
                                    <Input
                                        inputMode="numeric"
                                        placeholder={f.maxPlaceholder ?? 'Max'}
                                        value={current.max ?? ''}
                                        onChange={(e) => {
                                            const max = parseOptionalNumber(e.target.value)
                                            const next = { ...current, max }
                                            const isEmpty = next.min === undefined && next.max === undefined
                                            col.setFilterValue(isEmpty ? undefined : next)
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    }

                    return null
                })}
            </div>

            {showResetFilters && hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    type="button"
                >
                    Reset filtri
                </Button>
            )}
        </Form>
    ) : null

    return (
        <div className="space-y-3">
            {filters?.length ? (
                <Collapsible
                    open={filtersOpen}
                    onOpenChange={setFiltersOpen}
                    className="space-y-3"
                >
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-1 flex-wrap items-center gap-3" />

                        <div className="flex items-center gap-2 sm:ml-auto">
                            {enableRowSelection && onDeleteSelected && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
                                        onDeleteSelected(selectedRows)
                                        setRowSelection({})
                                    }}
                                    disabled={Object.keys(rowSelection).length === 0}
                                    type="button"
                                >
                                    {deleteSelectedText}
                                </Button>
                            )}

                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm" type="button">
                                    <LucideCog className="mr-2 size-4" />
                                    Filtri{hasActiveFilters ? ` (${columnFilters.length})` : ''}
                                    {filtersOpen ? <ChevronUp className="ml-2 size-4" /> : <ChevronDown className="ml-2 size-4" />}
                                </Button>
                            </CollapsibleTrigger>

                            {enableColumnVisibilityMenu && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">Colonne</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {visibleColumns.map((column) => (
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
                            )}

                        </div>
                    </div>

                    <CollapsibleContent
                        className={
                            filtersLayout === "panel"
                                ? "rounded-lg border border-sidebar-border/70 bg-muted/30 p-3"
                                : "p-3"
                        }
                    >
                        {filtersContent}
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-3" />

                    <div className="flex items-center gap-2 sm:ml-auto">
                        {enableRowSelection && onDeleteSelected && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
                                    onDeleteSelected(selectedRows)
                                    setRowSelection({})
                                }}
                                disabled={Object.keys(rowSelection).length === 0}
                                type="button"
                            >
                                {deleteSelectedText}
                            </Button>
                        )}

                        {enableColumnVisibilityMenu && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">Colonne</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {visibleColumns.map((column) => (
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
                        )}
                    </div>
                </div>
            )}

            {/* Table Body */}
            <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-background shadow-sm">
                <Table className="text-sm">
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className={header.column.id === 'select' ? 'w-10 px-2' : 'px-6'}>
                                        {header.isPlaceholder ? null : enableSorting && header.column.getCanSort() ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-1 h-8 px-2 text-left"
                                                onClick={header.column.getToggleSortingHandler()}
                                                type="button"
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === "asc" ? <ChevronUp className="ml-2 size-4" /> : header.column.getIsSorted() === "desc" ? <ChevronDown className="ml-2 size-4" /> : <ArrowUpDown className="ml-2 size-4" />}
                                            </Button>
                                        ) : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className={cell.column.id === 'select' ? 'w-10 px-2 text-center' : 'px-6 py-4'}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumns.length} className="px-6 py-8 text-center text-muted-foreground">Nessun risultato.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                        {enableRowSelection ? `${Object.keys(rowSelection).length} selezionate` : `${rowCount} totali`}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Righe</span>
                            <Select
                                value={String(pagination.pageSize)}
                                onValueChange={(v) => setPagination({ pageIndex: 0, pageSize: Number(v) })}
                            >
                                <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 50, 100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">Pagina {pagination.pageIndex + 1} di {pageCount}</div>
                        <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))} disabled={!table.getCanPreviousPage()}>Precedente</Button>
                        <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, pageIndex: Math.min(pageCount - 1, p.pageIndex + 1) }))} disabled={!table.getCanNextPage()}>Successiva</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export { ColumnFiltersState, PaginationState, SortingState };
