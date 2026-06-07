export function ToolPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-24 items-center justify-center px-3 text-center text-white/40">
      {label}
      {' '}
      — coming soon
    </div>
  )
}
