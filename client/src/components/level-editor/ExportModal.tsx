import { useEffect, useState } from 'react';
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
import { downloadJSON, serialize } from '@/utils/levelSerializer';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    levelData: LevelData | null;
}

export function ExportModal({ isOpen, onClose, levelData }: ExportModalProps) {
    const [jsonOutput, setJsonOutput] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && levelData) {
            const json = serialize(levelData);
            setJsonOutput(json);
        }
    }, [isOpen, levelData]);

    const handleDownload = () => {
        if (levelData) {
            downloadJSON(levelData);
            toast({
                title: 'Exported',
                description: 'Level exported as JSON',
            });
            onClose();
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonOutput);
            toast({
                title: 'Copied',
                description: 'Level JSON copied to clipboard',
            });
        } catch (_error) {
            toast({
                title: 'Copy Failed',
                description: 'Failed to copy to clipboard',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Export Level</DialogTitle>
                    <DialogDescription>Download or copy your level JSON data.</DialogDescription>
                </DialogHeader>

                <Textarea value={jsonOutput} readOnly className="font-mono text-sm h-96 resize-none" />

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="outline" onClick={handleCopyToClipboard}>
                        <i className="fas fa-copy mr-2"></i>
                        Copy to Clipboard
                    </Button>
                    <Button onClick={handleDownload}>
                        <i className="fas fa-download mr-2"></i>
                        Download JSON
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
