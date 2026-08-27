
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
} from '@/firebase';
import type { Subject } from '@/lib/types';
import { collection, query, where, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, FileText, Upload, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNotesFromText } from '@/ai/flows/text-note-generation-flow';
import { generateNotesFromImage } from '@/ai/flows/image-note-generation-flow';
import { pdfNoteGeneration } from '@/ai/flows/pdf-note-generation-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type GenerationResult = {
  title: string;
  notes: string;
} | null;

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const NoteRenderer = ({ content }: { content: string }) => {
    if (!content || content.trim() === '') {
        return <p className="text-muted-foreground text-center">The AI didn't generate any notes. Please try a different input.</p>;
    }
    return (
        <div className="prose-sm dark:prose-invert max-w-none">
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

export function NoteGenerationForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [result, setResult] = useState<GenerationResult>(null);
  const [error, setError] = useState<string | null>(null);

  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState('');

  const subjectsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
  
    return collection(firestore, 'users', user.uid, 'subjects');
  }, [firestore, user]);

  const { data: subjects } = useCollection<Subject>(subjectsQuery);

  useEffect(() => {
    if (subjects && subjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const resetForm = () => {
    setKeywords('');
    setFile(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    setNoteTitle('');
  };

  const handleTextGeneration = async () => {
    if (!keywords.trim()) {
        toast({ variant: 'destructive', title: 'Input required', description: 'Please enter a topic or keywords.' });
        return;
    }
    setStatus('loading');
    setResult(null);
    setError(null);
    try {
        const response = await generateNotesFromText({ topicOrKeywords: keywords });
        setResult(response);
        setNoteTitle(response.title);
        setStatus('success');
    } catch (e: any) {
        setError(e.message || 'Failed to generate notes.');
        setStatus('error');
    }
  };

  const handleFileGeneration = async () => {
    if (!file) {
        toast({ variant: 'destructive', title: 'File required', description: 'Please upload a file.' });
        return;
    }
    setStatus('loading');
    setResult(null);
    setError(null);
    try {
        const dataUri = await fileToDataUri(file);
        let response;
        if (file.type.startsWith('image/')) {
            response = await generateNotesFromImage({ imageUri: dataUri });
            setResult({ title: file.name, notes: response.notes });
            setNoteTitle(file.name);
        } else if (file.type === 'application/pdf') {
            response = await pdfNoteGeneration({ documentUri: dataUri });
            setResult({ title: file.name, notes: response.notes });
            setNoteTitle(file.name);
        } else {
            throw new Error('Unsupported file type.');
        }
        setStatus('success');
    } catch (e: any) {
        setError(e.message || 'Failed to generate notes from file.');
        setStatus('error');
    }
  };

  const handleSaveNote = async () => {
    if (!result || !noteTitle.trim() || !selectedSubjectId || !user) {
        toast({ variant: 'destructive', title: 'Information missing', description: 'Please provide a title and select a subject.' });
        return;
    }
    const notesCollection = collection(firestore, `users/${user.uid}/notes`);
    addDocumentNonBlocking(notesCollection, {
        title: noteTitle,
        content: result.notes,
        userProfileId: user.uid,
        subjectId: selectedSubjectId,
        isAIGenerated: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    toast({ title: 'Note saved!', description: `"${noteTitle}" has been saved.` });
    resetForm();
  };

  const fileInputLabel = useMemo(() => {
    if (file) return file.name;
    return 'Click to upload or drag and drop';
  }, [file]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="keywords" className="w-full" onValueChange={() => setFile(null)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keywords"><FileText className="mr-2"/>Keywords</TabsTrigger>
          <TabsTrigger value="image"><Upload className="mr-2"/>Image</TabsTrigger>
          <TabsTrigger value="pdf"><Upload className="mr-2"/>PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="keywords">
          <Card>
            <CardHeader>
                <CardTitle>From Keywords</CardTitle>
                <CardDescription>Enter a topic or keywords to generate notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., 'Cellular respiration', 'Key events of World War II', 'Principles of microeconomics'"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={4}
                disabled={status === 'loading'}
              />
              <Button onClick={handleTextGeneration} disabled={status === 'loading'}>
                {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Wand2 className="mr-2"/> Generate Notes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="image">
          <Card>
            <CardHeader>
                <CardTitle>From Image</CardTitle>
                <CardDescription>Upload an image of a document or whiteboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Input id="image-upload" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" disabled={status === 'loading'} />
               <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                 <Upload className="w-8 h-8 text-muted-foreground" />
                 <p className="text-sm text-muted-foreground mt-2">{fileInputLabel}</p>
                 <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
               </label>
              <Button onClick={handleFileGeneration} disabled={status === 'loading' || !file}>
                {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Wand2 className="mr-2"/> Generate Notes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pdf">
          <Card>
            <CardHeader>
                <CardTitle>From PDF</CardTitle>
                <CardDescription>Upload a PDF document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input id="pdf-upload" type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" disabled={status === 'loading'} />
               <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                 <Upload className="w-8 h-8 text-muted-foreground" />
                 <p className="text-sm text-muted-foreground mt-2">{fileInputLabel}</p>
                 <p className="text-xs text-muted-foreground">PDF up to 20MB</p>
               </label>
              <Button onClick={handleFileGeneration} disabled={status === 'loading' || !file}>
                {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Wand2 className="mr-2"/> Generate Notes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {status === 'loading' && (
        <Card className="animate-pulse">
            <CardHeader><CardTitle>Generating...</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card className="border-destructive">
            <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="text-destructive" />
                <CardTitle className="text-destructive">Generation Failed</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
        </Card>
      )}

      {status === 'success' && result && (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> Generated Notes</CardTitle>
                        <CardDescription>Review the generated notes and save them to a subject.</CardDescription>
                    </div>
                     <Button variant="outline" onClick={resetForm}>Start Over</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="note-title">Note Title</Label>
                        <Input id="note-title" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="subject-select">Save to Subject</Label>
                        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                            <SelectTrigger id="subject-select">
                                <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects && subjects.map(sub => (
                                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/50 h-96 overflow-auto">
                    <NoteRenderer content={result.notes} />
                </div>

                <Button onClick={handleSaveNote}>
                    <Save className="mr-2" /> Save Note
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
