# Contributing to Sequence Game

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend testing)
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/your-username/sequence.git
cd sequence

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your Supabase credentials

# Start development server
npm run dev
```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types, avoid `any` when possible
- Use interfaces for object shapes
- Export types from `src/types/`

### React
- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for reusable logic
- Follow React best practices

### Naming Conventions
- Components: PascalCase (e.g., `BoardCell.tsx`)
- Functions: camelCase (e.g., `validateMove`)
- Constants: UPPER_SNAKE_CASE (e.g., `BOARD_SIZE`)
- Types/Interfaces: PascalCase (e.g., `Card`, `Player`)

### File Structure
```
src/
  components/   # React components
  hooks/        # Custom hooks
  lib/          # Core logic, utilities
  pages/        # Route pages
  stores/       # State management
  types/        # TypeScript types
  utils/        # Helper functions
```

## Commit Messages

Follow conventional commits:

```
feat: add spectator mode
fix: correct sequence detection for diagonal
docs: update deployment guide
style: format code with prettier
refactor: simplify move validation
test: add unit tests for card logic
chore: update dependencies
```

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow existing patterns
   - Add comments for complex logic

3. **Test Changes**
   - Test manually
   - Ensure no console errors
   - Verify on mobile/desktop

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push to Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Use clear title and description
   - Reference any related issues
   - Add screenshots for UI changes

## Areas for Contribution

### High Priority
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Mobile optimization
- [ ] Accessibility improvements

### Features
- [ ] Spectator mode
- [ ] In-game chat
- [ ] Game history/replay
- [ ] Player statistics
- [ ] Custom game rules
- [ ] Tournament mode
- [ ] AI opponent
- [ ] Sound effects
- [ ] Animations improvements

### Bug Fixes
- Check open issues
- Test edge cases
- Improve validation

### Documentation
- Add code comments
- Improve README
- Add tutorials
- API documentation

## Testing Guidelines

### Manual Testing
- Test on multiple browsers
- Test on mobile devices
- Test with multiple players
- Test edge cases (see TESTING.md)

### Code Quality
- Run linter: `npm run lint`
- Format code: `npm run format`
- No TypeScript errors
- No console warnings

## Database Changes

If adding database features:

1. Create migration file in `supabase/migrations/`
2. Number sequentially (004_, 005_, etc.)
3. Test migration in Supabase dashboard
4. Document changes in migration file
5. Update TypeScript types

Example:
```sql
-- supabase/migrations/004_add_chat.sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Adding New Features

### Example: Adding Spectator Mode

1. **Plan the Feature**
   - Define requirements
   - Design database schema
   - Plan UI/UX

2. **Backend Changes**
   ```sql
   -- Add spectator flag to players table
   ALTER TABLE players ADD COLUMN is_spectator BOOLEAN DEFAULT false;
   ```

3. **Type Definitions**
   ```typescript
   // src/types/game.ts
   export interface Player {
     // ... existing fields
     is_spectator: boolean
   }
   ```

4. **State Management**
   ```typescript
   // src/stores/gameStore.ts
   // Add spectator-related state
   ```

5. **UI Components**
   ```typescript
   // src/components/spectator/SpectatorView.tsx
   ```

6. **Documentation**
   - Update README
   - Add to TESTING.md
   - Update GAME_FLOW.md

## Code Review Checklist

Before submitting PR, verify:

- [ ] Code follows style guide
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Backwards compatible

## Questions?

- Open an issue for discussion
- Check existing issues first
- Be clear and specific
- Provide examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
