import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { LevelData } from '@/types/level';
import { deserialize } from '@/utils/levelSerializer';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (levelData: LevelData, mode: 'new' | 'overwrite') => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const [importMode, setImportMode] = useState<'new' | 'overwrite'>('new');
    const { toast } = useToast();
    const newModeId = useId();
    const overwriteModeId = useId();

    const handleImport = () => {
        try {
            const levelData = deserialize(jsonInput);
            onImport(levelData, importMode);
            toast({
                title: 'Success',
                description: `Level ${importMode === 'new' ? 'created' : 'overwritten'} successfully`,
            });
            setJsonInput('');
            setImportMode('new');
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
        setImportMode('new');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Level</DialogTitle>
                    <DialogDescription>
                        Paste your level JSON data below to import it into the editor.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    <div className="space-y-2">
                        <Label>Import Mode</Label>
                        <RadioGroup
                            value={importMode}
                            onValueChange={(value) => setImportMode(value as 'new' | 'overwrite')}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id={newModeId} />
                                <Label htmlFor={newModeId} className="font-normal cursor-pointer">
                                    Create new level
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="overwrite" id={overwriteModeId} />
                                <Label htmlFor={overwriteModeId} className="font-normal cursor-pointer">
                                    Overwrite current level
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste level JSON here..."
                        className="font-mono text-sm flex-1 resize-none"
                    />
                </div>

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
