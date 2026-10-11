function Card({ children, className = '', padding = 'md' }) {
  const classes = [
    'card',
    `card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export default Card
