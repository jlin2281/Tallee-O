# Tallee-o

A simple and elegant bill splitting app for friends and groups. Split restaurant bills, shared expenses, and group purchases with ease.

## Features

- **Guest Mode Only (Release 1)**: No authentication required
- **Multiple Split Modes**: Equal, exact amounts, or percentage-based splits
- **Tax & Tip Handling**: Configurable tax rate and flexible tip options
- **Visual Person Assignment**: Color-coded people for easy identification
- **Detailed Breakdowns**: Per-person and per-item views
- **Settlement Calculations**: Minimal transaction recommendations
- **Settle-It Wheel**: Fun random selection for who pays
- **Dark/Light Mode**: Toggle between themes
- **Mobile-First Design**: Responsive across all devices

## Tech Stack

- **Frontend**: React + TypeScript + Next.js (App Router)
- **Styling**: Tailwind CSS
- **Storage**: localStorage only (no database for Release 1)
- **State Management**: React hooks with localStorage persistence
- **Build Tool**: Next.js with TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tallee-o
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tallee-o/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page (split calculator)
│   ├── results/           # Results pages
│   │   ├── page.tsx       # Results overview
│   │   ├── person/[id]/   # Person detail pages
│   │   └── item/[id]/     # Item detail pages
├── components/            # React components
│   ├── TopBar.tsx        # Navigation bar with theme toggle
│   ├── MobileDrawer.tsx  # Mobile navigation drawer
│   ├── PersonField.tsx   # Person input field
│   ├── ReceiptList.tsx   # Receipt items list
│   ├── ReceiptItem.tsx   # Individual receipt item
│   ├── AddItemModal.tsx  # Modal for adding/editing items
│   ├── TipSection.tsx    # Tip input section
│   ├── ResultsTabs.tsx   # Results tab navigation
│   ├── SettlementSection.tsx # Settlement transactions
│   └── SettleItWheel.tsx # Fun wheel for random selection
├── lib/                   # Utility functions
│   ├── colors.ts         # Color palette management
│   ├── localStorage.ts   # localStorage utilities (SSR-safe)
│   ├── calculations.ts   # Core split calculation logic
│   └── debtMinimization.ts # Settlement minimization algorithm
├── types/                 # TypeScript type definitions
│   └── index.ts          # All type definitions
└── config files          # Next.js, Tailwind, TypeScript configs
```

## Core Concepts

### Money Handling
- All money is calculated in integer cents internally to avoid floating-point bugs
- Formatting helpers convert cents to display strings (e.g., `$12.34`)

### Split Modes
1. **Equal**: Divide item price equally among assigned people
2. **Exact**: Specify exact amounts for each person
3. **Percentage**: Assign percentages that sum to 100%

### Tax & Tip
- Tax rate is configurable (default 8%)
- Tax can be split proportionally or equally
- Tip can be percentage-based or fixed amount
- Tip can be split proportionally or equally

### Calculations
The `calculateSplit()` function in `/lib/calculations.ts` handles:
1. Item share calculation based on split mode
2. Tax distribution (proportional or equal)
3. Tip distribution (proportional or equal)
4. Person and item result generation
5. Settlement transaction generation via debt minimization

### Debt Minimization
The `minimizeDebts()` function uses a greedy creditor-debtor matching algorithm to generate the minimal number of settlement transactions.

## localStorage Schema

- `tallee-o-session`: Current split session (`SplitSession` type)
- `tallee-o-result`: Calculation results (`CalculationResult` type)
- `tallee-o-theme`: UI theme preference (`"light" | "dark"`)

All localStorage access is guarded against SSR with `typeof window` checks.

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

### Code Style
- TypeScript strict mode enabled
- Tailwind CSS for styling
- Functional components with hooks
- Pure utility functions for calculations

## Release 2 Plans

Planned features for future releases:

1. **Account Mode**: User authentication and profiles
2. **Backend Integration**: Flask backend with database
3. **Persistent Sessions**: Save and load split sessions
4. **Multi-device Sync**: Share sessions across devices
5. **Payment Integration**: Direct payment links
6. **History & Analytics**: Track past splits and spending patterns
7. **Group Management**: Create and manage recurring groups

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with Next.js and Tailwind CSS
- Icons from Heroicons
- Color palette from Tailwind CSS default colors
- Debt minimization algorithm based on standard creditor-debtor matching