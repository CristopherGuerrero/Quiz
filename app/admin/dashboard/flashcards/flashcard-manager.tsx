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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react"
import type { Flashcard } from "@/lib/definitions"
import { useFormStatus } from "react-dom"
import { addOrUpdateFlashcard, deleteFlashcard } from "@/app/actions"
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
      {pending ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Flashcard')}
    </Button>
  )
}

function FlashcardDialog({ flashcard, onOpenChange, open }: { flashcard?: Flashcard | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const isEditing = !!flashcard;

  async function handleFormAction(formData: FormData) {
      const result = await addOrUpdateFlashcard(formData);
      if(result.success) {
          toast({ title: "Success", description: result.message });
          onOpenChange(false);
      } else {
          toast({ variant: "destructive", title: "Error", description: result.message });
      }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form action={handleFormAction}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Flashcard' : 'Add New Flashcard'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Make changes to the existing flashcard.' : 'Add a new flashcard.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing && <input type="hidden" name="id" value={flashcard.id} />}
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea id="question" name="question" defaultValue={flashcard?.question} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea id="answer" name="answer" defaultValue={flashcard?.answer} required />
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

export default function FlashcardManager({ flashcards }: { flashcards: Flashcard[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
  const { toast } = useToast();

  const handleEdit = (flashcard: Flashcard) => {
      setSelectedFlashcard(flashcard);
      setDialogOpen(true);
  }

  const handleAdd = () => {
      setSelectedFlashcard(null);
      setDialogOpen(true);
  }

  const handleDelete = async (id: number) => {
    const result = await deleteFlashcard(id);
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
          <PlusCircle className="mr-2 h-4 w-4" /> Add Flashcard
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashcards.map((flashcard) => (
              <TableRow key={flashcard.id}>
                <TableCell className="font-medium max-w-sm truncate">{flashcard.question}</TableCell>
                <TableCell className="max-w-xs truncate">{flashcard.answer}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(flashcard)}>
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
                                        This action cannot be undone. This will permanently delete the flashcard.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(flashcard.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
      <FlashcardDialog open={dialogOpen} onOpenChange={setDialogOpen} flashcard={selectedFlashcard} />
    </>
  )
}
