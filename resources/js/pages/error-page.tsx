import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Clock3, Home, ShieldAlert, TriangleAlert } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

const errorContent = {
    403: {
        title: 'Accesso negato',
        description: 'Non hai i permessi necessari per visualizzare questa pagina.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Pagina non trovata',
        description: 'La risorsa richiesta non esiste o e` stata spostata.',
        icon: AlertTriangle,
    },
    429: {
        title: 'Troppe richieste',
        description: 'Hai inviato troppe richieste in poco tempo. Attendi e riprova.',
        icon: Clock3,
    },
    500: {
        title: 'Errore interno',
        description: 'Si e` verificato un errore inatteso. Il problema verra` tracciato.',
        icon: TriangleAlert,
    },
    503: {
        title: 'Servizio non disponibile',
        description: 'L’applicazione e` momentaneamente non disponibile. Riprova tra poco.',
        icon: TriangleAlert,
    },
} as const;

type ErrorPageProps = {
    status: keyof typeof errorContent;
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const { name } = usePage().props as { name: string };
    const content = errorContent[status] ?? errorContent[500];
    const Icon = content.icon;

    return (
        <>
            <Head title={`${status} ${content.title}`} />

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
                                Errore applicativo
                            </p>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-semibold tracking-tight">
                                    {content.title}
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-slate-600">
                                    {content.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button asChild>
                                    <Link href={home()}>
                                        <Home className="size-4" />
                                        Torna all’app
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
