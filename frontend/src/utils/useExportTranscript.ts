import { useState } from 'react';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateTranscriptHtml } from './generateTranscriptHtml';
import { SummaryData } from '../redux/slices/session';

interface ExportTranscriptParams {
    topicTitle: string;
    messages: { role: string; text: string }[];
    summary: SummaryData;
}

export function useExportTranscript() {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = async (params: ExportTranscriptParams) => {
        setIsExporting(true);
        try {
            const html = generateTranscriptHtml(params);
            
            // Generate PDF
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            // Share PDF
            const isSharingAvailable = await Sharing.isAvailableAsync();
            if (isSharingAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Interview Transcript',
                    UTI: 'com.adobe.pdf'
                });
            } else {
                Alert.alert('Sharing Unavailable', 'Sharing is not supported on this device.');
            }
        } catch (error) {
            console.error('Failed to export transcript:', error);
            Alert.alert('Export Failed', 'An error occurred while generating the PDF.');
        } finally {
            setIsExporting(false);
        }
    };

    return { exportPdf, isExporting };
}
