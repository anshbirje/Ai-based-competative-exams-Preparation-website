import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Folder, Layers, Wand2 } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: Wand2,
    title: 'AI Note Generation',
    description: 'Input topics or upload documents. Our AI generates concise, structured notes in seconds.',
  },
  {
    icon: Folder,
    title: 'Subject Organization',
    description: 'Categorize your notes by subject for easy management and quick retrieval.',
  },
  {
    icon: Layers,
    title: 'Flashcard Review',
    description: 'Transform notes into interactive flashcards for effective memorization.',
  },
];

export default function LandingPage() {
  const heroImage = placeholderImages.find(p => p.id === "studysage-hero");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">StudySage</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                Smarter Studying Starts Here
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                StudySage is your AI-powered study partner. Automatically generate structured notes and flashcards from any topic or document to learn faster and more effectively.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Start for Free</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-secondary py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Learn Smarter, Not Harder</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to supercharge your study sessions.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col text-center">
                   <CardHeader className="items-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                     <CardTitle>{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Revolutionize Your Studying?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of students using StudySage to achieve their academic goals.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} StudySage. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
