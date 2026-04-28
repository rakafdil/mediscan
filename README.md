# MediScan

MediScan is a robust, full-stack AI symptom detection platform built with [Next.js](https://nextjs.org). It bridges the communication gap between patients and medical professionals by translating vague, natural-language health complaints into structured, medically grounded differential diagnoses. 

By utilizing a Human-in-the-Loop (HITL) architecture and an advanced AI agentic loop, MediScan provides highly accurate preliminary health assessments without the hallucinations common in standard LLM chatbots.

## Features

- **Human-in-the-Loop (HITL) Symptom Extraction:** Users input symptoms via natural language. The AI extracts these into structured, editable symptom cards. It actively identifies missing physical or sensory details and instructs users to update their cards, preventing misdiagnosis.
- **Advanced Agentic Loop:** The backend utilizes a multi-step agentic loop powered by Groq. The AI autonomously calls tools to cross-reference symptoms with medical literature and evaluates its own diagnostic confidence until probabilities mathematically converge.
- **Context-Aware Risk Modifiers:** Automatically fetches the user's location and real-time weather data. The system combines environmental factors with deterministic math (calculating risk modifiers based on BMI and age) to ensure a holistic diagnosis.
- **Responsive Design:** A clean, accessible, and mobile-friendly interface designed to reduce patient anxiety.

## Getting Started

### 1. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Run the Application

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The app will start on [http://localhost:3000](http://localhost:3000).

### 4. Build and Run Production

To build the app for production, run:

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm start
# or
yarn start
```

## Demo

Try the deployed app: [https://mediscan-phi.vercel.app/](https://mediscan-phi.vercel.app/)

## Technologies Used

- **Frontend:** [Next.js](https://nextjs.org), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/)
- **AI & Backend Logic:** [Groq SDK](https://console.groq.com/) (Llama 3 Models)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Feel free to contribute or open issues to help improve MediScan!
