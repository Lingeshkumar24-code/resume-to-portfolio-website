import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  theme: {
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#1E3A8A' },
    backgroundColor: { type: String, default: '#0F172A' },
    textColor: { type: String, default: '#F8FAFC' },
    fontFamily: { type: String, default: 'Inter' },
    layoutStyle: { type: String, default: 'modern-dark' }
  },
  sections: {
    hero: {
      name: { type: String },
      title: { type: String },
      subtitle: { type: String },
      tagline: { type: String },
      ctaText: { type: String },
      socialBio: { type: String },
    },
    about: {
      bio: { type: String },
      brandingSuggestion: { type: String },
    },
    skills: [
      {
        name: { type: String },
        category: { type: String }, // e.g. Frontend, Backend, Devops
        level: { type: Number, default: 85 }, // percentage representation
      }
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
        description: { type: String },
      }
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        duration: { type: String },
        details: { type: String },
      }
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        enhancedDescription: { type: String },
        technologies: [{ type: String }],
        projectUrl: { type: String },
        githubUrl: { type: String },
      }
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        date: { type: String },
      }
    ],
    contact: {
      email: { type: String },
      phone: { type: String },
      location: { type: String },
      github: { type: String },
      linkedin: { type: String },
      portfolio: { type: String },
    },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: String },
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field on save
portfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
