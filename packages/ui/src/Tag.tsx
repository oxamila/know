export function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 text-xs font-semibold text-white">
      #{label}
    </span>
  )
}
