'use client';

import { useMemo, use } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { Note, Subject } from '@/lib/types';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = use(params);
  const { user } = useUser();
  const firestore = useFirestore();

  const subjectDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid, 'subjects', subjectId);
  }, [firestore, user, subjectId]);

  const { data: subject, isLoading: isSubjectLoading } = useDoc<Subject>(subjectDocRef);

  const notesQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Scoped to the user's notes subcollection. 
    // Adding userProfileId filter explicitly to satisfy security rules for list operations.
    return query(
      collection(firestore, 'users', user.uid, 'notes'),
      where('userProfileId', '==', user.uid),
      where('subjectId', '==', subjectId),
      orderBy('updatedAt', 'desc')
    );
  }, [firestore, user, subjectId]);

  const { data: notes, isLoading: areNotesLoading } = useCollection<Note>(notesQuery);

  const isLoading = isSubjectLoading || areNotesLoading;

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-10">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Subject not found</h2>
        <p className="text-muted-foreground">The subject you are looking for does not exist or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-muted-foreground">
            {notes?.length || 0} note{notes?.length !== 1 ? 's' : ''} in this subject.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Plus className="mr-2" />
            New Note
          </Link>
        </Button>
      </div>

      {!notes || notes.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No notes yet</h2>
          <p className="text-muted-foreground">Create your first note for this subject.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Create Note</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link key={note.id} href={`/dashboard/subjects/${subjectId}/notes/${note.id}`} className="block">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{note.title}</CardTitle>
                  {note.updatedAt && (
                    <CardDescription>
                      Last updated: {format(note.updatedAt.toDate(), 'PPP')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
