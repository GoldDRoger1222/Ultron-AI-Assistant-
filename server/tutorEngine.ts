import { TutorCourseSession } from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';

export class TutorEngine {
  private static instance: TutorEngine;
  private sessions: TutorCourseSession[] = [];

  private constructor() {
    this.seedDefaultSession();
  }

  public static getInstance(): TutorEngine {
    if (!TutorEngine.instance) {
      TutorEngine.instance = new TutorEngine();
    }
    return TutorEngine.instance;
  }

  private seedDefaultSession() {
    this.sessions = [
      {
        id: 'tutor-cpp-oop-01',
        topic: 'C++ Object-Oriented Programming & Memory Safety',
        mode: 'INTERMEDIATE',
        conceptExplanation:
          'Object-Oriented Programming in modern C++ (C++17/20) revolves around encapsulation, inheritance, polymorphism, and strict Resource Acquisition Is Initialization (RAII). Unlike garbage-collected languages, C++ uses deterministic destructor lifecycles with `std::unique_ptr` and `std::shared_ptr` to eliminate memory leaks.',
        codeExamples: [
          {
            language: 'cpp',
            code: `#include <iostream>
#include <memory>
#include <string>

// Pure abstract interface
class IAutonomousAgent {
public:
    virtual ~IAutonomousAgent() = default; // Essential virtual destructor
    virtual void executeTask(const std::string& task) = 0;
};

// Concrete implementation with RAII
class UltronSubAgent : public IAutonomousAgent {
private:
    std::string agentName;
public:
    explicit UltronSubAgent(std::string name) : agentName(std::move(name)) {
        std::cout << "[Agent " << agentName << "] Initialized.\\n";
    }
    ~UltronSubAgent() override {
        std::cout << "[Agent " << agentName << "] Safely Terminated.\\n";
    }
    void executeTask(const std::string& task) override {
        std::cout << "Executing: " << task << " via " << agentName << "\\n";
    }
};

int main() {
    // Modern C++ unique pointer prevents memory leaks
    std::unique_ptr<IAutonomousAgent> agent = std::make_unique<UltronSubAgent>("CyberSentinel");
    agent->executeTask("Scan Subnet Ports");
    return 0;
}`,
            explanation:
              'Demonstrates Polymorphism via `IAutonomousAgent`, virtual destructor to avoid undefined behavior on deletion, and RAII lifecycle ownership using `std::make_unique`.',
          },
        ],
        quizQuestions: [
          {
            id: 'q1',
            question: 'Why is a virtual destructor mandatory in a base class with virtual methods in C++?',
            options: [
              'To speed up CPU execution',
              'To ensure derived class destructors are properly invoked when deleted via a base pointer',
              'To allow multiple inheritance',
              'Because the compiler fails to compile without it',
            ],
            correctIndex: 1,
            explanation:
              'Deleting a derived class instance through a base pointer without a virtual destructor causes undefined behavior and resource leaks.',
          },
          {
            id: 'q2',
            question: 'What is the primary ownership semantic of std::unique_ptr?',
            options: [
              'Shared ownership with atomic reference counting',
              'Exclusive, non-copyable ownership with zero overhead over a raw pointer',
              'Weak uncounted observation',
              'Heap garbage collection',
            ],
            correctIndex: 1,
            explanation: '`std::unique_ptr` guarantees single ownership and is movable but not copyable.',
          },
        ],
        detectedMistakes: [
          'Previous attempt had a missing virtual destructor in base interface.',
          'Used raw `new` and `delete` instead of `std::make_unique`.',
        ],
        studyPlanSteps: [
          'Step 1: Master RAII & Smart Pointers (std::unique_ptr, std::shared_ptr)',
          'Step 2: Virtual Methods, VTable Mechanics & Interface Design',
          'Step 3: Move Semantics, rvalue references (&&) & std::move',
          'Step 4: Concurrency & Lock-Free Thread Safety (std::atomic, std::mutex)',
        ],
        masteryScore: 85,
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  public getSessions(): TutorCourseSession[] {
    return this.sessions;
  }

  public getSessionById(id: string): TutorCourseSession | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  public async startLesson(topic: string, mode: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Promise<TutorCourseSession> {
    const prompt = `You are ULTRON Intelligent Tutor Engine. Create a comprehensive, interactive, and structured learning session for:
Topic: "${topic}"
Mode: "${mode}"

Return ONLY valid JSON matching this schema:
{
  "topic": "${topic}",
  "mode": "${mode}",
  "conceptExplanation": "Deep, crystal-clear explanation with real-world analogies and architectural best practices.",
  "codeExamples": [
    {
      "language": "cpp | python | javascript | rust | etc",
      "code": "executable code snippet",
      "explanation": "why this is the idiomatic way"
    }
  ],
  "quizQuestions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why option A is correct"
    },
    {
      "id": "q2",
      "question": "Question 2 text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Explanation"
    }
  ],
  "studyPlanSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ..."
  ]
}`;

    try {
      const aiRes = await generateAiContent({
        prompt,
        systemInstruction: 'You are ULTRON Elite Academic & Engineering Tutor. Return ONLY valid JSON.',
        temperature: 0.2,
      });

      const cleanJson = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const newSession: TutorCourseSession = {
        id: `tutor-${Date.now()}`,
        topic: parsed.topic || topic,
        mode,
        conceptExplanation: parsed.conceptExplanation || `Tutorial on ${topic}`,
        codeExamples: parsed.codeExamples || [],
        quizQuestions: parsed.quizQuestions || [],
        detectedMistakes: [],
        studyPlanSteps: parsed.studyPlanSteps || ['Step 1: Core Fundamentals', 'Step 2: Applied Practice', 'Step 3: Mastery Test'],
        masteryScore: mode === 'BEGINNER' ? 60 : mode === 'INTERMEDIATE' ? 75 : 85,
        updatedAt: new Date().toISOString(),
      };

      this.sessions.unshift(newSession);
      return newSession;
    } catch {
      const fallbackSession: TutorCourseSession = {
        id: `tutor-${Date.now()}`,
        topic,
        mode,
        conceptExplanation: `Welcome to the structured masterclass on ${topic}. ULTRON is your personal interactive tutor.`,
        codeExamples: [
          {
            language: 'cpp',
            code: `// ${topic} Implementation\n#include <iostream>\nint main() {\n    std::cout << "ULTRON Tutor Active: ${topic}" << std::endl;\n    return 0;\n}`,
            explanation: 'Baseline initialization pattern.',
          },
        ],
        quizQuestions: [
          {
            id: 'q1',
            question: `What is the key advantage of applying structured principles in ${topic}?`,
            options: ['Modular maintainability and error isolation', 'Faster compilation only', 'Eliminates all bugs automatically', 'None of the above'],
            correctIndex: 0,
            explanation: 'Modular design isolates concerns and makes systems testable and scalable.',
          },
        ],
        detectedMistakes: [],
        studyPlanSteps: ['1. Foundational Syntax', '2. Architectural Patterns', '3. Production Best Practices'],
        masteryScore: 70,
        updatedAt: new Date().toISOString(),
      };
      this.sessions.unshift(fallbackSession);
      return fallbackSession;
    }
  }

  public submitQuizAnswer(sessionId: string, questionId: string, selectedIndex: number): { isCorrect: boolean; explanation: string; updatedScore: number } {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Tutor session not found');

    const question = session.quizQuestions.find((q) => q.id === questionId);
    if (!question) throw new Error('Question not found');

    question.userSelectedIndex = selectedIndex;
    question.isCorrect = selectedIndex === question.correctIndex;

    if (!question.isCorrect) {
      session.detectedMistakes.push(`Mistake on: "${question.question}". Selected: "${question.options[selectedIndex]}"`);
    }

    const correctCount = session.quizQuestions.filter((q) => q.isCorrect).length;
    session.masteryScore = Math.round((correctCount / session.quizQuestions.length) * 100);
    session.updatedAt = new Date().toISOString();

    return {
      isCorrect: question.isCorrect,
      explanation: question.explanation,
      updatedScore: session.masteryScore,
    };
  }
}
