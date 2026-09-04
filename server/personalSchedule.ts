import { PersonalTask, PriorityLevel } from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';

export class PersonalScheduleEngine {
  private static instance: PersonalScheduleEngine;
  private tasks: PersonalTask[] = [];

  private constructor() {
    this.seedDefaultTasks();
  }

  public static getInstance(): PersonalScheduleEngine {
    if (!PersonalScheduleEngine.instance) {
      PersonalScheduleEngine.instance = new PersonalScheduleEngine();
    }
    return PersonalScheduleEngine.instance;
  }

  private seedDefaultTasks() {
    const now = new Date();
    const todayEvening = new Date(now);
    todayEvening.setHours(18, 0, 0, 0);

    const tomorrowMorning = new Date(now);
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(10, 0, 0, 0);

    this.tasks = [
      {
        id: 'pt-01',
        title: 'Review System Architecture & Security Audit',
        description: 'Verify cloud ingress endpoints, OAuth tokens, and memory vector indices.',
        deadline: todayEvening.toISOString(),
        reminderTime: new Date(todayEvening.getTime() - 3600000).toISOString(),
        isRecurring: false,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        tags: ['Engineering', 'Security', 'UltronOS'],
        calendarEventId: 'cal-evt-101',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'pt-02',
        title: 'Complete C++ OOP Masterclass with Tutor Agent',
        description: 'Practice virtual tables, smart pointers, and RAII design patterns.',
        deadline: tomorrowMorning.toISOString(),
        reminderTime: new Date(tomorrowMorning.getTime() - 1800000).toISOString(),
        isRecurring: true,
        recurrenceRule: 'DAILY',
        priority: 'MEDIUM',
        status: 'PENDING',
        tags: ['Learning', 'Coding', 'C++'],
        calendarEventId: 'cal-evt-102',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'pt-03',
        title: 'Backup Encrypted Project Vault & Key Rotation',
        description: 'Trigger encrypted cloud snapshot and export vault metadata.',
        deadline: new Date(Date.now() + 3600000 * 48).toISOString(),
        isRecurring: true,
        recurrenceRule: 'WEEKLY',
        priority: 'CRITICAL',
        status: 'PENDING',
        tags: ['Vault', 'Backup', 'Automation'],
        createdAt: new Date().toISOString(),
      },
    ];
  }

  public getTasks(): PersonalTask[] {
    return this.tasks;
  }

  public addTask(task: Omit<PersonalTask, 'id' | 'createdAt'>): PersonalTask {
    const newTask: PersonalTask = {
      ...task,
      id: `pt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<PersonalTask>): PersonalTask | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    Object.assign(task, updates);
    return task;
  }

  public deleteTask(id: string): boolean {
    const initLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < initLen;
  }

  public async parseNaturalScheduleCommand(command: string): Promise<{
    action: 'CREATE_TASK' | 'LIST_TASKS' | 'UPCOMING_DEADLINES' | 'REMINDER_TRIGGERED' | 'UNKNOWN';
    task?: PersonalTask;
    responseMessage: string;
  }> {
    const prompt = `You are ULTRON Personal Task & Schedule Assistant.
Current local time is: ${new Date().toISOString()}
User input: "${command}"

Analyze the command and output strictly JSON in this format:
{
  "action": "CREATE_TASK" | "LIST_TASKS" | "UPCOMING_DEADLINES" | "REMINDER_TRIGGERED" | "UNKNOWN",
  "taskTitle": "...",
  "description": "...",
  "deadlineIso": "ISO-8601 date or null",
  "reminderIso": "ISO-8601 date or null",
  "isRecurring": true | false,
  "recurrenceRule": "DAILY" | "WEEKLY" | "MONTHLY" | null,
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "responseSummary": "Friendly message summarizing the action taken in clean natural language"
}`;

    try {
      const aiRes = await generateAiContent({
        prompt,
        systemInstruction: 'You are ULTRON Schedule Manager. Return ONLY valid JSON.',
        temperature: 0.1,
      });

      const cleanJson = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.action === 'CREATE_TASK' && parsed.taskTitle) {
        const newTask = this.addTask({
          title: parsed.taskTitle,
          description: parsed.description || '',
          deadline: parsed.deadlineIso || new Date(Date.now() + 3600000 * 24).toISOString(),
          reminderTime: parsed.reminderIso,
          isRecurring: !!parsed.isRecurring,
          recurrenceRule: parsed.recurrenceRule,
          priority: (parsed.priority as PriorityLevel) || 'MEDIUM',
          status: 'PENDING',
          tags: ['Personal', 'Schedule'],
        });

        return {
          action: 'CREATE_TASK',
          task: newTask,
          responseMessage: parsed.responseSummary || `Task scheduled: "${newTask.title}".`,
        };
      }

      if (parsed.action === 'UPCOMING_DEADLINES' || command.toLowerCase().includes('deadline')) {
        const upcoming = this.tasks.filter((t) => t.status !== 'COMPLETED' && t.deadline).slice(0, 3);
        const deadlineSummary = upcoming.length > 0
          ? upcoming.map((t) => `• ${t.title} (Due: ${new Date(t.deadline!).toLocaleDateString()})`).join('\n')
          : 'No upcoming deadlines registered.';
        return {
          action: 'UPCOMING_DEADLINES',
          responseMessage: `Here are your upcoming deadlines:\n${deadlineSummary}`,
        };
      }

      const pending = this.tasks.filter((t) => t.status !== 'COMPLETED');
      return {
        action: 'LIST_TASKS',
        responseMessage: `You have ${pending.length} active tasks. Highest priority: "${pending[0]?.title || 'None'}"`,
      };
    } catch {
      return {
        action: 'LIST_TASKS',
        responseMessage: `Current active tasks: ${this.tasks.filter((t) => t.status !== 'COMPLETED').length}.`,
      };
    }
  }
}
