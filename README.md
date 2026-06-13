# Resume2Portfolio AI

Resume2Portfolio AI is a full-stack, AI-powered web application that allows users to upload their resume (in PDF, DOCX, or TXT format) and automatically generates a stunning, fully responsive portfolio website based on the resume contents. The resulting portfolio is fully customizable via an AI chat assistant, downloadable as a clean React/Tailwind codebase, and deployable to Render with a single click.

## Features

1. **Secure Authentication**: JWT-based login and registration with automatic administrator role assignment for the first user.
2. **Resume Upload & Parsing**: Drag-and-drop support for PDF, DOCX, and TXT files, extracting complete work history, education, skills, projects, and contact info.
3. **AI Content Analysis & Formatting**: Enhances descriptions, generates catchy taglines, classifies skills into visual categories, and provides SEO meta details using Groq (Llama 3).
4. **Interactive Editor**: Custom color adjustments, typography options, layout styles, and real-time responsiveness preview (Desktop, Tablet, Mobile frames).
5. **AI Customizer Chat**: Design changes ("Make the background a modern gradient dark purple", "Rewrite the hero tagline") executed instantly via conversational prompt commands.
6. **Code Export**: Packages the customized portfolio into a structured Vite + React + Tailwind CSS ZIP download.
7. **Render Deployment**: Publishes the app from one Render service that serves both the API and the built frontend.
8. **Admin Panel**: Dashboard displaying Platform metrics, format breakdown charts, and active deploy histories.

---

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, React Router
- **Backend**: Node.js, Express.js, Multer, PDF-Parse, Mammoth
- **Database**: MongoDB (Mongoose)
- **AI Engine**: Groq API (Llama 3 Model)
- **Deployment**: Render

---

## Folder Structure

```text
resume-website/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express request controllers
│   ├── middleware/         # Auth and rate-limiting middleware
│   ├── models/             # Mongoose Schemas (User, Resume, Portfolio, Deploy)
│   ├── routes/             # API Router definitions
│   ├── uploads/            # Multer temporary resume files
│   ├── .env.example        # Reference environment template
│   ├── .env                # Configured environment keys
│   ├── package.json        # Node server packages
│   └── server.js           # Server entry point
│
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # PortfolioPreview and Sidebar components
│   │   ├── context/        # AuthContext state provider
│   │   ├── pages/          # Login, Register, Dashboard, Editor, AdminPanel
│   │   ├── services/       # api.js axios configuration
│   │   ├── App.jsx         # Routing definitions
│   │   ├── index.css       # Global stylesheet (Tailwind directives)
│   │   └── main.jsx        # App entry point
│   ├── index.html          # Main HTML (Font pre-connects)
│   ├── vite.config.js      # Vite build configurations
│   ├── tailwind.config.js  # Tailwind theme definitions
│   └── package.json        # Frontend React packages
│
├── README.md               # Setup and documentation guide
└── implementation_plan.md  # Architectural details
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. The dependencies are already installed. Configure the `.env` file with your credentials:
   - `PORT`: Server port (default `5000`)
   - `MONGODB_URI`: Connection string (default `mongodb://localhost:27017/resume2portfolio`)
   - `JWT_SECRET`: Secure encryption key
   - `GROQ_API_KEY`: Groq Cloud Access Token (Llama 3 engine)
   - `NETLIFY_AUTH_TOKEN`: Netlify Personal Access Token (for deployments)

3. Start the backend API server:
   ```bash
   npm run start
   # or for development:
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. The dependencies are already installed. Run the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

### 3. Render Deployment
1. Push the repository to GitHub.
2. Create a new Render Web Service from the GitHub repo.
3. Use the included `render.yaml` blueprint or set these values manually:
   - Root directory: `backend`
   - Build command: `npm install && cd ../frontend && npm install && npm run build`
   - Start command: `yarn start`
4. Add these environment variables in Render:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `NETLIFY_AUTH_TOKEN` if your deploy flow still needs it
5. After the service deploys, Render will serve the React app and the API from the same URL.

### 4. GitHub Push
```bash
git init
git add .
git commit -m "Prepare Render deployment"
git branch -M main
git remote add origin https://github.com/Lingeshkumar24-code/resume-to-portfolio-website.git
git push -u origin main
```

---

## Sample Prompts for Groq API

Here are sample prompts used in the backend controllers to communicate with Llama 3:

### 1. Portfolio Generation Prompt
```text
System Prompt:
You are an expert resume parser and portfolio website designer. Your job is to extract data from the provided raw resume text and organize it into a structured, portfolio-ready JSON format.
You must enhance the project descriptions, write a compelling professional summary, classify skills, generate a branding suggestion, a tagline, a social bio, and SEO metadata.

Choose an appropriate theme based on the candidate's profession...
[Include full JSON Schema schema template output instructions]

User Prompt:
Parse the following raw resume text and generate the JSON portfolio data:
[Raw Resume Text Here]
```

### 2. AI Customizer Chat Prompt
```text
System Prompt:
You are a portfolio customizer AI. You are given a portfolio configuration JSON containing title, profession, theme parameters, and sections.
Your job is to read the user's instructions and modify the configuration JSON accordingly.
You can change typography, colors, layoutStyle, rewrite text sections, or even add/remove items.
You must preserve all properties that the user did not specify to change.
You MUST output a valid JSON matching the portfolio schema.

User Prompt:
Here is the current portfolio JSON:
[Current JSON Config]

User instructions for customization:
"Make the header accent text neon green and rewrite my experience bullet points to emphasize cloud architecture expertise."
```
