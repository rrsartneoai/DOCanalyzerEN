# Document Analysis Platform

This is an AI-powered document analysis platform built with Next.js, Supabase, and Stripe.

## Features

- User authentication (Login, Register)
- Document upload and management
- AI-powered document analysis (integrates with Gemini/OpenAI)
- Order and payment processing with Stripe
- Responsive design with Shadcn UI
- Internationalization (i18n) support
- Dark/Light mode toggle

## Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-username/document-analysis-platform.git
cd document-analysis-platform
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Set up Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

\`\`\`
# Supabase
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_JWT_SECRET="YOUR_SUPABASE_JWT_SECRET"

# Stripe
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="YOUR_STRIPE_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"

# AI Integrations (choose one or more)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# Next.js Base URL (for absolute URLs in redirects, API calls, etc.)
NEXT_PUBLIC_BASE_URL="http://localhost:3000" # e.g., https://your-app-name.vercel.app
\`\`\`

Replace the placeholder values with your actual API keys and URLs.

### 4. Set up Supabase

1.  **Create a new Supabase project:** Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get your API keys:** Find your `Project URL`, `anon public` key, and `service_role` key in your project settings under "API".
3.  **Set up JWT Secret:** Go to "Authentication" -> "Settings" and set a `JWT Secret` for your project. This should match `SUPABASE_JWT_SECRET` in your `.env.local`.
4.  **Run database migrations:** Use the SQL script provided in `scripts/create-database-schema.sql` to set up your database tables and RLS policies. You can run this directly in the Supabase SQL Editor.

### 5. Run the development server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project can be easily deployed to Vercel. Ensure your environment variables are configured in your Vercel project settings.

## Testing

To run tests:

\`\`\`bash
npm test
# or
yarn test
# or
pnpm test
\`\`\`

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
