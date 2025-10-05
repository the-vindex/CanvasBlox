import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { LevelData } from '@/types/level';
import { deserialize } from '@/utils/levelSerializer';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (levelData: LevelData) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const { toast } = useToast();

    const handleImport = () => {
        try {
            const levelData = deserialize(jsonInput);
            onImport(levelData);
            toast({
                title: 'Success',
                description: 'Level imported successfully',
            });
            setJsonInput('');
            onClose();
        } catch (error) {
            toast({
                title: 'Import Failed',
                description: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        setJsonInput('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Import Level</DialogTitle>
                    <DialogDescription>
                        Paste your level JSON data below to import it into the editor.
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste level JSON here..."
                    className="font-mono text-sm h-96 resize-none"
                />

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!jsonInput.trim()}>
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
