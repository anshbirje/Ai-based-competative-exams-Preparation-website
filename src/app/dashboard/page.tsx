import { NoteGenerationForm } from '@/components/note-generation-form';

export default function GenerateNotePage() {
  return (
    <div className="container mx-auto max-w-4xl">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Generate New Notes</h1>
            <p className="text-muted-foreground">
                Choose your method to start generating notes with AI.
            </p>
        </div>
        <NoteGenerationForm />
    </div>
  );
}
