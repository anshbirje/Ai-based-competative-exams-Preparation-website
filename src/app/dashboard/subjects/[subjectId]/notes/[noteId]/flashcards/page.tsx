'use client';
import '@/app/flashcard.css';
import { useState, useMemo, useEffect, use } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Note } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Flashcard } from '@/components/flashcard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw, Wand2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { generateFlashcards } from '@/ai/flows/generate-flashcards-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CardData = {
    front: string;
    back: string;
}

const NoteRenderer = ({ content }: { content: string }) => {
    return (
        <>
            {content.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('### ')) return <h3 key={index} className="font-bold text-lg mt-4 mb-2">{trimmedLine.substring(4)}</h3>;
                if (trimmedLine.startsWith('## ')) return <h2 key={index} className="font-bold text-xl mt-6 mb-3 border-b pb-2">{trimmedLine.substring(3)}</h2>;
                if (trimmedLine.startsWith('# ')) return <h1 key={index} className="font-bold text-2xl mt-8 mb-4 border-b pb-2">{trimmedLine.substring(2)}</h1>;
                if (trimmedLine.startsWith('- ')) return <li key={index} className="ml-4 list-disc">{trimmedLine.substring(2)}</li>;
                if (trimmedLine === '') return <br key={index} />;
                return <p key={index} className="mb-2">{line}</p>;
            })}
        </>
    );
};

export default function FlashcardPage({ params }: { params: Promise<{ subjectId: string; noteId: string }> }) {
  const { noteId } = use(params);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const noteDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid, 'notes', noteId);
  }, [firestore, user, noteId]);
  
  const { data: note, isLoading: isNoteLoading } = useDoc<Note>(noteDocRef);

  useEffect(() => {
    if (note && note.content) {
      setIsGenerating(true);
      setError(null);
      generateFlashcards({ noteContent: note.content })
        .then(response => {
          if (response.flashcards && response.flashcards.length > 0) {
            setCards(response.flashcards);
          } else {
            setError("The AI couldn't generate flashcards for this note. Try a note with more content.");
          }
        })
        .catch(err => {
          setError(err.message || "An unexpected error occurred while generating flashcards.");
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [note]);

  const shuffleCards = () => {
    setCards(prevCards => [...prevCards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setCardKey(k => k + 1);
  };
  
  const progress = useMemo(() => cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0, [currentCardIndex, cards]);
  
  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setCardKey(k => k + 1);
    }
  }

  const handlePrev = () => {
    if (currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
        setCardKey(k => k + 1);
    }
  }

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setCardKey(k => k + 1);
  }

  if (isNoteLoading) {
    return (
        <div className="max-w-2xl mx-auto py-8 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-96 w-full" />
            <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
  }
  
  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <Wand2 className="mx-auto h-12 w-12 text-primary animate-pulse" />
        <h2 className="mt-4 text-xl font-semibold">Generating Flashcards...</h2>
        <p className="text-muted-foreground">The AI is working its magic. This may take a moment.</p>
        <Skeleton className="h-96 w-full mt-8" />
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="text-center py-10 max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="text-destructive" />
                <CardTitle className="text-destructive">Flashcard Generation Failed</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">{error || "No flashcards were generated."}</p>
                <Button onClick={() => router.back()}><ArrowLeft className="mr-2"/> Go Back to Note</Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold truncate">{note?.title} - Flashcards</h1>
            <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2"/> Back to Note</Button>
        </div>

        <Flashcard key={cardKey} front={cards[currentCardIndex].front} back={<NoteRenderer content={cards[currentCardIndex].back} />} onFlip={() => {}} />

        <div className="mt-6 space-y-4">
            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                <span>Card {currentCardIndex + 1} of {cards.length}</span>
            </div>
             <Progress value={progress} />

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePrev} disabled={currentCardIndex === 0}>
                    <ArrowLeft className="mr-2" /> Previous
                </Button>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={shuffleCards}><Shuffle className="mr-2"/> Shuffle</Button>
                    {currentCardIndex === cards.length - 1 && 
                        <Button variant="secondary" onClick={handleRestart}><RotateCcw className="mr-2"/> Restart</Button>
                    }
                </div>
                <Button variant="default" onClick={handleNext} disabled={currentCardIndex === cards.length - 1}>
                    Next <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    </div>
  );
}
