import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { LevelData } from '@/types/level';
import { deserialize, downloadJSON, serialize } from '@/utils/levelSerializer';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (levelData: LevelData) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [jsonText, setJsonText] = useState('');
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonText(content);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        try {
            const levelData = deserialize(jsonText);
            onImport(levelData);
            onClose();
            setJsonText('');
            toast({
                title: 'Success',
                description: 'Level imported successfully!',
            });
        } catch (error) {
            toast({
                title: 'Import Failed',
                description: error instanceof Error ? error.message : 'Invalid JSON format',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl" data-testid="import-modal">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className="fas fa-file-import text-primary"></i>
                        Import Level from JSON
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Select JSON File</Label>
                        <Input
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="text-sm"
                            data-testid="input-import-file"
                        />
                    </div>

                    <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Or Paste JSON</Label>
                        <Textarea
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                            placeholder='{"levelName": "My Level", "metadata": {...}, "tiles": [...], "objects": [...], "spawnPoints": [...]}'
                            rows={12}
                            className="font-mono text-sm resize-none"
                            data-testid="textarea-import-json"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} data-testid="button-import-cancel">
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!jsonText.trim()} data-testid="button-import-confirm">
                        <i className="fas fa-upload mr-2"></i>
                        Import Level
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    levelData: LevelData;
}

export function ExportModal({ isOpen, onClose, levelData }: ExportModalProps) {
    const jsonString = serialize(levelData);
    const { toast } = useToast();

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            toast({
                title: 'Copied',
                description: 'JSON copied to clipboard!',
            });
        } catch (_error) {
            toast({
                title: 'Failed to copy',
                description: 'Could not copy to clipboard',
                variant: 'destructive',
            });
        }
    };

    const handleDownloadJSON = () => {
        downloadJSON(levelData);
        toast({
            title: 'Downloaded',
            description: 'Level exported as JSON file!',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl" data-testid="export-modal">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className="fas fa-file-export text-accent"></i>
                        Export Level as JSON
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Level JSON Output</Label>
                        <Textarea
                            value={jsonString}
                            readOnly
                            rows={16}
                            className="font-mono text-sm resize-none"
                            data-testid="textarea-export-json"
                        />
                    </div>

                    <div className="bg-muted/30 border border-border rounded p-3">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                            <i className="fas fa-info-circle text-accent"></i>
                            JSON Format Documentation
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>
                                <strong>metadata:</strong> Level information (name, dimensions, author, creation date)
                            </li>
                            <li>
                                <strong>tiles:</strong> Array of platform tiles with position, dimensions, rotation, and
                                material properties
                            </li>
                            <li>
                                <strong>objects:</strong> Interactable elements (buttons, doors, levers) with linking
                                system for game logic
                            </li>
                            <li>
                                <strong>spawnPoints:</strong> Player and enemy spawn locations with facing direction and
                                spawn IDs
                            </li>
                            <li>
                                <strong>Linking:</strong> Objects reference each other via ID arrays (linkedObjects,
                                linkedFrom)
                            </li>
                            <li>
                                <strong>Rotation:</strong> All rotations in degrees (0, 90, 180, 270)
                            </li>
                            <li>
                                <strong>Layers:</strong> Z-index for rendering order (0 = background, higher =
                                foreground)
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="justify-between">
                    <Button variant="outline" onClick={handleCopyToClipboard} data-testid="button-copy-clipboard">
                        <i className="fas fa-copy mr-2"></i>
                        Copy to Clipboard
                    </Button>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose} data-testid="button-export-close">
                            Close
                        </Button>
                        <Button
                            onClick={handleDownloadJSON}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            data-testid="button-download-json"
                        >
                            <i className="fas fa-download mr-2"></i>
                            Download JSON
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
