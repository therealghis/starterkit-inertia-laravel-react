import { Head, Link, useForm } from '@inertiajs/react';
import { CirclePlus, Download, FileSpreadsheet, Paperclip, PencilLine } from 'lucide-react';
import { useMemo, useState } from 'react';
import { update as mergeAcquisitionUpdate } from '@/actions/App/Http/Controllers/MergeAcquisitionController';
import FileUpload from '@/components/file-upload';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PageHero,
    PageHeroActions,
    PageHeroAside,
    PageHeroBody,
    PageHeroContent,
    PageHeroDescription,
    PageHeroEyebrow,
    PageHeroTitle,
} from '@/components/ui/page-hero';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFormToast } from '@/hooks/use-form-toast';
import AppLayout from '@/layouts/app-layout';
import MergeAcquisitionFormFields from '@/pages/merge_acquisition/merge-acquisition-form-fields';
import type { EconomicActivityOption, MergeAcquisitionFormData } from '@/pages/merge_acquisition/merge-acquisition-form-fields';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import { index as mergeAcquisitionDueDiligenceIndex } from '@/routes/merge_acquisition/due_diligences';
import type { BreadcrumbItem } from '@/types';

type AttachmentRecord = {
    id: number;
    filename: string;
    mimetype: string;
    file_path: string;
    download_url: string;
    created_at: string | null;
};

type FinancialRecord = {
    id: number;
    year: number;
    sales: string;
    income: string;
    pfn: string;
    ebitda: string;
    debt: string | null;
    created_at: string | null;
};

type DraftAttachmentRecord = {
    id: string;
    filename: string;
    mimetype: string;
    sizeLabel: string;
    file: File;
};

type DraftFinancialRecord = {
    id: string;
    year: number;
    sales: string;
    income: string;
    pfn: string;
    ebitda: string;
    debt: string;
};

type FinancialPayload = {
    id?: number;
    year: number;
    sales: string;
    income: string;
    pfn: string;
    ebitda: string;
    debt: string | null;
};

type FinancialDraftForm = {
    year: string;
    sales: string;
    income: string;
    pfn: string;
    ebitda: string;
    debt: string;
};

type PersistedAttachmentRow = {
    key: string;
    attachmentId: number;
    filename: string;
    mimetype: string;
    source: string;
    downloadUrl: string;
    status: 'Salvato';
};

type DraftAttachmentRow = {
    key: string;
    filename: string;
    mimetype: string;
    source: string;
    status: 'Da salvare';
};

type AttachmentRow = PersistedAttachmentRow | DraftAttachmentRow;

type MergeAcquisitionEditProps = {
    economicActivities: EconomicActivityOption[];
    mergeAcquisition: MergeAcquisitionFormData & {
        id: number;
    };
    attachments: AttachmentRecord[];
    financials: FinancialRecord[];
    pageUrl: string;
};

const emptyFinancialDraft = (): FinancialDraftForm => ({
    year: '',
    sales: '',
    income: '',
    pfn: '',
    ebitda: '',
    debt: '',
});

const formatFileSize = (file: File): string => `${(file.size / 1024).toFixed(1)} KB`;

const findFirstErrorByPrefix = (
    errors: Record<string, string | undefined>,
    prefix: string,
): string | null => {
    const entry = Object.entries(errors).find(([key, value]) => key.startsWith(prefix) && value);

    return entry?.[1] ?? null;
};

