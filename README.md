# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/eef97119-d2f1-45c4-b78c-cce0b2ceec5e

## 🚀 neXed MVP - Visa Compliance Management Platform

neXed is an intelligent visa management platform designed specifically for international students. Our MVP focuses on core features that help students stay compliant, organized, and stress-free.

### 🎯 Core MVP Features
- **Dashboard**: Overview of visa status and important deadlines
- **Document Vault**: Secure storage and management of visa documents
- **User Profile**: Complete profile management with visa information
- **Onboarding**: Streamlined user setup process
- **Authentication**: Secure login/signup with Supabase

### 🔒 Features Locked for MVP
- Compliance Hub (AI-powered compliance tracking)
- AI Assistant (24/7 immigration guidance)
- Advanced Settings (Advanced customization)
- DSO Features (Designated School Official tools)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase CLI (optional)

### Quick Start
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd nexed-s-mvp-1

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
Create the following environment files:

```bash
# .env.development
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_ENVIRONMENT=development

# .env.test
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key
VITE_ENVIRONMENT=test

# .env.staging
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_ENVIRONMENT=staging
```

## 🤖 CodeRabbit Integration

This project uses CodeRabbit for AI-powered code reviews. 

### Setup CodeRabbit
1. **Install Extension**: Install CodeRabbit extension in Cursor/VS Code
2. **Get API Key**: Sign up at [coderabbit.ai](https://coderabbit.ai) and get your API key
3. **Configure**: Add your API key to Cursor settings
4. **GitHub Integration**: Connect your GitHub account

### CodeRabbit Features
- **Automated PR Reviews**: AI reviews every pull request
- **Security Scanning**: Identifies security vulnerabilities
- **Performance Analysis**: Checks for performance issues
- **Best Practices**: Suggests code improvements
- **MVP Compliance**: Ensures MVP feature standards

### Configuration Files
- `.coderabbit.yaml`: Main configuration file
- `.github/pull_request_template.md`: PR template with CodeRabbit integration
- `.github/workflows/coderabbit.yml`: GitHub Actions workflow

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### Test Coverage
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- Coverage target: 80%+

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Build
```bash
# Production build
npm run build

# Staging build
npm run build:staging

# Test build
npm run build:test
```

### Preview
```bash
npm run preview
```

## 📋 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical fixes

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and commit with conventional commits
3. Create PR with detailed description
4. CodeRabbit automatically reviews
5. Manual review and approval
6. Merge to `develop`
7. Deploy to staging for testing
8. Merge to `main` for production

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:staging    # Build for staging
npm run build:test       # Build for testing
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run E2E tests
npm run type-check       # TypeScript type checking

# Code Quality
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── common/         # Common components
│   ├── dashboard/      # Dashboard components
│   ├── documents/      # Document management
│   └── onboarding/     # Onboarding components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # API services
├── utils/              # Utility functions
├── types/              # TypeScript types
├── config/             # Configuration files
└── integrations/       # Third-party integrations
```

## 🔐 Security

- **Authentication**: Supabase Auth with RLS policies
- **Data Encryption**: End-to-end encryption for sensitive data
- **Input Validation**: Server-side and client-side validation
- **Security Scanning**: Automated security checks via CodeRabbit

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Performance considered

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for international students**

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/eef97119-d2f1-45c4-b78c-cce0b2ceec5e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Project Overview

This project is a web application built with Vite, React, TypeScript, and Shadcn UI. It provides a foundation for developing modern user interfaces and includes components for various UI elements like forms, navigation, and data display.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to set up your development environment, run tests, and submit changes.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/eef97119-d2f1-45c4-b78c-cce0b2ceec5e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
