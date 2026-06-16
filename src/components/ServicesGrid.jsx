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
import { SERVICE_OVERVIEWS } from '../data/serviceOverviews'

const SERVICE_META = {
  'anxiety-depression': {
    icon: Brain,
    desc: 'Counselling, coaching, and wellbeing supports for anxiety, depression, and everyday stress.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  'trauma-ptsd': {
    icon: Flame,
    desc: 'Trauma-informed options focused on safety, stabilisation, and recovery.',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  'support-groups': {
    icon: Users,
    desc: 'Peer-led and facilitated groups to share experiences and build connection.',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  'youth-services': {
    icon: Baby,
    desc: 'Age-appropriate support for children, teenagers, young adults, and families.',
    color: 'bg-pink-50 text-pink-600 border-pink-100',
  },
  'relationships-family': {
    icon: HeartHandshake,
    desc: 'Support for families, carers, parenting, relationships, and household stress.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  'substance-use': {
    icon: Pill,
    desc: 'Non-judgemental support where mental health and substance use concerns overlap.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  'aged-care-support': {
    icon: LucideHeart,
    desc: 'Mental wellness, navigation, and community support for older Canberrans.',
    color: 'bg-teal-50 text-teal-600 border-teal-100',
  },
  'eating-disorders': {
    icon: BookOpen,
    desc: 'Help finding care planning, referral pathways, and recovery support.',
    color: 'bg-green-50 text-green-600 border-green-100',
  },
}

export default function ServicesGrid({ onOpenService }) {
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
          {SERVICE_OVERVIEWS.map(({ slug, title }) => {
            const { icon: Icon, desc, color } = SERVICE_META[slug]
            return (
            <button
              key={title}
              onClick={() => onOpenService(slug)}
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
            )
          })}
        </div>
      </div>
    </section>
  )
}
