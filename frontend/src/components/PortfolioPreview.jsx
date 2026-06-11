import React from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Code, Award, ExternalLink, ArrowUpRight
} from 'lucide-react';

const GithubIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export default function PortfolioPreview({ data }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
        <p>No preview data available. Please generate a portfolio first.</p>
      </div>
    );
  }

  const { theme, sections } = data;
  const primary = theme?.primaryColor || '#3B82F6';
  const secondary = theme?.secondaryColor || '#1E3A8A';
  const background = theme?.backgroundColor || '#0F172A';
  const textColor = theme?.textColor || '#F8FAFC';
  const font = theme?.fontFamily || 'Inter';

  // Apply typography font family style
  const fontStyle = {
    fontFamily: `"${font}", sans-serif`,
    backgroundColor: background,
    color: textColor
  };

  // Layout specific customizations
  let containerStyle = { ...fontStyle };
  if (theme?.layoutStyle === 'creative-gradient') {
    containerStyle.background = `linear-gradient(135deg, ${background} 0%, #170d2b 100%)`;
  } else if (theme?.layoutStyle === 'futuristic-dark') {
    containerStyle.fontFamily = '"Fira Code", monospace';
  } else if (theme?.layoutStyle === 'professional-blue') {
    containerStyle.fontFamily = '"Roboto", sans-serif';
  }

  const hero = sections?.hero || {};
  const about = sections?.about || {};
  const skills = sections?.skills || [];
  const experience = sections?.experience || [];
  const education = sections?.education || [];
  const projects = sections?.projects || [];
  const certifications = sections?.certifications || [];
  const contact = sections?.contact || {};

  return (
    <div style={containerStyle} className="w-full min-h-screen flex flex-col antialiased select-none text-left overflow-y-auto">
      {/* Mock Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md py-4 px-6 flex justify-between items-center" style={{ backgroundColor: `${background}CC` }}>
        <a href="#" className="text-lg font-bold tracking-tight" style={{ color: primary }}>
          {hero.name || 'Portfolio'}
        </a>
        <div className="flex items-center gap-6 text-sm font-medium opacity-80">
          <a href="#about" className="hover:opacity-100 cursor-pointer hover:text-white transition-colors">About</a>
          {skills.length > 0 && <a href="#skills" className="hover:opacity-100 cursor-pointer hover:text-white transition-colors">Skills</a>}
          {projects.length > 0 && <a href="#projects" className="hover:opacity-100 cursor-pointer hover:text-white transition-colors">Projects</a>}
          <a href="#contact" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: primary }}>
            Contact
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 flex flex-col items-center justify-center text-center px-6 border-b border-white/5">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[80px] -z-10 opacity-30" style={{ backgroundColor: primary }} />
        
        {hero.socialBio && (
          <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full border mb-4 text-xs" style={{ backgroundColor: `${primary}15`, borderColor: `${primary}30`, color: primary }}>
            Welcome to my portfolio
          </span>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
          Hi, I'm <span style={{ color: primary }}>{hero.name || 'Candidate'}</span>
        </h1>
        <p className="text-lg md:text-xl font-medium mb-4 opacity-90">
          {hero.title || 'Professional'}
        </p>
        <p className="text-sm md:text-md opacity-60 max-w-lg mb-6 leading-relaxed">
          {hero.tagline || hero.subtitle || 'Glad you stopped by. Explore my work and history below.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: primary }}>
            {hero.ctaText || 'View Projects'}
          </span>
          <span className="px-5 py-2.5 rounded-lg text-sm border font-semibold cursor-pointer border-white/10 hover:bg-white/5 transition-colors">
            Get In Touch
          </span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 max-w-4xl mx-auto px-6 w-full">
        <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
          <User size={20} style={{ color: primary }} /> About Me
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <p className="opacity-80 leading-relaxed text-sm whitespace-pre-wrap">
              {about.bio || 'Summary is being created...'}
            </p>
            {about.brandingSuggestion && (
              <div className="p-3.5 rounded-lg text-xs italic border" style={{ backgroundColor: `${primary}05`, borderColor: `${primary}15` }}>
                <strong className="block not-italic mb-1 font-semibold" style={{ color: primary }}>Personal Branding Tip:</strong>
                {about.brandingSuggestion}
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col justify-between h-fit">
            <div>
              <h3 className="font-semibold text-sm mb-3" style={{ color: primary }}>Details</h3>
              <ul className="space-y-2.5 text-xs opacity-75">
                {contact.email && <li className="flex items-center gap-2 truncate"><Mail size={14} /> {contact.email}</li>}
                {contact.phone && <li className="flex items-center gap-2 truncate"><Phone size={14} /> {contact.phone}</li>}
                {contact.location && <li className="flex items-center gap-2 truncate"><MapPin size={14} /> {contact.location}</li>}
              </ul>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
              {contact.github && (
                <span className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer" style={{ color: primary }}>
                  <GithubIcon size={16} />
                </span>
              )}
              {contact.linkedin && (
                <span className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer" style={{ color: primary }}>
                  <LinkedinIcon size={16} />
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      {skills.length > 0 && (
        <section id="skills" className="py-16 border-t border-white/5 bg-white/[0.01] w-full">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-2">
              <Code size={20} style={{ color: primary }} /> Skills
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {skills.map((skill, index) => (
                <div key={index} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-xs">{skill.name}</span>
                    <span className="text-[10px] font-semibold" style={{ color: primary }}>{skill.level || 85}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ width: `${skill.level || 85}%`, backgroundColor: primary }}
                    />
                  </div>
                  {skill.category && (
                    <span className="inline-block mt-2 px-1.5 py-0.5 text-[8px] font-semibold tracking-wider rounded text-white" style={{ backgroundColor: `${primary}30`, color: '#FFF' }}>
                      {skill.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section id="projects" className="py-16 border-t border-white/5 w-full">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-2">
              <Briefcase size={20} style={{ color: primary }} /> Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <div key={index} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-bold mb-1.5 group-hover:text-primary transition-colors flex items-center justify-between">
                      {project.title}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: primary }} />
                    </h3>
                    <p className="opacity-75 text-xs mb-3.5 leading-relaxed">
                      {project.enhancedDescription || project.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies?.map((tech, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-white/5 opacity-60">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold">
                      {project.projectUrl && (
                        <span className="flex items-center gap-1 cursor-pointer" style={{ color: primary }}>
                          Live Demo <ExternalLink size={10} />
                        </span>
                      )}
                      {project.githubUrl && (
                        <span className="flex items-center gap-1 opacity-70 cursor-pointer hover:opacity-100">
                          GitHub <GithubIcon size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <section id="experience" className="py-16 border-t border-white/5 bg-white/[0.01] w-full">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-bold mb-10 flex items-center gap-2">
              <Briefcase size={20} style={{ color: primary }} /> Experience
            </h2>
            <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="relative group text-left">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 transition-colors group-hover:bg-primary" style={{ borderColor: primary, backgroundColor: background }} />
                  <span className="text-[10px] font-semibold block mb-0.5" style={{ color: primary }}>{exp.duration}</span>
                  <h3 className="text-md font-bold">{exp.role}</h3>
                  <h4 className="text-xs font-semibold opacity-75 mb-2">{exp.company}</h4>
                  <p className="opacity-60 text-xs leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <section id="education" className="py-16 border-t border-white/5 w-full">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-bold mb-10 flex items-center gap-2">
              <GraduationCap size={20} style={{ color: primary }} /> Education
            </h2>
            <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-8">
              {education.map((edu, index) => (
                <div key={index} className="relative group text-left">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 transition-colors group-hover:bg-primary" style={{ borderColor: primary, backgroundColor: background }} />
                  <span className="text-[10px] font-semibold block mb-0.5" style={{ color: primary }}>{edu.duration}</span>
                  <h3 className="text-md font-bold">{edu.degree}</h3>
                  <h4 className="text-xs font-semibold opacity-75 mb-1.5">{edu.institution}</h4>
                  {edu.details && <p className="opacity-50 text-[11px]">{edu.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications.length > 0 && (
        <section id="certifications" className="py-16 border-t border-white/5 bg-white/[0.01] w-full">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-2">
              <Award size={20} style={{ color: primary }} /> Certifications
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div key={index} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3">
                  <Award size={20} className="shrink-0 mt-0.5" style={{ color: primary }} />
                  <div>
                    <h3 className="font-bold text-xs">{cert.name}</h3>
                    <p className="opacity-60 text-[11px]">{cert.issuer}</p>
                    {cert.date && <p className="opacity-40 text-[9px] mt-0.5">{cert.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Footer Section */}
      <section id="contact" className="py-16 border-t border-white/5 w-full bg-black/5 mt-auto">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
            <Mail size={20} style={{ color: primary }} /> Contact Me
          </h2>
          <p className="opacity-60 text-xs max-w-sm mx-auto leading-relaxed">
            If you'd like to get in touch, feel free to send me an email. I'll get back to you as soon as possible!
          </p>
          <a 
            href={`mailto:${contact.email || ''}`}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Send Email <Mail size={14} />
          </a>
        </div>
        <div className="mt-12 text-center text-[10px] opacity-40">
          <p className="mb-1">Generated via Resume2Portfolio AI</p>
          <p>© {new Date().getFullYear()} {hero.name || 'Candidate'}. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}
