import { Head, Link, useForm } from '@inertiajs/react';
import { store as mergeAcquisitionStore } from '@/actions/App/Http/Controllers/MergeAcquisitionController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useFormToast } from '@/hooks/use-form-toast';
import AppLayout from '@/layouts/app-layout';
import MergeAcquisitionFormFields from '@/pages/merge_acquisition/merge-acquisition-form-fields';
import type { EconomicActivityOption, MergeAcquisitionFormData } from '@/pages/merge_acquisition/merge-acquisition-form-fields';
import { create as mergeAcquisitionCreate, index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';
import type { BreadcrumbItem } from '@/types';

type MergeAcquisitionCreateProps = {
    economicActivities: EconomicActivityOption[];
};

export default function MergeAcquisitionCreate({
    economicActivities,
}: MergeAcquisitionCreateProps) {
    const createToast = useFormToast({
        successMessage: 'Opportunità salvata',
        successDescription: 'La nuova scheda M&A è stata registrata correttamente.',
        errorMessage: 'Salvataggio non riuscito',
        errorDescription: 'Controlla i campi evidenziati e riprova.',
    });
    const form = useForm<MergeAcquisitionFormData>({
        merge_acquisition_economic_activity_id: '',
        identification_code: '',
        intent_type: 'BUY_SIDE',
        company_name: '',
        company_description: '',
        product: '',
        legal_entity: '',
        establishment_date: '',
        ateco_code: '',
        nominal_capital: '',
        headquarters_legal_province: '',
        headquarters_legal_country: '',
        headquarters_operative_province: '',
        headquarters_operative_country: '',
        total_employees: '',
        selling_type: '',
        selling_reason: '',
        real_estate: false,
    });

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

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.submit(mergeAcquisitionStore(), {
            onSuccess: createToast.notifySuccess,
            onError: createToast.notifyError,
        });
    };

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
                                    Imposta i dati sensibili aziendali e la scheda principale della merge acquisition.
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
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <form
                    id="merge-acquisition-create-form"
                    className="space-y-8"
                    onSubmit={submit}
                >
                    <MergeAcquisitionFormFields
                        economicActivities={economicActivities}
                        form={form}
                        submitLabel="Salva opportunità"
                    />
                </form>
            </div>
        </AppLayout>
    );
}
