import React, { useState, useEffect, useCallback } from 'react'
import { Bell, X, Clock, Mail, CheckCircle, AlertTriangle } from 'lucide-react'

interface Notification {
  id: string
  type: 'relance' | 'info' | 'success' | 'warning'
  title: string
  message: string
  candidature_id?: number
  date_creation: string
  read: boolean
}

interface NotificationsProps {
  candidatures: any[]
}

export default function Notifications({ candidatures }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)

  // Générer les notifications de relance automatiquement
  const generateNotifications = useCallback(() => {
    const newNotifications: Notification[] = []
    const now = new Date()

    candidatures.forEach(candidature => {
      if (candidature.statut === 'envoye' && candidature.date_envoi) {
        const dateEnvoi = new Date(candidature.date_envoi)
        const diffJours = Math.floor((now.getTime() - dateEnvoi.getTime()) / (1000 * 60 * 60 * 24))
        
        // Notification de relance après 7 jours
        if (diffJours >= 7 && diffJours <= 14) {
          newNotifications.push({
            id: `relance-${candidature.id}`,
            type: 'relance',
            title: 'Relance recommandée',
            message: `Il est temps de relancer ${candidature.entreprise} pour le poste de ${candidature.poste}`,
            candidature_id: candidature.id,
            date_creation: now.toISOString(),
            read: false
          })
        }
        
        // Notification urgente après 14 jours
        if (diffJours > 14) {
          newNotifications.push({
            id: `urgent-${candidature.id}`,
            type: 'warning',
            title: 'Relance urgente',
            message: `Aucune réponse de ${candidature.entreprise} depuis ${diffJours} jours`,
            candidature_id: candidature.id,
            date_creation: now.toISOString(),
            read: false
          })
        }
      }
    })

    // Éviter les doublons en vérifiant les IDs existants
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id))
      const uniqueNotifications = newNotifications.filter(n => !existingIds.has(n.id))
      
      if (uniqueNotifications.length > 0) {
        return [...prev, ...uniqueNotifications]
      }
      return prev
    })
  }, [candidatures])

  useEffect(() => {
    generateNotifications()
  }, [generateNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'relance': return <Clock className="w-5 h-5 text-blue-500" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />
      default: return <Mail className="w-5 h-5 text-gray-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'relance': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-orange-50 border-orange-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Icône de notifications */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau des notifications */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 ${getBgColor(notification.type)} ${
                    !notification.read ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
              >
                Marquer tout comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}