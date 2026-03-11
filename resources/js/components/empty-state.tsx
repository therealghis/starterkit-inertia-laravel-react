import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

type EmptyStateProps = {
    title: string;
    description: string;
    icon?: ReactNode;
    actionLabel?: string;
    actionHref?: string;
};

export default function EmptyState({
    title,
    description,
    icon,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/80 bg-background/80 px-6 py-16 text-center">
            {icon ? (
                <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
                </div>
            ) : null}

            <div className="max-w-md space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">{t(title)}</h2>
                <p className="text-sm text-muted-foreground">{t(description)}</p>
            </div>

            {actionLabel && actionHref ? (
                <Button asChild className="mt-6">
                    <Link href={actionHref}>{t(actionLabel)}</Link>
                </Button>
            ) : null}
        </div>
    );
}
