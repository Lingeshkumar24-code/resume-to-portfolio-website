import axios from 'axios';
import Portfolio from '../models/Portfolio.js';
import Resume from '../models/Resume.js';

// Helper to clean JSON string from Groq if it returns markdown wrappers
const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return JSON.parse(cleaned.trim());
};

// @desc    Generate a portfolio from a parsed resume using Groq Llama 3
// @route   POST /api/portfolios/generate
// @access  Private
export const generatePortfolio = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Groq API Key is not configured in backend .env' 
      });
    }

    const systemPrompt = `You are an expert resume parser and portfolio website designer. Your job is to extract data from the provided raw resume text and organize it into a structured, portfolio-ready JSON format.
You must enhance the project descriptions, write a compelling professional summary, classify skills, generate a branding suggestion, a tagline, a social bio, and SEO metadata.

First, identify the candidate's profession: Developer, Designer, Data Scientist, AI Engineer, or a general category.
Choose an appropriate theme based on this profession:
1. Developer -> Dark Modern Theme: background hex "#0F172A" (slate-900), text hex "#F8FAFC", primary hex "#3B82F6" (blue-500), secondary hex "#1E293B", font "Inter", layout "modern-dark"
2. Designer -> Creative Gradient Theme: background hex "#090514", text hex "#FFFFFF", primary hex "#EC4899" (pink-500), secondary hex "#8B5CF6" (violet-500), font "Outfit", layout "creative-gradient"
3. Data Scientist -> Professional Blue Theme: background hex "#F8FAFC" (slate-50), text hex "#0F172A", primary hex "#0284C7" (sky-600), secondary hex "#0C4A6E", font "Roboto", layout "professional-blue"
4. AI Engineer -> Futuristic Dark Theme: background hex "#020617" (slate-950), text hex "#00FFCC", primary hex "#10B981" (emerald-500), secondary hex "#064E3B", font "Fira Code", layout "futuristic-dark"
5. Other -> Default Clean Theme: background hex "#FFFFFF", text hex "#1F2937", primary hex "#4F46E5" (indigo-600), secondary hex "#E0E7FF", font "Inter", layout "modern-dark"

You must output a valid JSON object matching the schema below. Do not include any text before or after the JSON.
{
  "title": "[Name]'s Portfolio",
  "profession": "[Detected Profession]",
  "theme": {
    "primaryColor": "[Chosen primary hex]",
    "secondaryColor": "[Chosen secondary hex]",
    "backgroundColor": "[Chosen background hex]",
    "textColor": "[Chosen text hex]",
    "fontFamily": "[Chosen font]",
    "layoutStyle": "[Chosen layoutStyle name]"
  },
  "sections": {
    "hero": {
      "name": "[Name]",
      "title": "[Professional title, e.g. Senior Frontend Engineer]",
      "subtitle": "[A brief catchy elevator pitch/intro]",
      "tagline": "[AI-generated portfolio tagline, e.g. 'Crafting clean, accessible code for modern web applications']",
      "ctaText": "View Projects",
      "socialBio": "[AI-generated social media bio, e.g. 'Senior Frontend Engineer | Passionate about React, UI/UX, and animations. Building the future of the web.']"
    },
    "about": {
      "bio": "[A full professional summary tailored for a website about section]",
      "brandingSuggestion": "[AI personal branding suggestion, e.g. 'Highlight your specialization in responsive design and micro-animations to stand out.']"
    },
    "skills": [
      { "name": "[Skill name]", "category": "[Frontend/Backend/Languages/DevOps/Data Science/AI/ML/Other]", "level": [Number between 60 and 100 representing expertise] }
    ],
    "experience": [
      { "company": "[Company Name]", "role": "[Role/Title]", "duration": "[Dates, e.g., June 2021 - Present]", "description": "[List of key accomplishments and tasks, formatted as bullet points or a cohesive paragraph]" }
    ],
    "education": [
      { "institution": "[University/Institution Name]", "degree": "[Degree earned, e.g., B.S. in Computer Science]", "duration": "[Dates, e.g., 2017 - 2021]", "details": "[GPA, achievements, or coursework]" }
    ],
    "projects": [
      { "title": "[Project Title]", "description": "[Original description if any]", "enhancedDescription": "[AI-enhanced detailed description showcasing impact, technologies, and achievements]", "technologies": ["[Tech name 1]", "[Tech name 2]"], "projectUrl": "", "githubUrl": "" }
    ],
    "certifications": [
      { "name": "[Certification Name]", "issuer": "[Issuer Name, e.g. AWS]", "date": "[Date earned]" }
    ],
    "contact": {
      "email": "[Candidate email from resume]",
      "phone": "[Candidate phone from resume]",
      "location": "[Candidate location from resume]",
      "github": "[Parsed GitHub link if any, else blank]",
      "linkedin": "[Parsed LinkedIn link if any, else blank]",
      "portfolio": "[Parsed website if any, else blank]"
    },
    "seo": {
      "title": "[SEO title tag for portfolio page]",
      "description": "[SEO description meta tag]",
      "keywords": "[comma-separated list of 10 relevant keywords]"
    }
  }
}`;

    const userPrompt = `Parse the following raw resume text and generate the JSON portfolio data:\n\n${resume.parsedText}`;

    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resultText = response.data.choices[0].message.content;
    let portfolioData;

    try {
      portfolioData = cleanJsonResponse(resultText);
    } catch (parseErr) {
      console.error('Failed to parse Groq response as JSON. Raw output:', resultText);
      return res.status(500).json({ 
        success: false, 
        message: 'AI generated invalid portfolio structure. Please try again.' 
      });
    }

    // Save to Database
    const portfolio = await Portfolio.create({
      user: req.user._id,
      resume: resume._id,
      title: portfolioData.title || `${portfolioData.sections?.hero?.name || 'My'}'s Portfolio`,
      profession: portfolioData.profession || 'Developer',
      theme: portfolioData.theme || {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E3A8A',
        backgroundColor: '#0F172A',
        textColor: '#F8FAFC',
        fontFamily: 'Inter',
        layoutStyle: 'modern-dark'
      },
      sections: portfolioData.sections,
    });

    // Update resume parsedJson cache
    resume.parsedJson = portfolioData.sections;
    await resume.save();

    return res.status(201).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('Portfolio generation error:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Server error during portfolio generation' });
  }
};

