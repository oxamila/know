export function Tag({ label }: { label: string }) {
  return (
    <span className="bg-primary text-primary-foreground inline-flex h-5 w-fit shrink-0 items-center overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-medium">
      #{label}
    </span>
  )
}
