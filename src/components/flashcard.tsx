'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

export const Flashcard = ({ front, back, onFlip }: { front: React.ReactNode; back: React.ReactNode; onFlip: () => void; }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip();
  }

  return (
    <div className="flip-card w-full h-80 md:h-96" onClick={handleFlip}>
      <div className={cn('flip-card-inner', { 'is-flipped': isFlipped })}>
        <div className="flip-card-front">
          <Card className="w-full h-full">
            <CardContent className="p-6 text-center flex items-center justify-center h-full">
              <p className="text-xl md:text-2xl font-semibold">{front}</p>
            </CardContent>
          </Card>
        </div>
        <div className="flip-card-back">
          <Card className="w-full h-full">
            <CardContent className="p-6 h-full">
                <ScrollArea className="h-full">
                    <div className="prose prose-sm max-w-none text-left">
                        {back}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
