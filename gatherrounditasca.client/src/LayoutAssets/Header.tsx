import React, { useState, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

// Icon components
const PinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const BurgerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

// Navigation link component
interface NavItemProps {
  to: string;
  children: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, children, onClick }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `it-nav__link ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
        {children}
    </NavLink>
);

// Header component
const Header: React.FC = () => {
    const [open, setOpen] = useState(false);
    const closeMenu = useCallback(() => setOpen(false), []);
    const toggleMenu = useCallback(() => setOpen(o => !o), []);

    return (
        <header className="it-header it-scope">
            <div className="it-header__inner">
                {/* Brand */}
                <Link to="/" className="it-brand" onClick={closeMenu}>
                    <span className="it-brand__mark"><PinIcon /></span>
                    <span>Itasca Trails</span>
                </Link>

                {/* Mobile menu toggle */}
                <button
                    className="it-burger"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    onClick={toggleMenu}
                >
                    {open ? <CloseIcon /> : <BurgerIcon />}
                </button>

                {/* Navigation */}
                <nav className={`it-nav ${open ? 'is-open' : ''}`}>
                    <NavItem to="/" onClick={closeMenu}>Home</NavItem>
                    <NavItem to="/about" onClick={closeMenu}>How it works</NavItem>
                    <NavItem to="/play" onClick={closeMenu}>Play</NavItem>
                    <NavItem to="/leaderboard" onClick={closeMenu}>Leaderboard</NavItem>
                    <Link
                        to="/join"
                        className="it-btn it-btn-primary it-nav__cta"
                        onClick={closeMenu}
                    >
                        Get a Player ID
                    </Link>
                </nav>

                {/* Theme toggle */}
                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;
