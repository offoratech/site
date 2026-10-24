import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { CtaButton } from '../ui/CtaButton.jsx'

const budgets = ['Under ₹1L', '₹1L – 5L', '₹5L – 15L', '₹15L+']
const interests = ['Technical Development', 'Digital Marketing', 'Both']

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [budget, setBudget] = useState(budgets[1])
  const [interest, setInterest] = useState(interests[2])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="relative border-t border-line pt-12 lg:border-t-0 lg:border-l lg:pl-16 lg:pt-0">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[420px] flex-col items-start justify-center"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-brand text-brand"
            >
              <CheckCircle2 size={26} />
            </motion.span>
            <h2 className="font-display mt-8 text-3xl font-medium text-bone sm:text-4xl">
              Message received.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">
              Thanks for reaching out. One of us will personally get back to you within
              24 hours.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              data-cursor-hover
              className="mt-8 text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit}
            className="space-y-10"
          >
            <div>
              <h2 className="font-display text-3xl font-medium text-bone sm:text-4xl">
                Tell us about your business
              </h2>
              <p className="mt-3 text-sm text-mute">
                The more you tell us, the less time we waste on the first call.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <Field label="Full Name" name="name" placeholder="Jane Doe" required />
              <Field label="Business Email" name="email" type="email" placeholder="jane@company.com" required />
              <Field label="Phone" name="phone" type="tel" placeholder="+91 00000 00000" />
              <Field label="Company" name="company" placeholder="Company name" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <SelectPills label="I'm interested in" options={interests} value={interest} onChange={setInterest} />
              <SelectPills label="Estimated budget" options={budgets} value={budget} onChange={setBudget} />
            </div>

            <div>
              <label htmlFor="message" className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-mute">
                Project details
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="What are you looking to build or grow?"
                className="w-full resize-none border-b border-line bg-transparent py-3 text-base text-bone placeholder:text-mute/50 outline-none transition-colors focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:text-sm"
              />
            </div>

            <CtaButton
              type="submit"
              className="hover:shadow-[0_0_45px_-8px_var(--color-brand)]"
            >
              Send Message
            </CtaButton>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, name, type = 'text', placeholder, required }) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-mute">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border-b border-line bg-transparent py-3 text-base text-bone placeholder:text-mute/50 outline-none transition-colors focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:text-sm"
      />
    </div>
  )
}

function SelectPills({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-mute">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            data-cursor-hover
            onClick={() => onChange(option)}
            className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-colors active:scale-95 ${
              value === option
                ? 'border-brand text-brand'
                : 'border-line text-mute hover:text-bone'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
