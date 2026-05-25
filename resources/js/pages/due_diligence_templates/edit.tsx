import { Head, Link, router, useForm } from '@inertiajs/react';
import { Info, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { store as storeDueDiligenceTemplateItem } from '@/routes/due_diligence_templates/items';
import {
    edit as dueDiligenceTemplateEdit,
    index as dueDiligenceTemplateIndex,
    update as updateDueDiligenceTemplate,
} from '@/routes/due_diligence_templates';
import type { BreadcrumbItem } from '@/types';

type TemplateRecord = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
};

type TemplateItemRecord = {
    id: number;
    entity: string;
    topic: string;
    request_text: string;
    sort_order: number;
    is_active: boolean;
    update_url: string;
    delete_url: string;
};

type DueDiligenceTemplateEditProps = {
    template: TemplateRecord;
    items: TemplateItemRecord[];
};

type TemplateFormData = {
    name: string;
    description: string;
    is_active: boolean;
};

type TemplateItemFormData = {
    entity: string;
    topic: string;
    request_text: string;
    sort_order: string;
    is_active: boolean;
};

type TemplateItemDialogProps = {
    title: string;
    description: string;
    submitLabel: string;
    trigger: React.ReactNode;
    initialData: TemplateItemFormData;
    submit: (form: ReturnType<typeof useForm<TemplateItemFormData>>, onSuccess: () => void) => void;
};

const buildItemFormData = (
    item?: Pick<
        TemplateItemRecord,
        'entity' | 'topic' | 'request_text' | 'sort_order' | 'is_active'
    >,
): TemplateItemFormData => ({
    entity: item?.entity ?? '',
    topic: item?.topic ?? '',
    request_text: item?.request_text ?? '',
    sort_order: item ? String(item.sort_order) : '',
    is_active: item?.is_active ?? true,
});

