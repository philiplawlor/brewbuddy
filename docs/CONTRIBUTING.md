# Contributing to BrewBuddy

Thank you for your interest in contributing to BrewBuddy! This guide will help you get started.

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Give credit where it's due

---

## Getting Started

### Prerequisites

- Docker Desktop
- Git
- Node.js 20+ (for local development without Docker)
- pnpm or npm

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/brewbuddy.git
   cd brewbuddy
   ```

3. Start the development environment:
   ```bash
   cp .env.example .env
   docker compose -f docker-compose.dev.yml up -d
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001/api

---

## Development Workflow

### Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `sprint-{n}` | Active sprint work |
| `feature/{name}` | Individual features |
| `fix/{name}` | Bug fixes |

### Branch Naming Convention

```
feature/add-water-calculator
fix/fermentation-chart-tooltip
docs/update-api-documentation
```

### Commit Messages

Follow Conventional Commits:

```
feat: add water chemistry calculator
fix: resolve fermentation chart tooltip issue
docs: update API documentation
style: format code with prettier
refactor: extract timer logic into custom hook
test: add unit tests for recipe calculations
chore: update dependencies
```

### Sprint Workflow

1. Create a sprint branch from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b sprint-1
   ```

2. Create feature branches from the sprint branch:
   ```bash
   git checkout -b feature/recipe-designer
   ```

3. Work on your feature, committing often

4. Push and create a PR to merge into the sprint branch

5. When the sprint is complete, merge to `main` and tag

---

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` type
- Use interfaces for object shapes
- Prefer `const` over `let`

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for props

### CSS

- Use CSS Modules or Tailwind CSS
- Follow the design system tokens
- Mobile-first responsive design
- Support dark mode

### API Design

- RESTful endpoints
- Consistent naming conventions
- Proper HTTP status codes
- Input validation on all endpoints
- Error responses with meaningful messages

---

## Testing

### Unit Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### Manual Testing

Before submitting a PR:

1. Test on mobile viewport (320px - 768px)
2. Test on desktop viewport (1024px+)
3. Test dark mode
4. Test with slow network (throttled)
5. Test offline mode (if applicable)

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] No console errors or warnings
- [ ] Responsive on mobile and desktop
- [ ] Dark mode works correctly
- [ ] Accessibility checked (keyboard nav, screen reader)
- [ ] Documentation updated (if applicable)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Mobile tested
- [ ] Dark mode tested

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Related Issues
Closes #123
```

### Review Process

1. Submit PR with description and screenshots
2. Wait for CI to pass
3. Address review comments
4. Get approval from at least one maintainer
5. Squash and merge

---

## Project Structure

```
brewbuddy/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API service functions
│   │   ├── types/      # TypeScript type definitions
│   │   └── styles/     # Global styles, theme
│   └── public/         # Static assets
│
├── backend/            # Express API
│   ├── src/
│   │   ├── routes/     # API route definitions
│   │   ├── controllers/# Request handlers
│   │   ├── models/     # MongoDB schemas
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── types/      # TypeScript type definitions
│   └── tests/          # Test files
│
├── docs/               # Documentation
└── scripts/            # Deployment scripts
```

---

## Adding Features

### New API Endpoint

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Create model in `backend/src/models/` (if new collection)
4. Add validation middleware
5. Update API documentation
6. Add tests

### New React Component

1. Create component in `frontend/src/components/`
2. Add TypeScript props interface
3. Export from component directory
4. Add stories (if using Storybook)
5. Add tests

### New Page

1. Create page in `frontend/src/pages/`
2. Add route in `App.tsx`
3. Add navigation item
4. Update documentation

---

## Design System

### Colors

Refer to `docs/PRD_UI.md` for the complete color palette.

### Components

Use the component library defined in `docs/PRD_UI.md`. If you need to add a new component:

1. Design according to the design principles
2. Support both light and dark modes
3. Make it responsive
4. Add accessibility features
5. Document usage examples

---

## Questions?

- Open a GitHub Discussion
- Ask in the team chat
- Review existing documentation

---

*Prepared by Sync (PM) - New England Sales Team*
