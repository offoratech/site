import { useEffect, useState } from 'react'

function istNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const hour24 = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hourCycle: 'h23' }).format(new Date()),
  )
  return {
    day: get('weekday'),
    time: `${get('hour')}:${get('minute')} ${get('dayPeriod')}`,
    hour24,
  }
}

/** Live Tamil Nadu time with an honest open/closed note based on Mon–Sat, 9 AM–7 PM IST. */
export function LocalTime() {
  const [now, setNow] = useState(istNow)
  useEffect(() => {
    const id = window.setInterval(() => setNow(istNow()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const sunday = now.day === 'Sun'
  const open = !sunday && now.hour24 >= 9 && now.hour24 < 19
  const note = open
    ? 'We’re at our desks.'
    : sunday
      ? 'It’s Sunday. Email anyway, we’ll see it Monday.'
      : 'We’re offline. Email anyway.'

  return (
    <p className="localtime">
      <span className={`localtime__dot${open ? ' is-open' : ''}`} aria-hidden="true" />
      <span>
        <span className="localtime__time">{now.time}</span> in Tamil Nadu. {note}
      </span>
    </p>
  )
}
