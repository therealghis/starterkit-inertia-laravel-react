import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { update as updateDueDiligenceItemNotes } from '@/routes/due_diligence_items/notes';

type DueDiligenceItemNotesDialogProps = {
    item: {
        id: number;
        company_notes: string | null;
        admin_notes: string | null;
    };
};

type DueDiligenceItemNotesFormData = {
    company_notes: string;
    admin_notes: string;
};

export default function DueDiligenceItemNotesDialog({
    item,
}: DueDiligenceItemNotesDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<DueDiligenceItemNotesFormData>({
        company_notes: item.company_notes ?? '',
        admin_notes: item.admin_notes ?? '',
    });

    useEffect(() => {
        form.setData({
            company_notes: item.company_notes ?? '',
            admin_notes: item.admin_notes ?? '',
        });
    }, [item.admin_notes, item.company_notes, item.id]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            form.clearErrors();
            form.setData({
                company_notes: item.company_notes ?? '',
                admin_notes: item.admin_notes ?? '',
            });
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.patch(updateDueDiligenceItemNotes(item.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Note
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Gestione note</DialogTitle>
                    <DialogDescription>
                        Aggiorna le note società e le note admin per questo elemento della due diligence.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor={`company_notes_${item.id}`}>Note società</Label>
                        <Textarea
                            id={`company_notes_${item.id}`}
                            value={form.data.company_notes}
                            onChange={(event) => form.setData('company_notes', event.target.value)}
                            rows={6}
                            disabled={form.processing}
                            placeholder="Inserisci le note condivise con la società"
                        />
                        <InputError message={form.errors.company_notes} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`admin_notes_${item.id}`}>Note admin</Label>
                        <Textarea
                            id={`admin_notes_${item.id}`}
                            value={form.data.admin_notes}
                            onChange={(event) => form.setData('admin_notes', event.target.value)}
                            rows={6}
                            disabled={form.processing}
                            placeholder="Inserisci le note interne amministrative"
                        />
                        <InputError message={form.errors.admin_notes} />
                    </div>

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
                            Salva note
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
