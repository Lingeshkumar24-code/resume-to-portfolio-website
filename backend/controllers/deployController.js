import axios from 'axios';
import archiver from 'archiver';
import { Writable } from 'stream';
import Portfolio from '../models/Portfolio.js';
import Deployment from '../models/Deployment.js';

// Helper to buffer the zip file in memory
class BufferWritable extends Writable {
  constructor(options) {
    super(options);
    this.chunks = [];
  }
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }
  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

// Helper to generate the static standalone HTML index page
const generateStaticHtml = (portfolio) => {
  const { title, theme, sections } = portfolio;
  const font = theme.fontFamily || 'Inter';

  // Format arrays for insertion into HTML
  const skillsList = sections.skills || [];
  const projectList = sections.projects || [];
  const experienceList = sections.experience || [];
  const educationList = sections.education || [];
  const certificationList = sections.certifications || [];
  const contact = sections.contact || {};
  const hero = sections.hero || {};
  const about = sections.about || {};

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${sections.seo?.description || 'Professional Portfolio'}">
  <meta name="keywords" content="${sections.seo?.keywords || 'resume, portfolio'}">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: "${theme.primaryColor}",
            secondary: "${theme.secondaryColor}",
            bgColor: "${theme.backgroundColor}",
            textColor: "${theme.textColor}"
          },
          fontFamily: {
            custom: ["${font}", "sans-serif"]
          }
        }
      }
    }
  </script>

  <style>
    body {
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
    }
    .glow-effect {
      box-shadow: 0 0 25px -5px ${theme.primaryColor}60;
    }
  </style>
