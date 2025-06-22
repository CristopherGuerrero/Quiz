import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { questions } from "@/lib/data"
import QuizManager from "./quiz-manager"

export default function QuizzesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Management</CardTitle>
        <CardDescription>
          Add, edit, or delete quiz questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuizManager questions={questions} />
      </CardContent>
    </Card>
  )
}
