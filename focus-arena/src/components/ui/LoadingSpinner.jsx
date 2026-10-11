function LoadingSpinner({ size = 'md' }) {
  const classes = ['spinner', `spinner--${size}`].join(' ')

  return (
    <div
      className={classes}
      role="status"
      aria-label="Loading"
    />
  )
}

export default LoadingSpinner
