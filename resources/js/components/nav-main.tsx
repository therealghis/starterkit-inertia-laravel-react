import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    const hasActiveDescendant = (item: NavItem): boolean => {
        if (item.href && isCurrentUrl(item.href)) {
            return true;
        }

        return item.items?.some(hasActiveDescendant) ?? false;
    };

    const renderSubItem = (item: NavItem, key: string, depth: 'md' | 'sm' = 'md') => {
        const itemIsActive = hasActiveDescendant(item);
        const buttonClassName = item.disabled
            ? 'cursor-default opacity-50 hover:bg-transparent hover:text-inherit'
            : undefined;

        if (item.items?.length) {
            return (
                <SidebarMenuSubItem key={key}>
                    <Collapsible defaultOpen={itemIsActive} className="group/collapsible">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton
                                asChild={false}
                                isActive={itemIsActive}
                                size={depth}
                            >
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuSubButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub className="ml-2 mr-0 mt-1">
                                {item.items.map((childItem) =>
                                    renderSubItem(childItem, `${key}-${childItem.title}`, 'sm'),
                                )}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarMenuSubItem>
            );
        }

        return (
            <SidebarMenuSubItem key={key}>
                {item.href && !item.disabled ? (
                    <SidebarMenuSubButton asChild isActive={itemIsActive} size={depth}>
                        <Link href={item.href} prefetch>
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuSubButton>
                ) : (
                    <SidebarMenuSubButton
                        asChild={false}
                        isActive={itemIsActive}
                        size={depth}
                        className={buttonClassName}
                    >
                        <span>{item.title}</span>
                    </SidebarMenuSubButton>
                )}

            </SidebarMenuSubItem>
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const itemHref = item.href;
                        const itemIsActive = hasActiveDescendant(item);

                        if (item.items?.length) {
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <Collapsible defaultOpen={itemIsActive} className="group/collapsible">
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                isActive={itemIsActive}
                                                tooltip={{ children: item.title }}
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((childItem) =>
                                                    renderSubItem(childItem, `${item.title}-${childItem.title}`),
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            );
                        }

                        return (
                            <SidebarMenuItem key={item.title}>
                                {itemHref && !item.disabled ? (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={itemIsActive}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={itemHref} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                ) : (
                                    <SidebarMenuButton
                                        isActive={itemIsActive}
                                        tooltip={{ children: item.title }}
                                        className="cursor-default opacity-70 hover:bg-transparent hover:text-inherit"
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                )}

                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