</head>
<body class="font-custom bg-bgColor text-textColor min-h-screen flex flex-col selection:bg-primary selection:text-white">

  <!-- Nav Header -->
  <nav class="sticky top-0 z-50 border-b border-white/5 bg-bgColor/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#" class="text-xl font-bold tracking-tight text-primary">
        ${hero.name || 'Portfolio'}
      </a>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#about" class="hover:text-primary transition-colors">About</a>
        ${skillsList.length > 0 ? `<a href="#skills" class="hover:text-primary transition-colors">Skills</a>` : ''}
        ${projectList.length > 0 ? `<a href="#projects" class="hover:text-primary transition-colors">Projects</a>` : ''}
        ${experienceList.length > 0 ? `<a href="#experience" class="hover:text-primary transition-colors">Experience</a>` : ''}
        ${educationList.length > 0 ? `<a href="#education" class="hover:text-primary transition-colors">Education</a>` : ''}
        <a href="#contact" class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity">
          Contact
        </a>
      </div>
      
      <!-- Mobile toggle -->
      <button onclick="toggleMenu()" class="md:hidden p-2 text-textColor hover:text-primary">
        <i data-lucide="menu" id="menu-icon" class="w-6 h-6"></i>
      </button>
    </div>

    <!-- Mobile Nav Menu -->
    <div id="mobile-menu" class="hidden md:hidden border-b border-white/5 bg-bgColor px-6 py-4 flex flex-col gap-4 text-center">
      <a href="#about" onclick="toggleMenu()" class="py-2 hover:text-primary">About</a>
      ${skillsList.length > 0 ? `<a href="#skills" onclick="toggleMenu()" class="py-2 hover:text-primary">Skills</a>` : ''}
      ${projectList.length > 0 ? `<a href="#projects" onclick="toggleMenu()" class="py-2 hover:text-primary">Projects</a>` : ''}
      ${experienceList.length > 0 ? `<a href="#experience" onclick="toggleMenu()" class="py-2 hover:text-primary">Experience</a>` : ''}
      ${educationList.length > 0 ? `<a href="#education" onclick="toggleMenu()" class="py-2 hover:text-primary">Education</a>` : ''}
      <a href="#contact" onclick="toggleMenu()" class="py-2 text-primary font-bold">Contact</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="relative overflow-hidden py-20 md:py-32 flex flex-col items-center justify-center text-center px-6 border-b border-white/5">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-primary/10 blur-[80px] -z-10"></div>
    
    ${hero.socialBio ? `<span class="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">Welcome to my space</span>` : ''}

    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
      Hi, I'm <span class="text-primary">${hero.name || 'Candidate'}</span>
    </h1>
    <p class="text-xl md:text-2xl font-medium text-textColor/80 mb-6 max-w-2xl">
      ${hero.title || 'Professional'}
    </p>
    <p class="text-md md:text-lg text-textColor/60 max-w-xl mb-8 leading-relaxed">
      ${hero.tagline || hero.subtitle || 'Glad you stopped by. Explore my work and history below.'}
    </p>

    <div class="flex flex-wrap items-center justify-center gap-4">
      <a href="#projects" class="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity">
        ${hero.ctaText || 'View Projects'}
      </a>
      <a href="#contact" class="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 font-semibold transition-colors">
        Get In Touch
      </a>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-20 max-w-4xl mx-auto px-6">
    <h2 class="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
      <i data-lucide="user" class="text-primary w-6 h-6"></i> About Me
    </h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="md:col-span-2 space-y-6">
        <p class="text-textColor/80 leading-relaxed text-lg whitespace-pre-wrap">
          ${about.bio || 'Professional summary loading...'}
        </p>
        ${about.brandingSuggestion ? `
          <div class="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm italic text-textColor/80">
            <strong class="text-primary block not-italic mb-1">Focus & Philosophy:</strong>
            ${about.brandingSuggestion}
          </div>
        ` : ''}
      </div>
      
      <div class="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
        <div>
          <h3 class="font-semibold text-lg mb-4 text-primary">Contact Details</h3>
          <ul class="space-y-3 text-sm text-textColor/70">
            ${contact.email ? `<li class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> ${contact.email}</li>` : ''}
            ${contact.phone ? `<li class="flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4"></i> ${contact.phone}</li>` : ''}
            ${contact.location ? `<li class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4"></i> ${contact.location}</li>` : ''}
          </ul>
        </div>
        
        <div class="mt-6 pt-6 border-t border-white/5 flex gap-4">
          ${contact.github ? `
            <a href="${contact.github}" target="_blank" class="p-2 rounded-lg bg-white/5 hover:text-primary hover:bg-white/10 transition-all">
              <i data-lucide="github" class="w-5 h-5"></i>
            </a>
          ` : ''}
          ${contact.linkedin ? `
            <a href="${contact.linkedin}" target="_blank" class="p-2 rounded-lg bg-white/5 hover:text-primary hover:bg-white/10 transition-all">
              <i data-lucide="linkedin" class="w-5 h-5"></i>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- Skills Section -->
  ${skillsList.length > 0 ? `
    <section id="skills" class="py-20 border-t border-white/5 bg-white/[0.01]">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-bold mb-10 flex items-center gap-3">
          <i data-lucide="code" class="text-primary w-6 h-6"></i> Skills
        </h2>
        <div class="grid sm:grid-cols-2 gap-6">
          ${skillsList.map(skill => `
            <div class="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-textColor">${skill.name}</span>
                <span class="text-xs text-primary font-semibold">${skill.level || 85}%</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div class="bg-primary h-full rounded-full" style="width: ${skill.level || 85}%"></div>
              </div>
              ${skill.category ? `<span class="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium tracking-wide rounded bg-primary/10 text-primary uppercase">${skill.category}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Projects Section -->
  ${projectList.length > 0 ? `
    <section id="projects" class="py-20 border-t border-white/5">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-bold mb-10 flex items-center gap-3">
          <i data-lucide="briefcase" class="text-primary w-6 h-6"></i> Projects
        </h2>
        <div class="grid md:grid-cols-2 gap-8">
          ${projectList.map(project => `
            <div class="group relative p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
              <div>
                <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                  ${project.title}
                  <i data-lucide="arrow-up-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </h3>
                <p class="text-textColor/70 text-sm mb-4 leading-relaxed">
                  ${project.enhancedDescription || project.description}
                </p>
              </div>
              <div>
                <div class="flex flex-wrap gap-2 mb-6">
                  ${(project.technologies || []).map(tech => `
                    <span class="px-2 py-1 text-xs rounded bg-white/5 text-textColor/60">${tech}</span>
                  `).join('')}
                </div>
                <div class="flex gap-4 text-xs font-semibold">
                  ${project.projectUrl ? `<a href="${project.projectUrl}" target="_blank" class="flex items-center gap-1 text-primary hover:underline">Live Demo <i data-lucide="external-link" class="w-3 h-3"></i></a>` : ''}
                  ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="flex items-center gap-1 text-textColor/80 hover:text-white hover:underline font-normal">GitHub <i data-lucide="github" class="w-3 h-3"></i></a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Experience Section -->
  ${experienceList.length > 0 ? `
    <section id="experience" class="py-20 border-t border-white/5 bg-white/[0.01]">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-bold mb-12 flex items-center gap-3">
          <i data-lucide="briefcase" class="text-primary w-6 h-6"></i> Professional Experience
        </h2>
        <div class="relative border-l border-white/10 pl-6 ml-4 space-y-12">
          ${experienceList.map(exp => `
            <div class="relative group">
              <div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bgColor border-2 border-primary group-hover:bg-primary transition-colors"></div>
              <span class="text-xs font-semibold text-primary block mb-1">${exp.duration}</span>
              <h3 class="text-xl font-bold text-textColor">${exp.role}</h3>
              <h4 class="text-md font-medium text-textColor/70 mb-3">${exp.company}</h4>
              <p class="text-textColor/60 text-sm leading-relaxed whitespace-pre-wrap">${exp.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Education Section -->
  ${educationList.length > 0 ? `
    <section id="education" class="py-20 border-t border-white/5">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-bold mb-12 flex items-center gap-3">
          <i data-lucide="graduation-cap" class="text-primary w-6 h-6"></i> Education
        </h2>
        <div class="relative border-l border-white/10 pl-6 ml-4 space-y-10">
          ${educationList.map(edu => `
            <div class="relative group">
              <div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bgColor border-2 border-primary group-hover:bg-primary transition-colors"></div>
              <span class="text-xs font-semibold text-primary block mb-1">${edu.duration}</span>
              <h3 class="text-xl font-bold text-textColor">${edu.degree}</h3>
              <h4 class="text-md font-medium text-textColor/70 mb-2">${edu.institution}</h4>
              ${edu.details ? `<p class="text-textColor/50 text-sm">${edu.details}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Certifications Section -->
  ${certificationList.length > 0 ? `
    <section id="certifications" class="py-20 border-t border-white/5 bg-white/[0.01]">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-bold mb-10 flex items-center gap-3">
          <i data-lucide="award" class="text-primary w-6 h-6"></i> Certifications
        </h2>
        <div class="grid sm:grid-cols-2 gap-6">
          ${certificationList.map(cert => `
            <div class="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-4">
              <i data-lucide="award" class="text-primary shrink-0 mt-1 w-6 h-6"></i>
              <div>
                <h3 class="font-bold text-textColor mb-1">${cert.name}</h3>
                <p class="text-textColor/60 text-sm">${cert.issuer}</p>
                ${cert.date ? `<p class="text-textColor/40 text-xs mt-1">${cert.date}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Contact Section -->
  <section id="contact" class="py-20 border-t border-white/5">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-4">Get In Touch</h2>
      <p class="text-textColor/60 mb-8 max-w-md mx-auto">
        Have a project in mind, a job opportunity, or just want to chat? Send me an email and I'll get back to you!
      </p>
      <a href="mailto:${contact.email || ''}" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity">
        Send Email <i data-lucide="mail" class="w-5 h-5"></i>
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="mt-auto border-t border-white/5 py-8 bg-bgColor text-center text-xs text-textColor/40">
    <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p>© ${new Date().getFullYear()} ${hero.name || 'Candidate'}. All rights reserved.</p>
      <p>Generated via Resume2Portfolio AI</p>
    </div>
  </footer>

  <script>
    // Initialize Lucide Icons
    lucide.createIcons();

    // Mobile Navigation Menu Toggle
    function toggleMenu() {
      const menu = document.getElementById('mobile-menu');
      const icon = document.getElementById('menu-icon');
      
      if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
      } else {
        menu.classList.add('hidden');
        icon.setAttribute('data-lucide', 'menu');
      }
      lucide.createIcons();
    }
  </script>
</body>
</html>
`;
};

// @desc    Deploy portfolio to Netlify
// @route   POST /api/portfolios/:id/deploy
// @access  Private
export const deployPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

    // Fail gracefully with a demo mock link if Token is missing
    if (!netlifyToken) {
      console.warn('Netlify Auth Token is missing. Simulating deployment...');
      
      const randomId = Math.random().toString(36).substring(2, 9);
      const mockUrl = `https://portfolio-${randomId}.netlify.app`;

      const deployment = await Deployment.create({
        user: req.user._id,
        portfolio: portfolio._id,
        netlifyId: `mock-id-${randomId}`,
        siteName: `portfolio-${randomId}`,
        url: mockUrl,
        status: 'success',
      });

      return res.status(201).json({
        success: true,
        message: 'Deployed in DEMO MODE (Netlify token missing in server env)',
        data: deployment,
      });
    }

    // Generate static HTML content
    const htmlContent = generateStaticHtml(portfolio);

    // Create Zip Archive in memory
    const zipStream = new BufferWritable();
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => { throw err; });
    archive.pipe(zipStream);
    archive.append(htmlContent, { name: 'index.html' });
    await archive.finalize();

    const zipBuffer = zipStream.toBuffer();

    // 1. Create a site on Netlify (if we don't have a deploy record, let's create a new site)
    // To make deployments simple and unique, we will create a site on every deploy, or we can look up if we have deployed this site before.
    let siteId = '';
    let siteUrl = '';
    let siteName = '';

    const existingDeploy = await Deployment.findOne({ portfolio: portfolio._id, status: 'success' });
    if (existingDeploy && existingDeploy.netlifyId && !existingDeploy.netlifyId.startsWith('mock-')) {
      siteId = existingDeploy.netlifyId;
      siteUrl = existingDeploy.url;
      siteName = existingDeploy.siteName;
    } else {
      // Create new Site
      const createSiteResponse = await axios.post(
        'https://api.netlify.com/api/v1/sites',
        {
          name: `resume2portfolio-${portfolio._id.toString().substring(18, 24)}-${Math.floor(Math.random() * 1000)}`,
        },
        {
          headers: {
            'Authorization': `Bearer ${netlifyToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      siteId = createSiteResponse.data.id;
      siteUrl = createSiteResponse.data.ssl_url || createSiteResponse.data.url;
      siteName = createSiteResponse.data.name;
    }

    // 2. Upload the ZIP buffer to Netlify deploys endpoint
    const deployResponse = await axios.post(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
      zipBuffer,
      {
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/zip',
        },
      }
    );

    // 3. Save Deployment in Database
    const deployment = await Deployment.create({
      user: req.user._id,
      portfolio: portfolio._id,
      netlifyId: siteId,
      siteName: siteName,
      url: siteUrl,
      status: 'success',
    });

    return res.status(201).json({
      success: true,
      message: 'Portfolio successfully deployed to Netlify!',
      data: deployment,
    });

  } catch (error) {
    console.error('Netlify deploy error:', error?.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to deploy to Netlify',
      error: error?.response?.data?.message || error.message 
    });
  }
};

// @desc    Get deployment history for current user
// @route   GET /api/deploys
// @access  Private
export const getMyDeployments = async (req, res) => {
  try {
    const deploys = await Deployment.find({ user: req.user._id })
      .populate('portfolio', 'title')
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: deploys.length, data: deploys });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
