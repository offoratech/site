import { Play, ImageIcon, Expand } from 'lucide-react'

const gradients = [
  'from-[#7fa3c9]/20 via-ink-soft to-ink',
  'from-brand/15 via-ink-soft to-ink',
  'from-[#c99b7f]/15 via-ink-soft to-ink',
  'from-[#a68fc9]/15 via-ink-soft to-ink',
]

export default function GalleryItem({ item, index, categoryLabel, isVideo, onOpen }) {
  const Icon = isVideo ? Play : ImageIcon

  return (
    <button
      type="button"
      data-cursor-hover
      onClick={() => onOpen(item)}
      className={`group relative block h-72 w-56 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:h-96 sm:w-72 ${gradients[index % gradients.length]}`}
    >
      {item.poster && (
        <img
          src={item.poster}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-bone/15 bg-ink/30 text-bone/80 backdrop-blur transition-transform duration-500 group-hover:scale-110">
          <Icon size={20} strokeWidth={1.5} />
        </span>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/20 to-transparent p-5">
        <p className="text-[10px] font-medium tracking-[0.1em] text-brand">
          {categoryLabel}
        </p>
        <p className="mt-1 font-display text-sm font-medium text-bone">{item.title}</p>
      </div>

      <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-bone opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
        <Expand size={13} />
      </span>

      <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  )
}
