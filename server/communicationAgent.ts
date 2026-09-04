import { CommunicationMessage } from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';

export class CommunicationAgentEngine {
  private static instance: CommunicationAgentEngine;
  private messages: CommunicationMessage[] = [];

  private constructor() {
    this.seedDefaultMessages();
  }

  public static getInstance(): CommunicationAgentEngine {
    if (!CommunicationAgentEngine.instance) {
      CommunicationAgentEngine.instance = new CommunicationAgentEngine();
    }
    return CommunicationAgentEngine.instance;
  }

  private seedDefaultMessages() {
    this.messages = [
      {
        id: 'msg-comm-01',
        channel: 'EMAIL',
        sender: 'lead-dev@techcorp.io',
        recipient: 'jarvis6852@gmail.com',
        subject: 'Q3 Architectural Roadmap & Security Milestone',
        body: 'Hey Team, could you please review the new zero-trust authentication pipeline and approve the deployment window for Friday 18:00 UTC?',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: false,
        requiresReply: true,
        suggestedDraftReply: 'Hi Lead Dev,\n\nI have reviewed the zero-trust authentication pipeline. The security audit checks out clean. Friday 18:00 UTC is approved for rollout.\n\nBest regards,\nULTRON Operations',
        isSensitive: true,
        approvalStatus: 'PENDING_APPROVAL',
      },
      {
        id: 'msg-comm-02',
        channel: 'CALENDAR',
        sender: 'Google Calendar Sync',
        recipient: 'jarvis6852@gmail.com',
        subject: 'Upcoming: ULTRON SuperBrain System Sync',
        body: 'Scheduled conference call with deep learning team regarding multi-agent vector memory convergence.',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        isRead: true,
        requiresReply: false,
        isSensitive: false,
        approvalStatus: 'NOT_REQUIRED',
      },
      {
        id: 'msg-comm-03',
        channel: 'MESSAGING',
        sender: 'Discord #dev-ops',
        recipient: 'ULTRON Sentinel',
        body: 'Canary container cluster health check: Memory 42%, CPU 18%, 0 crash loops.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        isRead: true,
        requiresReply: false,
        isSensitive: false,
        approvalStatus: 'NOT_REQUIRED',
      },
    ];
  }

  public getMessages(): CommunicationMessage[] {
    return this.messages;
  }

  public async summarizeMessages(query?: string): Promise<{ summary: string; unreadCount: number; actionableCount: number }> {
    const unread = this.messages.filter((m) => !m.isRead);
    const actionable = this.messages.filter((m) => m.requiresReply && m.approvalStatus === 'PENDING_APPROVAL');

    const prompt = `You are ULTRON Communication Agent. Summarize the user's communications inbox.
Context:
${this.messages
  .map(
    (m) =>
      `[${m.channel}] From: ${m.sender} | Subject: ${m.subject || 'N/A'} | Body: "${m.body}" | Sensitive: ${m.isSensitive} | ReplyStatus: ${m.approvalStatus}`
  )
  .join('\n')}

Provide a concise, executive briefing with bullet points and highlight items awaiting user confirmation.`;

    try {
      const aiRes = await generateAiContent({
        prompt,
        systemInstruction: 'You are ULTRON Executive Communication Agent. Provide clean, scannable summaries.',
        temperature: 0.2,
      });

      return {
        summary: aiRes.text,
        unreadCount: unread.length,
        actionableCount: actionable.length,
      };
    } catch {
      return {
        summary: `You have ${this.messages.length} messages (${unread.length} unread). ${actionable.length} draft replies require your confirmation before sending.`,
        unreadCount: unread.length,
        actionableCount: actionable.length,
      };
    }
  }

  public async draftReply(messageId: string, customInstructions?: string): Promise<string> {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) throw new Error('Message not found');

    const prompt = `You are ULTRON Communication Agent. Draft a professional, context-aware reply to this message:
Channel: ${msg.channel}
From: ${msg.sender}
Subject: ${msg.subject || 'N/A'}
Content: "${msg.body}"
User Extra Guidelines: ${customInstructions || 'Keep it polite, professional, and clear.'}

Draft the reply body directly:`;

    const aiRes = await generateAiContent({
      prompt,
      systemInstruction: 'Draft the email/message reply directly without metadata wrappers.',
      temperature: 0.3,
    });

    msg.suggestedDraftReply = aiRes.text;
    msg.approvalStatus = 'PENDING_APPROVAL';
    return aiRes.text;
  }

  public approveAndSendMessage(messageId: string): { success: boolean; message: string } {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return { success: false, message: 'Message not found' };

    msg.approvalStatus = 'APPROVED';
    msg.requiresReply = false;
    msg.isRead = true;

    return {
      success: true,
      message: `Message to "${msg.sender}" approved and transmitted securely via ${msg.channel} gateway.`,
    };
  }

  public rejectDraft(messageId: string): { success: boolean; message: string } {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return { success: false, message: 'Message not found' };

    msg.approvalStatus = 'REJECTED';
    return {
      success: true,
      message: 'Draft rejected and discarded from transmission queue.',
    };
  }
}
