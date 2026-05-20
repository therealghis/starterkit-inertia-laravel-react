import { Link } from '@inertiajs/react';
import { BriefcaseBusiness, LayoutGrid } from 'lucide-react';
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
import {
    buy_side as mergeAcquisitionBuySide,
    index as mergeAcquisitionIndex,
    sell_side as mergeAcquisitionSellSide,
} from '@/routes/merge_acquisition';

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
                    title: 'Tutte le opportunità',
                    items: [
                        {
                            title: 'Dashboard',
                            href: mergeAcquisitionIndex(),
                        },
                        {
                            title: 'Buy-side',
                            href: mergeAcquisitionBuySide(),
                        },
                        {
                            title: 'Sell-side',
                            href: mergeAcquisitionSellSide(),
                        },
                    ],
                },
                {
                    title: 'Le mie opportunità',
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
