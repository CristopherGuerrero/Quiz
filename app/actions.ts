"use server";

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminUsers, quizAttempts, questions, flashcards } from '@/lib/data';
import type { QuizAttempt, QuizQuestion, Flashcard } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// A very simple session management
async function createSession(userId: number) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  cookies().set('learnlog-session', String(userId), { expires, httpOnly: true });
}

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  try {
    const { username, password } = FormSchema.parse(Object.fromEntries(formData.entries()));
    
    const user = adminUsers.find(u => u.username === username);

    if (!user || user.passwordHash !== password) {
      return 'Invalid credentials.';
    }

    await createSession(user.id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return 'Validation failed. Please check your inputs.';
    }
    return 'Something went wrong.';
  }
  redirect('/admin/dashboard');
}

export async function logout() {
  cookies().delete('learnlog-session');
  redirect('/admin');
}

export async function logQuizAttempt(data: Omit<QuizAttempt, 'id' | 'userId' | 'userName' | 'date'>) {
    const session = cookies().get('learnlog-session')?.value;
    // In this mock app, we'll assign it to the default admin user.
    const userId = session ? parseInt(session) : 1; 
    const user = adminUsers.find(u => u.id === userId);

    const newAttempt: QuizAttempt = {
        id: Math.max(0, ...quizAttempts.map(a => a.id)) + 1,
        userId: userId,
        userName: user?.username || 'Guest',
        date: new Date().toISOString(),
        ...data,
    };
    quizAttempts.unshift(newAttempt); // Add to the beginning of the array
    revalidatePath('/admin/dashboard/users');
    revalidatePath('/admin/dashboard');
    return { success: true };
}

// Quiz CRUD
export async function addOrUpdateQuizQuestion(formData: FormData) {
  const id = formData.get('id') ? Number(formData.get('id')) : null;
  const question = formData.get('question') as string;
  const options = [
    formData.get('option0') as string,
    formData.get('option1') as string,
    formData.get('option2') as string,
    formData.get('option3') as string,
  ].filter(Boolean);
  const correctAnswerIndex = Number(formData.get('correctAnswerIndex'));

  const newQuestionData = { question, options, correctAnswerIndex };

  if (id) {
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) questions[index] = { ...questions[index], ...newQuestionData };
  } else {
    const newId = Math.max(0, ...questions.map(q => q.id)) + 1;
    questions.push({ id: newId, ...newQuestionData });
  }
  revalidatePath('/admin/dashboard/quizzes');
  return { success: true, message: `Question ${id ? 'updated' : 'added'} successfully.` };
}

export async function deleteQuizQuestion(id: number) {
    const index = questions.findIndex(q => q.id === id);
    if(index > -1) {
        questions.splice(index, 1);
    }
    revalidatePath('/admin/dashboard/quizzes');
    return { success: true, message: 'Question deleted.' };
}

// Flashcard CRUD
export async function addOrUpdateFlashcard(formData: FormData) {
  const id = formData.get('id') ? Number(formData.get('id')) : null;
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  
  if (id) {
    const index = flashcards.findIndex(f => f.id === id);
    if (index !== -1) flashcards[index] = { ...flashcards[index], question, answer };
  } else {
    const newId = Math.max(0, ...flashcards.map(f => f.id)) + 1;
    flashcards.push({ id: newId, question, answer });
  }
  revalidatePath('/admin/dashboard/flashcards');
  return { success: true, message: `Flashcard ${id ? 'updated' : 'added'} successfully.` };
}

export async function deleteFlashcard(id: number) {
    const index = flashcards.findIndex(f => f.id === id);
    if(index > -1) {
        flashcards.splice(index, 1);
    }
    revalidatePath('/admin/dashboard/flashcards');
    return { success: true, message: 'Flashcard deleted.' };
}
