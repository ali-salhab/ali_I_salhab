import { Github, Linkedin, Mail, Heart } from 'lucide-react'
import { PersonalInfo } from '../types/portfolio'

interface FooterProps {
  personal: PersonalInfo
}

export default function Footer({ personal }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
              bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30">
              {personal.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <span className="font-display font-semibold text-white/70 text-sm">{personal.name}</span>
          </div>

          {/* Copyright */}
          <p className="text-white/30 text-sm flex items-center gap-1.5">
            © {year} — Built by <Heart size={12} className="text-violet-400" fill="currentColor" /> {personal.name}
          </p>

          {/* Social links */}
          <div className="flex gap-3">
            {personal.github && (
              <a href={personal.github} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center
                  text-white/40 hover:text-white hover:border-white/20 transition-all duration-300">
                <Github size={16} />
              </a>
            )}
            {personal.linkedin && (
              <a href={personal.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center
                  text-white/40 hover:text-white hover:border-white/20 transition-all duration-300">
                <Linkedin size={16} />
              </a>
            )}
            <a href={`mailto:${personal.email}`}
              className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center
                text-white/40 hover:text-white hover:border-white/20 transition-all duration-300">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
