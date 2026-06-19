import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReadingPlanCardProps {
  plan: {
    id: string;
    slug: string;
    title: string;
    description: string;
    totalDays: number;
    coverImageUrl: string | null;
  };
  userProgress?: { completed: number; total: number };
}

export function ReadingPlanCard({ plan, userProgress }: ReadingPlanCardProps) {
  const hasProgress = userProgress && userProgress.completed > 0;
  const percentage = userProgress
    ? Math.round((userProgress.completed / userProgress.total) * 100)
    : 0;

  return (
    <Link href={`/dashboard/bible-study/plans/${plan.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        {plan.coverImageUrl ? (
          <div
            className="h-32 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${plan.coverImageUrl})` }}
          />
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-navy/10 to-gold/10">
            <BookOpen className="h-10 w-10 text-gold/60" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg">{plan.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">
            {plan.totalDays} days
          </p>
          {hasProgress && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-navy">{percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-gold transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
          <Button variant="sacred" size="sm" className="mt-4 w-full">
            {hasProgress ? 'Continue' : 'Start Plan'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
