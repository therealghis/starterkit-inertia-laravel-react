import { Head, Link } from '@inertiajs/react';
import { Download, FileSpreadsheet, Paperclip, PencilLine, ShieldAlert } from 'lucide-react';
import Heading from '@/components/heading';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import { index as mergeAcquisitionDueDiligenceIndex } from '@/routes/merge_acquisition/due_diligences';
import type { BreadcrumbItem } from '@/types';

type MergeAcquisitionDetail = {
    id: number;
    identification_code: string;
    intent_type: string;
    economic_activity: string;
    product: string;
    legal_entity: string;
    establishment_date: string;
    ateco_code: string;
    nominal_capital: string;
    headquarters_legal_province: string;
    headquarters_legal_country: string;
    headquarters_operative_province: string;
    headquarters_operative_country: string;
    total_employees: string;
    selling_type: string;
    selling_reason: string;
    real_estate: boolean;
};

type SensitiveDetails = {
    company_name: string;
    company_description: string;
} | null;

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

type MergeAcquisitionShowProps = {
    mergeAcquisition: MergeAcquisitionDetail;
    sensitiveDetails: SensitiveDetails;
    attachments: AttachmentRecord[];
    financials: FinancialRecord[];
    canViewSensitiveDetails: boolean;
    pageUrl: string;
    editUrl: string | null;
};

type DetailItemProps = {
    label: string;
    value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
    return (
        <div className="space-y-1 rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
            <p className="text-sm leading-6 text-foreground">{value}</p>
        </div>
    );
}

export default function MergeAcquisitionShow({
    mergeAcquisition,
    sensitiveDetails,
    attachments,
    financials,
    canViewSensitiveDetails,
    pageUrl,
    editUrl,
}: MergeAcquisitionShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
        {
            title: mergeAcquisition.identification_code,
            href: pageUrl,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mergeAcquisition.identification_code} />

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
                                <Badge className="rounded-full px-3 py-1">
                                    {mergeAcquisition.intent_type === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                                </Badge>
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>{mergeAcquisition.identification_code}</PageHeroTitle>
                                <PageHeroDescription>
                                    Scheda di dettaglio M&amp;A con informazioni generali, allegati e serie finanziaria.
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
                                        Due Diligence
                                    </Link>
                                </Button>
                                {editUrl ? (
                                    <Button asChild size="lg">
                                        <Link href={editUrl}>
                                            <PencilLine className="size-4" />
                                            Modifica
                                        </Link>
                                    </Button>
                                ) : null}
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                {canViewSensitiveDetails && sensitiveDetails ? (
                    <section className="space-y-6">
                        <Heading
                            title="Dati sensibili"
                            description="Questa sezione è visibile solo al proprietario dell'opportunità."
                        />

                        <Card className="border-amber-200/70 bg-linear-to-br from-amber-50/70 via-background to-background shadow-sm dark:border-amber-500/30 dark:from-amber-500/8">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-100/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                        <ShieldAlert className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Dati riservati</CardTitle>
                                        <CardDescription>
                                            Nome azienda e descrizione completa del profilo.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="sensitive-details" className="border-b-0">
                                        <AccordionTrigger className="py-0 hover:no-underline">
                                            Mostra dati sensibili
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-5">
                                            <div className="grid gap-4">
                                                <DetailItem label="Nome azienda" value={sensitiveDetails.company_name} />
                                                <DetailItem label="Descrizione azienda" value={sensitiveDetails.company_description} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </section>
                ) : null}

                <Separator />

                <section className="space-y-6">
                    <Heading
                        title="Scheda opportunità"
                        description="Informazioni principali sempre visibili agli utenti autenticati."
                    />

                    <Card className="shadow-sm">
                        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-3">
                            <DetailItem label="Codice opportunità" value={mergeAcquisition.identification_code} />
                            <DetailItem
                                label="Tipo operazione"
                                value={mergeAcquisition.intent_type === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'}
                            />
                            <DetailItem label="Settore attività" value={mergeAcquisition.economic_activity} />
                            <DetailItem label="Forma giuridica" value={mergeAcquisition.legal_entity} />
                            <DetailItem label="Anno costituzione" value={mergeAcquisition.establishment_date} />
                            <DetailItem label="Codice Ateco" value={mergeAcquisition.ateco_code} />
                            <DetailItem label="Capitale nominale" value={mergeAcquisition.nominal_capital} />
                            <DetailItem label="Numero dipendenti" value={mergeAcquisition.total_employees} />
                            <DetailItem label="Immobili inclusi" value={mergeAcquisition.real_estate ? 'Sì' : 'No'} />
                            <DetailItem label="Sede legale provincia" value={mergeAcquisition.headquarters_legal_province} />
                            <DetailItem label="Sede legale paese" value={mergeAcquisition.headquarters_legal_country} />
                            <DetailItem label="Sede operativa provincia" value={mergeAcquisition.headquarters_operative_province} />
                            <DetailItem label="Sede operativa paese" value={mergeAcquisition.headquarters_operative_country} />
                            <DetailItem label="Tipologia cessione" value={mergeAcquisition.selling_type} />
                            <DetailItem label="Motivazione cessione" value={mergeAcquisition.selling_reason} />
                            <div className="md:col-span-2 xl:col-span-3">
                                <DetailItem label="Prodotto" value={mergeAcquisition.product} />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Separator />

                <section className="space-y-6">
                    <Heading
                        title="Allegati"
                        description="Documenti collegati all'opportunità e disponibili al download."
                    />

                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
                                    <Paperclip className="size-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle>Documentazione allegata</CardTitle>
                                    <CardDescription>
                                        Gli allegati vengono mostrati a tutti gli utenti autenticati.
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
                                        <TableHead>Caricato il</TableHead>
                                        <TableHead className="w-20">Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                                Nessun allegato disponibile.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attachments.map((attachment) => (
                                            <TableRow key={attachment.id}>
                                                <TableCell className="font-medium">{attachment.filename}</TableCell>
                                                <TableCell>{attachment.mimetype}</TableCell>
                                                <TableCell className="max-w-[340px] truncate">{attachment.file_path}</TableCell>
                                                <TableCell>{attachment.created_at ?? 'N/D'}</TableCell>
                                                <TableCell>
                                                    <Button asChild type="button" variant="outline" size="icon">
                                                        <a href={attachment.download_url} aria-label={`Scarica ${attachment.filename}`}>
                                                            <Download className="size-4" />
                                                            <span className="sr-only">Scarica</span>
                                                        </a>
                                                    </Button>
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
                    <Heading
                        title="Dati finanziari annuali"
                        description="Serie storica disponibile per l'opportunità."
                    />

                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
                                    <FileSpreadsheet className="size-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle>Serie finanziaria</CardTitle>
                                    <CardDescription>
                                        Tutte le righe finanziarie salvate per questa opportunità.
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {financials.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                                Nessun dato finanziario disponibile.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        financials.map((financial) => (
                                            <TableRow key={financial.id}>
                                                <TableCell className="font-medium">{financial.year}</TableCell>
                                                <TableCell>{financial.sales}</TableCell>
                                                <TableCell>{financial.income}</TableCell>
                                                <TableCell>{financial.pfn}</TableCell>
                                                <TableCell>{financial.ebitda}</TableCell>
                                                <TableCell>{financial.debt ?? 'N/D'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
