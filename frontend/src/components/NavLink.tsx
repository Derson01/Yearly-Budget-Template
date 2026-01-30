'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
}

const NavLink = ({ href, icon, label }: NavLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`nav-link-premium ${isActive ? 'bg-slate-50 text-accent font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default NavLink;
