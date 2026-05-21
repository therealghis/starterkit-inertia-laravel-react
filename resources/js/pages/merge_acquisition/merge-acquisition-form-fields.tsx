import type { InertiaFormProps } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export type EconomicActivityOption = {
    label: string;
    value: string;
};

export type MergeAcquisitionFormData = {
    merge_acquisition_economic_activity_id: string;
    identification_code: string;
    intent_type: string;
    company_name: string;
    company_description: string;
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

type MergeAcquisitionFormFieldsProps = {
    economicActivities: EconomicActivityOption[];
    form: InertiaFormProps<MergeAcquisitionFormData>;
    showSubmitButton?: boolean;
    submitLabel?: string;
};

export default function MergeAcquisitionFormFields({
    economicActivities,
    form,
    showSubmitButton = true,
    submitLabel = 'Salva opportunità',
}: MergeAcquisitionFormFieldsProps) {
    return (
        <>
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
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="sensitive-details" className="border-b-0">
                                <AccordionTrigger className="py-0 hover:no-underline">
                                    Mostra dati sensibili
                                </AccordionTrigger>
                                <AccordionContent className="pt-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">Nome azienda</Label>
                                            <Input
                                                id="company_name"
                                                name="company_name"
                                                value={form.data.company_name}
                                                onChange={(event) => form.setData('company_name', event.target.value)}
                                                placeholder="Es. NorthGrid Analytics"
                                            />
                                            <InputError message={form.errors.company_name} />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="company_description">Descrizione azienda</Label>
                                            <Textarea
                                                id="company_description"
                                                name="company_description"
                                                value={form.data.company_description}
                                                onChange={(event) => form.setData('company_description', event.target.value)}
                                                placeholder="Descrizione riservata del profilo aziendale."
                                                className="min-h-32"
                                            />
                                            <InputError message={form.errors.company_description} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </section>

            <Separator />

            <section className="space-y-6">
                <Heading
                    title="Scheda opportunità"
                    description="Campi principali della tabella merge_acquisition da valorizzare nella scheda base."
                />

                <Card className="shadow-sm">
                    <CardContent className="space-y-8 pt-6">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="identification_code">Codice opportunità</Label>
                                <Input
                                    id="identification_code"
                                    name="identification_code"
                                    value={form.data.identification_code}
                                    onChange={(event) => form.setData('identification_code', event.target.value)}
                                    placeholder="Es. MA-2026-010"
                                />
                                <InputError message={form.errors.identification_code} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="intent_type">Tipo operazione</Label>
                                <Select
                                    value={form.data.intent_type}
                                    onValueChange={(value) => form.setData('intent_type', value)}
                                >
                                    <SelectTrigger id="intent_type" className="w-full">
                                        <SelectValue placeholder="Seleziona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BUY_SIDE">Buy-side</SelectItem>
                                        <SelectItem value="SELL_SIDE">Sell-side</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.intent_type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="merge_acquisition_economic_activity_id">Settore attività</Label>
                                <Select
                                    value={form.data.merge_acquisition_economic_activity_id}
                                    onValueChange={(value) => form.setData('merge_acquisition_economic_activity_id', value)}
                                >
                                    <SelectTrigger id="merge_acquisition_economic_activity_id" className="w-full">
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
                                <InputError message={form.errors.merge_acquisition_economic_activity_id} />
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
                            <div className="space-y-2">
                                <Label htmlFor="product">Prodotto</Label>
                                <Textarea
                                    id="product"
                                    name="product"
                                    value={form.data.product}
                                    onChange={(event) => form.setData('product', event.target.value)}
                                    placeholder="Descrivi il prodotto o l'oggetto del mandato."
                                    className="min-h-32"
                                />
                                <InputError message={form.errors.product} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="legal_entity">Forma giuridica</Label>
                                <Input
                                    id="legal_entity"
                                    name="legal_entity"
                                    value={form.data.legal_entity}
                                    onChange={(event) => form.setData('legal_entity', event.target.value)}
                                    placeholder="Es. Srl"
                                />
                                <InputError message={form.errors.legal_entity} />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="establishment_date">Anno costituzione</Label>
                                <Input
                                    id="establishment_date"
                                    name="establishment_date"
                                    value={form.data.establishment_date}
                                    onChange={(event) => form.setData('establishment_date', event.target.value)}
                                    placeholder="Es. 2018"
                                />
                                <InputError message={form.errors.establishment_date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ateco_code">Codice Ateco</Label>
                                <Input
                                    id="ateco_code"
                                    name="ateco_code"
                                    value={form.data.ateco_code}
                                    onChange={(event) => form.setData('ateco_code', event.target.value)}
                                    placeholder="Es. 62.01"
                                />
                                <InputError message={form.errors.ateco_code} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nominal_capital">Capitale nominale</Label>
                                <Input
                                    id="nominal_capital"
                                    name="nominal_capital"
                                    value={form.data.nominal_capital}
                                    onChange={(event) => form.setData('nominal_capital', event.target.value)}
                                    placeholder="Es. EUR 250.000"
                                />
                                <InputError message={form.errors.nominal_capital} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_employees">Numero dipendenti</Label>
                                <Input
                                    id="total_employees"
                                    name="total_employees"
                                    type="number"
                                    value={form.data.total_employees}
                                    onChange={(event) => form.setData('total_employees', event.target.value)}
                                    placeholder="Es. 34"
                                />
                                <InputError message={form.errors.total_employees} />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="headquarters_legal_province">Sede legale provincia</Label>
                                <Input
                                    id="headquarters_legal_province"
                                    name="headquarters_legal_province"
                                    value={form.data.headquarters_legal_province}
                                    onChange={(event) => form.setData('headquarters_legal_province', event.target.value)}
                                    placeholder="Es. Milano"
                                />
                                <InputError message={form.errors.headquarters_legal_province} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="headquarters_legal_country">Sede legale paese</Label>
                                <Input
                                    id="headquarters_legal_country"
                                    name="headquarters_legal_country"
                                    value={form.data.headquarters_legal_country}
                                    onChange={(event) => form.setData('headquarters_legal_country', event.target.value)}
                                    placeholder="Es. Italia"
                                />
                                <InputError message={form.errors.headquarters_legal_country} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="headquarters_operative_province">Sede operativa provincia</Label>
                                <Input
                                    id="headquarters_operative_province"
                                    name="headquarters_operative_province"
                                    value={form.data.headquarters_operative_province}
                                    onChange={(event) => form.setData('headquarters_operative_province', event.target.value)}
                                    placeholder="Es. Bergamo"
                                />
                                <InputError message={form.errors.headquarters_operative_province} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="headquarters_operative_country">Sede operativa paese</Label>
                                <Input
                                    id="headquarters_operative_country"
                                    name="headquarters_operative_country"
                                    value={form.data.headquarters_operative_country}
                                    onChange={(event) => form.setData('headquarters_operative_country', event.target.value)}
                                    placeholder="Es. Italia"
                                />
                                <InputError message={form.errors.headquarters_operative_country} />
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.4fr)]">
                            <div className="space-y-2">
                                <Label htmlFor="selling_type">Tipologia cessione</Label>
                                <Input
                                    id="selling_type"
                                    name="selling_type"
                                    value={form.data.selling_type}
                                    onChange={(event) => form.setData('selling_type', event.target.value)}
                                    placeholder="Es. Quota di maggioranza"
                                />
                                <InputError message={form.errors.selling_type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="selling_reason">Motivo cessione</Label>
                                <Textarea
                                    id="selling_reason"
                                    name="selling_reason"
                                    value={form.data.selling_reason}
                                    onChange={(event) => form.setData('selling_reason', event.target.value)}
                                    placeholder="Motivazione operativa o strategica della cessione."
                                    className="min-h-32"
                                />
                                <InputError message={form.errors.selling_reason} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 px-5 py-4">
                            <Checkbox
                                id="real_estate"
                                checked={form.data.real_estate}
                                onCheckedChange={(checked) => form.setData('real_estate', checked === true)}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="real_estate">Include componente immobiliare</Label>
                                <p className="text-sm text-muted-foreground">
                                    Flag iniziale per segnalare presenza di asset real estate nell&apos;operazione.
                                </p>
                                <InputError message={form.errors.real_estate} className="pt-1" />
                            </div>
                        </div>

                        {showSubmitButton ? (
                            <div className="flex justify-end border-t border-border/70 pt-6">
                                <Button size="lg" type="submit" disabled={form.processing}>
                                    {submitLabel}
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </section>
        </>
    );
}
