import {
  Brain,
  Flame,
  Users,
  Baby,
  HeartHandshake,
  Pill,
  LucideHeart,
  BookOpen,
} from 'lucide-react'

const SERVICES = [
  {
    icon: Brain,
    title: 'Anxiety & Depression',
    desc: 'Evidence-based counselling for anxiety, depression, and mood disorders.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Flame,
    title: 'Trauma & PTSD',
    desc: 'Specialist trauma-informed care in a safe, supportive environment.',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    icon: Users,
    title: 'Support Groups',
    desc: 'Peer-led and facilitated groups to share experiences and build resilience.',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    icon: Baby,
    title: 'Youth Services',
    desc: 'Age-appropriate support for children, teens, and young adults.',
    color: 'bg-pink-50 text-pink-600 border-pink-100',
  },
  {
    icon: HeartHandshake,
    title: 'Relationships & Family',
    desc: 'Couples counselling, family therapy, and parenting support.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: Pill,
    title: 'Substance Use',
    desc: 'Non-judgmental support for alcohol and drug-related challenges.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: LucideHeart,
    title: 'Aged Care Support',
    desc: 'Mental wellness services designed for older Canberrans.',
    color: 'bg-teal-50 text-teal-600 border-teal-100',
  },
  {
    icon: BookOpen,
    title: 'Eating Disorders',
    desc: 'Specialist eating disorder treatment and recovery support.',
    color: 'bg-green-50 text-green-600 border-green-100',
  },
]

export default function ServicesGrid() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Services available
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Whatever you're going through, there's a service in Canberra that can help.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map(({ icon: Icon, title, desc, color }) => (
            <button
              key={title}
              className="group text-left p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
