import { Head, Link, router } from '@inertiajs/react';
import { CirclePlus, Files, FolderSearch, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create as dueDiligenceTemplateCreate, index as dueDiligenceTemplateIndex } from '@/routes/due_diligence_templates';
import type { BreadcrumbItem } from '@/types';
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
    PageHero,
    PageHeroActions,
    PageHeroAside,
    PageHeroBody,
    PageHeroContent,
    PageHeroDescription,
    PageHeroEyebrow,
    PageHeroStat,
    PageHeroStatLabel,
    PageHeroStats,
    PageHeroStatValue,
    PageHeroTitle,
} from '@/components/ui/page-hero';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type DueDiligenceTemplatesIndexProps = {
    templates: Array<{
        id: number;
        name: string;
        description: string | null;
        is_active: boolean;
        items_count: number;
        edit_url: string;
        delete_url: string;
    }>;
};

export default function DueDiligenceTemplatesIndex({
    templates,
}: DueDiligenceTemplatesIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Checklist template',
            href: dueDiligenceTemplateIndex(),
        },
    ];

    const handleDelete = (template: DueDiligenceTemplatesIndexProps['templates'][number]) => {
        if (
            !window.confirm(
                `Eliminare il template "${template.name}"? Questa azione non modifica le due diligence gia create.`,
            )
        ) {
            return;
        }

        router.delete(template.delete_url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checklist template" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <PageHero tone="support">
                    <PageHeroBody>
                        <PageHeroContent>
                            <PageHeroEyebrow>
                                <Files className="size-4" />
                                Due Diligence
                            </PageHeroEyebrow>

                            <div className="space-y-3">
                                <PageHeroTitle>Checklist template</PageHeroTitle>
                                <PageHeroDescription>
                                    Anagrafica checklist base per generare snapshot delle due
                                    diligence.
                                </PageHeroDescription>
                            </div>
                        </PageHeroContent>

                        <PageHeroAside>
                            <PageHeroStats>
                                <PageHeroStat>
                                    <PageHeroStatLabel>Template</PageHeroStatLabel>
                                    <PageHeroStatValue>{templates.length}</PageHeroStatValue>
                                </PageHeroStat>
                            </PageHeroStats>

                            <PageHeroActions>
                                <Button asChild>
                                    <Link href={dueDiligenceTemplateCreate()}>
                                        <CirclePlus className="size-4" />
                                        Crea checklist
                                    </Link>
                                </Button>
                            </PageHeroActions>
                        </PageHeroAside>
                    </PageHeroBody>
                </PageHero>

                <Card className="border-border/70 bg-card/90">
                    <CardHeader className="gap-3">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-1">
                                <CardTitle>Archivio template</CardTitle>
                                <CardDescription>
                                    Eliminare un template non modifica le due diligence gia create.
                                </CardDescription>
                            </div>

                            <div className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                                {templates.length} risultati
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {templates.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center">
                                <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background">
                                        <FolderSearch className="size-6 text-muted-foreground" />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-xl font-semibold tracking-tight">
                                            Nessun template disponibile
                                        </h2>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Crea la prima checklist base da riutilizzare per le
                                            future due diligence.
                                        </p>
                                    </div>

                                    <Button asChild>
                                        <Link href={dueDiligenceTemplateCreate()}>
                                            <CirclePlus className="size-4" />
                                            Crea checklist
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-border/70">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-56">Nome</TableHead>
                                            <TableHead className="min-w-72">Descrizione</TableHead>
                                            <TableHead className="min-w-36">Stato</TableHead>
                                            <TableHead className="min-w-28">Numero righe</TableHead>
                                            <TableHead className="min-w-44">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templates.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="whitespace-normal align-top">
                                                    <p className="font-medium text-foreground">
                                                        {template.name}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="whitespace-normal align-top">
                                                    <p className="text-sm leading-6 text-muted-foreground">
                                                        {template.description || 'Nessuna descrizione'}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="whitespace-normal align-top">
                                                    <Badge
                                                        variant={
                                                            template.is_active
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {template.is_active
                                                            ? 'Attiva'
                                                            : 'Non attiva'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    <span className="font-medium">
                                                        {template.items_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="whitespace-normal align-top">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button asChild size="sm" variant="outline">
                                                            <Link href={template.edit_url}>
                                                                Modifica
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDelete(template)
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
