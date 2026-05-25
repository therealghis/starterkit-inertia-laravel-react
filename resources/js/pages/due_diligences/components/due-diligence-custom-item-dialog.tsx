import { useForm } from '@inertiajs/react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { store as storeDueDiligenceCustomItem } from '@/routes/due_diligences/custom_items';

type DueDiligenceCustomItemDialogProps = {
    dueDiligenceId: number;
};

type DueDiligenceCustomItemFormData = {
    entity: string;
    topic: string;
    request_text: string;
    company_notes: string;
    admin_notes: string;
};

const emptyFormData: DueDiligenceCustomItemFormData = {
    entity: '',
    topic: '',
    request_text: '',
    company_notes: '',
    admin_notes: '',
};

export default function DueDiligenceCustomItemDialog({
    dueDiligenceId,
}: DueDiligenceCustomItemDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<DueDiligenceCustomItemFormData>(emptyFormData);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            form.clearErrors();
            return;
        }

        if (!form.processing) {
            form.reset();
            form.clearErrors();
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(storeDueDiligenceCustomItem(dueDiligenceId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                setIsOpen(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">Aggiungi riga custom</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Aggiungi riga custom</DialogTitle>
                    <DialogDescription>
                        Crea un nuovo elemento personalizzato per questa due diligence.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`custom_item_entity_${dueDiligenceId}`}>
                                Entità
                            </Label>
                            <Input
                                id={`custom_item_entity_${dueDiligenceId}`}
                                value={form.data.entity}
                                onChange={(event) =>
                                    form.setData('entity', event.target.value)
                                }
                                disabled={form.processing}
                                placeholder="Inserisci l'entità"
                            />
                            <InputError message={form.errors.entity} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`custom_item_topic_${dueDiligenceId}`}>
                                Topic
                            </Label>
                            <Input
                                id={`custom_item_topic_${dueDiligenceId}`}
                                value={form.data.topic}
                                onChange={(event) =>
                                    form.setData('topic', event.target.value)
                                }
                                disabled={form.processing}
                                placeholder="Inserisci il topic"
                            />
                            <InputError message={form.errors.topic} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`custom_item_request_text_${dueDiligenceId}`}>
                            Testo richiesta
                        </Label>
                        <Textarea
                            id={`custom_item_request_text_${dueDiligenceId}`}
                            value={form.data.request_text}
                            onChange={(event) =>
                                form.setData('request_text', event.target.value)
                            }
                            rows={5}
                            disabled={form.processing}
                            placeholder="Descrivi la richiesta"
                        />
                        <InputError message={form.errors.request_text} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`custom_item_company_notes_${dueDiligenceId}`}>
                            Note società
                        </Label>
                        <Textarea
                            id={`custom_item_company_notes_${dueDiligenceId}`}
                            value={form.data.company_notes}
                            onChange={(event) =>
                                form.setData('company_notes', event.target.value)
                            }
                            rows={4}
                            disabled={form.processing}
                            placeholder="Inserisci le note condivise con la società"
                        />
                        <InputError message={form.errors.company_notes} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`custom_item_admin_notes_${dueDiligenceId}`}>
                            Note admin
                        </Label>
                        <Textarea
                            id={`custom_item_admin_notes_${dueDiligenceId}`}
                            value={form.data.admin_notes}
                            onChange={(event) =>
                                form.setData('admin_notes', event.target.value)
                            }
                            rows={4}
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
                            Salva riga custom
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
