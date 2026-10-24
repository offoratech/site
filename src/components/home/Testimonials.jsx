import { clients } from '../../data/clients.js'
import { CircularTestimonials } from '../ui/CircularTestimonials.jsx'
import TextReveal from '../ui/TextReveal.jsx'
import Kicker from '../ui/Kicker.jsx'

// Placeholder quotes only - deliberately generic until real client feedback
// is dropped in. Names/logos are real (same clients as the brands section
// above), the words are not attributed to anything anyone actually said.
const testimonials = [
  {
    src: clients.find((c) => c.id === 'beetzo').logo,
    name: 'Beetzo',
    designation: 'Founder & CEO',
    quote:
      'Offora handled the build and the marketing together, so we never had to explain the same thing twice to two different teams.',
  },
  {
    src: clients.find((c) => c.id === 'aasife-biriyani').logo,
    name: 'Aasife Biriyani',
    designation: 'Managing Director',
    quote:
      'They actually took the time to understand how our business runs before touching anything. That showed in the final result.',
  },
  {
    src: clients.find((c) => c.id === 'global-hospital').logo,
    name: 'Global Mission Hospital',
    designation: 'Executive Director',
    quote:
      'Straightforward to work with, no hand-offs, no lost context. Questions got answered by someone who actually knew the project.',
  },
  {
    src: clients.find((c) => c.id === 'hidude').logo,
    name: 'Hidude',
    designation: 'Founder & CEO',
    quote:
      'Fast turnaround and the site still looks and works the way we wanted six months later, not just on launch day.',
  },
  {
    src: clients.find((c) => c.id === 'st-michael').logo,
    name: 'St. Michael College of Engineering and Technology',
    designation: 'Principal',
    quote:
      'One team for the website and the outreach meant fewer meetings and things actually got done on time.',
  },
]

export default function Testimonials() {
  return (
    <section className="container-offora pb-32 sm:pb-44">
      <Kicker>What Clients Say</Kicker>
      <h2 className="font-display max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-bone sm:text-6xl">
        <TextReveal text="Don't just take our word for it." />
      </h2>

      <div className="mt-20 flex justify-center">
        <CircularTestimonials testimonials={testimonials} autoplay />
      </div>
    </section>
  )
}
