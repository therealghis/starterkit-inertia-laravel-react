import { Link } from '@inertiajs/react';
import { BriefcaseBusiness, FolderKanban, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard } from '@/routes';
import { index as mergeAcquisitionIndex } from '@/routes/merge_acquisition';

export function AppSidebar() {
    const { t } = useTranslations();

    const mainNavItems = [
        {
            title: t('Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'M&A',
            icon: BriefcaseBusiness,
            items: [
                {
                    title: 'Dashboard',
                    href: mergeAcquisitionIndex(),
                },
                {
                    title: 'Buy-side',
                    href: mergeAcquisitionIndex({
                        query: { intent_type: 'BUY_SIDE' },
                    }),
                },
                {
                    title: 'Sell-side',
                    href: mergeAcquisitionIndex({
                        query: { intent_type: 'SELL_SIDE' },
                    }),
                },
            ],
        },
        {
            title: 'Le mie opportunità',
            icon: FolderKanban,
            items: [
                {
                    title: 'Dashboard',
                    disabled: true,
                },
                {
                    title: 'Buy-side',
                    disabled: true,
                },
                {
                    title: 'Sell-side',
                    disabled: true,
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
