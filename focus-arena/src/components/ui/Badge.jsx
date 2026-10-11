function Badge({ children, color = 'gray' }) {
  const classes = ['badge', `badge--${color}`].join(' ')

  return (
    <span className={classes}>
      {children}
    </span>
  )
}

export default Badge
