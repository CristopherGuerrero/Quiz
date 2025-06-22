import Header from "@/components/header";
import { questions } from "@/lib/data";
import QuizClient from "./quiz-client";

export default function QuizPage() {
  // In a real app, you'd fetch this data.
  const quizQuestions = questions;

  return (
    <>
      <Header />
      <main className="flex-1 container py-8">
        <QuizClient questions={quizQuestions} />
      </main>
    </>
  );
}