// @desc    Get all portfolios of current user
// @route   GET /api/portfolios
// @access  Private
export const getMyPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: portfolios.length, data: portfolios });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get a specific portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    return res.json({ success: true, data: portfolio });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update portfolio manually (Direct Save)
// @route   PUT /api/portfolios/:id
// @access  Private
export const updatePortfolio = async (req, res) => {
  try {
    const { title, profession, theme, sections } = req.body;

    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    if (title) portfolio.title = title;
    if (profession) portfolio.profession = profession;
    if (theme) portfolio.theme = theme;
    if (sections) portfolio.sections = sections;

    await portfolio.save();

    return res.json({ success: true, data: portfolio });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error during portfolio update' });
  }
};

// @desc    Customize portfolio via AI Chat
// @route   POST /api/portfolios/:id/customize
// @access  Private
export const customizePortfolioWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide customization instructions' });
    }

    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Groq API Key is not configured' 
      });
    }

    const systemPrompt = `You are a portfolio customizer AI. You are given a portfolio configuration JSON containing title, profession, theme parameters, and sections (hero, about, skills, experience, education, projects, certifications, contact, seo).
Your job is to read the user's instructions and modify the configuration JSON accordingly.
You can change the typography (theme.fontFamily), colors (theme.primaryColor, theme.secondaryColor, theme.backgroundColor, theme.textColor), layoutStyle (theme.layoutStyle), rewrite text sections (hero title, taglines, project descriptions, skills level, details, etc.), or even add/remove projects/skills/experience as requested.

Make sure to preserve all the properties that the user didn't ask to change.
Maintain the exact JSON structure.
You MUST output a valid JSON object matching the portfolio schema. Do not include any text before or after the JSON.

Theme and Font options:
- Fonts: Inter, Outfit, Roboto, Fira Code, Playfair Display, Poppins, Montserrat
- Colors: Any hex codes that look cohesive and modern. If they request a specific style (e.g. "sunset", "forest"), choose highly professional modern colors.
- LayoutStyles: "modern-dark", "creative-gradient", "professional-blue", "futuristic-dark", "minimal-light"

Portfolio Schema:
{
  "title": "...",
  "profession": "...",
  "theme": { "primaryColor": "...", "secondaryColor": "...", "backgroundColor": "...", "textColor": "...", "fontFamily": "...", "layoutStyle": "..." },
  "sections": {
    "hero": { "name": "...", "title": "...", "subtitle": "...", "tagline": "...", "ctaText": "...", "socialBio": "..." },
    "about": { "bio": "...", "brandingSuggestion": "..." },
    "skills": [ { "name": "...", "category": "...", "level": 80 } ],
    "experience": [ { "company": "...", "role": "...", "duration": "...", "description": "..." } ],
    "education": [ { "institution": "...", "degree": "...", "duration": "...", "details": "..." } ],
    "projects": [ { "title": "...", "description": "...", "enhancedDescription": "...", "technologies": [...], "projectUrl": "...", "githubUrl": "..." } ],
    "certifications": [ { "name": "...", "issuer": "...", "date": "..." } ],
    "contact": { "email": "...", "phone": "...", "location": "...", "github": "...", "linkedin": "...", "portfolio": "..." },
    "seo": { "title": "...", "description": "...", "keywords": "..." }
  }
}`;

    const currentPortfolioJson = JSON.stringify({
      title: portfolio.title,
      profession: portfolio.profession,
      theme: portfolio.theme,
      sections: portfolio.sections
    }, null, 2);

    const userPrompt = `Here is the current portfolio JSON:\n\n${currentPortfolioJson}\n\nUser instructions for customization:\n"${message}"`;

    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resultText = response.data.choices[0].message.content;
    let updatedData;

    try {
      updatedData = cleanJsonResponse(resultText);
    } catch (parseErr) {
      console.error('Failed to parse Groq customizer response. Raw text:', resultText);
      return res.status(500).json({ 
        success: false, 
        message: 'AI generated invalid configuration format. Please rephrase your instructions.' 
      });
    }

    // Apply updates
    if (updatedData.title) portfolio.title = updatedData.title;
    if (updatedData.profession) portfolio.profession = updatedData.profession;
    if (updatedData.theme) portfolio.theme = updatedData.theme;
    if (updatedData.sections) portfolio.sections = updatedData.sections;

    await portfolio.save();

    return res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('Portfolio AI customization error:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Server error during AI customization' });
  }
};

// @desc    Delete a portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    await portfolio.deleteOne();
    return res.json({ success: true, message: 'Portfolio removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
