"use client";

import { useState } from 'react';
import type { Flashcard } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FlashcardsClient({ flashcards }: { flashcards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
      setIsAnimating(false);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  if (!flashcards || flashcards.length === 0) {
    return <p>No flashcards available.</p>
  }
  
  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="w-full h-64 [perspective:1000px]">
        <div 
          className={cn(
            "relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]",
            isAnimating && "opacity-0",
            isFlipped && "[transform:rotateY(180deg)]"
          )}
        >
          <Card className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center p-6 text-center">
            <CardContent className="p-0">
              <p className="text-2xl font-semibold">{currentCard.question}</p>
            </CardContent>
          </Card>
          <Card className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center p-6 text-center bg-accent text-accent-foreground">
            <CardContent className="p-0">
              <p className="text-xl">{currentCard.answer}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Card {currentIndex + 1} of {flashcards.length}
      </p>

      <div className="flex items-center justify-center gap-4 w-full">
        <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous Card">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button onClick={handleFlip} className="px-6 min-w-[150px]" variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4" />
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next Card">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
