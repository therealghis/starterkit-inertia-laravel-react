import { Head } from '@inertiajs/react';
import { Boxes } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <EmptyState
                    title="Nessun modulo disponibile"
                    description="Lo starter kit e` pronto, ma la dashboard non ha ancora widget o dati di dominio. Usa questo spazio come pattern per i tuoi stati vuoti."
                    icon={<Boxes className="size-6" />}
                />
            </div>
        </AppLayout>
    );
}
