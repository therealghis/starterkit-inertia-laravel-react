import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { create as dueDiligenceTemplateCreate, index as dueDiligenceTemplateIndex, store as storeDueDiligenceTemplate } from '@/routes/due_diligence_templates';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type DueDiligenceTemplateCreateFormData = {
    name: string;
    description: string;
    is_active: boolean;
};

export default function DueDiligenceTemplatesCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Checklist template',
            href: dueDiligenceTemplateIndex(),
        },
        {
            title: 'Nuova checklist',
            href: dueDiligenceTemplateCreate(),
        },
    ];

    const form = useForm<DueDiligenceTemplateCreateFormData>({
        name: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(storeDueDiligenceTemplate(), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuova checklist" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Nuova checklist
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configura il template base da usare per generare nuove due diligence.
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link href={dueDiligenceTemplateIndex()}>
                            Torna alla lista
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-3xl border-border/70 bg-card/90">
                    <CardHeader>
                        <CardTitle>Dati checklist</CardTitle>
                        <CardDescription>
                            In questa pagina definisci solo le informazioni generali del template.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    disabled={form.processing}
                                    placeholder="Inserisci il nome della checklist"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrizione</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData('description', event.target.value)
                                    }
                                    rows={5}
                                    disabled={form.processing}
                                    placeholder="Descrivi lo scopo della checklist"
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/60 px-4 py-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) =>
                                            form.setData('is_active', checked === true)
                                        }
                                        disabled={form.processing}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">Attiva</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Rendi subito disponibile questo template per la creazione
                                            di nuove due diligence.
                                        </p>
                                    </div>
                                </div>
                                <InputError message={form.errors.is_active} />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button type="submit" disabled={form.processing}>
                                    Crea checklist
                                </Button>
                                <Button asChild type="button" variant="outline">
                                    <Link href={dueDiligenceTemplateIndex()}>
                                        Torna alla lista
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
