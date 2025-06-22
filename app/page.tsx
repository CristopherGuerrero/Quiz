import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BrainCircuit } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
              Welcome to LearnLog
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Your personal space for interactive learning. Sharpen your knowledge with quizzes and flashcards.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BrainCircuit className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline">Interactive Quiz</CardTitle>
                  <CardDescription>Test your knowledge with our quizzes.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">
                  Challenge yourself, track your progress, and see how you improve over time with detailed feedback.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/quiz">Start Quiz</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline">Flashcards</CardTitle>
                  <CardDescription>Memorize key concepts efficiently.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">
                  Flip through cards, reveal answers, and master new topics at your own pace.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/flashcards">View Flashcards</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        <p>Copyright © {new Date().getFullYear()} LearnLog. All rights reserved.</p>
        <Button variant="link" asChild className="text-primary">
          <Link href="/admin">Admin Login</Link>
        </Button>
      </footer>
    </>
  );
}
