import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Clock3, Home, ShieldAlert, TriangleAlert } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { home } from '@/routes';

const errorContent = {
    403: {
        title: 'Access denied',
        description: 'You do not have permission to view this page.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Page not found',
        description: 'The requested resource does not exist or has been moved.',
        icon: AlertTriangle,
    },
    429: {
        title: 'Too many requests',
        description: 'You have sent too many requests in a short time. Please wait and try again.',
        icon: Clock3,
    },
    500: {
        title: 'Internal server error',
        description: 'An unexpected error occurred. The problem will be tracked automatically.',
        icon: TriangleAlert,
    },
    503: {
        title: 'Service unavailable',
        description: 'The application is temporarily unavailable. Please try again later.',
        icon: TriangleAlert,
    },
} as const;

type ErrorPageProps = {
    status: keyof typeof errorContent;
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const { name } = usePage().props as { name: string };
    const { t } = useTranslations();
    const content = errorContent[status] ?? errorContent[500];
    const Icon = content.icon;

    return (
        <>
            <Head title={`${status} ${t(content.title)}`} />

            <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#f4efe2_0%,#f8f5ee_45%,#ffffff_100%)] px-6 py-10 text-slate-950">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
                    <Link href={home()} className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                            <AppLogoIcon className="size-6 fill-current" />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                            {name}
                        </span>
                    </Link>

                    <div className="rounded-full border border-slate-300/80 px-4 py-1 text-sm font-medium text-slate-600">
                        HTTP {status}
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center">
                    <div className="grid gap-10 rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] md:grid-cols-[auto,1fr] md:p-12">
                        <div className="flex size-24 items-center justify-center rounded-[1.75rem] bg-slate-950 text-white">
                            <Icon className="size-10" />
                        </div>

                        <div className="space-y-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                {t('Application error')}
                            </p>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-semibold tracking-tight">
                                    {t(content.title)}
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-slate-600">
                                    {t(content.description)}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button asChild>
                                    <Link href={home()}>
                                        <Home className="size-4" />
                                        {t('Return to the app')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
