import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { flashcards } from "@/lib/data"
import FlashcardManager from "./flashcard-manager"

export default function FlashcardsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcard Management</CardTitle>
        <CardDescription>
          Add, edit, or delete flashcards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FlashcardManager flashcards={flashcards} />
      </CardContent>
    </Card>
  )
}