function TemplateItemDialog({
    title,
    description,
    submitLabel,
    trigger,
    initialData,
    submit,
}: TemplateItemDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<TemplateItemFormData>(initialData);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            form.setData(initialData);
            form.clearErrors();

            return;
        }

        if (!form.processing) {
            form.setData(initialData);
            form.clearErrors();
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        submit(form, () => {
            setIsOpen(false);
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <TemplateItemFields form={form} />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={form.processing}
                        >
                            Annulla
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function TemplateItemFields({
    form,
}: {
    form: ReturnType<typeof useForm<TemplateItemFormData>>;
}) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="entity">Entità</Label>
                    <Input
                        id="entity"
                        value={form.data.entity}
                        onChange={(event) => form.setData('entity', event.target.value)}
                        disabled={form.processing}
                        placeholder="Inserisci l'entità"
                    />
                    <InputError message={form.errors.entity} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="topic">Argomento</Label>
                    <Input
                        id="topic"
                        value={form.data.topic}
                        onChange={(event) => form.setData('topic', event.target.value)}
                        disabled={form.processing}
                        placeholder="Inserisci l'argomento"
                    />
                    <InputError message={form.errors.topic} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="request_text">Richiesta</Label>
                <Textarea
                    id="request_text"
                    value={form.data.request_text}
                    onChange={(event) => form.setData('request_text', event.target.value)}
                    rows={5}
                    disabled={form.processing}
                    placeholder="Descrivi la richiesta documentale o informativa"
                />
                <InputError message={form.errors.request_text} />
            </div>

            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="space-y-2">
                    <Label htmlFor="sort_order">Ordine</Label>
                    <Input
                        id="sort_order"
                        type="number"
                        min={0}
                        value={form.data.sort_order}
                        onChange={(event) =>
                            form.setData('sort_order', event.target.value)
                        }
                        disabled={form.processing}
                        placeholder="10"
                    />
                    <InputError message={form.errors.sort_order} />
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
                                La riga sara disponibile per le nuove due diligence generate dal
                                template.
                            </p>
                        </div>
                    </div>
                    <InputError message={form.errors.is_active} />
                </div>
            </div>
        </div>
    );
}

export default function DueDiligenceTemplatesEdit({
    template,
    items,
}: DueDiligenceTemplateEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Checklist template',
            href: dueDiligenceTemplateIndex(),
        },
        {
            title: 'Modifica checklist',
            href: dueDiligenceTemplateEdit(template.id),
        },
    ];

    const form = useForm<TemplateFormData>({
        name: template.name,
        description: template.description ?? '',
        is_active: template.is_active,
    });

    const handleTemplateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.submit(updateDueDiligenceTemplate.patch(template.id), {
            preserveScroll: true,
        });
    };

    const handleDeleteItem = (item: TemplateItemRecord) => {
        if (!window.confirm('Confermi l\'eliminazione di questa riga checklist?')) {
            return;
        }

        router.delete(item.delete_url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifica checklist" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Modifica checklist
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Aggiorna il template e gestisci le righe che verranno replicate nelle
                            nuove due diligence.
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link href={dueDiligenceTemplateIndex()}>Torna alla lista</Link>
                    </Button>
                </div>

                <Alert className="border-sky-200/70 bg-sky-50/70 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100">
                    <Info className="size-4" />
                    <AlertDescription>
                        Le modifiche a questa anagrafica non modificano le Due Diligence gia
                        create.
                    </AlertDescription>
                </Alert>

                <Card className="border-border/70 bg-card/90">
                    <CardHeader>
                        <CardTitle>Dati template</CardTitle>
                        <CardDescription>
                            Modifica i dati generali della checklist base.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-6" onSubmit={handleTemplateSubmit}>
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                                <div className="space-y-6">
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
                                                form.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                            rows={5}
                                            disabled={form.processing}
                                            placeholder="Descrivi lo scopo della checklist"
                                        />
                                        <InputError message={form.errors.description} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="template_is_active"
                                                checked={form.data.is_active}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'is_active',
                                                        checked === true,
                                                    )
                                                }
                                                disabled={form.processing}
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="template_is_active">
                                                    Template attivo
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Se disattivo, il template non sara selezionabile
                                                    per nuove due diligence.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <InputError message={form.errors.is_active} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button type="submit" disabled={form.processing}>
                                    Salva template
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

                <Card className="border-border/70 bg-card/90">
                    <CardHeader className="gap-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-1">
                                <CardTitle>Righe checklist</CardTitle>
                                <CardDescription>
                                    Aggiungi, aggiorna o disattiva le righe del template.
                                </CardDescription>
                            </div>

                            <TemplateItemDialog
                                title="Aggiungi riga checklist"
                                description="Crea una nuova riga da includere nelle future due diligence generate da questo template."
                                submitLabel="Salva riga"
                                initialData={buildItemFormData()}
                                submit={(itemForm, onSuccess) => {
                                    itemForm.post(storeDueDiligenceTemplateItem(template.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            itemForm.setData(buildItemFormData());
                                            itemForm.clearErrors();
                                            onSuccess();
                                        },
                                    });
                                }}
                                trigger={
                                    <Button>
                                        <Plus className="size-4" />
                                        Aggiungi riga
                                    </Button>
                                }
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center">
                                <div className="mx-auto max-w-md space-y-2">
                                    <h2 className="text-xl font-semibold tracking-tight">
                                        Nessuna riga configurata
                                    </h2>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Aggiungi la prima richiesta per completare la checklist
                                        template.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-border/70">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">Ordine</TableHead>
                                            <TableHead className="min-w-44">Entità</TableHead>
                                            <TableHead className="min-w-44">Argomento</TableHead>
                                            <TableHead className="min-w-80">Richiesta</TableHead>
                                            <TableHead className="w-28">Attiva</TableHead>
                                            <TableHead className="min-w-44">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="align-top font-medium">
                                                    {item.sort_order}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {item.entity}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {item.topic}
                                                </TableCell>
                                                <TableCell className="whitespace-normal align-top">
                                                    <p className="text-sm leading-6 text-muted-foreground">
                                                        {item.request_text}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    <Badge
                                                        variant={
                                                            item.is_active
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {item.is_active ? 'Si' : 'No'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    <div className="flex flex-wrap gap-2">
                                                        <TemplateItemDialog
                                                            title="Modifica riga checklist"
                                                            description="Aggiorna i dati della riga selezionata."
                                                            submitLabel="Salva modifiche"
                                                            initialData={buildItemFormData(
                                                                item,
                                                            )}
                                                            submit={(
                                                                itemForm,
                                                                onSuccess,
                                                            ) => {
                                                                itemForm.patch(
                                                                    item.update_url,
                                                                    {
                                                                        preserveScroll: true,
                                                                        onSuccess,
                                                                    },
                                                                );
                                                            }}
                                                            trigger={
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    <PencilLine className="size-4" />
                                                                    Modifica
                                                                </Button>
                                                            }
                                                        />

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDeleteItem(item)
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                            Elimina
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
