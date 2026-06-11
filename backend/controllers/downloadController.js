import archiver from 'archiver';
import Portfolio from '../models/Portfolio.js';

// @desc    Download generated portfolio source code as a ZIP
// @route   GET /api/portfolios/:id/download
// @access  Private
export const downloadPortfolioSource = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const { theme, sections } = portfolio;
    const font = theme.fontFamily || 'Inter';

    // Set Response Headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.title.replace(/[^a-zA-Z0-9]/g, '_')}_source.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle archive errors
    archive.on('error', (err) => {
      throw err;
    });

    // Pipe archive data to the response
    archive.pipe(res);

    // 1. package.json
    const packageJsonContent = JSON.stringify({
      name: "resume2portfolio-website",
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      dependencies: {
        "lucide-react": "^0.344.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@types/react": "^18.2.66",
        "@types/react-dom": "^18.2.22",
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.19",
        "postcss": "^8.4.38",
        "tailwindcss": "^3.4.3",
        "vite": "^5.2.11"
      }
    }, null, 2);
    archive.append(packageJsonContent, { name: 'package.json' });

    // 2. vite.config.js
    const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`;
    archive.append(viteConfigContent, { name: 'vite.config.js' });

    // 3. tailwind.config.js
    const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${theme.primaryColor}",
        secondary: "${theme.secondaryColor}",
        bgColor: "${theme.backgroundColor}",
        textColor: "${theme.textColor}",
      },
      fontFamily: {
        custom: ["${font}", "sans-serif"],
      }
    },
  },
  plugins: [],
}
`;
    archive.append(tailwindConfigContent, { name: 'tailwind.config.js' });

    // 4. postcss.config.js
    const postcssConfigContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    archive.append(postcssConfigContent, { name: 'postcss.config.js' });

    // 5. index.html
    const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${portfolio.title}</title>
    <meta name="description" content="${sections.seo?.description || 'My Professional Portfolio'}" />
    <meta name="keywords" content="${sections.seo?.keywords || 'portfolio, CV, resume'}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
  </head>
  <body class="font-custom bg-bgColor text-textColor antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
    archive.append(indexHtmlContent, { name: 'index.html' });

    // 6. src/main.jsx
    const mainJsxContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
    archive.append(mainJsxContent, { name: 'src/main.jsx' });

    // 7. src/index.css
    const indexCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: ${theme.backgroundColor};
  color: ${theme.textColor};
}

