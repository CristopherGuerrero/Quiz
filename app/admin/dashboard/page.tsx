import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { flashcards, questions, quizAttempts } from "@/lib/data"
import { BarChart, BookOpen, FileText, Target, TrendingUp, User, Users } from "lucide-react"
import StatsChart from "./stats-chart"

function getStats() {
    const totalAttempts = quizAttempts.length;
    const totalCorrect = quizAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalWrong = quizAttempts.reduce((sum, a) => sum + a.wrongAnswers, 0);
    const totalQuestionsAnswered = totalCorrect + totalWrong;
    const averageScore = totalQuestionsAnswered > 0 ? (totalCorrect / totalQuestionsAnswered) * 100 : 0;
    const totalFlashcards = flashcards.length;
    const totalQuizQuestions = questions.length;

    return { totalAttempts, averageScore, totalFlashcards, totalQuizQuestions };
}

export default function DashboardPage() {
    const { totalAttempts, averageScore, totalFlashcards, totalQuizQuestions } = getStats();
    const recentAttempts = quizAttempts.slice(0, 5);

  return (
    <>
      <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quiz Attempts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlashcards}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5"/>
                Frequently Missed Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <StatsChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>
              The last 5 quiz attempts from users.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                            <TableCell>{attempt.userName}</TableCell>
                            <TableCell>{((attempt.correctAnswers / (attempt.correctAnswers + attempt.wrongAnswers)) * 100).toFixed(0)}%</TableCell>
                            <TableCell>{new Date(attempt.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
