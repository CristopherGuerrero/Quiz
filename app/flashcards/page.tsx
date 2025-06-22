import Header from "@/components/header";
import { flashcards } from "@/lib/data";
import FlashcardsClient from "./flashcards-client";

export default function FlashcardsPage() {
  // In a real app, you'd fetch this data.
  const cardData = flashcards;

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
           <h1 className="text-3xl font-bold font-headline text-center mb-6">Flashcards</h1>
           <FlashcardsClient flashcards={cardData} />
        </div>
      </main>
    </>
  );
}
