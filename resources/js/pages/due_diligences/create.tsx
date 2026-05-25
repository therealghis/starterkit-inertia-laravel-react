import { Head, Link, useForm } from '@inertiajs/react';
import { CirclePlus, FileCheck2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    create as dueDiligenceCreate,
    index as dueDiligenceIndex,
    store as dueDiligenceStore,
} from '@/routes/merge_acquisition/due_diligences';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import type { BreadcrumbItem } from '@/types';

type DueDiligencesCreateProps = {
    mergeAcquisition: {
        id: number;
        identification_code: string;
        company_name: string | null;
    };
    templates: Array<{
        label: string;
        value: number;
        items_count: number;
    }>;
};

type DueDiligenceCreateFormData = {
    title: string;
    year: string;
    due_diligence_template_id: string;
    company_notes: string;
    admin_notes: string;
};

type ClientErrors = Partial<Record<keyof DueDiligenceCreateFormData, string>>;

export default function DueDiligencesCreate({
    mergeAcquisition,
    templates,
}: DueDiligencesCreateProps) {
    const [clientErrors, setClientErrors] = useState<ClientErrors>({});
    const form = useForm<DueDiligenceCreateFormData>({
        title: '',
        year: '',
        due_diligence_template_id: '',
        company_notes: '',
        admin_notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'M&A',
            href: mergeAcquisitionIndex(),
        },
        {
            title: 'Due Diligence della M&A',
            href: dueDiligenceIndex(mergeAcquisition.id),
        },
        {
            title: 'Nuova due diligence',
            href: dueDiligenceCreate(mergeAcquisition.id),
        },
    ];

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextClientErrors: ClientErrors = {};

        if (form.data.title.trim() === '') {
            nextClientErrors.title = 'Il titolo è obbligatorio.';
        }

        if (form.data.due_diligence_template_id.trim() === '') {
            nextClientErrors.due_diligence_template_id = 'Seleziona un template checklist.';
        }

        setClientErrors(nextClientErrors);

        if (Object.keys(nextClientErrors).length > 0) {
            return;
        }

        form.post(dueDiligenceStore(mergeAcquisition.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuova due diligence" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <PageHero tone="support">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <FileCheck2 className="size-4" />
                                {mergeAcquisition.identification_code}
                                {mergeAcquisition.company_name ? ` · ${mergeAcquisition.company_name}` : ''}
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Nuova due diligence</PageHeroTitle>
                                <PageHeroDescription>
                                    Crea una checklist documentale collegata alla M&A selezionata
                                    scegliendo un template esistente.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroActions>
                                <Button asChild variant="outline" size="lg">
                                    <Link href={dueDiligenceIndex(mergeAcquisition.id)}>
                                        Torna alla lista
                                    </Link>
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <form
                    className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm"
                    onSubmit={submit}
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="title">Titolo</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) => {
                                    setClientErrors((current) => ({ ...current, title: undefined }));
                                    form.setData('title', event.target.value);
                                }}
                                placeholder="Es. Due diligence 2025"
                            />
                            <InputError message={clientErrors.title ?? form.errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Anno</Label>
                            <Input
                                id="year"
                                value={form.data.year}
                                onChange={(event) => form.setData('year', event.target.value)}
                                placeholder="Es. 2025"
                            />
                            <InputError message={form.errors.year} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_diligence_template_id">Template checklist</Label>
                            <Select
                                value={form.data.due_diligence_template_id}
                                onValueChange={(value) => {
                                    setClientErrors((current) => ({
                                        ...current,
                                        due_diligence_template_id: undefined,
                                    }));
                                    form.setData('due_diligence_template_id', value);
                                }}
                            >
                                <SelectTrigger id="due_diligence_template_id" className="w-full">
                                    <SelectValue placeholder="Seleziona un template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((template) => (
                                        <SelectItem key={template.value} value={String(template.value)}>
                                            {template.label} ({template.items_count} item)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={
                                    clientErrors.due_diligence_template_id
                                    ?? form.errors.due_diligence_template_id
                                }
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="company_notes">Note società</Label>
                            <Textarea
                                id="company_notes"
                                value={form.data.company_notes}
                                onChange={(event) => form.setData('company_notes', event.target.value)}
                                placeholder="Note condivise con la società"
                                rows={5}
                            />
                            <InputError message={form.errors.company_notes} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="admin_notes">Note admin</Label>
                            <Textarea
                                id="admin_notes"
                                value={form.data.admin_notes}
                                onChange={(event) => form.setData('admin_notes', event.target.value)}
                                placeholder="Note interne amministrative"
                                rows={5}
                            />
                            <InputError message={form.errors.admin_notes} />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button asChild variant="outline">
                            <Link href={dueDiligenceIndex(mergeAcquisition.id)}>
                                Torna alla lista
                            </Link>
                        </Button>

                        <Button type="submit" disabled={form.processing}>
                            <CirclePlus className="size-4" />
                            Salva
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
