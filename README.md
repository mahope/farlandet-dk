# Danish Fathers Directory

A community-driven directory website where Danish fathers can share and discover resources including links, podcasts, PDFs, blog articles, tips and tricks.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Backend**: Supabase (BaaS)
- **State Management**: Zustand (to be added)
- **Data Fetching**: TanStack Query (to be added)

## Project Structure

```
src/
├── components/          # React components
│   └── ui/             # Shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
│   ├── supabase.ts     # Supabase client configuration
│   └── utils.ts        # Utility functions (cn helper)
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
└── App.tsx             # Main application component
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Features (Planned)

- Resource submission and management
- Community voting system
- Comment system
- Search and filtering
- Category-based browsing
- Random resource discovery
- User authentication
- Admin moderation panel
- Responsive masonry grid layout

## Development

This project follows the spec-driven development methodology. See the `.kiro/specs/danish-fathers-directory/` directory for detailed requirements, design, and implementation tasks.