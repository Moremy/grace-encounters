import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/brand/reveal';
import { DiscussionList } from '@/components/community/discussion-list';
import { JoinGroupButton } from '@/components/community/join-group-button';
import {
  getGroupBySlug,
  isGroupMember,
  createDiscussion,
} from '@/lib/community/actions';

const categoryLabels: Record<string, string> = {
  PRAYER: 'Prayer',
  BIBLE_STUDY: 'Bible Study',
  WORSHIP: 'Worship',
  FELLOWSHIP: 'Fellowship',
  OUTREACH: 'Outreach',
  YOUTH: 'Youth',
  WOMEN: 'Women',
  MEN: 'Men',
};

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = await getGroupBySlug(params.slug);

  if (!group) {
    return { title: 'Group Not Found' };
  }

  return {
    title: `${group.name} | Community Groups`,
    description: group.description,
  };
}

export default async function GroupDetailPage({ params, searchParams }: Props) {
  const group = await getGroupBySlug(params.slug);

  if (!group) {
    notFound();
  }

  const isMember = await isGroupMember(group.id);

  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium mb-4">
            {categoryLabels[group.category] ?? group.category}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-navy">
            {group.name}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {group.description}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.memberCount} members</span>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content - Discussions */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="font-serif text-2xl text-navy">Discussions</h2>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
                    {errorMessage}
                  </div>
                )}

                <DiscussionList discussions={group.discussions} />

                {/* New Discussion Form */}
                {isMember && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Start a Discussion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form action={createDiscussion} className="space-y-4">
                      <input type="hidden" name="groupId" value={group.id} />

                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="What would you like to discuss?"
                          required
                          minLength={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <textarea
                          id="content"
                          name="content"
                          placeholder="Share your thoughts..."
                          required
                          minLength={10}
                          rows={4}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPrayerThread"
                          name="isPrayerThread"
                          className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="isPrayerThread" className="text-sm">
                          This is a prayer thread
                        </Label>
                      </div>

                      <Button type="submit" variant="sacred">
                        Post Discussion
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount} members</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                    <JoinGroupButton
                      groupId={group.id}
                      initialIsMember={isMember}
                    />
                  </CardContent>
                </Card>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/community">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    All Groups
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
