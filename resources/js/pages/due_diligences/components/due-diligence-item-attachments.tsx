import { router, useForm } from '@inertiajs/react';
import { Download, LoaderCircle, Paperclip, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import FileUpload from '@/components/file-upload';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { store as storeDueDiligenceItemAttachments } from '@/routes/due_diligence_items/attachments';

type DueDiligenceItemAttachment = {
    id: number;
    filename: string;
    mimetype: string;
    size: number | null;
    download_url: string;
    delete_url: string;
};

type DueDiligenceItemAttachmentsProps = {
    itemId: number;
    attachments: DueDiligenceItemAttachment[];
};

type DueDiligenceItemAttachmentsFormData = {
    attachments: File[];
};

const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const getAttachmentError = (
    errors: Record<string, string | undefined>,
): string | undefined => {
    if (errors.attachments) {
        return errors.attachments;
    }

    return Object.entries(errors).find(([key, value]) => key.startsWith('attachments.') && value)?.[1];
};

export default function DueDiligenceItemAttachments({
    itemId,
    attachments,
}: DueDiligenceItemAttachmentsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null);
    const form = useForm<DueDiligenceItemAttachmentsFormData>({
        attachments: [],
    });

    const attachmentError = getAttachmentError(form.errors);

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);

        if (open) {
            form.clearErrors();
            return;
        }

        if (!form.processing) {
            form.reset();
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(storeDueDiligenceItemAttachments(itemId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleDelete = (attachment: DueDiligenceItemAttachment) => {
        if (!window.confirm(`Eliminare l'allegato "${attachment.filename}"?`)) {
            return;
        }

        setDeletingAttachmentId(attachment.id);

        router.delete(attachment.delete_url, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingAttachmentId(null);
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Paperclip className="h-4 w-4" />
                        Allegati
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gestisci i documenti collegati a questo elemento.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Upload className="h-4 w-4" />
                            Carica allegati
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Carica allegati</DialogTitle>
                            <DialogDescription>
                                Seleziona uno o più file da associare a questo elemento della due diligence.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <FileUpload
                                    name="attachments"
                                    files={form.data.attachments}
                                    onFilesChange={(files) => form.setData('attachments', files)}
                                    disabled={form.processing}
                                    helperText="Formati supportati fino a 50 MB per file."
                                />
                                <InputError message={attachmentError} />
                            </div>

                            {form.progress && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Upload in corso</span>
                                        <span>{form.progress.percentage}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all"
                                            style={{ width: `${form.progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={form.processing}
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing || form.data.attachments.length === 0}
                                >
                                    {form.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Conferma upload
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {attachments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                    Nessun allegato presente.
                </div>
            ) : (
                <ul className="space-y-3">
                    {attachments.map((attachment) => {
                        const isDeleting = deletingAttachmentId === attachment.id;

                        return (
                            <li
                                key={attachment.id}
                                className="flex flex-col gap-3 rounded-lg border border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {attachment.filename}
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span>{attachment.mimetype}</span>
                                        {attachment.size !== null && <span>{formatBytes(attachment.size)}</span>}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button asChild type="button" variant="outline" size="sm">
                                        <a href={attachment.download_url}>
                                            <Download className="h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(attachment)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        Elimina
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
