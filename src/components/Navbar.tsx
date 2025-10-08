'use client'

import { Home, Mail, FileText, Briefcase, BarChart3, User } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const navItems = [
    {
      id: 'accueil',
      label: 'Accueil',
      icon: Home,
      description: 'Vue d\'ensemble'
    },
    {
      id: 'candidatures',
      label: 'Candidatures',
      icon: Briefcase,
      description: 'Gérer mes candidatures'
    },
    {
      id: 'statistiques',
      label: 'Statistiques',
      icon: BarChart3,
      description: 'Analyses et métriques'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Mail,
      description: 'Modèles de mail'
    },
    {
      id: 'compte',
      label: 'Compte',
      icon: User,
      description: 'Mon profil et CV'
    }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Standey</h1>
                <p className="text-xs text-gray-500">Tracker de candidatures</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">Standey</h1>
              </div>
            </div>
          </div>

          {/* Navigation desktop */}
          <div className="hidden sm:flex">
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.id !== 'compte' && <span>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation mobile */}
          <div className="flex sm:hidden">
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`inline-flex items-center justify-center p-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}