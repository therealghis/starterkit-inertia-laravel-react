import { useState } from 'react';
import type { ReactNode } from 'react';
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

type ConfirmActionDialogProps = {
    triggerLabel: string;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    triggerIcon?: ReactNode;
    ariaLabel?: string;
};

export default function ConfirmActionDialog({
    triggerLabel,
    title,
    description,
    confirmLabel = 'Conferma',
    onConfirm,
    disabled = false,
    variant = 'destructive',
    confirmVariant = 'destructive',
    size = 'sm',
    triggerIcon,
    ariaLabel,
}: ConfirmActionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} disabled={disabled}>
                    {triggerIcon}
                    {triggerLabel}
                    {ariaLabel ? <span className="sr-only">{ariaLabel}</span> : null}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                    >
                        Annulla
                    </Button>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={() => {
                            setIsOpen(false);
                            onConfirm();
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
