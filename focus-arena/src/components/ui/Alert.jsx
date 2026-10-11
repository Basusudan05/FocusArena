const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
}

function Alert({ type = 'info', message, onClose }) {
  const classes = ['alert', `alert--${type}`].join(' ')

  return (
    <div className={classes} role="alert">
      <span className="alert__icon" aria-hidden="true">
        {ICONS[type] ?? ICONS.info}
      </span>
      <span className="alert__message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default Alert
