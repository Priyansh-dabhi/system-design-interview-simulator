import { SummaryData } from '../redux/slices/session';

interface GenerateHtmlOptions {
    topicTitle: string;
    messages: { role: string; text: string }[];
    summary: SummaryData;
}

export function generateTranscriptHtml({ topicTitle, messages, summary }: GenerateHtmlOptions) {
    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const messagesHtml = messages
        .map((msg) => {
            const isUser = msg.role === 'candidate';
            const color = isUser ? '#2563EB' : '#4B5563';
            const name = isUser ? 'You' : 'Interviewer';
            return `
                <div style="margin-bottom: 16px;">
                    <strong style="color: ${color};">${name}</strong>
                    <div style="margin-top: 4px; line-height: 1.5; color: #1F2937;">
                        ${msg.text.replace(/\n/g, '<br/>')}
                    </div>
                </div>
            `;
        })
        .join('');

    const scoresHtml = summary.dimension_scores
        ? Object.entries(summary.dimension_scores)
              .map(
                  ([dim, data]) => `
                  <div style="margin-bottom: 8px;">
                      <div style="display: flex; justify-content: space-between; font-size: 14px;">
                          <strong>${dim.replace(/_/g, ' ').toUpperCase()}</strong>
                          <span>${data.score}/10</span>
                      </div>
                      <div style="font-size: 12px; color: #4B5563;">${data.comment}</div>
                  </div>
              `
              )
              .join('')
        : '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 40px;
                    color: #111827;
                    line-height: 1.6;
                }
                .header {
                    border-bottom: 2px solid #E5E7EB;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                h1 { margin: 0; font-size: 28px; }
                .date { color: #6B7280; font-size: 14px; margin-top: 8px; }
                .section {
                    margin-bottom: 40px;
                }
                .section-title {
                    font-size: 20px;
                    border-bottom: 1px solid #E5E7EB;
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                    color: #374151;
                }
                .score-box {
                    background: #F3F4F6;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .score-box h2 { margin: 0; font-size: 36px; color: #10B981; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${topicTitle} - Interview Transcript</h1>
                <div class="date">${dateStr}</div>
            </div>

            <div class="section">
                <div class="score-box">
                    <div>Overall Score</div>
                    <h2>${summary.overall_score || 'N/A'} / 100</h2>
                </div>
                ${scoresHtml}
            </div>

            <div class="section">
                <h2 class="section-title">Conversation Transcript</h2>
                ${messagesHtml}
            </div>

            ${summary.ideal_answer ? `
            <div class="section">
                <h2 class="section-title">Reference Design</h2>
                <div style="white-space: pre-wrap;">${summary.ideal_answer}</div>
            </div>
            ` : ''}
        </body>
        </html>
    `;
}
