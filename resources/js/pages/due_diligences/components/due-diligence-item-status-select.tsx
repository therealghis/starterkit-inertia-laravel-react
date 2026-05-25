import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus]);

    const handleValueChange = (selectedValue: string) => {
        setSelectedStatus(selectedValue);
        setIsProcessing(true);

        router.patch(updateDueDiligenceItemStatus(itemId), { status: selectedValue }, {
            preserveScroll: true,
            onFinish: () => {
                setIsProcessing(false);
            },
        });
    };

    return (
        <Select
            value={selectedStatus}
            onValueChange={handleValueChange}
            disabled={isProcessing}
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
