import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Layers,
  Search,
  ShoppingCart,
  User,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  Building2,
  Store,
  Bot
} from 'lucide-react';

export default function Navbar({ onOpenAuth, onOpenAi, activeTab, setActiveTab, onSearchSubmit }) {
  const { user, darkMode, toggleDarkMode, switchRole, logout } = useAuth();
  const { totalMeters, items, setIsOpen: setIsCartOpen } = useCart();
  const [searchInput, setSearchInput] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchInput);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glassmorphism border-b border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('marketplace')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-brand-500/25 group hover:scale-105 transition-transform duration-300">
            <Layers className="w-6 h-6 animate-pulse-slow" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-900 dark:from-white dark:via-brand-300 dark:to-indigo-300 bg-clip-text text-transparent">
              FabricMart
            </span>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-brand-600 dark:text-brand-400">
              B2B Textile Sourcing Engine
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search fabric name, GSM, composition, or ask AI..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-11 pr-24 py-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            
            <button
              onClick={() => onSearchSubmit(searchInput)}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAi}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:border-indigo-500/60 text-xs font-bold transition shadow-sm"
          >
            <Bot className="w-4 h-4 text-indigo-500 animate-bounce" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(prev => !prev)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {user?.role === 'supplier' ? (
                <>
                  <Store className="w-3.5 h-3.5 text-amber-500" />
                  <span>Supplier View</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Buyer View</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-xs">
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Switch Operating Mode
                </div>
                <button
                  onClick={() => {
                    switchRole('buyer');
                    setActiveTab('marketplace');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition ${user?.role === 'buyer' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Buyer Portal
                  </span>
                  {user?.role === 'buyer' && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                </button>
                <button
                  onClick={() => {
                    switchRole('supplier');
                    setActiveTab('supplier_dashboard');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition ${user?.role === 'supplier' ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4" /> Supplier Portal
                  </span>
                  {user?.role === 'supplier' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {user?.role === 'supplier' ? (
            <button
              onClick={() => setActiveTab('supplier_dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'supplier_dashboard' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('buyer_dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'buyer_dashboard' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
            >
              My Orders
            </button>
          )}

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] shadow-lg animate-pulse">
                {items.length}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                className="hidden lg:block text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
