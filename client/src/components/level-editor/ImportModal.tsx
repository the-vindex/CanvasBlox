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
            <DialogContent className="max-w-2xl h-[85vh] max-h-[85vh] flex flex-col">
                <DialogHeader className="pb-4">
                    <DialogTitle>Import Level</DialogTitle>
                    <DialogDescription className="text-xs">Paste JSON data below</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste level JSON here..."
                        className="font-mono text-sm flex-1 min-h-0"
                        data-testid="textarea-import-json"
                    />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
                    <div className="flex items-center gap-2 mr-auto">
                        <RadioGroup
                            value={importMode}
                            onValueChange={(value) => setImportMode(value as 'new' | 'overwrite')}
                            className="flex items-center gap-3"
                        >
                            <div className="flex items-center space-x-1.5">
                                <RadioGroupItem value="new" id={newModeId} />
                                <Label htmlFor={newModeId} className="font-normal cursor-pointer text-xs">
                                    Create new level
                                </Label>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <RadioGroupItem value="overwrite" id={overwriteModeId} />
                                <Label htmlFor={overwriteModeId} className="font-normal cursor-pointer text-xs">
                                    Overwrite current level
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
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