export default function MergeAcquisitionEdit({
    economicActivities,
    mergeAcquisition,
    attachments,
    financials,
    pageUrl,
}: MergeAcquisitionEditProps) {
    const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
    const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [draftAttachments, setDraftAttachments] = useState<DraftAttachmentRecord[]>([]);
    const [draftFinancials, setDraftFinancials] = useState<DraftFinancialRecord[]>([]);
    const [financialDraft, setFinancialDraft] = useState<FinancialDraftForm>(emptyFinancialDraft);
    const [financialDraftError, setFinancialDraftError] = useState<string | null>(null);
    const updateToast = useFormToast({
        successMessage: 'Opportunità aggiornata',
        successDescription: 'Le modifiche alla scheda M&A sono state salvate.',
        errorMessage: 'Aggiornamento non riuscito',
        errorDescription: 'Controlla i campi evidenziati e riprova.',
    });

    const form = useForm<MergeAcquisitionFormData>({
        merge_acquisition_economic_activity_id: mergeAcquisition.merge_acquisition_economic_activity_id,
        identification_code: mergeAcquisition.identification_code,
        intent_type: mergeAcquisition.intent_type,
        company_name: mergeAcquisition.company_name,
        company_description: mergeAcquisition.company_description,
        product: mergeAcquisition.product,
        legal_entity: mergeAcquisition.legal_entity,
        establishment_date: mergeAcquisition.establishment_date,
        ateco_code: mergeAcquisition.ateco_code,
        nominal_capital: mergeAcquisition.nominal_capital,
        headquarters_legal_province: mergeAcquisition.headquarters_legal_province,
        headquarters_legal_country: mergeAcquisition.headquarters_legal_country,
        headquarters_operative_province: mergeAcquisition.headquarters_operative_province,
        headquarters_operative_country: mergeAcquisition.headquarters_operative_country,
        total_employees: mergeAcquisition.total_employees,
        selling_type: mergeAcquisition.selling_type,
        selling_reason: mergeAcquisition.selling_reason,
        real_estate: mergeAcquisition.real_estate,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
        {
            title: `Modifica ${mergeAcquisition.identification_code}`,
            href: pageUrl,
        },
    ];

    const combinedFinancialRows = useMemo(() => {
        const persistedRows = financials.map((financial) => ({
            key: `persisted-${financial.id}`,
            year: financial.year,
            sales: financial.sales,
            income: financial.income,
            pfn: financial.pfn,
            ebitda: financial.ebitda,
            debt: financial.debt ?? '',
            status: 'Salvato',
        }));

        const draftRows = draftFinancials.map((financial) => ({
            key: `draft-${financial.id}`,
            year: financial.year,
            sales: financial.sales,
            income: financial.income,
            pfn: financial.pfn,
            ebitda: financial.ebitda,
            debt: financial.debt,
            status: 'Da salvare',
        }));

        return [...persistedRows, ...draftRows].sort((left, right) => right.year - left.year);
    }, [draftFinancials, financials]);

    const combinedAttachmentRows = useMemo<AttachmentRow[]>(() => {
        const persistedRows = attachments.map((attachment) => ({
            key: `persisted-${attachment.id}`,
            attachmentId: attachment.id,
            filename: attachment.filename,
            mimetype: attachment.mimetype,
            source: attachment.file_path,
            downloadUrl: attachment.download_url,
            status: 'Salvato' as const,
        }));

        const draftRows = draftAttachments.map((attachment) => ({
            key: `draft-${attachment.id}`,
            filename: attachment.filename,
            mimetype: attachment.mimetype,
            source: attachment.sizeLabel,
            status: 'Da salvare' as const,
        }));

        return [...persistedRows, ...draftRows];
    }, [attachments, draftAttachments]);

    const financialPayload = useMemo<FinancialPayload[]>(
        () => [
            ...financials.map((financial) => ({
                id: financial.id,
                year: financial.year,
                sales: financial.sales,
                income: financial.income,
                pfn: financial.pfn,
                ebitda: financial.ebitda,
                debt: financial.debt,
            })),
            ...draftFinancials.map((financial) => ({
                year: financial.year,
                sales: financial.sales,
                income: financial.income,
                pfn: financial.pfn,
                ebitda: financial.ebitda,
                debt: financial.debt || null,
            })),
        ],
        [draftFinancials, financials],
    );

    const attachmentFiles = useMemo(
        () => draftAttachments.map((attachment) => attachment.file),
        [draftAttachments],
    );

    const formErrors = form.errors as Record<string, string | undefined>;
    const attachmentError = formErrors.attachments ?? findFirstErrorByPrefix(formErrors, 'attachments.') ?? undefined;
    const financialError = formErrors.financials ?? findFirstErrorByPrefix(formErrors, 'financials.') ?? undefined;
    const triggerAttachmentDownload = (url: string): void => {
        window.location.assign(url);
    };

    const resetAttachmentDialog = () => {
        setPendingFiles([]);
        setIsAttachmentDialogOpen(false);
    };

    const handleAttachmentDraftAppend = () => {
        if (pendingFiles.length === 0) {
            return;
        }

        setDraftAttachments((currentDrafts) => [
            ...currentDrafts,
            ...pendingFiles.map((file) => ({
                id: `${file.name}-${file.lastModified}-${file.size}`,
                filename: file.name,
                mimetype: file.type || 'application/octet-stream',
                sizeLabel: formatFileSize(file),
                file,
            })),
        ]);

        resetAttachmentDialog();
    };

    const resetFinancialDialog = () => {
        setFinancialDraft(emptyFinancialDraft());
        setFinancialDraftError(null);
        setIsFinancialDialogOpen(false);
    };

    const handleFinancialDraftCreate = () => {
        const normalizedYear = financialDraft.year.trim();
        const normalizedSales = financialDraft.sales.trim();
        const normalizedIncome = financialDraft.income.trim();
        const normalizedPfn = financialDraft.pfn.trim();
        const normalizedEbitda = financialDraft.ebitda.trim();
        const normalizedDebt = financialDraft.debt.trim();

        if (
            normalizedYear === ''
            || normalizedSales === ''
            || normalizedIncome === ''
            || normalizedPfn === ''
            || normalizedEbitda === ''
        ) {
            setFinancialDraftError('Anno, sales, income, PFN ed EBITDA sono obbligatori.');
            return;
        }

        if (! /^\d{4}$/.test(normalizedYear)) {
            setFinancialDraftError('L’anno deve avere 4 cifre.');
            return;
        }

        const parsedYear = Number(normalizedYear);
        const yearAlreadyExists = financials.some((financial) => financial.year === parsedYear)
            || draftFinancials.some((financial) => financial.year === parsedYear);

        if (yearAlreadyExists) {
            setFinancialDraftError('Esiste già una riga finanziaria per questo anno.');
            return;
        }

        setDraftFinancials((currentDrafts) => [
            ...currentDrafts,
            {
                id: `${parsedYear}-${currentDrafts.length + 1}`,
                year: parsedYear,
                sales: normalizedSales,
                income: normalizedIncome,
                pfn: normalizedPfn,
                ebitda: normalizedEbitda,
                debt: normalizedDebt,
            },
        ]);

        resetFinancialDialog();
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            _method: 'put',
            attachments: attachmentFiles,
            financials: financialPayload,
        }));

        form.post(mergeAcquisitionUpdate(mergeAcquisition.id).url, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                updateToast.notifySuccess();
                setDraftAttachments([]);
                setDraftFinancials([]);
                setPendingFiles([]);
                setFinancialDraft(emptyFinancialDraft());
                setFinancialDraftError(null);
                setIsAttachmentDialogOpen(false);
                setIsFinancialDialogOpen(false);
            },
            onError: updateToast.notifyError,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifica ${mergeAcquisition.identification_code}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <PageHero tone="admin">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                >
                                    Origination Desk
                                </Badge>
                                <Badge className="rounded-full px-3 py-1">
                                    Modifica scheda
                                </Badge>
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Modifica opportunità M&amp;A</PageHeroTitle>
                                <PageHeroDescription>
                                    Aggiorna la scheda base, allega documenti riservati e completa la serie finanziaria annuale direttamente dalla pagina di edit.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroActions>
                                <Button asChild variant="outline" size="lg">
                                    <Link href={mergeAcquisitionIndex()}>
                                        Torna alla lista
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href={mergeAcquisitionDueDiligenceIndex(mergeAcquisition.id)}>
                                        Gestisci Due Diligence
                                    </Link>
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <form className="space-y-8" onSubmit={submit}>
                    <MergeAcquisitionFormFields
                        economicActivities={economicActivities}
                        form={form}
                        showSubmitButton={false}
                    />

                    <Separator />

                    <section className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <Heading
                                title="Allegati"
                                description="La tabella mostra gli allegati già presenti e quelli appena aggiunti, che verranno salvati insieme alla modifica della scheda."
                            />

                            <Dialog
                                open={isAttachmentDialogOpen}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        resetAttachmentDialog();
                                        return;
                                    }

                                    setIsAttachmentDialogOpen(true);
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button type="button">
                                        <CirclePlus className="size-4" />
                                        Aggiungi allegato
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Carica allegati</DialogTitle>
                                        <DialogDescription>
                                            Usa il componente di upload già condiviso nel progetto. I file aggiunti finiscono subito nella tabella e vengono caricati al submit.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <FileUpload
                                        name="attachments"
                                        files={pendingFiles}
                                        onFilesChange={setPendingFiles}
                                        helperText="Puoi selezionare uno o più file. I duplicati locali vengono ignorati automaticamente."
                                    />

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={resetAttachmentDialog}>
                                            Annulla
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleAttachmentDraftAppend}
                                            disabled={pendingFiles.length === 0}
                                        >
                                            Aggiungi alla tabella
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <InputError message={attachmentError} />

                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
                                        <Paperclip className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Documentazione allegata</CardTitle>
                                        <CardDescription>
                                            I documenti vengono salvati sullo storage privato dell&apos;applicazione e collegati a questa opportunità.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>File</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Origine</TableHead>
                                            <TableHead className="w-20">Download</TableHead>
                                            <TableHead className="w-32">Stato</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {combinedAttachmentRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                                    Nessun allegato disponibile.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            combinedAttachmentRows.map((attachment) => (
                                                <TableRow key={attachment.key}>
                                                    <TableCell className="font-medium">{attachment.filename}</TableCell>
                                                    <TableCell>{attachment.mimetype}</TableCell>
                                                    <TableCell className="max-w-[340px] truncate">{attachment.source}</TableCell>
                                                    <TableCell>
                                                        {'downloadUrl' in attachment ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                aria-label={`Scarica ${attachment.filename}`}
                                                                onClick={() => triggerAttachmentDownload(attachment.downloadUrl)}
                                                            >
                                                                <Download className="size-4" />
                                                                <span className="sr-only">Scarica</span>
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Bozza</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={attachment.status === 'Salvato' ? 'secondary' : 'outline'}>
                                                            {attachment.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator />

                    <section className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <Heading
                                title="Dati finanziari annuali"
                                description="Ogni riga rappresenta un anno. La UI previene duplicati per anno già presenti o aggiunti in bozza e il submit li persiste nel database."
                            />

                            <Dialog
                                open={isFinancialDialogOpen}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        resetFinancialDialog();
                                        return;
                                    }

                                    setIsFinancialDialogOpen(true);
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button type="button">
                                        <CirclePlus className="size-4" />
                                        Aggiungi financial
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Nuovo dato finanziario</DialogTitle>
                                        <DialogDescription>
                                            Crea una nuova riga annuale per la tabella `merge_acquisition_financial`.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="financial_year">Anno</Label>
                                            <Input
                                                id="financial_year"
                                                type="number"
                                                value={financialDraft.year}
                                                onChange={(event) => setFinancialDraft((current) => ({
                                                    ...current,
                                                    year: event.target.value,
                                                }))}
                                                placeholder="Es. 2025"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="financial_sales">Sales</Label>
                                            <Input
                                                id="financial_sales"
                                                value={financialDraft.sales}
                                                onChange={(event) => setFinancialDraft((current) => ({
                                                    ...current,
                                                    sales: event.target.value,
                                                }))}
                                                placeholder="Es. EUR 8.400.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="financial_income">Income</Label>
                                            <Input
                                                id="financial_income"
                                                value={financialDraft.income}
                                                onChange={(event) => setFinancialDraft((current) => ({
                                                    ...current,
                                                    income: event.target.value,
                                                }))}
                                                placeholder="Es. EUR 1.100.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="financial_pfn">PFN</Label>
                                            <Input
                                                id="financial_pfn"
                                                value={financialDraft.pfn}
                                                onChange={(event) => setFinancialDraft((current) => ({
                                                    ...current,
                                                    pfn: event.target.value,
                                                }))}
                                                placeholder="Es. EUR 350.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="financial_ebitda">EBITDA</Label>
                                            <Input
                                                id="financial_ebitda"
                                                value={financialDraft.ebitda}
                                                onChange={(event) => setFinancialDraft((current) => ({
                                                    ...current,
                                                    ebitda: event.target.value,
                                                }))}
                                                placeholder="Es. EUR 920.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="financial_debt">Debt</Label>
                                            <Input
                                                id="financial_debt"
                                                value={financialDraft.debt}
                                                onChange={(event) => setFinancialDraft((current) => ({
                                                    ...current,
                                                    debt: event.target.value,
                                                }))}
                                                placeholder="Opzionale"
                                            />
                                        </div>
                                    </div>

                                    {financialDraftError ? (
                                        <p className="text-sm text-destructive">{financialDraftError}</p>
                                    ) : null}

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={resetFinancialDialog}>
                                            Annulla
                                        </Button>
                                        <Button type="button" onClick={handleFinancialDraftCreate}>
                                            Aggiungi alla tabella
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <InputError message={financialError} />

                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
                                        <FileSpreadsheet className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Serie finanziaria</CardTitle>
                                        <CardDescription>
                                            Le righe già salvate convivono con quelle in bozza, che verranno create al prossimo submit.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Anno</TableHead>
                                            <TableHead>Sales</TableHead>
                                            <TableHead>Income</TableHead>
                                            <TableHead>PFN</TableHead>
                                            <TableHead>EBITDA</TableHead>
                                            <TableHead>Debt</TableHead>
                                            <TableHead className="w-32">Stato</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {combinedFinancialRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                                    Nessun dato finanziario disponibile.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            combinedFinancialRows.map((financial) => (
                                                <TableRow key={financial.key}>
                                                    <TableCell className="font-medium">{financial.year}</TableCell>
                                                    <TableCell>{financial.sales}</TableCell>
                                                    <TableCell>{financial.income}</TableCell>
                                                    <TableCell>{financial.pfn}</TableCell>
                                                    <TableCell>{financial.ebitda}</TableCell>
                                                    <TableCell>{financial.debt || 'N/D'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={financial.status === 'Salvato' ? 'secondary' : 'outline'}>
                                                            {financial.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator />

                <Card className="border-dashed shadow-none">
                        <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <PencilLine className="size-4" />
                                    Salvataggio modifica
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Il submit aggiorna i dati base, salva gli allegati nuovi e persiste le righe finanziarie presenti nella tabella.
                                </p>
                                {form.progress ? (
                                    <p className="text-sm text-muted-foreground">
                                        Upload in corso: {form.progress.percentage}%
                                    </p>
                                ) : null}
                            </div>

                            <Button type="submit" size="lg" disabled={form.processing}>
                                {form.processing ? 'Salvataggio...' : 'Salva modifiche'}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
