// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    { name: 'Home', href: '/' },
    { name: 'Music', href: '/music' },
    { name: 'Videos', href: '/videos' },
    { name: 'Blog', href: '/blog' },
    { name: 'Store', href: '/store' },
]

export default function Navbar() {
    const pathname = usePathname()

    return (
        <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-neutral-800 bg-black text-white">
            <div className="text-xl font-bold tracking-wide">
                <Link href="/">BIOMECHANICS</Link>
            </div>
            <ul className="flex gap-6 text-sm font-medium">
                {links.map(({ name, href }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className={`hover:underline ${pathname === href ? 'text-primary' : 'text-white'
                                }`}
                        >
                            {name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
