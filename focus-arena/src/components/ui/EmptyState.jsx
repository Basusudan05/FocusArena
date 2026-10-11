import { InboxIcon } from 'lucide-react'

const ICON_MAP = {
  inbox:   InboxIcon,
}

function EmptyState({ title, description, action, icon = 'inbox' }) {
  // Accept a custom Lucide element or fall back to the icon map
  const IconEl = typeof icon === 'string' ? (ICON_MAP[icon] ?? InboxIcon) : null

  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        {typeof icon !== 'string' ? icon : IconEl ? <IconEl size={36} strokeWidth={1.5} /> : null}
      </div>
      {title && <p className="empty-state__title">{title}</p>}
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
