export function Icon({
  name,
  className = '',
  onClick,
}: {
  name: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLElement>
}) {
  return <i className={`fa-solid ${name} ${className}`} onClick={onClick} />
}
