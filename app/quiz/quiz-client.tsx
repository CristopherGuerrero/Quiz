"use client";

import { useState, useEffect, useMemo } from 'react';
import type { QuizQuestion } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Timer, Award } from 'lucide-react';
import { logQuizAttempt } from '../actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function QuizClient({ questions }: { questions: QuizQuestion[] }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setStartTime(Date.now());
  }, []);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setEndTime(Date.now());
      setIsFinished(true);
      const { score, correctAnswers, wrongAnswers, missedQuestionIds } = getResults();
      const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      
      logQuizAttempt({ correctAnswers, wrongAnswers, durationSeconds, missedQuestionIds })
        .then(() => toast({ title: "Success", description: "Your quiz attempt has been logged." }))
        .catch(() => toast({ variant: "destructive", title: "Error", description: "Failed to log your attempt." }));
    }
  };

  const getResults = () => {
      let correctAnswers = 0;
      const missedQuestionIds: number[] = [];
      questions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswerIndex) {
          correctAnswers++;
        } else {
          missedQuestionIds.push(q.id);
        }
      });
      const wrongAnswers = questions.length - correctAnswers;
      const score = (correctAnswers / questions.length) * 100;
      return { score, correctAnswers, wrongAnswers, missedQuestionIds };
  };

  const { score, correctAnswers, wrongAnswers } = useMemo(() => {
    if (!isFinished) return { score: 0, correctAnswers: 0, wrongAnswers: 0 };
    return getResults();
  }, [isFinished, selectedAnswers, questions]);

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <Award className="w-16 h-16 mx-auto text-accent" />
            <CardTitle className="text-3xl font-headline mt-4">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-around text-center p-4 bg-muted rounded-lg">
              <div>
                <p className="text-2xl font-bold">{Math.round(score)}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{wrongAnswers}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0}s</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
             <Button onClick={() => window.location.reload()} className="w-full">Take Again</Button>
             <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="animate-in fade-in-50 duration-500">
        <CardHeader>
          <Progress value={progress} className="w-full mb-4 bg-accent/20 h-2 [&>div]:bg-accent" />
          <CardTitle className="font-headline text-2xl leading-tight">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <CardDescription className="text-lg pt-4">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedAnswers[currentQuestionIndex]?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <Label 
                key={index} 
                htmlFor={`option-${index}`}
                className={cn(
                  "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                  "hover:bg-accent/10 hover:border-accent",
                  selectedAnswers[currentQuestionIndex] === index && "bg-accent/20 border-accent"
                )}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mr-3" />
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNext} disabled={selectedAnswers[currentQuestionIndex] === null} className="w-full">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
