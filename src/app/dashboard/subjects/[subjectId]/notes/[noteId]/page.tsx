'use client';

import { useState, useEffect, use } from 'react';
import {
  useFirestore,
  useUser,
  useDoc,
  useMemoFirebase,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { Note } from '@/lib/types';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Edit, Save, Trash2, Layers, BookOpen, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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

const NoteRenderer = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            {content.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('### ')) return <h3 key={index} className="font-bold text-lg mt-4 mb-2">{trimmedLine.substring(4)}</h3>;
                if (trimmedLine.startsWith('## ')) return <h2 key={index} className="font-bold text-xl mt-6 mb-3 border-b pb-2">{trimmedLine.substring(3)}</h2>;
                if (trimmedLine.startsWith('# ')) return <h1 key={index} className="font-bold text-2xl mt-8 mb-4 border-b pb-2">{trimmedLine.substring(2)}</h1>;
                if (trimmedLine.startsWith('- ')) return <li key={index} className="ml-4 list-disc">{trimmedLine.substring(2)}</li>;
                if (trimmedLine === '') return <br key={index} />;
                return <p key={index} className="mb-2">{line}</p>;
            })}
        </div>
    );
};

export default function NotePage({ params }: { params: Promise<{ subjectId: string; noteId: string }> }) {
  const { subjectId, noteId } = use(params);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const noteDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid, 'notes', noteId);
  }, [firestore, user, noteId]);

  const { data: note, isLoading } = useDoc<Note>(noteDocRef);

  useEffect(() => {
    if (note && !isEditing) {
      setEditTitle(note.title);
      setEditContent(note.content);
    }
  }, [note, isEditing]);

  const handleSave = async () => {
    if (!note || !noteDocRef) return;
    setIsSaving(true);
    updateDocumentNonBlocking(noteDocRef, {
        title: editTitle,
        content: editContent,
        updatedAt: serverTimestamp()
    });
    setIsEditing(false);
    setIsSaving(false);
    toast({ title: "Note updated successfully!" });
  };

  const handleDelete = async () => {
    if (!noteDocRef) return;
    deleteDocumentNonBlocking(noteDocRef);
    toast({ title: "Note deleted" });
    router.push(`/dashboard/subjects/${subjectId}`);
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>;
  }

  if (!note) {
    return (
      <div className="text-center py-10">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Note not found</h2>
          <p className="text-muted-foreground">The note you are looking for does not exist or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/subjects/${subjectId}`)} className="mb-4">
            <ArrowLeft className="mr-2"/> Back to subject
        </Button>
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center gap-2 flex-wrap">
                    {isEditing ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-2xl font-bold p-0 border-0 shadow-none focus-visible:ring-0 h-auto flex-1 min-w-0" />
                    ) : (
                        <CardTitle className="text-3xl flex-1 min-w-0 break-words">{note.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <Link href={`/dashboard/subjects/${subjectId}/notes/${noteId}/flashcards`}>
                            <Button variant="outline"><Layers className="mr-2" /> Flashcards</Button>
                         </Link>
                         {isEditing ? (
                            <>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2"/>} Save
                                </Button>
                                <Button variant="ghost" onClick={() => { setIsEditing(false); setEditTitle(note.title); setEditContent(note.content); }}>Cancel</Button>
                            </>
                         ) : (
                            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2"/> Edit</Button>
                         )}
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your note.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={20} className="text-base" />
                ) : (
                    <div className="p-4 border rounded-md bg-muted/50 min-h-[300px]">
                        <NoteRenderer content={note.content} />
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
