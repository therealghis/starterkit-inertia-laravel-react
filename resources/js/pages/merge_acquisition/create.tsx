import { Head, Link } from '@inertiajs/react';
import { Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { create as mergeAcquisitionCreate, index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

type EconomicActivityOption = {
    label: string;
    value: string;
};

type MergeAcquisitionCreateProps = {
    economicActivities: EconomicActivityOption[];
};

type FinancialRow = {
    id: number;
};

export default function MergeAcquisitionCreate({
    economicActivities,
}: MergeAcquisitionCreateProps) {
    const [financialRows, setFinancialRows] = useState<FinancialRow[]>([{ id: 1 }]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
        {
            title: 'Nuova opportunità',
            href: mergeAcquisitionCreate(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuova opportunità M&A" />

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
                                    Creazione guidata
                                </Badge>
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Nuova opportunità M&amp;A</PageHeroTitle>
                                <PageHeroDescription>
                                    Imposta i dati sensibili aziendali, la scheda principale della merge acquisition e la prima base finanziaria.
                                    Salvataggio e backend li colleghiamo nello step successivo.
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
                                <Button
                                    size="lg"
                                    disabled
                                    aria-label="Salvataggio disponibile nel prossimo step"
                                >
                                    Salva opportunità
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <form
                    className="space-y-8"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <section className="space-y-6">
                        <Heading
                            title="Dati sensibili"
                            description="Nome e descrizione azienda vengono raccolti subito ma non saranno mostrati in chiaro nella tabella opportunità."
                        />

                        <Card className="border-amber-200/70 bg-linear-to-br from-amber-50/70 via-background to-background shadow-sm dark:border-amber-500/30 dark:from-amber-500/8">
                            <CardHeader className="gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-100/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                        <ShieldAlert className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Dati riservati</CardTitle>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Questi campi servono all&apos;operatività interna e restano schermati nella vista tabellare pubblica del modulo M&amp;A.
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Nome azienda</Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        placeholder="Es. NorthGrid Analytics"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="company_description">Descrizione azienda</Label>
                                    <Textarea
                                        id="company_description"
                                        name="company_description"
                                        placeholder="Descrizione riservata del profilo aziendale."
                                        className="min-h-32"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator />

                    <section className="space-y-6">
                        <Heading
                            title="Scheda opportunità"
                            description="Campi principali della tabella merge_acquisition da valorizzare in fase di creazione."
                        />

                        <Card className="shadow-sm">
                            <CardContent className="grid gap-5 pt-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="identification_code">Codice opportunità</Label>
                                    <Input
                                        id="identification_code"
                                        name="identification_code"
                                        placeholder="Es. MA-2026-010"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="intent_type">Tipo operazione</Label>
                                    <Select defaultValue="BUY_SIDE">
                                        <SelectTrigger id="intent_type" className="w-full">
                                            <SelectValue placeholder="Seleziona tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUY_SIDE">Buy-side</SelectItem>
                                            <SelectItem value="SELL_SIDE">Sell-side</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="economic_activity">Settore attività</Label>
                                    <Select>
                                        <SelectTrigger id="economic_activity" className="w-full">
                                            <SelectValue placeholder="Seleziona settore" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {economicActivities.map((activity) => (
                                                <SelectItem key={activity.value} value={activity.value}>
                                                    {activity.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 xl:col-span-2">
                                    <Label htmlFor="product">Prodotto</Label>
                                    <Textarea
                                        id="product"
                                        name="product"
                                        placeholder="Descrivi il prodotto o l'oggetto del mandato."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="legal_entity">Forma giuridica</Label>
                                    <Input
                                        id="legal_entity"
                                        name="legal_entity"
                                        placeholder="Es. Srl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="establishment_date">Anno costituzione</Label>
                                    <Input
                                        id="establishment_date"
                                        name="establishment_date"
                                        placeholder="Es. 2018"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ateco_code">Codice Ateco</Label>
                                    <Input
                                        id="ateco_code"
                                        name="ateco_code"
                                        placeholder="Es. 62.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nominal_capital">Capitale nominale</Label>
                                    <Input
                                        id="nominal_capital"
                                        name="nominal_capital"
                                        placeholder="Es. EUR 250.000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="headquarters_legal_province">Sede legale provincia</Label>
                                    <Input
                                        id="headquarters_legal_province"
                                        name="headquarters_legal_province"
                                        placeholder="Es. Milano"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="headquarters_legal_country">Sede legale paese</Label>
                                    <Input
                                        id="headquarters_legal_country"
                                        name="headquarters_legal_country"
                                        placeholder="Es. Italia"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="headquarters_operative_province">Sede operativa provincia</Label>
                                    <Input
                                        id="headquarters_operative_province"
                                        name="headquarters_operative_province"
                                        placeholder="Es. Bergamo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="headquarters_operative_country">Sede operativa paese</Label>
                                    <Input
                                        id="headquarters_operative_country"
                                        name="headquarters_operative_country"
                                        placeholder="Es. Italia"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_employees">Numero dipendenti</Label>
                                    <Input
                                        id="total_employees"
                                        name="total_employees"
                                        type="number"
                                        placeholder="Es. 34"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="selling_type">Tipologia cessione</Label>
                                    <Input
                                        id="selling_type"
                                        name="selling_type"
                                        placeholder="Es. Quota di maggioranza"
                                    />
                                </div>

                                <div className="space-y-2 xl:col-span-2">
                                    <Label htmlFor="selling_reason">Motivo cessione</Label>
                                    <Textarea
                                        id="selling_reason"
                                        name="selling_reason"
                                        placeholder="Motivazione operativa o strategica della cessione."
                                    />
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                                    <Checkbox id="real_estate" />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="real_estate">Include componente immobiliare</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Flag iniziale per segnalare presenza di asset real estate nell&apos;operazione.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator />

                    <section className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <Heading
                                title="Storico finanziario"
                                description="Prima raccolta dei dati per merge_acquisition_financial. Puoi predisporre più annualità fin da subito."
                            />

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFinancialRows((rows) => [...rows, { id: rows.length + 1 }])}
                            >
                                <Plus className="size-4" />
                                Aggiungi annualità
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {financialRows.map((row, index) => (
                                <Card key={row.id} className="shadow-sm">
                                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <HeadingSmall
                                                title={`Annualità ${index + 1}`}
                                                description="Dati finanziari da associare all'opportunità in fase di creazione."
                                            />
                                        </div>

                                        {financialRows.length > 1 ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFinancialRows((rows) => rows.filter((item) => item.id !== row.id))}
                                            >
                                                <Trash2 className="size-4" />
                                                Rimuovi
                                            </Button>
                                        ) : null}
                                    </CardHeader>

                                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor={`financials.${row.id}.year`}>Anno</Label>
                                            <Input
                                                id={`financials.${row.id}.year`}
                                                name={`financials[${index}][year]`}
                                                type="number"
                                                placeholder="Es. 2024"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`financials.${row.id}.sales`}>Sales</Label>
                                            <Input
                                                id={`financials.${row.id}.sales`}
                                                name={`financials[${index}][sales]`}
                                                placeholder="Es. 2.430.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`financials.${row.id}.income`}>Income</Label>
                                            <Input
                                                id={`financials.${row.id}.income`}
                                                name={`financials[${index}][income]`}
                                                placeholder="Es. 355.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`financials.${row.id}.pfn`}>PFN</Label>
                                            <Input
                                                id={`financials.${row.id}.pfn`}
                                                name={`financials[${index}][pfn]`}
                                                placeholder="Es. 180.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`financials.${row.id}.ebitda`}>EBITDA</Label>
                                            <Input
                                                id={`financials.${row.id}.ebitda`}
                                                name={`financials[${index}][ebitda]`}
                                                placeholder="Es. 470.000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`financials.${row.id}.debt`}>Debt</Label>
                                            <Input
                                                id={`financials.${row.id}.debt`}
                                                name={`financials[${index}][debt]`}
                                                placeholder="Es. 60.000"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 md:col-span-2 xl:col-span-3">
                                            <Checkbox id={`financials.${row.id}.active`} defaultChecked />
                                            <div className="space-y-0.5">
                                                <Label htmlFor={`financials.${row.id}.active`}>Riga finanziaria attiva</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Mantieni attiva l&apos;annualità da salvare quando collegheremo il backend.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </form>
            </div>
        </AppLayout>
    );
}