/* Custom visual utilities */
.glow-effect {
  box-shadow: 0 0 20px -5px ${theme.primaryColor}80;
}
.glassmorphism {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
`;
    archive.append(indexCssContent, { name: 'src/index.css' });

    // 8. src/App.jsx
    const appJsxContent = `import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Code, Award, ExternalLink, Github, Linkedin, Menu, X, ArrowUpRight
} from 'lucide-react';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const hero = ${JSON.stringify(sections.hero || {})};
  const about = ${JSON.stringify(sections.about || {})};
  const skills = ${JSON.stringify(sections.skills || [])};
  const experience = ${JSON.stringify(sections.experience || [])};
  const education = ${JSON.stringify(sections.education || [])};
  const projects = ${JSON.stringify(sections.projects || [])};
  const certifications = ${JSON.stringify(sections.certifications || [])};
  const contact = ${JSON.stringify(sections.contact || {})};

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-bgColor/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-xl font-bold tracking-tight text-primary">
            {hero.name || 'Portfolio'}
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            {skills.length > 0 && <a href="#skills" className="hover:text-primary transition-colors">Skills</a>}
            {projects.length > 0 && <a href="#projects" className="hover:text-primary transition-colors">Projects</a>}
            {experience.length > 0 && <a href="#experience" className="hover:text-primary transition-colors">Experience</a>}
            {education.length > 0 && <a href="#education" className="hover:text-primary transition-colors">Education</a>}
            <a href="#contact" className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity">
              Contact
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-textColor hover:text-primary">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-b border-white/5 bg-bgColor px-6 py-4 flex flex-col gap-4 text-center">
            <a href="#about" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">About</a>
            {skills.length > 0 && <a href="#skills" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Skills</a>}
            {projects.length > 0 && <a href="#projects" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Projects</a>}
            {experience.length > 0 && <a href="#experience" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Experience</a>}
            {education.length > 0 && <a href="#education" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Education</a>}
            <a href="#contact" onClick={() => setMenuOpen(false)} className="py-2 text-primary font-bold">Contact</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 flex flex-col items-center justify-center text-center px-6 border-b border-white/5">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-primary/10 blur-[80px] -z-10" />
        
        {hero.socialBio && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            Welcome to my space
          </span>
        )}

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Hi, I'm <span className="text-primary">{hero.name || 'Candidate'}</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-textColor/80 mb-6 max-w-2xl">
          {hero.title || 'Professional'}
        </p>
        <p className="text-md md:text-lg text-textColor/60 max-w-xl mb-8 leading-relaxed">
          {hero.tagline || hero.subtitle || 'Glad you stopped by. Explore my work and history below.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#projects" className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity">
            {hero.ctaText || 'View Projects'}
          </a>
          <a href="#contact" className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 font-semibold transition-colors">
            Get In Touch
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
          <User className="text-primary" /> About Me
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <p className="text-textColor/80 leading-relaxed text-lg whitespace-pre-wrap">
              {about.bio || 'Professional summary loading...'}
            </p>
            {about.brandingSuggestion && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm italic text-textColor/80">
                <strong className="text-primary block not-italic mb-1">Focus & Philosophy:</strong>
                {about.brandingSuggestion}
              </div>
            )}
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-primary">Contact Details</h3>
              <ul className="space-y-3 text-sm text-textColor/70">
                {contact.email && <li className="flex items-center gap-2"><Mail size={16} /> {contact.email}</li>}
                {contact.phone && <li className="flex items-center gap-2"><Phone size={16} /> {contact.phone}</li>}
                {contact.location && <li className="flex items-center gap-2"><MapPin size={16} /> {contact.location}</li>}
              </ul>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
              {contact.github && (
                <a href={contact.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:text-primary hover:bg-white/10 transition-all">
                  <Github size={20} />
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:text-primary hover:bg-white/10 transition-all">
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      {skills.length > 0 && (
        <section id="skills" className="py-20 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 flex items-center gap-3">
              <Code className="text-primary" /> Skills
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <div key={index} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-textColor">{skill.name}</span>
                    <span className="text-xs text-primary font-semibold">{skill.level || 85}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000" 
                      style={{ width: \`\${skill.level || 85}%\` }}
                    />
                  </div>
                  {skill.category && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium tracking-wide rounded bg-primary/10 text-primary uppercase">
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
        <section id="projects" className="py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 flex items-center gap-3">
              <Briefcase className="text-primary" /> Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <div key={index} className="group relative p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                      {project.title}
                      <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-textColor/70 text-sm mb-4 leading-relaxed">
                      {project.enhancedDescription || project.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies?.map((tech, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded bg-white/5 text-textColor/60">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs font-semibold">
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          Live Demo <ExternalLink size={12} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-textColor/80 hover:text-white hover:underline">
                          GitHub <Github size={12} />
                        </a>
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
        <section id="experience" className="py-20 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 flex items-center gap-3">
              <Briefcase className="text-primary" /> Professional Experience
            </h2>
            <div className="relative border-l border-white/10 pl-6 ml-4 space-y-12">
              {experience.map((exp, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bgColor border-2 border-primary group-hover:bg-primary transition-colors" />
                  <span className="text-xs font-semibold text-primary block mb-1">{exp.duration}</span>
                  <h3 className="text-xl font-bold text-textColor">{exp.role}</h3>
                  <h4 className="text-md font-medium text-textColor/70 mb-3">{exp.company}</h4>
                  <p className="text-textColor/60 text-sm leading-relaxed whitespace-pre-wrap">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <section id="education" className="py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 flex items-center gap-3">
              <GraduationCap className="text-primary" /> Education
            </h2>
            <div className="relative border-l border-white/10 pl-6 ml-4 space-y-10">
              {education.map((edu, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bgColor border-2 border-primary group-hover:bg-primary transition-colors" />
                  <span className="text-xs font-semibold text-primary block mb-1">{edu.duration}</span>
                  <h3 className="text-xl font-bold text-textColor">{edu.degree}</h3>
                  <h4 className="text-md font-medium text-textColor/70 mb-2">{edu.institution}</h4>
                  {edu.details && <p className="text-textColor/50 text-sm">{edu.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications.length > 0 && (
        <section id="certifications" className="py-20 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 flex items-center gap-3">
              <Award className="text-primary" /> Certifications
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {certifications.map((cert, index) => (
                <div key={index} className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-4">
                  <Award className="text-primary shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-textColor mb-1">{cert.name}</h3>
                    <p className="text-textColor/60 text-sm">{cert.issuer}</p>
                    {cert.date && <p className="text-textColor/40 text-xs mt-1">{cert.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-textColor/60 mb-8 max-w-md mx-auto">
            Have a project in mind, a job opportunity, or just want to chat? Send me an email and I'll get back to you!
          </p>
          <a href={\`mailto:\${contact.email || ''}\`} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity">
            Send Email <Mail size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 bg-bgColor text-center text-xs text-textColor/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {hero.name}. All rights reserved.</p>
          <p>Generated via Resume2Portfolio AI</p>
        </div>
      </footer>
    </div>
  );
}
`;
    archive.append(appJsxContent, { name: 'src/App.jsx' });

    // 9. README.md
    const readmeContent = `# Generated Portfolio website

This portfolio website was automatically generated from a resume using Resume2Portfolio AI.
It is built with Vite, React, and Tailwind CSS.

## Getting Started

1. Unpack the ZIP files.
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the local development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open the link displayed in your terminal (typically \`http://localhost:5173\`).

## Customization

- To update colors, fonts, or the theme setup, look at \`tailwind.config.js\`.
- To modify the layout structure, edit \`src/App.jsx\`.
- To style individual parts, use standard Tailwind CSS utility classes.
`;
    archive.append(readmeContent, { name: 'README.md' });

    // Finalize the archive (closes it to writing)
    archive.finalize();

  } catch (error) {
    console.error('ZIP generation error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to generate source code ZIP file' });
    }
  }
};
