import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { update as updateDueDiligenceItemStatus } from '@/routes/due_diligence_items/status';

type DueDiligenceItemStatusSelectProps = {
    itemId: number;
    currentStatus: string;
    statuses: Array<{
        value: string;
        label: string;
    }>;
};

export default function DueDiligenceItemStatusSelect({
    itemId,
    currentStatus,
    statuses,
}: DueDiligenceItemStatusSelectProps) {
    const form = useForm({
        status: currentStatus,
    });

    useEffect(() => {
        form.setData('status', currentStatus);
    }, [currentStatus]);

    const handleValueChange = (selectedValue: string) => {
        form.setData('status', selectedValue);

        form.patch(updateDueDiligenceItemStatus(itemId), {
            data: {
                status: selectedValue,
            },
            preserveScroll: true,
        });
    };

    return (
        <Select
            value={form.data.status}
            onValueChange={handleValueChange}
            disabled={form.processing}
        >
            <SelectTrigger className="w-full min-w-40" aria-label="Stato elemento due diligence">
                <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent>
                {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                        {status.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
