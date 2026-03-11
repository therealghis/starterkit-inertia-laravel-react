import { Head } from '@inertiajs/react';
import { Boxes } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function Dashboard() {
    const { t } = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Dashboard'),
            href: dashboard(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <EmptyState
                    title="No modules available"
                    description="The starter kit is ready, but the dashboard does not have widgets or domain data yet. Use this area as the standard pattern for empty states."
                    icon={<Boxes className="size-6" />}
                />
            </div>
        </AppLayout>
    );
}
