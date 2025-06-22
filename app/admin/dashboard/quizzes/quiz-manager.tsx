"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react"
import type { QuizQuestion } from "@/lib/definitions"
import { useFormStatus } from "react-dom"
import { addOrUpdateQuizQuestion, deleteQuizQuestion } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Question')}
    </Button>
  )
}

function QuestionDialog({ question, onOpenChange, open }: { question?: QuizQuestion | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const isEditing = !!question;

  async function handleFormAction(formData: FormData) {
      const result = await addOrUpdateQuizQuestion(formData);
      if(result.success) {
          toast({ title: "Success", description: result.message });
          onOpenChange(false);
      } else {
          toast({ variant: "destructive", title: "Error", description: result.message });
      }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <form action={handleFormAction}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Make changes to the existing question.' : 'Add a new question to the quiz.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing && <input type="hidden" name="id" value={question.id} />}
            <div className="grid gap-2">
              <Label htmlFor="question">Question Text</Label>
              <Input id="question" name="question" defaultValue={question?.question} required />
            </div>
            <div className="grid gap-2">
                <Label>Options & Correct Answer</Label>
                <RadioGroup name="correctAnswerIndex" defaultValue={question?.correctAnswerIndex.toString() ?? "0"} required>
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <RadioGroupItem value={i.toString()} id={`r${i}`} />
                            <Input name={`option${i}`} placeholder={`Option ${i+1}`} defaultValue={question?.options[i] ?? ''} required />
                        </div>
                    ))}
                </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <SubmitButton isEditing={isEditing} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


export default function QuizManager({ questions }: { questions: QuizQuestion[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const { toast } = useToast();

  const handleEdit = (question: QuizQuestion) => {
      setSelectedQuestion(question);
      setDialogOpen(true);
  }

  const handleAdd = () => {
      setSelectedQuestion(null);
      setDialogOpen(true);
  }
  
  const handleDelete = async (id: number) => {
    const result = await deleteQuizQuestion(id);
    if(result.success) {
        toast({ title: "Success", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Correct Answer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium max-w-sm truncate">{question.question}</TableCell>
                <TableCell className="max-w-xs truncate">{question.options[question.correctAnswerIndex]}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(question)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm text-destructive hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the question.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(question.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <QuestionDialog open={dialogOpen} onOpenChange={setDialogOpen} question={selectedQuestion} />
    </>
  )
}
