import { router, useForm } from '@inertiajs/react';
import { Download, LoaderCircle, Paperclip, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import ConfirmActionDialog from '@/components/confirm-action-dialog';
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

    return Object.entries(errors).find(
        ([key, value]) => key.startsWith('attachments.') && value,
    )?.[1];
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
            },
        });
    };

    const handleDelete = (attachment: DueDiligenceItemAttachment) => {
        setDeletingAttachmentId(attachment.id);

        router.delete(attachment.delete_url, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingAttachmentId(null);
            },
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <div className="min-w-0 space-y-3 rounded-2xl border border-border/70 bg-muted/10 p-4">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Paperclip className="h-4 w-4" />
                        Allegati
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {attachments.length === 0
                            ? 'Nessun file caricato.'
                            : `${attachments.length} file collegati.`}
                    </p>
                </div>

                <DialogTrigger asChild>
                    <Button size="sm" className="w-full">
                        <Upload className="h-4 w-4" />
                        Gestisci allegati
                    </Button>
                </DialogTrigger>
            </div>

            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Gestisci allegati</DialogTitle>
                    <DialogDescription>
                        Visualizza i file già presenti e aggiungi nuovi allegati a questo
                        elemento della due diligence.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">
                                Allegati presenti
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Download ed eliminazione dei file già associati.
                            </p>
                        </div>

                        {attachments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                                Nessun allegato presente.
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {attachments.map((attachment) => {
                                    const isDeleting =
                                        deletingAttachmentId === attachment.id;

                                    return (
                                        <li
                                            key={attachment.id}
                                            className="space-y-3 rounded-xl border border-border/70 bg-background/80 px-4 py-3"
                                        >
                                            <div className="min-w-0 space-y-1">
                                                <p className="break-all text-sm font-medium text-foreground">
                                                    {attachment.filename}
                                                </p>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    <span>{attachment.mimetype}</span>
                                                    {attachment.size !== null && (
                                                        <span>{formatBytes(attachment.size)}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={attachment.download_url}>
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </a>
                                                </Button>
                                                <ConfirmActionDialog
                                                    triggerLabel="Elimina"
                                                    title="Eliminare l'allegato?"
                                                    description={`L'allegato "${attachment.filename}" verra eliminato da questa riga della due diligence.`}
                                                    confirmLabel="Elimina allegato"
                                                    onConfirm={() => handleDelete(attachment)}
                                                    disabled={isDeleting}
                                                    triggerIcon={
                                                        isDeleting ? (
                                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )
                                                    }
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                    Aggiungi allegati
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Seleziona uno o più file da associare a questo elemento.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <FileUpload
                                    name="attachments"
                                    files={form.data.attachments}
                                    onFilesChange={(files) =>
                                        form.setData('attachments', files)
                                    }
                                    disabled={form.processing}
                                    helperText="Formati supportati fino a 50 MB per file."
                                />
                                <InputError message={attachmentError} />
                            </div>
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
                                Chiudi
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || form.data.attachments.length === 0}
                            >
                                {form.processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                Conferma upload
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
