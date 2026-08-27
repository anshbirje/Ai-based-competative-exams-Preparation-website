'use client';
import { useState, useMemo } from 'react';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import type { Subject } from '@/lib/types';
import { collection, query, where, serverTimestamp, doc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Book, BrainCircuit, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

const subjectFormSchema = z.object({
  name: z.string().min(1, 'Subject name is required.'),
});

export function SubjectSidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const subjectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'subjects'), where('userProfileId', '==', user.uid));
  }, [firestore, user]);

  const { data: subjects } = useCollection<Subject>(subjectsQuery);

  const sortedSubjects = useMemo(() => {
    if (!subjects) return [];
    return [...subjects].sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects]);

  const newForm = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: '' },
  });

  const renameForm = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: '' },
  });

  async function onNewSubmit(values: z.infer<typeof subjectFormSchema>) {
    if (!user) return;
    const subjectsCollection = collection(firestore, 'users', user.uid, 'subjects');
    addDocumentNonBlocking(subjectsCollection, {
      name: values.name,
      userProfileId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    toast({ title: 'Subject created', description: `"${values.name}" has been added.` });
    newForm.reset();
    setIsNewDialogOpen(false);
  }

  async function onRenameSubmit(values: z.infer<typeof subjectFormSchema>) {
    if (!user || !selectedSubject) return;
    const subjectRef = doc(firestore, 'users', user.uid, 'subjects', selectedSubject.id);
    updateDocumentNonBlocking(subjectRef, {
      name: values.name,
      updatedAt: serverTimestamp(),
    });
    toast({ title: 'Subject renamed', description: `Successfully renamed to "${values.name}".` });
    setIsRenameDialogOpen(false);
    setSelectedSubject(null);
    renameForm.reset();
  }

  async function onDeleteConfirm() {
    if (!user || !selectedSubject) return;
    const subjectRef = doc(firestore, 'users', user.uid, 'subjects', selectedSubject.id);
    deleteDocumentNonBlocking(subjectRef);
    toast({ title: 'Subject deleted', description: `"${selectedSubject.name}" has been removed.` });
    setIsDeleteDialogOpen(false);
    setSelectedSubject(null);
    if (pathname === `/dashboard/subjects/${selectedSubject.id}`) {
        router.push('/dashboard');
    }
  }

  const handleRenameClick = (subject: Subject) => {
    setSelectedSubject(subject);
    renameForm.setValue('name', subject.name);
    setIsRenameDialogOpen(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">StudySage</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
              <Link href="/dashboard">
                <Plus />
                <span>New Note</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-4 px-4 mb-2 text-xs font-medium text-muted-foreground uppercase">
          Subjects
        </div>

        <SidebarMenu>
          {sortedSubjects && sortedSubjects.map((subject) => (
            <SidebarMenuItem key={subject.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(`/dashboard/subjects/${subject.id}`)}
              >
                <Link href={`/dashboard/subjects/${subject.id}`}>
                  <Book />
                  <span>{subject.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem onClick={() => handleRenameClick(subject)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(subject)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" onClick={() => setIsNewDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Subject
        </Button>
      </SidebarFooter>

      {/* New Subject Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Organize your notes by creating a new subject.
            </DialogDescription>
          </DialogHeader>
          <Form {...newForm}>
            <form onSubmit={newForm.handleSubmit(onNewSubmit)} className="space-y-4">
              <FormField
                control={newForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Biology 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsNewDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={newForm.formState.isSubmitting}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Rename Subject Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Subject</DialogTitle>
            <DialogDescription>
              Enter a new name for your subject.
            </DialogDescription>
          </DialogHeader>
          <Form {...renameForm}>
            <form onSubmit={renameForm.handleSubmit(onRenameSubmit)} className="space-y-4">
              <FormField
                control={renameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Subject Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={renameForm.formState.isSubmitting}>
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject "{selectedSubject?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSubject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
